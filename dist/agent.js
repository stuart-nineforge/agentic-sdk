"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const execution_1 = require("./execution");
const functions_1 = require("./functions");
const session_1 = require("./session");
/**
 * Agent runner with built-in session tracking.
 */
class Agent {
    constructor(options, session) {
        this.name = options.name;
        this.description = options.description;
        this.instructions = options.instructions;
        this.tools = options.tools;
        this.session = session !== null && session !== void 0 ? session : new session_1.Session();
        this.functions = options.functions;
    }
    /**
     * Send input to the agent under the given provider, updating session history
     * and returning the raw or parsed response.
     */
    async execute(provider, input, format) {
        var _a, _b, _c;
        // normalize and record user input
        this.session.addInput(typeof input === "string" ? { "role": "user", "content": input } : input);
        const messages = [...this.session.getInput()];
        let output;
        let output_text;
        let executing = true;
        let turns = 0;
        const usage = {
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
            const execReq = {
                provider,
                instructions: this.instructions,
                input: messages,
                ...(executing ? { tools: this.tools } : {}),
                format: format !== null && format !== void 0 ? format : this.format,
            };
            // run through core execute
            const response = await (0, execution_1.execute)(execReq);
            if (response.error) {
                console.debug(`Executing[${turns}]: Error`, response.error);
                return {
                    error: response.error,
                    usage
                };
            }
            output = response.output;
            output_text = response.output_text;
            usage.input_tokens += response.usage.input_tokens;
            usage.output_tokens += response.usage.output_tokens;
            usage.cached_tokens += response.usage.cached_tokens;
            usage.reasoning_tokens += response.usage.reasoning_tokens;
            usage.total_tokens += response.usage.total_tokens;
            if (((_a = output === null || output === void 0 ? void 0 : output[0]) === null || _a === void 0 ? void 0 : _a.type) === "message") {
                break;
            }
            else if (((_b = output === null || output === void 0 ? void 0 : output[0]) === null || _b === void 0 ? void 0 : _b.type) === "function_call") {
                messages.push(output[0]);
                if (response.toolCalls && response.toolCalls.length > 0) {
                    const tasks = [];
                    const toolCallIds = [];
                    for (const toolCall of response.toolCalls) {
                        const func = (_c = this.functions) === null || _c === void 0 ? void 0 : _c[toolCall.function.name];
                        if (func) {
                            const functionHandler = functions_1.FunctionHandlers[func.type];
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
                    const toolCallResults = [];
                    results.forEach((result, index) => {
                        const toolCallId = toolCallIds[index];
                        if (result.status === "fulfilled") {
                            toolCallResults.push({
                                id: toolCallId,
                                output: result.value,
                                status: "completed",
                            });
                        }
                        else {
                            toolCallResults.push({
                                id: toolCallId,
                                output: "Error calling function",
                                status: "failed",
                                error: result.reason,
                            });
                        }
                    });
                    toolCallResults.map((toolCallResult) => {
                        const message = {
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
            };
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
exports.Agent = Agent;
