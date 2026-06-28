import React, { useState } from "react";
import { Search, Sparkles } from "lucide-react";

interface CompanySearchBarProps {
  onSearch: (companyName: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function CompanySearchBar({ onSearch, isLoading, placeholder }: CompanySearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mt-4">
      <div className="relative flex items-center bg-slate-950/40 border border-slate-800/80 focus-within:border-amber-500/60 focus-within:ring-4 focus-within:ring-amber-500/10 rounded-2xl shadow-2xl transition-all duration-500 p-2 backdrop-blur-xl">
        <div className="pl-3 text-slate-500 transition-colors duration-300">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          placeholder={placeholder || "Enter company name (e.g., Zomato, Tesla, Infosys)..."}
          className="w-full py-2 px-3 bg-transparent text-white placeholder-slate-500 focus:outline-none text-base md:text-lg font-light tracking-wide transition-all duration-300"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 disabled:from-slate-900 disabled:to-slate-900 text-slate-950 disabled:text-slate-600 font-extrabold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-amber-500/10 disabled:shadow-none whitespace-nowrap text-sm tracking-wide cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-slate-500 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isLoading ? "Running Pipeline..." : "Analyze Stock"}
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-500 mt-2.5 font-mono tracking-wider uppercase">
        ⚡ Structured Multi-Stage Agentic Verification
      </p>
    </form>
  );
}
