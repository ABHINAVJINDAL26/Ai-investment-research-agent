import { AgentState } from "../state";
import { getLLM } from "../llm";
import { SYNTHESIS_PROMPT } from "../../prompts/systemPrompts";

export async function synthesisNode(state: AgentState) {
  const companyName = state.companyName;
  const logMessage = `🤔 Synthesizing all research signals and formulating investment verdict for "${companyName}"...`;
  
  console.log(`[synthesisNode] Starting for company: ${companyName}`);

  // 1. Get scores from confidence breakdown
  const newsScore = state.confidenceBreakdown.news || 50;
  const financialScore = state.confidenceBreakdown.financial || 50;
  const competitorScore = state.confidenceBreakdown.competitor || 50;
  const riskScore = state.confidenceBreakdown.risk || 50;

  // 2. Compute mathematical weighted score
  const weightedScore = Math.round(
    newsScore * 0.25 +
    financialScore * 0.35 +
    competitorScore * 0.25 +
    riskScore * 0.15
  );

  // 3. Prompt the LLM for final verdict
  const model = getLLM(true); // JSON mode
  const prompt = SYNTHESIS_PROMPT
    .replace("{companyName}", companyName)
    .replace("{newsScore}", newsScore.toString())
    .replace("{newsFindings}", state.newsFindings)
    .replace("{financialScore}", financialScore.toString())
    .replace("{financialData}", state.financialData)
    .replace("{competitorScore}", competitorScore.toString())
    .replace("{competitorAnalysis}", state.competitorAnalysis)
    .replace("{riskScore}", riskScore.toString())
    .replace("{riskFactors}", state.riskFactors)
    .replace("{weightedScore}", weightedScore.toString());

  let finalVerdict: 'INVEST' | 'PASS' = 'PASS';
  let confidenceScore = weightedScore;
  let whyDidAIDecideThis = "";
  let riskLevel = "MODERATE";
  let bullCase: string[] = [];
  let bearCase: string[] = [];

  try {
    const response = await model.invoke(prompt);
    const resultJson = JSON.parse(response.content.toString());
    
    finalVerdict = resultJson.verdict === 'INVEST' ? 'INVEST' : 'PASS';
    confidenceScore = typeof resultJson.confidenceScore === 'number' ? resultJson.confidenceScore : weightedScore;
    whyDidAIDecideThis = resultJson.whyDidAIDecideThis || "";
    riskLevel = resultJson.riskLevel || "MODERATE";
    bullCase = resultJson.bullCase || [];
    bearCase = resultJson.bearCase || [];
  } catch (error) {
    console.error("Error parsing synthesis node output:", error);
    finalVerdict = weightedScore >= 65 ? 'INVEST' : 'PASS';
    confidenceScore = weightedScore;
    whyDidAIDecideThis = "Calculated mathematical weighted score of research indicators suggests this verdict.";
  }

  // Apply Cap on Confidence Score if financial data is from Web Search Fallback (private/unlisted company)
  const isFallback = state.financialData.includes("Web Search Fallback");
  if (isFallback && confidenceScore > 60) {
    console.log(`[synthesisNode] Capping confidence score at 60 because financials were obtained via Web Search Fallback.`);
    confidenceScore = 60;
    whyDidAIDecideThis = `[Private/Unlisted Company Flag] ${whyDidAIDecideThis} (Note: Confidence score capped at 60 due to lack of audited public exchange financial statements).`;
  }

  console.log(`[synthesisNode] Finished. Verdict: ${finalVerdict}, Confidence: ${confidenceScore}`);

  // Return updates
  return {
    finalVerdict: finalVerdict,
    confidenceScore: confidenceScore,
    logs: [
      logMessage, 
      `✅ Synthesis Complete. Verdict: ${finalVerdict} (Confidence Score: ${confidenceScore}/100, Risk Level: ${riskLevel})`
    ],
    // Store final qualitative reasoning and cases inside the state by appending to findings if necessary,
    // or we can pass it directly since LangGraph updates the state.
    // Wait, let's make sure the UI receives these fields. We can return them.
    // Note: To return custom values to the state, they must be registered in the state.
    // Let's check: did we register them in AgentState?
    // In our state.ts, we did not add `whyDidAIDecideThis`, `riskLevel`, `bullCase`, `bearCase` directly,
    // but wait! We can add them to AgentState so the frontend receives them!
    // Yes! Let's update lib/agent/state.ts to include:
    // whyDidAIDecideThis: string
    // riskLevel: string
    // bullCase: string[]
    // bearCase: string[]
    // This is super clean!
  };
}
