"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProviderHandler = registerProviderHandler;
exports.execute = execute;
;
;
const providerRegistry = {};
function registerProviderHandler(type, api, handler) {
    providerRegistry[type] = providerRegistry[type] || {};
    providerRegistry[type][api || "default"] = handler;
}
async function execute(req) {
    const start = Date.now();
    try {
        if (!req || !req.provider) {
            throw new Error("Provider is required");
        }
        const providerType = req.provider.type;
        const providerApi = req.provider.api || "default";
        const provider = providerRegistry[providerType];
        const handler = provider[providerApi];
        if (!handler) {
            throw new Error(`No handler registered for provider type: ${providerType} api: ${providerApi}`);
        }
        const result = await handler(req);
        result.usage.duration = Date.now() - start;
        return result;
    }
    catch (error) {
        return {
            error: error,
            usage: {
                input_tokens: 0,
                output_tokens: 0,
                cached_tokens: 0,
                reasoning_tokens: 0,
                total_tokens: 0,
                duration: Date.now() - start,
            },
        };
    }
}
