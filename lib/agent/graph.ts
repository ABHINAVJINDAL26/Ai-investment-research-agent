import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentStateAnnotation } from "./state";
import { newsResearchNode } from "./nodes/newsResearch";
import { financialAnalysisNode } from "./nodes/financialAnalysis";
import { competitiveAnalysisNode } from "./nodes/competitiveAnalysis";
import { riskAssessmentNode } from "./nodes/riskAssessment";
import { synthesisNode } from "./nodes/synthesize";

// Create the StateGraph by passing the state annotation
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("newsResearch", newsResearchNode)
  .addNode("financialAnalysis", financialAnalysisNode)
  .addNode("competitiveAnalysis", competitiveAnalysisNode)
  .addNode("riskAssessment", riskAssessmentNode)
  .addNode("synthesize", synthesisNode)
  
  // Define the edges connecting the nodes in a sequential research pipeline
  .addEdge(START, "newsResearch")
  .addEdge("newsResearch", "financialAnalysis")
  .addEdge("financialAnalysis", "competitiveAnalysis")
  .addEdge("competitiveAnalysis", "riskAssessment")
  .addEdge("riskAssessment", "synthesize")
  .addEdge("synthesize", END);

// Compile the workflow into a runnable graph
export const researchAgent = workflow.compile();
