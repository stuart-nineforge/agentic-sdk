"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
/**
 * Maintains a conversation history for an agent.
 */
class Session {
    constructor(input) {
        if (Array.isArray(input)) {
            this.input = input;
        }
        else if (input) {
            this.input = [input];
        }
        else {
            this.input = [];
        }
    }
    addInput(input) {
        this.input.push(input);
    }
    getInput() {
        return this.input;
    }
}
exports.Session = Session;
