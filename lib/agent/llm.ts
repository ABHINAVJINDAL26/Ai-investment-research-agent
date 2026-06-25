import { ChatOpenAI } from "@langchain/openai";

/**
 * Helper to get a configured ChatOpenAI model instance.
 * Automatically adapts to use Gemini API if GEMINI_API_KEY is defined.
 * 
 * @param jsonMode If true, forces JSON output formatting.
 */
export function getLLM(jsonMode: boolean = false): ChatOpenAI {
  const openAIApiKey = process.env.OPENAI_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!openAIApiKey && !geminiApiKey) {
    throw new Error("No LLM API keys found. Please set OPENAI_API_KEY or GEMINI_API_KEY in .env.local");
  }

  // If Gemini key is set and OpenAI key is not, configure to use Gemini's OpenAI-compatible API
  if (geminiApiKey && !openAIApiKey) {
    console.log("[LLM] Configuring ChatOpenAI wrapper for Google Gemini endpoint.");
    return new ChatOpenAI({
      apiKey: geminiApiKey,
      modelName: "gemini-1.5-flash", // Use gemini-1.5-flash as the fast and capable default model
      temperature: 0.2,
      configuration: {
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      },
      modelKwargs: jsonMode ? { response_format: { type: "json_object" } } : undefined,
    });
  }

  // Default to standard OpenAI setup
  console.log("[LLM] Configuring ChatOpenAI wrapper for standard OpenAI endpoint.");
  return new ChatOpenAI({
    apiKey: openAIApiKey,
    modelName: "gpt-4o-mini", // Use gpt-4o-mini as a cost-effective and extremely fast default, or gpt-4o
    temperature: 0.2,
    modelKwargs: jsonMode ? { response_format: { type: "json_object" } } : undefined,
  });
}
