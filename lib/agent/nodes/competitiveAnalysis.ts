import { AgentState } from "../state";
import { searchWeb } from "../tools/tavilySearch";
import { getLLM } from "../llm";
import { COMPETITOR_ANALYSIS_PROMPT } from "../../prompts/systemPrompts";

export async function competitiveAnalysisNode(state: AgentState) {
  const companyName = state.companyName;
  const logMessage = `🏆 Analyzing competitor landscape and market share for "${companyName}"...`;
  
  console.log(`[competitiveAnalysisNode] Starting for company: ${companyName}`);

  // 1. Search the web for competitor information
  const searchQuery = `${companyName} competitors market share moat competitive advantage`;
  const searchResult = await searchWeb(searchQuery);

  // 2. Format search results for LLM
  const searchResultsFormatted = searchResult.results
    .map((r, idx) => `[${idx + 1}] Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.content}\n`)
    .join("\n");

  const newSources = searchResult.results.map((r) => ({
    title: r.title,
    url: r.url,
  }));

  // 3. Prompt the LLM
  const model = getLLM(true); // JSON mode
  const prompt = COMPETITOR_ANALYSIS_PROMPT
    .replace("{companyName}", companyName)
    .replace("{searchResults}", searchResultsFormatted);

  let summary = "";
  let competitors: string[] = [];
  let bullets: string[] = [];
  let score = 50;

  try {
    const response = await model.invoke(prompt);
    const resultJson = JSON.parse(response.content.toString());
    summary = resultJson.summary || "";
    
    // Normalize competitors to array of strings
    if (Array.isArray(resultJson.competitors)) {
      competitors = resultJson.competitors.map(String);
    } else if (typeof resultJson.competitors === "string") {
      competitors = resultJson.competitors.split(",").map((c: string) => c.trim()).filter(Boolean);
    } else {
      competitors = [];
    }

    // Normalize bullets to array of strings
    if (Array.isArray(resultJson.bullets)) {
      bullets = resultJson.bullets.map(String);
    } else if (typeof resultJson.bullets === "string") {
      bullets = [resultJson.bullets];
    } else {
      bullets = [];
    }

    score = typeof resultJson.score === "number" ? resultJson.score : 50;
  } catch (error) {
    console.error("Error parsing competitor node output:", error);
    summary = "Failed to analyze competitive positioning.";
    bullets = ["Unable to retrieve competitor comparison details."];
    score = 50;
  }

  // Format competitor analysis for state
  const competitorAnalysisString = `Competitive Moat Score: ${score}/100\n\n${summary}\n\nKey Competitors: ${competitors.join(", ") || "None listed"}\n\nKey Findings:\n` + 
    bullets.map((b) => `- ${b}`).join("\n");

  console.log(`[competitiveAnalysisNode] Finished. Moat score: ${score}`);

  return {
    competitorAnalysis: competitorAnalysisString,
    sources: newSources,
    logs: [logMessage, `✅ Competition Analysis Complete (Moat Score: ${score}/100)`],
    confidenceBreakdown: {
      ...state.confidenceBreakdown,
      competitor: score,
    },
  };
}
