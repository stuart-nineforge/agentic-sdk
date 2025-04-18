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
    return handler(req);
}
