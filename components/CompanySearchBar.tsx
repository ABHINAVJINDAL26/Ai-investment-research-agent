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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mt-6">
      <div className="relative flex items-center bg-slate-900/80 border-2 border-slate-700 focus-within:border-amber-500/80 rounded-2xl shadow-lg transition-all duration-300 p-2 backdrop-blur-md">
        <div className="pl-3 text-slate-400">
          <Search className="w-6 h-6" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          placeholder={placeholder || "Enter company name (e.g., Zomato, Tesla, Infosys)..."}
          className="w-full py-3 px-4 bg-transparent text-white placeholder-slate-400 focus:outline-none text-lg font-medium"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-md disabled:shadow-none whitespace-nowrap"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-500 border-t-slate-900 rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {isLoading ? "Researching..." : "Research Stock"}
        </button>
      </div>
      <p className="text-center text-xs text-slate-500 mt-3 italic">
        Powered by AI Agentic workflows. Always cross-check results before making investment decisions.
      </p>
    </form>
  );
}
