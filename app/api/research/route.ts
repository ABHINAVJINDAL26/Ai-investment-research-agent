import { researchAgent } from "../../../lib/agent/graph";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { companyName } = body;

    if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
      return new Response(JSON.stringify({ error: "Company name is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Input sanitization: limit character length to prevent buffer/token attacks, 
    // and strip HTML/Script/Bracket characters to prevent prompt injections.
    companyName = companyName.trim().slice(0, 50);
    companyName = companyName.replace(/[<>'"\{\}\[\]\\\/]/g, "");

    if (!companyName) {
      return new Response(JSON.stringify({ error: "Invalid company name after sanitization." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        try {
          console.log(`[API Route] Starting LangGraph streaming for: ${companyName}`);
          sendEvent("start", { message: `Initializing investment research for "${companyName}"...` });

          // Start the LangGraph execution stream
          const agentStream = await researchAgent.stream({
            companyName: companyName,
            newsFindings: "",
            financialData: "",
            competitorAnalysis: "",
            riskFactors: "",
            finalVerdict: "",
            confidenceScore: 0,
            confidenceBreakdown: { news: 0, financial: 0, competitor: 0, risk: 0 },
            sources: [],
            logs: [`Starting research agent for ${companyName}...`],
            whyDidAIDecideThis: "",
            riskLevel: "",
            bullCase: [],
            bearCase: [],
          }, {
            streamMode: "updates"
          });

          let accumulatedState: any = {
            companyName,
            sources: [],
            logs: [],
            confidenceBreakdown: { news: 0, financial: 0, competitor: 0, risk: 0 }
          };

          for await (const chunk of agentStream) {
            const nodeName = Object.keys(chunk)[0];
            const nodeOutput = (chunk as any)[nodeName];
            // Merge details into accumulatedState
            if (nodeOutput) {
              if (nodeOutput.logs) {
                accumulatedState.logs = [...accumulatedState.logs, ...nodeOutput.logs];
              }
              if (nodeOutput.sources) {
                // Deduplicate sources by URL
                const combinedSources = [...accumulatedState.sources, ...nodeOutput.sources];
                const uniqueSources = Array.from(
                  new Map(combinedSources.map((item) => [item.url, item])).values()
                );
                accumulatedState.sources = uniqueSources;
              }
              if (nodeOutput.confidenceBreakdown) {
                accumulatedState.confidenceBreakdown = {
                  ...accumulatedState.confidenceBreakdown,
                  ...nodeOutput.confidenceBreakdown
                };
              }
              
              // Merge other fields
              accumulatedState = {
                ...accumulatedState,
                ...nodeOutput
              };
            }

            // Stream progress event to the client
            sendEvent("progress", {
              node: nodeName,
              status: "complete",
              logs: nodeOutput.logs || [],
              state: accumulatedState
            });
          }

          // Send final completed result state
          sendEvent("result", accumulatedState);
        } catch (error: any) {
          console.error("[API Route] Error in agent stream:", error);
          sendEvent("error", { message: error?.message || "An error occurred during agent execution." });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("[API Route] Error in POST handler:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
