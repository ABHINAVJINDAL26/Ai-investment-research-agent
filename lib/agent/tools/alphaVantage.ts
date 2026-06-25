export interface CompanyFinancials {
  symbol: string;
  name: string;
  sector: string;
  marketCap?: string;
  peRatio?: string;
  pegRatio?: string;
  dividendYield?: string;
  revenueTTM?: string;
  profitMargin?: string;
  operatingMargin?: string;
  debtToEquity?: string;
  revenueTrend?: string; // Annual revenue trend
  profitTrend?: string; // Annual profit trend
  rawOverview?: any;
  source: 'alpha_vantage' | 'web_search_fallback';
}

/**
 * Searches for a ticker symbol on Alpha Vantage.
 * Returns the best match symbol or null if not found.
 */
async function searchTicker(keywords: string, apiKey: string): Promise<{ symbol: string; name: string } | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
      keywords
    )}&apikey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.Note || data.Information) {
      console.warn("Alpha Vantage Rate Limit Hit during search:", data.Note || data.Information);
      return null;
    }

    const matches = data.bestMatches;
    if (matches && matches.length > 0) {
      // Return the first match
      const bestMatch = matches[0];
      return {
        symbol: bestMatch["1. symbol"],
        name: bestMatch["2. name"],
      };
    }
  } catch (e) {
    console.error("Error in Alpha Vantage searchTicker:", e);
  }
  return null;
}

/**
 * Fetches company overview from Alpha Vantage.
 */
async function fetchCompanyOverview(symbol: string, apiKey: string): Promise<any | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(
      symbol
    )}&apikey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.Note || data.Information) {
      console.warn("Alpha Vantage Rate Limit Hit during overview fetch:", data.Note || data.Information);
      return null;
    }

    if (data["Symbol"]) {
      return data;
    }
  } catch (e) {
    console.error("Error in Alpha Vantage fetchCompanyOverview:", e);
  }
  return null;
}

/**
 * Main entry point for retrieving financial data for a company name.
 * Automatically handles ticker resolution, API querying, and error fallback.
 */
export async function getFinancialData(companyName: string): Promise<CompanyFinancials | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    console.warn("ALPHA_VANTAGE_API_KEY is not set. Falling back to web search.");
    return null;
  }

  console.log(`[AlphaVantage] Searching ticker for company: ${companyName}`);
  const tickerMatch = await searchTicker(companyName, apiKey);
  if (!tickerMatch) {
    console.log(`[AlphaVantage] No ticker found or API rate limit hit for ${companyName}`);
    return null;
  }

  console.log(`[AlphaVantage] Found ticker: ${tickerMatch.symbol} (${tickerMatch.name})`);
  const overview = await fetchCompanyOverview(tickerMatch.symbol, apiKey);
  if (!overview) {
    console.log(`[AlphaVantage] Overview not available or API rate limit hit for ticker: ${tickerMatch.symbol}`);
    return null;
  }

  // Parse key fields from the Alpha Vantage Company Overview
  return {
    symbol: overview["Symbol"] || tickerMatch.symbol,
    name: overview["Name"] || tickerMatch.name,
    sector: overview["Sector"] || "Unknown",
    marketCap: overview["MarketCapitalization"] ? parseFloat(overview["MarketCapitalization"]).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : undefined,
    peRatio: overview["PERatio"] && overview["PERatio"] !== "None" ? overview["PERatio"] : undefined,
    pegRatio: overview["PEGRatio"] && overview["PEGRatio"] !== "None" ? overview["PEGRatio"] : undefined,
    dividendYield: overview["DividendYield"] && overview["DividendYield"] !== "None" ? `${(parseFloat(overview["DividendYield"]) * 100).toFixed(2)}%` : undefined,
    revenueTTM: overview["RevenueTTM"] ? parseFloat(overview["RevenueTTM"]).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : undefined,
    profitMargin: overview["ProfitMargin"] && overview["ProfitMargin"] !== "None" ? `${(parseFloat(overview["ProfitMargin"]) * 100).toFixed(2)}%` : undefined,
    operatingMargin: overview["OperatingMarginPercentTTM"] && overview["OperatingMarginPercentTTM"] !== "None" ? `${(parseFloat(overview["OperatingMarginPercentTTM"]) * 100).toFixed(2)}%` : undefined,
    debtToEquity: overview["DebtToEquityRatio"] && overview["DebtToEquityRatio"] !== "None" ? overview["DebtToEquityRatio"] : undefined,
    source: 'alpha_vantage',
    rawOverview: overview
  };
}
