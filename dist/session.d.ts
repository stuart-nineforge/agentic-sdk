import { Input, InputItem } from "./execution";
/**
 * Maintains a conversation history for an agent.
 */
export declare class Session {
    input: Input;
    constructor(input?: Input | InputItem);
    addInput(input: InputItem): void;
    getInput(): import("openai/resources/responses/responses.mjs").ResponseInput;
}
