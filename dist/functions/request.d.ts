export interface RequestOptions {
    url: string;
    method: "GET" | "POST";
    headers: Record<string, string>;
    body: any;
    parameters?: Record<string, "path" | "query" | "body">;
}
