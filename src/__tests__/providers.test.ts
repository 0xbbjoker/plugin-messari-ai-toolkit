import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { copilotProvider } from "../providers/copilot";
import {
  createMockRuntime,
  createMockMemory,
  createMockState,
  mockFetch,
} from "./test-utils";
import type {
  Memory,
  State,
  IAgentRuntime,
  ProviderResult,
} from "@elizaos/core";
import { ModelType } from "@elizaos/core";

describe("Messari Copilot Provider", () => {
  let runtime: IAgentRuntime;
  let memory: Memory;
  let state: State;
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    runtime = createMockRuntime() as IAgentRuntime;
    memory = createMockMemory() as Memory;
    state = createMockState() as State;

    // Mock fetch for API calls
    fetchMock = mockFetch({
      "api.messari.io": {
        data: {
          messages: [
            {
              content: "The current price of ETH is $3,500",
              role: "assistant",
            },
          ],
        },
      },
    });
  });

  afterEach(() => {
    // @ts-ignore - Reset global fetch
    global.fetch = undefined;
  });

  it("should have the correct name and description", () => {
    expect(copilotProvider.name).toBe("messariCopilot");
    expect(copilotProvider.description).toBe(
      "Provides access to Messari's AI Toolkit for crypto market research and analysis",
    );
  });

  it("should return error message when API key is not configured", async () => {
    // Override getSetting to return undefined for API key
    runtime.getSetting = mock().mockReturnValue(undefined);

    const result = await copilotProvider.get(runtime, memory, state);

    expect(result).toBeDefined();
    expect(result?.text).toBe(
      "Messari API key not configured. Please set MESSARI_API_KEY in your environment.",
    );
  });

  it("should identify research questions in messages", async () => {
    // Set up runtime to extract question
    runtime.useModel = mock().mockResolvedValueOnce(
      "what is the current price of ETH",
    ); // Question extraction

    memory = createMockMemory({
      content: {
        text: "what is the current price of ETH",
        channelType: "DIRECT",
        source: "direct",
      },
    }) as Memory;

    const result = await copilotProvider.get(runtime, memory, state);

    expect(result).toBeDefined();
    expect(result?.text).toBe("The current price of ETH is $3,500");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.messari.io/ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-messari-api-key": "test-messari-api-key",
        }),
      }),
    );
  });

  it("should handle messages without research questions", async () => {
    // Set up runtime to return NONE for no question
    runtime.useModel = mock().mockResolvedValue("NONE");

    memory = createMockMemory({
      content: {
        text: "Hello there!",
        channelType: "DIRECT",
        source: "direct",
      },
    }) as Memory;

    const result = await copilotProvider.get(runtime, memory, state);

    expect(result).toBeDefined();
    expect(result?.text).toBe(
      "No research questions identified in your message. Please ask a specific question about crypto markets, protocols, or metrics.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    // Mock failed API response
    fetchMock = mockFetch({});
    runtime.useModel = mock().mockResolvedValue("what is BTC price");

    const result = await copilotProvider.get(runtime, memory, state);

    expect(result).toBeDefined();
    expect(result?.text).toBe(
      "Unable to fetch data from Messari API. Please try again later.",
    );
  });

  it("should use recent messages for context", async () => {
    runtime.useModel = mock().mockResolvedValue(
      "as I asked before, what is the TVL",
    );

    state = createMockState({
      recentMessagesData: [
        { content: { text: "What is the TVL of Arbitrum?" } },
        { content: { text: "The TVL of Arbitrum is $2.5B" } },
        { content: { text: "as I asked before, what is the TVL" } },
      ] as Memory[],
    }) as State;

    await copilotProvider.get(runtime, memory, state);

    // Verify that the context was composed with recent messages
    expect(runtime.useModel).toHaveBeenCalledWith(
      ModelType.TEXT_SMALL,
      expect.objectContaining({
        prompt: expect.stringContaining("What is the TVL of Arbitrum?"),
        maxTokens: 150,
        temperature: 0.1,
      }),
    );
  });

  it("should handle empty or whitespace questions", async () => {
    runtime.useModel = mock().mockResolvedValue("   ");

    const result = await copilotProvider.get(runtime, memory, state);

    expect(result).toBeDefined();
    expect(result?.text).toBe(
      "No research questions identified in your message. Please ask a specific question about crypto markets, protocols, or metrics.",
    );
  });

  it("should handle API response with different formats", async () => {
    fetchMock = mockFetch({
      "api.messari.io": {
        data: {
          messages: [
            {
              content:
                "Here are the top 10 L2s by fees:\n1. Arbitrum\n2. Optimism\n3. Base",
              role: "assistant",
            },
          ],
        },
      },
    });

    runtime.useModel = mock().mockResolvedValue(
      "what are the top 10 L2s by fees",
    );

    const result = await copilotProvider.get(runtime, memory, state);

    expect(result).toBeDefined();
    expect(result?.text).toContain("Here are the top 10 L2s by fees");
    expect(result?.text).toContain("Arbitrum");
  });

  it("should properly format the API request", async () => {
    runtime.useModel = mock().mockResolvedValue(
      "what is the market cap of BTC",
    );

    await copilotProvider.get(runtime, memory, state);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.messari.io/ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-messari-api-key": "test-messari-api-key",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "what is the market cap of BTC",
            },
          ],
        }),
      },
    );
  });

  it("should return ProviderResult format", async () => {
    runtime.useModel = mock().mockResolvedValue("ETH price");

    const result = await copilotProvider.get(runtime, memory, state);

    expect(result).toBeDefined();
    expect(result).toHaveProperty("text");
    expect(typeof result?.text).toBe("string");
    // Ensure it doesn't have other properties unless needed
    expect(Object.keys(result || {})).toEqual(["text"]);
  });
});
