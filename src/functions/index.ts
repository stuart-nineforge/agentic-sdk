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

export const FunctionHandlers: FunctionRegistry = {};

export function registerFunctionHandler(type: string, handler: FunctionHandler) {
  FunctionHandlers[type] = handler;
}

export async function executeFunction(type: string, input: any, options: any): Promise<FunctionResult> {
  const handler = FunctionHandlers[type];
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
  } catch (error) {
    return {
      type,
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error",
      duration: Date.now() - started,
    };
  }
}
