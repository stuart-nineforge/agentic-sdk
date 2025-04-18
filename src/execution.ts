import { JSONSchema7 } from "json-schema";
import { Provider } from "./providers";
import { OpenAI } from "openai";

/** Input to execution: either a plain string or an array of messages. */
export type InputItem = OpenAI.Responses.ResponseInputItem;
export type Input = OpenAI.Responses.ResponseInput;
export type OutputItem = OpenAI.Responses.ResponseOutputItem;

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

export interface ToolCallResult {
  id: string;
  output: string;
  status: "completed" | "failed";
  error?: Error;
}

/** Response format. */
export type Format =
  | { type: "text" }
  | { type: "json"; schema: JSONSchema7 };

/** Usage information. */
export interface Usage extends Record<string, any> {
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  reasoning_tokens: number;
  total_tokens: number;
  duration?: number;
};

/** Execution request parameters. */
export interface ExecutionRequest {
  provider: Provider;
  instructions: string;
  input: Input;
  tools?: Tool[];
  format?: Format;
}

/** Execution response. */
export interface ExecutionResponse {
  output?: OutputItem[];
  output_text?: string;
  toolCalls?: ToolCall[];
  error?: Error;
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
  const start = Date.now();
  try {
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
    const result = await handler(req);
    result.usage.duration = Date.now() - start;
    return result;
  } catch (error: any) {
    return {
      error: error as Error,
      usage: {
        input_tokens: 0,
        output_tokens: 0,
        cached_tokens: 0,
        reasoning_tokens: 0,
        total_tokens: 0,
        duration: Date.now() - start,
      },
    };
  }
} 