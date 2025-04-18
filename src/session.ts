import { Input, InputItem } from "./execution";

/**
 * Maintains a conversation history for an agent.
 */
export class Session {
    input: Input;

    constructor(input?: Input | InputItem) {
        if (Array.isArray(input)) {
            this.input = input;
        } else if (input) {
            this.input = [input] as Input;
        } else {
            this.input = [];
        }

    }

    addInput(input: InputItem) {
        this.input.push(input);
    }
            
    getInput() {
        return this.input;
    }
}