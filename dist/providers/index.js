"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = void 0;
exports.registerDefaultProvider = registerDefaultProvider;
exports.getDefaultProvider = getDefaultProvider;
// Default provider registry
exports.Providers = {};
function registerDefaultProvider(provider) {
    exports.Providers[provider.type] = exports.Providers[provider.type] || {};
    exports.Providers[provider.type][provider.api || "default"] = provider;
}
function getDefaultProvider(type, api) {
    return exports.Providers[type][api || "default"];
}
