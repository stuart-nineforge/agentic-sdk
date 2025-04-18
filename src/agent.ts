import { 
    Tool, 
    Format, 
    execute, 
    ExecutionRequest, 
    Usage,
    Input,
    OutputItem,
    InputItem,
    ToolCallResult
} from "./execution";
import { FunctionHandlers } from "./functions";
import { Provider } from "./providers";
import { Session } from "./session";

/**
 * Defines an agent's static properties.
 */
export interface AgentOptions {
    name: string;
    description: string;
    instructions: string;
    tools?: Tool[];
    format?: Format;
    functions?: Record<string, { type: string, options?: any }>;
}

export interface AgentResponse {
    output?: OutputItem[];
    output_text?: string;
    error?: Error;
    usage: Usage;
}

/**
 * Agent runner with built-in session tracking.
 */
export class Agent {
    name: string;
    description: string;
    instructions: string;
    tools?: Tool[];
    format?: Format;
    session: Session;
    functions?: Record<string, { type: string, options?: any }>;

    constructor(options: AgentOptions, session?: Session) {
        this.name = options.name;
        this.description = options.description;
        this.instructions = options.instructions;
        this.tools = options.tools;
        this.session = session ?? new Session();
        this.functions = options.functions;
    }

    /**
     * Send input to the agent under the given provider, updating session history
     * and returning the raw or parsed response.
     */
    async execute(
        provider: Provider,
        input: string | InputItem,
        format?: Format
    ): Promise<AgentResponse> {
        // normalize and record user input
        this.session.addInput(typeof input === "string" ? { "role": "user", "content": input } : input);

        const messages: Input = [...this.session.getInput()];

        let output: OutputItem[] | undefined;
        let output_text: string | undefined;
        let executing = true;
        let turns = 0;
        const usage: Usage = {
            input_tokens: 0,
            output_tokens: 0,
            cached_tokens: 0,
            reasoning_tokens: 0,
            total_tokens: 0,
            duration: 0,
        };
        while (executing) {
            turns++;

            if (turns > 10) {
                executing = false;
            }

            // prepare ExecutionRequest
            const execReq: ExecutionRequest = {
                provider,
                instructions: this.instructions,
                input: messages,
                ...(executing ? { tools: this.tools } : {}),
                format: format ?? this.format,
            };

            // run through core execute
            const response = await execute(execReq);

            if (response.error) {
                console.debug(`Executing[${turns}]: Error`, response.error);
                return {
                    error: response.error,
                    usage
                }
            }

            output = response.output;
            output_text = response.output_text;

            usage.input_tokens += response.usage.input_tokens;
            usage.output_tokens += response.usage.output_tokens;
            usage.cached_tokens += response.usage.cached_tokens;
            usage.reasoning_tokens += response.usage.reasoning_tokens;
            usage.total_tokens += response.usage.total_tokens;

            if (output?.[0]?.type === "message") {
                break;
            } else if (output?.[0]?.type === "function_call") {
                
                messages.push(output[0]);

                if (response.toolCalls && response.toolCalls.length > 0) {
                    const tasks: Promise<any>[] = [];
                    const toolCallIds: string[] = [];
                    for (const toolCall of response.toolCalls) {
                        const func = this.functions?.[toolCall.function.name];
                        if (func) {
                            const functionHandler = FunctionHandlers[func.type];
                            if (functionHandler) {
                                toolCallIds.push(toolCall.id);
                                tasks.push(functionHandler(JSON.parse(toolCall.function.arguments), func.options));
                            }
                        }
                    }
    
                    if (tasks.length == 0) {
                        console.debug(`Executing[${turns}]: No functions to call`);
                        executing = false;
                    }

                    const results = await Promise.allSettled(tasks);

                    const toolCallResults: ToolCallResult[] = [];
                    results.forEach((result, index) => {
                        const toolCallId = toolCallIds[index];
                        if (result.status === "fulfilled") {
                            toolCallResults.push({
                                id: toolCallId,
                                output: result.value,
                                status: "completed",
                            });
                        } else {
                            toolCallResults.push({
                                id: toolCallId,
                                output: "Error calling function",
                                status: "failed",
                                error: result.reason as Error,
                            });
    
                        }
                    });

                    toolCallResults.map((toolCallResult) => {
                        const message: InputItem = {
                            type: "function_call_output",
                            call_id: toolCallResult.id,
                            output: toolCallResult.output,
                        };
                        messages.push(message);
                    });
                }
            }
        }

        if (!output) {
            return {
                error: new Error("No output from agent"),
                usage
            }
        }

        // add output to session
        output.forEach((item) => {
            this.session.addInput(item);
        });

        return {
            output,
            output_text,
            usage
        };
    }
} 