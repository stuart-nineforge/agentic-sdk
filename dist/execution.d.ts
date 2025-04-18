import { JSONSchema7 } from "json-schema";
import { Provider } from "./providers";
/** A message in the execution input. */
export interface Message {
    role: "system" | "user" | "assistant";
    content?: string;
    tool_calls?: ToolCall[];
}
/** Input to execution: either a plain string or an array of messages. */
export type Input = string | Message[];
export interface Credentials extends Record<string, any> {
}
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
export type Format = {
    type: "text";
} | {
    type: "json";
    schema: JSONSchema7;
};
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
}
export interface ExecutionResponse {
    output: string | Message[];
    toolCalls?: ToolCall[];
    usage: Usage;
}
export type ProviderHandler = (req: ExecutionRequest) => Promise<ExecutionResponse>;
export declare function registerProviderHandler(type: string, api: string | undefined, handler: ProviderHandler): void;
export declare function execute(req: ExecutionRequest): Promise<ExecutionResponse>;
