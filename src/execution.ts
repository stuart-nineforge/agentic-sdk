import { JSONSchema7 } from "json-schema";
import { runOpenAIChatCompletion } from "./providers/openai-chat-completions";
import { runOpenAIResponse } from "./providers/openai-responses";
import { Provider } from "./providers";

/** A message in the execution input. */
export interface Message {
  role: "system" | "user" | "assistant";
  content?: string;
  tool_calls?: ToolCall[];
}

/** Input to execution: either a plain string or an array of messages. */
export type Input = string | Message[];

export interface Credentials extends Record<string, any> {};

/** Tool definition. */
export interface Tool {
  name: string;
  description?: string;
  parameters: JSONSchema7;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: FunctionCall;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

/** Response format. */
export type Format =
  | { type: "text" }
  | { type: "json"; schema: JSONSchema7 };

/** Execution request parameters. */
export interface ExecutionRequest {
  provider: Provider;
  instructions: string;
  input: Input;
  tools?: Tool[];
  format?: Format;
}

export interface Usage extends Record<string, any> {
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  reasoning_tokens: number;
};

export interface ExecutionResponse {
  output: string | Message[];
  toolCalls?: ToolCall[];
  usage: Usage;
}

// Provider handler registry
export type ProviderHandler = (req: ExecutionRequest) => Promise<ExecutionResponse>;
const providerRegistry: Record<string, Record<string, ProviderHandler>> = {};

export function registerProviderHandler(type: string, api: string | undefined, handler: ProviderHandler) {
  providerRegistry[type] = providerRegistry[type] || {};
  providerRegistry[type][api || "default"] = handler;
}

export async function execute(
  req: ExecutionRequest
): Promise<ExecutionResponse> {
  if (!req || !req.provider) {
    throw new Error("Provider is required");
  }
  const providerType = req.provider.type;
  const providerApi = req.provider.api || "default";

  const provider = providerRegistry[providerType];
  const handler = provider[providerApi];
  if (!handler) {
    throw new Error(`No handler registered for provider type: ${providerType} api: ${providerApi}`);
  }
  return handler(req);
} 