export type FunctionHandler = (input: any, options: any) => Promise<any>;
interface FunctionRegistry {
    [type: string]: FunctionHandler;
}
interface FunctionResult {
    type: string;
    data?: string;
    error?: string;
    status: "success" | "error";
    duration: number;
}
export declare const FunctionHandlers: FunctionRegistry;
export declare function registerFunctionHandler(type: string, handler: FunctionHandler): void;
export declare function executeFunction(type: string, input: any, options: any): Promise<FunctionResult>;
export {};
