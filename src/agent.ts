import { 
    Message, 
    Tool, 
    Format, 
    execute, 
    ExecutionRequest, 
    ExecutionResponse 
} from "./execution";
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

    constructor(options: AgentOptions, session?: Session) {
        this.name = options.name;
        this.description = options.description;
        this.instructions = options.instructions;
        this.tools = options.tools;
        this.session = session ?? new Session();
    }

    /**
     * Send input to the agent under the given provider, updating session history
     * and returning the raw or parsed response.
     */
    async execute(
        provider: Provider,
        input: string | Message,
        format?: Format
    ): Promise<ExecutionResponse> {
        // normalize and record user input
        const userMsg: Message =
            typeof input === "string" ? { role: "user", content: input } : input;
        this.session.messages.push(userMsg);

        // prepare ExecutionRequest
        const execReq: ExecutionRequest = {
            provider,
            instructions: this.instructions,
            input: this.session.messages,
            tools: this.tools,
            format: format ?? this.format,
        };

        // run through core execute
        const result = await execute(execReq);

        // record assistant response
        this.session.messages.push({ role: "assistant", content: result.output as string });

        return result;
    }
} 