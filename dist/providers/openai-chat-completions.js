"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOpenAIChatCompletion = runOpenAIChatCompletion;
// @ts-ignore: Suppress missing module declaration for openai
const openai_1 = __importDefault(require("openai"));
const execution_1 = require("../execution");
const index_1 = require("./index");
/**
 * Executes an OpenAI Chat Completions request.
 */
async function runOpenAIChatCompletion(req) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const { provider, instructions, input, tools, format } = req;
    // initialize OpenAI client with credentials
    const openai = new openai_1.default({ ...(provider.credentials ? provider.credentials : {}) });
    const messages = [
        { role: "system", content: instructions },
        ...(typeof input === "string"
            ? [{ role: "user", content: input }]
            : input),
    ];
    // @ts-ignore: bypass type mismatch for create call
    const response = await openai.chat.completions.create({
        model: provider.model,
        // spread any model-specific options
        ...provider.options,
        messages,
        ...(tools ?
            {
                tools: tools === null || tools === void 0 ? void 0 : tools.map((tool) => ({
                    type: "function",
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters,
                    strict: true,
                })),
                tool_choice: "auto",
            } : {}),
    });
    const message = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message;
    let output = [{
            id: response.id,
            type: "message",
            role: "assistant",
            content: [
                { type: "output_text", text: message.content || "", annotations: [] }
            ],
            status: "completed"
        }];
    const toolCalls = ((_e = (_d = (_c = response.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.tool_calls) || null;
    return {
        output,
        ...(toolCalls ? { toolCalls } : {}),
        usage: {
            input_tokens: ((_f = response.usage) === null || _f === void 0 ? void 0 : _f.prompt_tokens) || 0,
            output_tokens: ((_g = response.usage) === null || _g === void 0 ? void 0 : _g.completion_tokens) || 0,
            cached_tokens: ((_j = (_h = response.usage) === null || _h === void 0 ? void 0 : _h.prompt_tokens_details) === null || _j === void 0 ? void 0 : _j.cached_tokens) || 0,
            reasoning_tokens: ((_l = (_k = response.usage) === null || _k === void 0 ? void 0 : _k.completion_tokens_details) === null || _l === void 0 ? void 0 : _l.reasoning_tokens) || 0,
            total_tokens: ((_m = response.usage) === null || _m === void 0 ? void 0 : _m.total_tokens) || 0,
        },
    };
}
(0, execution_1.registerProviderHandler)("OpenAI", "ChatCompletions", runOpenAIChatCompletion);
(0, index_1.registerDefaultProvider)({
    type: "OpenAI",
    api: "ChatCompletions",
    model: "gpt-4.1-mini",
});
