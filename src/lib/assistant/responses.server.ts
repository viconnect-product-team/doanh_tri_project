import { createOpenAI } from "@ai-sdk/openai";
import { streamText, stepCountIs, type ModelMessage, type ToolSet } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server.ts";

export function createResponsesCall(
  request: Request,
  config: { baseURL: string; apiKey: string; model: string },
  messages: ModelMessage[],
  instructions?: string,
  tools?: ToolSet,
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  let settleUpstream: (value: { status: number; message?: string }) => void = () => {};
  const upstreamReady = new Promise<{ status: number; message?: string }>(resolve => { settleUpstream = resolve; });
  const provider = createOpenAI({
    baseURL: `${config.baseURL.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`,
    apiKey: config.apiKey,
    headers: { "Lovable-API-Key": config.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      try {
        const response = await runIdFetch.fetch(input, init);
        if (!response.ok) {
          let message: string | undefined;
          try { const body = await response.clone().json() as { message?: string; error?: { message?: string } }; message = body.message || body.error?.message; } catch { /* no safe message */ }
          settleUpstream({ status: response.status, ...(message ? { message } : {}) });
        } else settleUpstream({ status: response.status });
        return response;
      } catch (e) { settleUpstream({ status: 500 }); throw e; }
    },
  });
  const reasoning = config.model !== "openai/chat-latest";
  const result = streamText({
    model: provider.responses(config.model),
    // AI SDK 6 lacks `instructions`: rename this key to `system` there.
    ...(instructions ? { instructions } : {}),
    messages,
    abortSignal: request.signal,
    ...(tools ? { tools } : {}),
    stopWhen: stepCountIs(50),
    maxRetries: 0,
    providerOptions: {
      openai: {
        store: false,
        ...(reasoning
          ? {
              forceReasoning: true,
              reasoningEffort: "medium",
              reasoningSummary: "auto",
              include: ["reasoning.encrypted_content"],
            }
          : {}),
      },
    },
  });
  return {
    result,
    runIdFetch,
    upstreamReady,
    response: () =>
      withLovableAiGatewayRunIdHeader(result.toUIMessageStreamResponse({ sendReasoning: true }), runIdFetch),
  };
}
