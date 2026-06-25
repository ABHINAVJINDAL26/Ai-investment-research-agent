import { AgentState } from "../state";
import { searchWeb } from "../tools/tavilySearch";
import { getLLM } from "../llm";
import { RISK_ASSESSMENT_PROMPT } from "../../prompts/systemPrompts";

export async function riskAssessmentNode(state: AgentState) {
  const companyName = state.companyName;
  const logMessage = `⚠️ Assessing risks, lawsuits, insider selling, and regulatory flags for "${companyName}"...`;
  
  console.log(`[riskAssessmentNode] Starting for company: ${companyName}`);

  // 1. Search the web for risk factors
  const searchQuery = `${companyName} regulatory issues lawsuit problems risk factors insider selling red flags`;
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
  const prompt = RISK_ASSESSMENT_PROMPT
    .replace("{companyName}", companyName)
    .replace("{searchResults}", searchResultsFormatted);

  let summary = "";
  let bullets: string[] = [];
  let score = 50;

  try {
    const response = await model.invoke(prompt);
    const resultJson = JSON.parse(response.content.toString());
    summary = resultJson.summary || "";
    bullets = resultJson.bullets || [];
    score = typeof resultJson.score === "number" ? resultJson.score : 50;
  } catch (error) {
    console.error("Error parsing risk node output:", error);
    summary = "Failed to analyze risk indicators.";
    bullets = ["Unable to retrieve detailed risk parameters."];
    score = 50;
  }

  // Format risk factors for state
  const riskFactorsString = `Risk Mitigation Score: ${score}/100\n\n${summary}\n\nKey Risks Identified:\n` + 
    bullets.map((b) => `- ${b}`).join("\n");

  console.log(`[riskAssessmentNode] Finished. Risk mitigation score: ${score}`);

  return {
    riskFactors: riskFactorsString,
    sources: newSources,
    logs: [logMessage, `✅ Risk Assessment Complete (Risk Mitigation Score: ${score}/100)`],
    confidenceBreakdown: {
      ...state.confidenceBreakdown,
      risk: score,
    },
  };
}
