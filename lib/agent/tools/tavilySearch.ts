export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchResponse {
  results: TavilySearchResult[];
}

/**
 * Searches the web using the Tavily API.
 * @param query The search query string.
 * @returns An object containing an array of search results.
 */
export async function searchWeb(query: string): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("TAVILY_API_KEY is not set. Returning empty search results.");
    return { results: [] };
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "advanced",
        include_images: false,
        include_answer: false,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API responded with status: ${response.status}`);
    }

    const data = (await response.json()) as TavilySearchResponse;
    return data;
  } catch (error) {
    console.error("Error fetching from Tavily:", error);
    return { results: [] };
  }
}
