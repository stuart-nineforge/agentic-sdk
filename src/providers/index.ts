import { Credentials } from "../execution";

export type Provider = {
    type: string;
    api?: string;
    model: string;
    credentials: Credentials;
    options?: Record<string, any>;
}

// Default provider registry
export const Providers: Record<string, Record<string, Provider>> = {};

export function registerDefaultProvider(provider: Provider) {
    Providers[provider.type] = Providers[provider.type] || {};
    Providers[provider.type][provider.api || "default"] = provider;
}

export function getDefaultProvider(type: string, api: string): Provider | undefined {
    return Providers[type][api || "default"];
}