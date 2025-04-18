import { Credentials } from "../execution";
export type Provider = {
    type: string;
    api?: string;
    model: string;
    credentials: Credentials;
    options?: Record<string, any>;
};
export declare const Providers: Record<string, Record<string, Provider>>;
export declare function registerDefaultProvider(provider: Provider): void;
export declare function getDefaultProvider(type: string, api: string): Provider | undefined;
