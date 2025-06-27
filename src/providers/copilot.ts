import {
  IAgentRuntime,
  elizaLogger,
  composePrompt,
  ModelType,
} from "@elizaos/core";
import type { Memory, Provider, State, ProviderResult } from "@elizaos/core";

// Configuration constants
const CONFIG = {
  RECENT_MESSAGES_COUNT: 5,
  API_ENDPOINT: "https://api.messari.io/ai/v1/chat/completions",
  ENV_API_KEY: "MESSARI_API_KEY",
} as const;

// Types for API responses and errors
interface MessariAPIResponse {
  data: {
    messages: Array<{
      content: string;
      role: string;
    }>;
  };
}

interface MessariError extends Error {
  status?: number;
  statusText?: string;
  responseText?: string;
}

// Template for question generation
const COPILOT_QUESTION_TEMPLATE = `IMPORTANT: Your primary task is to identify research questions in the CURRENT MESSAGE. Recent messages are provided only as supporting context.

Current message to analyze: {{currentMessage}}
Supporting context from recent messages (last ${CONFIG.RECENT_MESSAGES_COUNT}): {{recentMessages}}

First, focus on the current message and identify if it contains any research questions or requests. Only if the current message is ambiguous or references previous messages, consider the supporting context.

Consider the following as research questions:
1. Requests for market data, statistics, or metrics
2. Questions about rankings or comparisons
3. Requests for historical data or trends
4. Questions about specific protocols, tokens, or platforms
5. Requests for financial analysis or performance data

Extract and output the exact research question from the CURRENT MESSAGE. If multiple questions exist in the current message, output the most relevant one.
If there are NO research questions in the current message, output "NONE".

Remember:
- Focus primarily on the current message
- Any request for data, rankings, or market information should be considered a research question, even if not phrased as a question
- Only use recent messages for context if the current message is ambiguous or references them directly

Examples:
- Current: "what are the top 10 L2s by fees" -> "what are the top 10 L2s by fees"
- Current: "show me ETH price" -> "what is the current price of ETH"
- Current: "TVL of Arbitrum" -> "what is the current TVL of Arbitrum"
- Current: "as I asked before, what's the value?" (ambiguous) -> Use context to determine the specific metric being asked about`;

/**
 * Makes a request to the Messari API
 * @param apiKey - The Messari API key
 * @param question - The question to ask
 * @returns The API response content or null if there's an error
 */
async function callMessariAPI(
  apiKey: string,
  question: string,
): Promise<string | null> {
  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-messari-api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      const error = new Error() as MessariError;
      error.status = response.status;
      error.statusText = response.statusText;
      error.responseText = responseText;
      throw error;
    }

    const data = (await response.json()) as MessariAPIResponse;
    const res = data.data.messages[0].content;
    elizaLogger.debug("Messari API response", {
      response: res,
    });
    return res;
  } catch (error) {
    const err = error as MessariError;
    elizaLogger.error("Error calling Messari API:", {
      status: err.status,
      statusText: err.statusText,
      responseText: err.responseText,
      message: err.message,
    });
    return null;
  }
}

/**
 * Extracts recent messages from state
 * @param state - The current state
 * @returns A string of recent messages
 */
function getRecentMessages(state?: State): string {
  return (
    state?.recentMessagesData
      ?.slice(-CONFIG.RECENT_MESSAGES_COUNT)
      .map((m: Memory) => m.content.text || "")
      .join("\n") || ""
  );
}

/**
 * Generates text using the agent's model
 * @param runtime - The agent runtime
 * @param prompt - The prompt to generate from
 * @returns Generated text response
 */
async function generateText(
  runtime: IAgentRuntime,
  prompt: string,
): Promise<string> {
  try {
    // Use the text generation model
    const response = await runtime.useModel(ModelType.TEXT_SMALL, {
      prompt: prompt,
      maxTokens: 150,
      temperature: 0.1,
    });
    return response || "";
  } catch (error) {
    elizaLogger.error("Error generating text:", error);
    return "";
  }
}

const copilotProvider: Provider = {
  name: "messariCopilot",
  description:
    "Provides access to Messari's AI Toolkit for crypto market research and analysis",
  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
  ): Promise<ProviderResult> => {
    const apiKey = runtime.getSetting(CONFIG.ENV_API_KEY);
    if (!apiKey) {
      elizaLogger.error("Messari API key not found in runtime settings");
      return {
        text: "Messari API key not configured. Please set MESSARI_API_KEY in your environment.",
      };
    }

    const contextState = {
      currentMessage: message.content.text || "",
      recentMessages: getRecentMessages(state),
    };

    const questionContext = composePrompt({
      state: contextState,
      template: COPILOT_QUESTION_TEMPLATE,
    });

    elizaLogger.debug("Generated question context", {
      context: questionContext,
    });

    const copilotQuestion = await generateText(runtime, questionContext);

    if (copilotQuestion === "NONE" || !copilotQuestion.trim()) {
      elizaLogger.info("No research questions identified in the message");
      return {
        text: "No research questions identified in your message. Please ask a specific question about crypto markets, protocols, or metrics.",
      };
    }

    elizaLogger.info("Processing research question", {
      question: copilotQuestion,
    });

    const result = await callMessariAPI(apiKey, copilotQuestion);

    return {
      text:
        result ||
        "Unable to fetch data from Messari API. Please try again later.",
    };
  },
};

export { copilotProvider };
