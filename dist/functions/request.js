"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
async function handleRequest(input, options) {
    const { url, method, headers, body, parameters } = options;
    const reqUrl = new URL(url);
    Object.entries(input).forEach(([key, value]) => {
        const type = parameters && parameters[key] || (method === "GET" ? "query" : "body");
        if (type === "path") {
            reqUrl.pathname = reqUrl.pathname.replace(`{${key}}`, value);
        }
        else if (type === "query") {
            reqUrl.searchParams.append(key, value);
        }
        else if (type === "body") {
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
(0, index_1.registerFunctionHandler)("request", handleRequest);
