"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOpenAIResponse = runOpenAIResponse;
// @ts-ignore: Suppress missing module declaration for openai
const openai_1 = __importDefault(require("openai"));
const execution_1 = require("../execution");
const index_1 = require("./index");
/**
 * Executes an OpenAI Responses API request.
 */
async function runOpenAIResponse(req) {
    var _a, _b, _c, _d, _e, _f, _g;
    const { provider, instructions, input, tools, format } = req;
    const openai = new openai_1.default({ apiKey: (_a = provider.options) === null || _a === void 0 ? void 0 : _a.apiKey });
    // @ts-ignore: bypass type mismatch for create call
    const response = await openai.responses.create({
        model: provider.model,
        ...provider.options,
        instructions,
        input,
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
    // extract text from response
    let output;
    if (!(format === null || format === void 0 ? void 0 : format.type) || (format === null || format === void 0 ? void 0 : format.type) === "text") {
        output = response.output_text || "";
    }
    else if ((format === null || format === void 0 ? void 0 : format.type) === "json") {
        output = JSON.parse(response.output_text);
    }
    const toolCalls = getToolCalls(response.output);
    return {
        output,
        ...(toolCalls ? { toolCalls } : {}),
        usage: {
            input_tokens: ((_b = response.usage) === null || _b === void 0 ? void 0 : _b.input_tokens) || 0,
            output_tokens: ((_c = response.usage) === null || _c === void 0 ? void 0 : _c.output_tokens) || 0,
            cached_tokens: ((_e = (_d = response.usage) === null || _d === void 0 ? void 0 : _d.input_tokens_details) === null || _e === void 0 ? void 0 : _e.cached_tokens) || 0,
            reasoning_tokens: ((_g = (_f = response.usage) === null || _f === void 0 ? void 0 : _f.output_tokens_details) === null || _g === void 0 ? void 0 : _g.reasoning_tokens) || 0,
        },
    };
}
function getToolCalls(output) {
    return output.filter((item) => item.type === "function_call").map((item) => {
        return {
            id: item.call_id,
            type: "function",
            function: {
                name: item.name,
                arguments: item.arguments,
            }
        };
    });
}
(0, execution_1.registerProviderHandler)("OpenAI", "Responses", runOpenAIResponse);
(0, index_1.registerDefaultProvider)({
    type: "OpenAI",
    api: "Responses",
    model: "gpt-4.1-mini",
    credentials: { apiKey: process.env.OPENAI_API_KEY },
});
