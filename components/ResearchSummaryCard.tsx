import React from "react";
import { Newspaper, DollarSign, Trophy, ShieldAlert, Sparkles } from "lucide-react";

interface ResearchSummaryCardProps {
  newsFindings: string;
  financialData: string;
  competitorAnalysis: string;
  riskFactors: string;
}

export default function ResearchSummaryCard({
  newsFindings,
  financialData,
  competitorAnalysis,
  riskFactors,
}: ResearchSummaryCardProps) {
  
  const parseSections = (text: string) => {
    if (!text) return { score: "N/A", textContent: "Research pending..." };
    
    const lines = text.split("\n");
    let score = "N/A";
    const contentLines: string[] = [];

    for (const line of lines) {
      if (line.includes("Score:")) {
        score = line.split("Score:")[1].split("/")[0].trim();
      } else {
        contentLines.push(line);
      }
    }

    return {
      score,
      textContent: contentLines.join("\n").trim()
    };
  };

  const cards = [
    {
      id: "news",
      title: "News & Sentiment",
      icon: <Newspaper className="w-5 h-5 text-amber-400" />,
      borderColor: "hover:border-amber-500/30",
      data: parseSections(newsFindings),
    },
    {
      id: "financial",
      title: "Financial Analysis",
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      borderColor: "hover:border-emerald-500/30",
      data: parseSections(financialData),
    },
    {
      id: "competitor",
      title: "Competition & Moat",
      icon: <Trophy className="w-5 h-5 text-blue-400" />,
      borderColor: "hover:border-blue-500/30",
      data: parseSections(competitorAnalysis),
    },
    {
      id: "risk",
      title: "Risk Assessment",
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      borderColor: "hover:border-rose-500/30",
      data: parseSections(riskFactors),
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-bold text-white">Detailed Research Dimensions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl transition-all duration-300 ${card.borderColor} flex flex-col`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-800/80 rounded-xl">{card.icon}</div>
                <h4 className="font-bold text-white text-base md:text-lg">{card.title}</h4>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/60 border border-slate-800 rounded-full text-xs font-bold font-mono text-slate-300">
                SCORE: {card.data.score}/100
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line font-light">
              {card.data.textContent}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
