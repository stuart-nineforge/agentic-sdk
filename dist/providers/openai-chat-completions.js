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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const { provider, instructions, input, tools, format } = req;
    // initialize OpenAI client with credentials
    const openai = new openai_1.default({ apiKey: provider.credentials.apiKey });
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
    let output = ((_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || "";
    if ((format === null || format === void 0 ? void 0 : format.type) === "json") {
        output = JSON.parse(((_f = (_e = (_d = response.choices) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.message) === null || _f === void 0 ? void 0 : _f.content) || "");
    }
    const toolCalls = ((_j = (_h = (_g = response.choices) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.message) === null || _j === void 0 ? void 0 : _j.tool_calls) || null;
    return {
        output,
        ...(toolCalls ? { toolCalls } : {}),
        usage: {
            input_tokens: ((_k = response.usage) === null || _k === void 0 ? void 0 : _k.prompt_tokens) || 0,
            output_tokens: ((_l = response.usage) === null || _l === void 0 ? void 0 : _l.completion_tokens) || 0,
            cached_tokens: ((_o = (_m = response.usage) === null || _m === void 0 ? void 0 : _m.prompt_tokens_details) === null || _o === void 0 ? void 0 : _o.cached_tokens) || 0,
            reasoning_tokens: ((_q = (_p = response.usage) === null || _p === void 0 ? void 0 : _p.completion_tokens_details) === null || _q === void 0 ? void 0 : _q.reasoning_tokens) || 0,
        },
    };
}
(0, execution_1.registerProviderHandler)("OpenAI", "ChatCompletions", runOpenAIChatCompletion);
(0, index_1.registerDefaultProvider)({
    type: "OpenAI",
    api: "ChatCompletions",
    model: "gpt-4.1-mini",
    credentials: { apiKey: process.env.OPENAI_API_KEY },
});
