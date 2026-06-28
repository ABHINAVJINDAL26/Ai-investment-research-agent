import { AgentState } from "../state";
import { searchWeb } from "../tools/tavilySearch";
import { getLLM } from "../llm";
import { NEWS_SUMMARY_PROMPT } from "../../prompts/systemPrompts";

export async function newsResearchNode(state: AgentState) {
  const companyName = state.companyName;
  const logMessage = `🔍 Searching latest news and corporate developments for "${companyName}"...`;
  
  console.log(`[newsResearchNode] Starting for company: ${companyName}`);

  // 1. Search the web for latest news
  const searchQuery = `${companyName} latest news corporate developments earnings`;
  const searchResult = await searchWeb(searchQuery);

  // 2. Format search results for the LLM
  const searchResultsFormatted = searchResult.results
    .map((r, idx) => `[${idx + 1}] Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.content}\n`)
    .join("\n");

  // Extract source links
  const newSources = searchResult.results.map((r) => ({
    title: r.title,
    url: r.url,
  }));

  // 3. Prompt the LLM
  const model = getLLM(true); // JSON mode
  const prompt = NEWS_SUMMARY_PROMPT
    .replace("{companyName}", companyName)
    .replace("{searchResults}", searchResultsFormatted);

  let summary = "";
  let bullets: string[] = [];
  let score = 50;

  try {
    const response = await model.invoke(prompt);
    const resultJson = JSON.parse(response.content.toString());
    summary = resultJson.summary || "";
    
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
    console.error("Error parsing news node output:", error);
    summary = "Failed to analyze news developments.";
    bullets = ["Unable to retrieve detailed news highlights."];
    score = 50;
  }

  // Format news findings for state
  const newsFindingsString = `Sentiment Score: ${score}/100\n\n${summary}\n\nKey Highlights:\n` + 
    bullets.map((b) => `- ${b}`).join("\n");

  console.log(`[newsResearchNode] Finished. Sentiment score: ${score}`);

  return {
    newsFindings: newsFindingsString,
    sources: newSources,
    logs: [logMessage, `✅ News Research Complete (Sentiment Score: ${score}/100)`],
    confidenceBreakdown: {
      ...state.confidenceBreakdown,
      news: score,
    },
  };
}
