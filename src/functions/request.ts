import { registerFunctionHandler } from "./index";

export interface RequestOptions {
    url: string;
    method: "GET" | "POST";
    headers: Record<string, string>;
    body: any;
    parameters?: Record<string, "path" | "query" | "body">;
}

async function handleRequest(input: any, options: RequestOptions) {

    const { url, method, headers, body, parameters } = options;

    const reqUrl = new URL(url);
    Object.entries(input).forEach(([key, value]) => {
        const type = parameters && parameters[key] || (method === "GET" ? "query" : "body");
        if (type === "path") {
            reqUrl.pathname = reqUrl.pathname.replace(`{${key}}`, value as string);
        } else if (type === "query") {
            reqUrl.searchParams.append(key, value as string);
        } else if (type === "body") {
            body[key] = value;
        }
    });

    const response = await fetch(reqUrl, { 
        ...(headers ? { headers } : {}), 
        ...(method !== "GET" ? { method, body } : {}) 
    });

    const content = await response.text();

    if (!response.ok) {
        throw new Error(`Error fetching response: [${response.status}] ${content}`);
    }

    return content;
}

registerFunctionHandler("request", handleRequest);
