import { Annotation } from "@langchain/langgraph";

export interface SourceCitation {
  title: string;
  url: string;
}

export interface ConfidenceBreakdown {
  news: number;
  financial: number;
  competitor: number;
  risk: number;
}

export interface AgentState {
  companyName: string;
  newsFindings: string;
  financialData: string;
  competitorAnalysis: string;
  riskFactors: string;
  finalVerdict: 'INVEST' | 'PASS' | '';
  confidenceScore: number;
  confidenceBreakdown: ConfidenceBreakdown;
  sources: SourceCitation[];
  logs: string[];
  whyDidAIDecideThis: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | '';
  bullCase: string[];
  bearCase: string[];
}

export const AgentStateAnnotation = Annotation.Root({
  companyName: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  newsFindings: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  financialData: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  competitorAnalysis: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  riskFactors: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  finalVerdict: Annotation<'INVEST' | 'PASS' | ''>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  confidenceScore: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  confidenceBreakdown: Annotation<ConfidenceBreakdown>({
    reducer: (x, y) => y ?? x,
    default: () => ({ news: 0, financial: 0, competitor: 0, risk: 0 }),
  }),
  sources: Annotation<SourceCitation[]>({
    reducer: (x, y) => (x || []).concat(y || []),
    default: () => [],
  }),
  logs: Annotation<string[]>({
    reducer: (x, y) => (x || []).concat(y || []),
    default: () => [],
  }),
  whyDidAIDecideThis: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  riskLevel: Annotation<'LOW' | 'MODERATE' | 'HIGH' | ''>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  bullCase: Annotation<string[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  bearCase: Annotation<string[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
});
