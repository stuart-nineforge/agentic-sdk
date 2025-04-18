import { Message } from "./execution";

/**
 * Maintains a conversation history for an agent.
 */
export class Session {
    messages: Message[];

    constructor(messages: Message[] = []) {
        this.messages = messages;
    }

    addMessage(message: Message) {
        this.messages.push(message);
    }
            
    getMessages() {
        return this.messages;
    }
}

export class SummarizingSession extends Session {
    constructor(messages: Message[] = []) {
        super(messages);
    }

    addMessage(message: Message) {
        super.addMessage(message);
    }

    getMessages() {
        return super.getMessages();
    }
}