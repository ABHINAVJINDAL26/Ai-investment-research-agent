import React, { useEffect, useRef } from "react";
import { CheckCircle2, Circle, Loader2, Terminal } from "lucide-react";

interface AgentProgressTrackerProps {
  currentNode: string;
  logs: string[];
  completedNodes: string[];
}

export default function AgentProgressTracker({ currentNode, logs, completedNodes }: AgentProgressTrackerProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const steps = [
    { id: "newsResearch", label: "News Research & Sentiment Analysis" },
    { id: "financialAnalysis", label: "Financial Data & Health Check" },
    { id: "competitiveAnalysis", label: "Competitor Moat & Market Share" },
    { id: "riskAssessment", label: "Risk Assessment & Red Flags" },
    { id: "synthesize", label: "Investment Verdict Synthesis" },
  ];

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          Agentic Research in Progress...
        </h3>
        <p className="text-sm text-slate-400">
          The agent is gathering and analyzing real-time data from financial sheets and web search.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedNodes.includes(step.id);
          const isCurrent = currentNode === step.id;
          
          let statusIcon = <Circle className="w-5 h-5 text-slate-600" />;
          let statusText = "text-slate-500";
          let rowBg = "border-transparent";

          if (isCompleted) {
            statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />;
            statusText = "text-emerald-400 font-medium";
          } else if (isCurrent) {
            statusIcon = <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
            statusText = "text-amber-400 font-semibold animate-pulse";
            rowBg = "bg-slate-800/40 border-slate-700/50 shadow-inner";
          }

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 px-4 py-3 border rounded-2xl transition-all duration-300 ${rowBg}`}
            >
              <div className="flex-shrink-0">{statusIcon}</div>
              <div className="flex-grow">
                <span className={`text-sm ${statusText}`}>{step.label}</span>
              </div>
              <div className="text-xs text-slate-500">
                {isCompleted ? "Complete" : isCurrent ? "Running..." : "Waiting"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs Terminal */}
      <div className="border border-slate-800 bg-slate-950 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-2 border-b border-slate-900 pb-2">
          <Terminal className="w-4 h-4 text-amber-500" />
          <span>AGENT LOG CONSOLE</span>
        </div>
        <div className="h-44 overflow-y-auto font-mono text-xs text-slate-300 space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {logs.map((log, idx) => {
            const isSuccess = log.startsWith("✅");
            const isWarning = log.startsWith("⚠️");
            let colorClass = "text-slate-300";
            if (isSuccess) colorClass = "text-emerald-400 font-semibold";
            else if (isWarning) colorClass = "text-rose-400";
            else if (log.startsWith("🔍") || log.startsWith("📊") || log.startsWith("🏆") || log.startsWith("🤔")) {
              colorClass = "text-amber-400/90";
            }
            return (
              <div key={idx} className={`leading-relaxed ${colorClass}`}>
                {log}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
