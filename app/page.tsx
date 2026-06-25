"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRightLeft, TrendingUp, HelpCircle, FileBarChart2 } from "lucide-react";
import CompanySearchBar from "../components/CompanySearchBar";
import AgentProgressTracker from "../components/AgentProgressTracker";
import VerdictBanner from "../components/VerdictBanner";
import ResearchSummaryCard from "../components/ResearchSummaryCard";
import SourceCitations from "../components/SourceCitations";

interface TargetState {
  companyName: string;
  isLoading: boolean;
  currentNode: string;
  logs: string[];
  completedNodes: string[];
  newsFindings: string;
  financialData: string;
  competitorAnalysis: string;
  riskFactors: string;
  finalVerdict: 'INVEST' | 'PASS' | '';
  confidenceScore: number;
  confidenceBreakdown: { news: number; financial: number; competitor: number; risk: number };
  sources: { title: string; url: string }[];
  whyDidAIDecideThis: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | '';
  bullCase: string[];
  bearCase: string[];
  error: string;
  showResult: boolean;
}

const initialTargetState = (): TargetState => ({
  companyName: "",
  isLoading: false,
  currentNode: "",
  logs: [],
  completedNodes: [],
  newsFindings: "",
  financialData: "",
  competitorAnalysis: "",
  riskFactors: "",
  finalVerdict: "",
  confidenceScore: 0,
  confidenceBreakdown: { news: 0, financial: 0, competitor: 0, risk: 0 },
  sources: [],
  whyDidAIDecideThis: "",
  riskLevel: "",
  bullCase: [],
  bearCase: [],
  error: "",
  showResult: false,
});

export default function Home() {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [leftState, setLeftState] = useState<TargetState>(initialTargetState());
  const [rightState, setRightState] = useState<TargetState>(initialTargetState());

  const handleResearch = async (company: string, side: 'left' | 'right') => {
    const updateState = side === 'left' ? setLeftState : setRightState;

    // Reset target state
    updateState({
      ...initialTargetState(),
      companyName: company,
      isLoading: true,
      logs: [`Initiating agent sequence for "${company}"...`],
    });

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: company }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to initialize stream.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ReadableStream not supported on client.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse event and data
          const eventMatch = line.match(/^event: (.+)$/m);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (eventMatch && dataMatch) {
            const event = eventMatch[1].trim();
            const data = JSON.parse(dataMatch[1].trim());

            if (event === "start") {
              updateState((prev) => ({
                ...prev,
                logs: [...prev.logs, data.message],
              }));
            } else if (event === "progress") {
              const { node, state: agentState } = data;
              updateState((prev) => ({
                ...prev,
                currentNode: node,
                completedNodes: [...prev.completedNodes, node],
                logs: [...prev.logs, ...data.logs],
                newsFindings: agentState.newsFindings || prev.newsFindings,
                financialData: agentState.financialData || prev.financialData,
                competitorAnalysis: agentState.competitorAnalysis || prev.competitorAnalysis,
                riskFactors: agentState.riskFactors || prev.riskFactors,
                sources: agentState.sources || prev.sources,
                confidenceBreakdown: agentState.confidenceBreakdown || prev.confidenceBreakdown,
              }));
            } else if (event === "result") {
              updateState((prev) => ({
                ...prev,
                isLoading: false,
                showResult: true,
                finalVerdict: data.finalVerdict,
                confidenceScore: data.confidenceScore,
                whyDidAIDecideThis: data.whyDidAIDecideThis,
                riskLevel: data.riskLevel,
                bullCase: data.bullCase || [],
                bearCase: data.bearCase || [],
                logs: [...prev.logs, `🎉 Investment research for "${company}" completed!`],
              }));
            } else if (event === "error") {
              throw new Error(data.message || "An error occurred during agent research.");
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      updateState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || "An unexpected error occurred.",
        logs: [...prev.logs, `❌ Error: ${err.message}`],
      }));
    }
  };

  const handleReset = (side?: 'left' | 'right') => {
    if (side === 'left') setLeftState(initialTargetState());
    else if (side === 'right') setRightState(initialTargetState());
    else {
      setLeftState(initialTargetState());
      setRightState(initialTargetState());
    }
  };

  return (
    <main className="min-h-screen bg-[#070b13] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,41,59,0.5),rgba(255,255,255,0))] text-slate-100 font-sans pb-16">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl -z-20 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-20 pointer-events-none" />

      {/* Navigation Header */}
      <nav className="border-b border-slate-900 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-amber-500 to-yellow-400 p-2 rounded-xl text-slate-950 shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                EQUITYEDGE
              </span>
              <span className="text-[10px] block font-mono text-amber-500 tracking-widest leading-none font-bold">
                INVESTMENT LAB
              </span>
            </div>
          </div>

          {/* Mode Toggle Button */}
          <button
            onClick={() => {
              setIsCompareMode(!isCompareMode);
              handleReset();
            }}
            className="flex items-center gap-2 border border-slate-800 hover:border-slate-700 bg-slate-900/60 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 transition-all duration-300 shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-500" />
            {isCompareMode ? "Single Asset Mode" : "Asset Compare Mode"}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        
        {/* Title Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Smart Equity Due Diligence
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI Investment Research Agent
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed font-normal">
            autonomously crawls earnings transcripts, checks balance sheet metrics on Alpha Vantage, analyzes competitors, and delivers a transparent invest or pass verdict in 60 seconds.
          </p>
        </div>

        {/* COMPARISON MODE */}
        {isCompareMode ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-slate-900 pb-12">
              {/* Left Column (Asset 1) */}
              <div className="space-y-8 border-r border-slate-900/80 pr-0 lg:pr-8">
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Asset Primary Target</h3>
                  <CompanySearchBar
                    onSearch={(comp) => handleResearch(comp, 'left')}
                    isLoading={leftState.isLoading}
                    placeholder="Enter first company (e.g. Zomato)..."
                  />
                  {leftState.error && <p className="text-sm text-rose-500 mt-2 font-medium">Error: {leftState.error}</p>}
                </div>

                {leftState.isLoading && (
                  <AgentProgressTracker
                    currentNode={leftState.currentNode}
                    logs={leftState.logs}
                    completedNodes={leftState.completedNodes}
                  />
                )}

                {leftState.showResult && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3">
                      <span className="text-slate-400 text-xs font-mono">ASSET RESEARCH LOADED</span>
                      <button onClick={() => handleReset('left')} className="text-xs text-rose-400 hover:text-rose-300 font-bold">
                        Clear Result
                      </button>
                    </div>
                    <VerdictBanner
                      companyName={leftState.companyName}
                      verdict={leftState.finalVerdict}
                      confidenceScore={leftState.confidenceScore}
                      confidenceBreakdown={leftState.confidenceBreakdown}
                      whyDidAIDecideThis={leftState.whyDidAIDecideThis}
                      riskLevel={leftState.riskLevel}
                      bullCase={leftState.bullCase}
                      bearCase={leftState.bearCase}
                    />
                    <ResearchSummaryCard
                      newsFindings={leftState.newsFindings}
                      financialData={leftState.financialData}
                      competitorAnalysis={leftState.competitorAnalysis}
                      riskFactors={leftState.riskFactors}
                    />
                    <SourceCitations sources={leftState.sources} />
                  </div>
                )}
              </div>

              {/* Right Column (Asset 2) */}
              <div className="space-y-8 pl-0 lg:pl-8">
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Asset Secondary Target</h3>
                  <CompanySearchBar
                    onSearch={(comp) => handleResearch(comp, 'right')}
                    isLoading={rightState.isLoading}
                    placeholder="Enter second company (e.g. Swiggy)..."
                  />
                  {rightState.error && <p className="text-sm text-rose-500 mt-2 font-medium">Error: {rightState.error}</p>}
                </div>

                {rightState.isLoading && (
                  <AgentProgressTracker
                    currentNode={rightState.currentNode}
                    logs={rightState.logs}
                    completedNodes={rightState.completedNodes}
                  />
                )}

                {rightState.showResult && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3">
                      <span className="text-slate-400 text-xs font-mono">ASSET RESEARCH LOADED</span>
                      <button onClick={() => handleReset('right')} className="text-xs text-rose-400 hover:text-rose-300 font-bold">
                        Clear Result
                      </button>
                    </div>
                    <VerdictBanner
                      companyName={rightState.companyName}
                      verdict={rightState.finalVerdict}
                      confidenceScore={rightState.confidenceScore}
                      confidenceBreakdown={rightState.confidenceBreakdown}
                      whyDidAIDecideThis={rightState.whyDidAIDecideThis}
                      riskLevel={rightState.riskLevel}
                      bullCase={rightState.bullCase}
                      bearCase={rightState.bearCase}
                    />
                    <ResearchSummaryCard
                      newsFindings={rightState.newsFindings}
                      financialData={rightState.financialData}
                      competitorAnalysis={rightState.competitorAnalysis}
                      riskFactors={rightState.riskFactors}
                    />
                    <SourceCitations sources={rightState.sources} />
                  </div>
                )}
              </div>
            </div>

            {/* Compare Dashboard Side-by-side Highlights (Visible when both targets have loaded results) */}
            {leftState.showResult && rightState.showResult && (
              <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-slideUp">
                <div className="flex items-center gap-2.5 border-b border-slate-900 pb-3">
                  <FileBarChart2 className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-bold text-white">Side-by-Side Asset Comparison</h2>
                </div>
                <div className="grid grid-cols-3 gap-4 font-mono text-xs uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-900">
                  <div>Dimension</div>
                  <div className="text-center">{leftState.companyName}</div>
                  <div className="text-center">{rightState.companyName}</div>
                </div>

                <div className="space-y-4 divide-y divide-slate-900/50">
                  <div className="grid grid-cols-3 gap-4 items-center pt-2">
                    <span className="text-sm font-semibold text-slate-300">Final Verdict</span>
                    <div className="text-center">
                      <span className={`text-base font-extrabold px-3 py-1 rounded-xl ${leftState.finalVerdict === 'INVEST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {leftState.finalVerdict}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className={`text-base font-extrabold px-3 py-1 rounded-xl ${rightState.finalVerdict === 'INVEST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {rightState.finalVerdict}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center pt-4">
                    <span className="text-sm font-semibold text-slate-300">Conviction Score</span>
                    <div className={`text-center font-bold font-mono text-lg ${leftState.finalVerdict === 'INVEST' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {leftState.confidenceScore}/100
                    </div>
                    <div className={`text-center font-bold font-mono text-lg ${rightState.finalVerdict === 'INVEST' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {rightState.confidenceScore}/100
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center pt-4">
                    <span className="text-sm font-semibold text-slate-300">Risk Profile</span>
                    <div className="text-center font-mono font-bold text-xs">{leftState.riskLevel}</div>
                    <div className="text-center font-mono font-bold text-xs">{rightState.riskLevel}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center pt-4">
                    <span className="text-sm font-semibold text-slate-300">Financial Score</span>
                    <div className="text-center font-mono text-xs">{leftState.confidenceBreakdown.financial}/100</div>
                    <div className="text-center font-mono text-xs">{rightState.confidenceBreakdown.financial}/100</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center pt-4">
                    <span className="text-sm font-semibold text-slate-300">News Sentiment</span>
                    <div className="text-center font-mono text-xs">{leftState.confidenceBreakdown.news}/100</div>
                    <div className="text-center font-mono text-xs">{rightState.confidenceBreakdown.news}/100</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center pt-4">
                    <span className="text-sm font-semibold text-slate-300">Competitor Moat</span>
                    <div className="text-center font-mono text-xs">{leftState.confidenceBreakdown.competitor}/100</div>
                    <div className="text-center font-mono text-xs">{rightState.confidenceBreakdown.competitor}/100</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* SINGLE ASSET MODE */
          <div className="space-y-12">
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8">
              <CompanySearchBar
                onSearch={(comp) => handleResearch(comp, 'left')}
                isLoading={leftState.isLoading}
              />
              {leftState.error && (
                <div className="max-w-2xl mx-auto mt-4 p-4 border border-rose-500/20 bg-rose-500/10 rounded-2xl text-rose-400 text-sm font-semibold text-center">
                  Error during research: {leftState.error}
                </div>
              )}
            </div>

            {leftState.isLoading && (
              <AgentProgressTracker
                currentNode={leftState.currentNode}
                logs={leftState.logs}
                completedNodes={leftState.completedNodes}
              />
            )}

            {leftState.showResult && (
              <div className="space-y-10 animate-fadeIn">
                <VerdictBanner
                  companyName={leftState.companyName}
                  verdict={leftState.finalVerdict}
                  confidenceScore={leftState.confidenceScore}
                  confidenceBreakdown={leftState.confidenceBreakdown}
                  whyDidAIDecideThis={leftState.whyDidAIDecideThis}
                  riskLevel={leftState.riskLevel}
                  bullCase={leftState.bullCase}
                  bearCase={leftState.bearCase}
                />
                <ResearchSummaryCard
                  newsFindings={leftState.newsFindings}
                  financialData={leftState.financialData}
                  competitorAnalysis={leftState.competitorAnalysis}
                  riskFactors={leftState.riskFactors}
                />
                <SourceCitations sources={leftState.sources} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
