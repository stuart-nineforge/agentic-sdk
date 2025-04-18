"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const execution_1 = require("./execution");
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
    }
    /**
     * Send input to the agent under the given provider, updating session history
     * and returning the raw or parsed response.
     */
    async execute(provider, input, format) {
        // normalize and record user input
        const userMsg = typeof input === "string" ? { role: "user", content: input } : input;
        this.session.messages.push(userMsg);
        // prepare ExecutionRequest
        const execReq = {
            provider,
            instructions: this.instructions,
            input: this.session.messages,
            tools: this.tools,
            format: format !== null && format !== void 0 ? format : this.format,
        };
        // run through core execute
        const result = await (0, execution_1.execute)(execReq);
        // record assistant response
        this.session.messages.push({ role: "assistant", content: result.output });
        return result;
    }
}
exports.Agent = Agent;
