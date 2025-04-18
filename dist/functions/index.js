"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionHandlers = void 0;
exports.registerFunctionHandler = registerFunctionHandler;
exports.executeFunction = executeFunction;
exports.FunctionHandlers = {};
function registerFunctionHandler(type, handler) {
    exports.FunctionHandlers[type] = handler;
}
async function executeFunction(type, input, options) {
    const handler = exports.FunctionHandlers[type];
    if (!handler) {
        throw new Error(`Function handler '${type}' not found`);
    }
    const started = Date.now();
    try {
        return {
            type,
            data: await handler(input, options),
            status: "success",
            duration: Date.now() - started,
        };
    }
    catch (error) {
        return {
            type,
            error: error instanceof Error ? error.message : "Unknown error",
            status: "error",
            duration: Date.now() - started,
        };
    }
}
