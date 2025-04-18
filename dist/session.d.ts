import { Message } from "./execution";
/**
 * Maintains a conversation history for an agent.
 */
export declare class Session {
    messages: Message[];
    constructor(messages?: Message[]);
    addMessage(message: Message): void;
    getMessages(): Message[];
}
export declare class SummarizingSession extends Session {
    constructor(messages?: Message[]);
    addMessage(message: Message): void;
    getMessages(): Message[];
}
