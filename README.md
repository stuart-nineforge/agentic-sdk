# Agentic SDK

A modular, extensible TypeScript SDK for building agentic applications with pluggable LLM providers and session management.

## Features
- **Provider Registry:** Register and use multiple LLM providers (OpenAI, etc.)
- **Agent Abstraction:** Built-in agent class with session and message history
- **Extensible:** Easily add new providers and tools
- **TypeScript-first:** Strongly typed API

## Installation

```
npm install agentic-sdk
```

> Or clone and build locally:
>
> ```
> git clone <your-repo-url>
> cd agentic-sdk
> npm install
> npm run build
> ```

## Usage

### Using the Agent Class

```ts
import { Agent, Providers } from "agentic-sdk";

const provider = Providers.OpenAI.Responses;
const agent = new Agent({
  name: "Basic",
  description: "Basic chat assistant",
  instructions: "You are a helpful assistant.",
});

const response = await agent.execute(provider, "Tell me a knock-knock joke.");
console.log(response.output);
```

### Direct Execution

```ts
import { execute, getDefaultProvider } from "agentic-sdk";

const req = {
  provider: Providers.OpenAI.ChatCompletions,
  instructions: "You are a helpful assistant.",
  input: "Tell me a joke!",
};

const result = await execute(req);
console.log(result.output);
```


## API

### Core Types
- `Agent` — Agent abstraction with session and message history
- `execute` — Directly execute a request with a provider
- `Provider` — Provider config type
- `ExecutionRequest`, `ExecutionResponse`, `Message`, `Tool` — Core data types

### Providers
- **OpenAI Chat Completions** (`type: "OpenAI", api: "ChatCompletions"`)
- **OpenAI Responses** (`type: "OpenAI", api: "Responses"`)

## Extending Providers

To add your own providers, implement a handler and register it:

```ts
import { registerProviderHandler, registerDefaultProvider, Provider } from "agentic-sdk";

async function myHandler(req) { /* ... */ }
registerProviderHandler("MyProvider", "MyAPI", myHandler);
registerDefaultProvider({
  type: "MyProvider",
  api: "MyAPI",
  model: "my-model",
  credentials: { apiKey: "..." },
});
```

## Environment Variables
- Set `OPENAI_API_KEY` in your environment for OpenAI providers.

## Development
- Build: `npm run build`
- Test: See `/tests` folder for examples

## License
MIT 