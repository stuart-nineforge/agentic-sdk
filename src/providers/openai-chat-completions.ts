// @ts-ignore: Suppress missing module declaration for openai
import OpenAI from "openai";
import { ExecutionRequest, ExecutionResponse, Input, InputItem, OutputItem } from "../execution";
import { registerProviderHandler } from "../execution";
import { registerDefaultProvider, Provider } from "./index";

/**
 * Executes an OpenAI Chat Completions request.
 */
export async function runOpenAIChatCompletion(
  req: ExecutionRequest
): Promise<ExecutionResponse> {
  const { provider, instructions, input, tools, format } = req;
  // initialize OpenAI client with credentials
  const openai = new OpenAI({ ...(provider.credentials ? provider.credentials : {}) });

  const messages = [
    { role: "system", content: instructions },
    ...(typeof input === "string"
      ? [{ role: "user", content: input }]
      : input),
  ];

  // @ts-ignore: bypass type mismatch for create call
  const response = await openai.chat.completions.create(
    {
      model: provider.model,
      // spread any model-specific options
      ...(provider.options as Record<string, any>),
      messages,
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

  const message = response.choices?.[0]?.message;
  let output : OutputItem[] = [{ 
    id: response.id,
    type: "message", 
    role: "assistant", 
    content: [
      { type: "output_text", text: message.content || "", annotations: [] }
    ],
    status: "completed"
  }];

  const toolCalls = response.choices?.[0]?.message?.tool_calls || null;

  return {
    output,
    ...(toolCalls ? { toolCalls } : {}),
    usage: {
      input_tokens: response.usage?.prompt_tokens || 0,
      output_tokens: response.usage?.completion_tokens || 0,
      cached_tokens: response.usage?.prompt_tokens_details?.cached_tokens || 0,
      reasoning_tokens: response.usage?.completion_tokens_details?.reasoning_tokens || 0,
      total_tokens: response.usage?.total_tokens || 0,
    },
  };
}

registerProviderHandler("OpenAI", "ChatCompletions", runOpenAIChatCompletion);

registerDefaultProvider({
  type: "OpenAI",
  api: "ChatCompletions",
  model: "gpt-4.1-mini",
} as Provider);
