"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummarizingSession = exports.Session = void 0;
/**
 * Maintains a conversation history for an agent.
 */
class Session {
    constructor(messages = []) {
        this.messages = messages;
    }
    addMessage(message) {
        this.messages.push(message);
    }
    getMessages() {
        return this.messages;
    }
}
exports.Session = Session;
class SummarizingSession extends Session {
    constructor(messages = []) {
        super(messages);
    }
    addMessage(message) {
        super.addMessage(message);
    }
    getMessages() {
        return super.getMessages();
    }
}
exports.SummarizingSession = SummarizingSession;
