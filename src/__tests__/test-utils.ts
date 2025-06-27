import { mock } from "bun:test";
import {
  type IAgentRuntime,
  type Memory,
  type State,
  type Character,
  type UUID,
  type Content,
  type Room,
  type Entity,
  type HandlerCallback,
  type Service,
  type ServiceTypeName,
  ModelType,
} from "@elizaos/core";

// Mock Runtime Type
export type MockRuntime = Partial<IAgentRuntime> & {
  agentId: UUID;
  character: Character;
  getSetting: ReturnType<typeof mock>;
  useModel: ReturnType<typeof mock>;
  composeState: ReturnType<typeof mock>;
  createMemory: ReturnType<typeof mock>;
  getMemories: ReturnType<typeof mock>;
  searchMemories: ReturnType<typeof mock>;
  updateMemory: ReturnType<typeof mock>;
  getRoom: ReturnType<typeof mock>;
  getParticipantUserState: ReturnType<typeof mock>;
  setParticipantUserState: ReturnType<typeof mock>;
  emitEvent: ReturnType<typeof mock>;
  getTasks: ReturnType<typeof mock>;
  providers: any[];
  actions: any[];
  evaluators: any[];
  services: any[];
};

// Create Mock Runtime
export function createMockRuntime(
  overrides: Partial<MockRuntime> = {},
): MockRuntime {
  return {
    agentId: "test-agent-id" as UUID,
    character: {
      name: "Test Agent",
      bio: "A test agent for unit testing",
      templates: {
        messageHandlerTemplate: "Test template {{recentMessages}}",
        shouldRespondTemplate: "Should respond {{recentMessages}}",
      },
    } as Character,

    // Core methods with default implementations
    useModel: mock().mockResolvedValue("Mock response"),
    composeState: mock().mockResolvedValue({
      values: {
        agentName: "Test Agent",
        recentMessages: "Test message",
      },
      data: {
        room: {
          id: "test-room-id",
          type: "DIRECT" as any,
        },
      },
    }),
    createMemory: mock().mockResolvedValue({ id: "memory-id" }),
    getMemories: mock().mockResolvedValue([]),
    searchMemories: mock().mockResolvedValue([]),
    updateMemory: mock().mockResolvedValue(undefined),
    getSetting: mock().mockImplementation((key: string) => {
      const settings: Record<string, string> = {
        TEST_SETTING: "test-value",
        API_KEY: "test-api-key",
        MESSARI_API_KEY: "test-messari-api-key",
      };
      return settings[key];
    }),
    getRoom: mock().mockResolvedValue({
      id: "test-room-id",
      type: "DIRECT" as any,
      worldId: "test-world-id",
      serverId: "test-server-id",
      source: "test",
    }),
    getParticipantUserState: mock().mockResolvedValue("ACTIVE"),
    setParticipantUserState: mock().mockResolvedValue(undefined),
    emitEvent: mock().mockResolvedValue(undefined),
    getTasks: mock().mockResolvedValue([]),

    // Provider/action/evaluator lists
    providers: [],
    actions: [],
    evaluators: [],
    services: new Map() as Map<ServiceTypeName, Service> & any[],

    // Override with custom implementations
    ...overrides,
  };
}

// Create Mock Memory
export function createMockMemory(
  overrides: Partial<Memory> = {},
): Partial<Memory> {
  return {
    id: "test-message-id" as UUID,
    roomId: "test-room-id" as UUID,
    entityId: "test-entity-id" as UUID,
    agentId: "test-agent-id" as UUID,
    content: {
      text: "Test message",
      channelType: "DIRECT" as any,
      source: "direct",
    } as Content,
    createdAt: Date.now(),
    ...overrides,
  };
}

// Create Mock State
export function createMockState(
  overrides: Partial<State> = {},
): Partial<State> {
  return {
    values: {
      agentName: "Test Agent",
      recentMessages: "User: Test message",
      ...overrides.values,
    },
    data: {
      room: {
        id: "test-room-id",
        type: "DIRECT" as any,
      },
      ...overrides.data,
    },
    recentMessagesData:
      overrides.recentMessagesData ||
      ([
        {
          id: "msg-1" as UUID,
          content: { text: "Recent message 1" },
          createdAt: Date.now(),
        },
        {
          id: "msg-2" as UUID,
          content: { text: "Recent response 1" },
          createdAt: Date.now(),
        },
        {
          id: "msg-3" as UUID,
          content: { text: "Recent message 2" },
          createdAt: Date.now(),
        },
      ] as Memory[]),
    ...overrides,
  };
}

// Mock HTTP Fetch for API testing
export function mockFetch(responses: Record<string, any>) {
  const fetchMock = mock().mockImplementation((url: string, options?: any) => {
    const key = Object.keys(responses).find((k) => url.includes(k));
    if (key) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responses[key]),
        text: () => Promise.resolve(JSON.stringify(responses[key])),
      });
    }
    return Promise.resolve({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Not found"),
    });
  });

  // @ts-ignore - Mock global fetch
  global.fetch = fetchMock;
  return fetchMock;
}

// Utility to wait for async operations
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility to create a callback mock
export function createCallbackMock() {
  return mock<HandlerCallback>().mockResolvedValue([]);
}
