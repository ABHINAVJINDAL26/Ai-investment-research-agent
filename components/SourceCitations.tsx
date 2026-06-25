import React from "react";
import { Link2, ExternalLink } from "lucide-react";
import { SourceCitation } from "../lib/agent/state";

interface SourceCitationsProps {
  sources: SourceCitation[];
}

export default function SourceCitations({ sources }: SourceCitationsProps) {
  if (sources.length === 0) return null;

  // Helper to extract a friendly host name from a URL
  const getDomainName = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      return url.hostname.replace("www.", "");
    } catch (e) {
      return urlStr;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-950/40 border border-slate-900 rounded-3xl p-6 shadow-md">
      <div className="flex items-center gap-2 border-b border-slate-900 pb-2 mb-4">
        <Link2 className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-mono uppercase tracking-wider text-indigo-400">
          Auditable Source Citations ({sources.length})
        </h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl text-xs font-medium text-slate-300 transition-all duration-300 shadow-sm"
          >
            <span className="text-slate-400 truncate max-w-[200px]" title={source.title}>
              {source.title.length > 35 ? `${source.title.slice(0, 35)}...` : source.title}
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 flex-shrink-0">
              {getDomainName(source.url)}
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
