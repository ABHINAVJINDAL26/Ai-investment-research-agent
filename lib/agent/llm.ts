import { ChatOpenAI } from "@langchain/openai";

/**
 * Custom native wrapper for Gemini API to support the new secure 'AQ.' key formats.
 * Newer 'AQ.' key formats are rejected by the legacy OpenAI-compatible API endpoint.
 * This class uses standard HTTP fetch to query Google's native Gemini API directly.
 */
class GeminiNativeWrapper {
  private apiKey: string;
  private jsonMode: boolean;

  constructor(apiKey: string, jsonMode: boolean) {
    this.apiKey = apiKey;
    this.jsonMode = jsonMode;
  }

  async invoke(prompt: string): Promise<{ content: string; toString: () => string }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: this.jsonMode ? {
        responseMimeType: "application/json"
      } : undefined
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini Native API Error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      content: textResponse,
      toString: () => textResponse
    };
  }
}

/**
 * Helper to get a configured LLM model instance.
 * Automatically uses the custom GeminiNativeWrapper if GEMINI_API_KEY is present,
 * supporting the new secure 'AQ.' key format.
 * 
 * @param jsonMode If true, forces JSON output formatting.
 */
export function getLLM(jsonMode: boolean = false): any {
  const openAIApiKey = process.env.OPENAI_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!openAIApiKey && !geminiApiKey) {
    throw new Error("No LLM API keys found. Please set OPENAI_API_KEY or GEMINI_API_KEY in .env.local");
  }

  // If Gemini key is set, use the native wrapper to handle the new AQ. key formats.
  if (geminiApiKey && !openAIApiKey) {
    console.log("[LLM] Configuring GeminiNativeWrapper to support the secure AQ. key format.");
    return new GeminiNativeWrapper(geminiApiKey, jsonMode);
  }

  // Default to standard OpenAI setup if OpenAI key is present
  console.log("[LLM] Configuring ChatOpenAI wrapper for standard OpenAI endpoint.");
  return new ChatOpenAI({
    apiKey: openAIApiKey,
    modelName: "gpt-4o-mini", // Use gpt-4o-mini as a cost-effective and fast model
    temperature: 0.2,
    modelKwargs: jsonMode ? { response_format: { type: "json_object" } } : undefined,
  });
}
