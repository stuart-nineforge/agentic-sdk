// @ts-ignore: Suppress missing module declaration for openai
import OpenAI from "openai";
import { ExecutionRequest, ExecutionResponse, ToolCall } from "../execution";
import { ResponseOutputItem } from "openai/resources/responses/responses";
import { registerProviderHandler } from "../execution";
import { registerDefaultProvider, Provider } from "./index";

/**
 * Executes an OpenAI Responses API request.
 */
export async function runOpenAIResponse(
    req: ExecutionRequest
): Promise<ExecutionResponse> {
    const { provider, instructions, input, tools, format } = req;
    const openai = new OpenAI({ ...(provider.credentials ? provider.credentials : {}) });

    // @ts-ignore: bypass type mismatch for create call
    const response = await openai.responses.create(
        {
            model: provider.model,
            ...provider.options,
            instructions,
            input,
            ...(tools ?
                {
                    tools: tools?.map((tool) => ({
                        type: "function" as const,
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.parameters,
                        strict: true as const,
                    })),
                    tool_choice: "auto" as const,
                } : {}),
        } as any
    );

    const toolCalls = getToolCalls(response.output);

    return {
        output: response.output,
        output_text: response.output_text,
        ...(toolCalls ? { toolCalls } : {}),
        usage: {
            input_tokens: response.usage?.input_tokens || 0,
            output_tokens: response.usage?.output_tokens || 0,
            cached_tokens: response.usage?.input_tokens_details?.cached_tokens || 0,
            reasoning_tokens: response.usage?.output_tokens_details?.reasoning_tokens || 0,
            total_tokens: response.usage?.total_tokens || 0,
        },
    };
}

function getToolCalls(output: ResponseOutputItem[]): ToolCall[] {
    return output.filter((item) => item.type === "function_call").map((item) => {
        return {
            id: item.call_id,
            type: "function",
            function: {
                name: item.name,
                arguments: item.arguments,
            }
        } as ToolCall
    });
}

registerProviderHandler("OpenAI", "Responses", runOpenAIResponse);

registerDefaultProvider({
  type: "OpenAI",
  api: "Responses",
  model: "gpt-4.1-mini",
} as Provider);