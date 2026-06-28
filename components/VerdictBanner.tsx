import React from "react";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, ShieldAlert, Award, Info } from "lucide-react";
import { ConfidenceBreakdown } from "../lib/agent/state";

interface VerdictBannerProps {
  companyName: string;
  verdict: 'INVEST' | 'PASS' | '';
  confidenceScore: number;
  confidenceBreakdown: ConfidenceBreakdown;
  whyDidAIDecideThis: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | '';
  bullCase: string[];
  bearCase: string[];
}

export default function VerdictBanner({
  companyName,
  verdict,
  confidenceScore,
  confidenceBreakdown,
  whyDidAIDecideThis,
  riskLevel,
  bullCase,
  bearCase,
}: VerdictBannerProps) {
  const isInvest = verdict === "INVEST";

  // Colors for risk level
  const riskColors = {
    LOW: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", dot: "bg-emerald-500" },
    MODERATE: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-500" },
    HIGH: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", dot: "bg-rose-500" },
    "": { text: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30", dot: "bg-slate-50" }
  };

  const activeRisk = riskColors[riskLevel || "MODERATE"];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Verdict & Confidence Summary Card */}
      <div
        className={`relative overflow-hidden border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl bg-slate-950/40 transition-all duration-500 ${
          isInvest ? "border-emerald-500/30 shadow-emerald-950/10" : "border-rose-500/30 shadow-rose-950/10"
        }`}
      >
        {/* Decorative background glow */}
        <div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10 opacity-10 transition-all duration-1000 ${
            isInvest ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Verdict Text */}
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-2xl ${
                isInvest ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {isInvest ? (
                <CheckCircle className="w-12 h-12 stroke-[2.5]" />
              ) : (
                <ShieldAlert className="w-12 h-12 stroke-[2.5]" />
              )}
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-slate-500">Final Verdict</div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {isInvest ? "INVEST" : "PASS"} IN{" "}
                <span className={isInvest ? "text-emerald-400" : "text-rose-400"}>
                  {companyName.toUpperCase()}
                </span>
              </h1>
            </div>
          </div>

          {/* Confidence Slider/Meter */}
          <div className="w-full md:w-80 space-y-2">
            <div className="flex justify-between items-end text-sm">
              <span className="font-mono text-slate-500 text-xs uppercase tracking-widest">AI Conviction Score</span>
              <span
                className={`text-2xl font-extrabold font-mono ${
                  isInvest ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {confidenceScore}/100
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden shadow-inner border border-slate-800/80">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  isInvest ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-rose-500 to-orange-400"
                }`}
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono tracking-wider">
              <span>CAUTIOUS</span>
              <span>NEUTRAL</span>
              <span>CONVICTION</span>
            </div>
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className="mt-6 flex flex-wrap gap-3 items-center border-t border-slate-9050/80 pt-6">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${activeRisk.bg} ${activeRisk.border} ${activeRisk.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeRisk.dot}`} />
            RISK LEVEL: {riskLevel || "MODERATE"}
          </div>
          {confidenceScore <= 60 && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-semibold">
              <Info className="w-3.5 h-3.5" />
              Private/Unlisted Company Cap Applied
            </div>
          )}
        </div>
      </div>

      {/* Why Did AI Decide This Section */}
      {whyDidAIDecideThis && (
        <div className="bg-slate-950/40 border border-slate-850/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Decision Logic Reasoning Chain
          </h3>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
            {whyDidAIDecideThis}
          </p>
        </div>
      )}

      {/* Bull & Bear Case Side-By-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bull Case */}
        <div className="bg-slate-950/20 border border-emerald-950/60 hover:border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500 flex flex-col">
          <h3 className="text-base md:text-lg font-extrabold text-emerald-400 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Bull Case (Growth Moats)
          </h3>
          {bullCase.length > 0 ? (
            <ul className="space-y-3.5 flex-grow">
              {bullCase.map((bullet, idx) => (
                <li key={idx} className="flex gap-3 text-slate-300 text-xs leading-relaxed p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-2xl hover:border-emerald-800/40 transition-all duration-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="font-light">{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm italic flex-grow">No bull case highlights extracted.</p>
          )}
        </div>

        {/* Bear Case */}
        <div className="bg-slate-950/20 border border-rose-950/60 hover:border-rose-500/30 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500 flex flex-col">
          <h3 className="text-base md:text-lg font-extrabold text-rose-400 mb-6 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Bear Case (Key Vulnerabilities)
          </h3>
          {bearCase.length > 0 ? (
            <ul className="space-y-3.5 flex-grow">
              {bearCase.map((bullet, idx) => (
                <li key={idx} className="flex gap-3 text-slate-300 text-xs leading-relaxed p-4 bg-rose-950/10 border border-rose-900/30 rounded-2xl hover:border-rose-800/40 transition-all duration-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <span className="font-light">{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm italic flex-grow">No bear case highlights extracted.</p>
          )}
        </div>
      </div>

      {/* Confidence Score Breakdown (Visual Progress Bars) */}
      <div className="bg-slate-950/40 border border-slate-850/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
          Dimension Score Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* News Sentiment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">News Sentiment</span>
              <span className="text-white font-bold">{confidenceBreakdown.news}/100</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800/60">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${confidenceBreakdown.news}%` }}
              />
            </div>
          </div>

          {/* Financial Health */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Financial Health</span>
              <span className="text-white font-bold">{confidenceBreakdown.financial}/100</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800/60">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${confidenceBreakdown.financial}%` }}
              />
            </div>
          </div>

          {/* Competitive Moat */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Competitive Moat</span>
              <span className="text-white font-bold">{confidenceBreakdown.competitor}/100</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800/60">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${confidenceBreakdown.competitor}%` }}
              />
            </div>
          </div>

          {/* Risk Mitigation */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Risk Mitigation Score</span>
              <span className="text-white font-bold">{confidenceBreakdown.risk}/100</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800/60">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${confidenceBreakdown.risk}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Professional Advisory Disclaimer */}
      <div className="flex gap-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 text-[11px] text-rose-300/80 leading-relaxed font-mono">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-450 mt-0.5" />
        <p>
          <strong>DISCLAIMER:</strong> This research is AI-generated for educational and information purposes only. It is not financial advice. Investing in financial assets carries high risks. Always consult a SEBI-registered advisor (or your local registered advisor) before deploying capital.
        </p>
      </div>
    </div>
  );
}
