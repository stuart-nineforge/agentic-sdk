import { Message, Tool, Format, ExecutionResponse } from "./execution";
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
export declare class Agent {
    name: string;
    description: string;
    instructions: string;
    tools?: Tool[];
    format?: Format;
    session: Session;
    constructor(options: AgentOptions, session?: Session);
    /**
     * Send input to the agent under the given provider, updating session history
     * and returning the raw or parsed response.
     */
    execute(provider: Provider, input: string | Message, format?: Format): Promise<ExecutionResponse>;
}
