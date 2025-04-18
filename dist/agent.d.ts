import { Tool, Format, Usage, OutputItem, InputItem } from "./execution";
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
    functions?: Record<string, {
        type: string;
        options?: any;
    }>;
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
export declare class Agent {
    name: string;
    description: string;
    instructions: string;
    tools?: Tool[];
    format?: Format;
    session: Session;
    functions?: Record<string, {
        type: string;
        options?: any;
    }>;
    constructor(options: AgentOptions, session?: Session);
    /**
     * Send input to the agent under the given provider, updating session history
     * and returning the raw or parsed response.
     */
    execute(provider: Provider, input: string | InputItem, format?: Format): Promise<AgentResponse>;
}
