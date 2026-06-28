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
    if (!text) {
      return { 
        score: "N/A", 
        parsed: { intro: "Research pending...", sections: [] } 
      };
    }
    
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

    const cleanedText = contentLines.join("\n").trim();
    
    // Parse cleanedText structurally
    const splitLines = cleanedText.split("\n").map(l => l.trim()).filter(Boolean);
    let introLines: string[] = [];
    let currentSectionTitle = "";
    let currentSectionItems: string[] = [];
    
    interface Section {
      title: string;
      items: string[];
    }
    const sections: Section[] = [];

    for (const line of splitLines) {
      if (line.startsWith("-") || line.startsWith("*")) {
        const cleaned = line.replace(/^[-*]\s*/, "");
        currentSectionItems.push(cleaned);
      } else if (line.endsWith(":")) {
        if (currentSectionTitle || currentSectionItems.length > 0) {
          sections.push({ title: currentSectionTitle || "Details", items: currentSectionItems });
        }
        currentSectionTitle = line.replace(/:$/, "");
        currentSectionItems = [];
      } else {
        if (!currentSectionTitle && sections.length === 0) {
          introLines.push(line);
        } else {
          if (currentSectionTitle) {
            currentSectionItems.push(line);
          } else {
            introLines.push(line);
          }
        }
      }
    }

    if (currentSectionTitle || currentSectionItems.length > 0) {
      sections.push({ title: currentSectionTitle || "Details", items: currentSectionItems });
    }

    // Fallback if no sections are found but multiple lines exist
    if (sections.length === 0 && introLines.length > 1) {
      const [first, ...rest] = introLines;
      return {
        score,
        parsed: {
          intro: first,
          sections: rest.length > 0 ? [{ title: "Key Highlights", items: rest }] : []
        }
      };
    }

    return {
      score,
      parsed: {
        intro: introLines.join(" "),
        sections
      }
    };
  };

  const cards = [
    {
      id: "news",
      title: "News & Sentiment",
      icon: <Newspaper className="w-5 h-5 text-amber-400" />,
      borderColor: "hover:border-amber-500/30",
      bulletColor: "bg-amber-400",
      data: parseSections(newsFindings),
    },
    {
      id: "financial",
      title: "Financial Analysis",
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      borderColor: "hover:border-emerald-500/30",
      bulletColor: "bg-emerald-400",
      data: parseSections(financialData),
    },
    {
      id: "competitor",
      title: "Competition & Moat",
      icon: <Trophy className="w-5 h-5 text-blue-400" />,
      borderColor: "hover:border-blue-500/30",
      bulletColor: "bg-blue-400",
      data: parseSections(competitorAnalysis),
    },
    {
      id: "risk",
      title: "Risk Assessment",
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      borderColor: "hover:border-rose-500/30",
      bulletColor: "bg-rose-400",
      data: parseSections(riskFactors),
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-6">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-extrabold text-white tracking-wide">Detailed Research Dimensions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500 ${card.borderColor} flex flex-col`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl">{card.icon}</div>
                <h4 className="font-extrabold text-white text-base md:text-lg tracking-wide">{card.title}</h4>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/60 border border-slate-800/80 rounded-full text-[10px] font-extrabold font-mono text-slate-300 tracking-wider">
                SCORE: {card.data.score}/100
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow space-y-6">
              {card.data.parsed.intro && (
                <div className="text-slate-300 text-sm leading-relaxed font-light border-l-2 border-slate-700 pl-4 py-0.5">
                  {card.data.parsed.intro}
                </div>
              )}
              
              {card.data.parsed.sections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block border-b border-slate-900 pb-1.5 mb-1.5">
                    {section.title}
                  </span>
                  <div className="grid grid-cols-1 gap-3">
                    {section.items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx} 
                        className="bg-slate-950/40 border border-slate-900/60 hover:border-slate-800/40 rounded-2xl p-4 transition-all duration-300 group flex items-start gap-3"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${card.bulletColor}`} />
                        <p className="text-slate-300 text-xs leading-relaxed font-light group-hover:text-slate-200">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
