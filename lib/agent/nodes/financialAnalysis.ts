import { AgentState } from "../state";
import { getFinancialData } from "../tools/alphaVantage";
import { searchWeb } from "../tools/tavilySearch";
import { getLLM } from "../llm";
import { FINANCIAL_ANALYSIS_PROMPT, FINANCIAL_FALLBACK_PROMPT } from "../../prompts/systemPrompts";

export async function financialAnalysisNode(state: AgentState) {
  const companyName = state.companyName;
  let logMessage = "";
  let finalFinancialsString = "";
  let score = 50;
  let newSources: { title: string; url: string }[] = [];

  console.log(`[financialAnalysisNode] Starting for company: ${companyName}`);

  // 1. Try to fetch Alpha Vantage data
  logMessage = `📊 Querying financial statements from Alpha Vantage for "${companyName}"...`;
  const alphaData = await getFinancialData(companyName);

  if (alphaData) {
    console.log(`[financialAnalysisNode] Alpha Vantage data retrieved for ${companyName}`);
    
    // Format structured overview data
    const formattedData = Object.entries(alphaData)
      .filter(([key]) => key !== "rawOverview" && key !== "source")
      .map(([key, val]) => `${key}: ${val}`)
      .join("\n");

    const model = getLLM(true); // JSON mode
    const prompt = FINANCIAL_ANALYSIS_PROMPT
      .replace("{companyName}", companyName)
      .replace("{financialData}", formattedData);

    try {
      const response = await model.invoke(prompt);
      const resultJson = JSON.parse(response.content.toString());
      const summary = resultJson.summary || "";
      let bullets: string[] = [];
      if (Array.isArray(resultJson.bullets)) {
        bullets = resultJson.bullets.map(String);
      } else if (typeof resultJson.bullets === "string") {
        bullets = [resultJson.bullets];
      } else {
        bullets = [];
      }
      score = typeof resultJson.score === "number" ? resultJson.score : 50;

      finalFinancialsString = `Financial Health Score: ${score}/100 (Source: Alpha Vantage)\n\n${summary}\n\nKey Financial Metrics:\n` + 
        bullets.map((b: string) => `- ${b}`).join("\n");
    } catch (error) {
      console.error("Error parsing Alpha Vantage financial analysis:", error);
      finalFinancialsString = `Error analyzing Alpha Vantage structured financials. Raw data:\n${formattedData}`;
      score = 50;
    }
  } else {
    // 2. Fallback to web search
    console.log(`[financialAnalysisNode] Alpha Vantage data unavailable. Falling back to web search for ${companyName}`);
    const fallbackLog = `⚠️ Alpha Vantage data unavailable for "${companyName}" (private company or API rate limit). Falling back to web search for financial metrics...`;
    
    const searchQuery = `${companyName} revenue profit margins debt valuation financials`;
    const searchResult = await searchWeb(searchQuery);

    const searchResultsFormatted = searchResult.results
      .map((r, idx) => `[${idx + 1}] Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.content}\n`)
      .join("\n");

    newSources = searchResult.results.map((r) => ({
      title: r.title,
      url: r.url,
    }));

    const model = getLLM(true); // JSON mode
    const prompt = FINANCIAL_FALLBACK_PROMPT
      .replace("{companyName}", companyName)
      .replace("{searchResults}", searchResultsFormatted);

    try {
      const response = await model.invoke(prompt);
      const resultJson = JSON.parse(response.content.toString());
      const summary = resultJson.summary || "";
      let bullets: string[] = [];
      if (Array.isArray(resultJson.bullets)) {
        bullets = resultJson.bullets.map(String);
      } else if (typeof resultJson.bullets === "string") {
        bullets = [resultJson.bullets];
      } else {
        bullets = [];
      }
      score = typeof resultJson.score === "number" ? resultJson.score : 50;

      // Cap confidence/score if private/fallback data is used, as specified by the guidelines
      // Capping score if it's a private company fallback
      finalFinancialsString = `Financial Health Score: ${score}/100 (Source: Web Search Fallback)\n\n${summary}\n\nKey Financial Findings:\n` + 
        bullets.map((b: string) => `- ${b}`).join("\n");
    } catch (error) {
      console.error("Error parsing fallback financial analysis:", error);
      finalFinancialsString = `Failed to extract financial data from web search for "${companyName}".`;
      score = 50;
    }

    return {
      financialData: finalFinancialsString,
      sources: newSources,
      logs: [
        logMessage, 
        fallbackLog, 
        `✅ Financial Analysis Complete via Web Fallback (Financial Health Score: ${score}/100)`
      ],
      confidenceBreakdown: {
        ...state.confidenceBreakdown,
        financial: score,
      },
    };
  }

  return {
    financialData: finalFinancialsString,
    sources: newSources,
    logs: [logMessage, `✅ Financial Analysis Complete (Financial Health Score: ${score}/100)`],
    confidenceBreakdown: {
      ...state.confidenceBreakdown,
      financial: score,
    },
  };
}
