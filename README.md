# AI Investment Research Agent
> **InsideIIM × Altuni AI Labs — AI Product Engineer Intern Assignment**

An autonomous, full-stack investment due diligence agent that researches any company across news, financials, competitor positioning, and risks, returning a transparent **INVEST / PASS** verdict with conviction breakdown and source citations.

---

## Overview

Retail investors rarely have the time to read through multiple earnings reports, crawl news articles, assess competitor moats, and scour legal disclosures before buying a stock. This application compresses that entire process into a 45-60 second autonomous pipeline, delivering an auditable thesis.

### Key Features
* **Multi-Dimensional Analysis**: Crawls web sentiment, checks balance sheet indicators, benchmarks competitive advantage, and flags regulatory risks.
* **Server-Sent Events (SSE)**: Streams execution logs and intermediate node states dynamically to the frontend so you can watch the agent work.
* **Resilient Financial Fallbacks**: Instantly switches from Alpha Vantage API to Tavily web crawling if rate limits are hit or the target company is private (capping the final conviction score at 60).
* **Asset Compare Mode**: Lets you query and compare two equities side-by-side with benchmark indicators (Moats, Sentiment, Verdict, Conviction).

---

## Tech Stack & Architecture

| Layer | Technology | Why Selected |
|---|---|---|
| **Frontend** | React, Next.js (App Router), Tailwind CSS | Standard spec; provides excellent Server Components and layout ergonomics. |
| **Orchestration** | LangGraph.js (`StateGraph`) | Graph-based state machines separate concerns, isolate context, and enable custom execution paths (e.g. conditional branches). |
| **Search Engine** | Tavily Search API | Returns curated, parsed snippets optimized for LLM contexts instead of raw, noisy HTML. |
| **Financial API** | Alpha Vantage | Free tier provides company overview, valuations, and balance sheet metrics. |
| **LLM Gateway** | LangChain `ChatOpenAI` | Standard OpenAI bindings, configured to dynamically support Google's OpenAI-compatible Gemini endpoint. |

### System Flow
```
[User Input] 
    │
    ▼
[POST /api/research] ──► (Establishes SSE Stream)
    │
    ▼
[LangGraph StateGraph Engine]
    ├── Node 1: newsResearch (Sentiment analysis & events summary)
    ├── Node 2: financialAnalysis (Alpha Vantage fetch ──► Fallback to Tavily if unlisted/rate-limited)
    ├── Node 3: competitiveAnalysis (Moat evaluation & market benchmarking)
    ├── Node 4: riskAssessment (Litigation scan & regulatory headwinds)
    └── Node 5: synthesize (Weighed scoring logic: 25% News, 35% Fin, 25% Moat, 15% Risk)
```

---

## Setup & Local Run

### 1. Configure Keys
Create a `.env.local` file at the root of the project:
```env
# Choose one LLM provider
GEMINI_API_KEY=your_gemini_api_key
# OR
OPENAI_API_KEY=your_openai_api_key

# Web crawling & search
TAVILY_API_KEY=your_tavily_key

# Financial statements API
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### 2. Install & Start
```bash
# Install dependencies with legacy peer resolutions
npm install --legacy-peer-deps

# Start next dev server
npm run dev
```
Navigate to `http://localhost:3000` to run the application.

---

## Example Verdicts

### Zomato (BSE: ZOMATO) — Verdict: ✅ INVEST
* **News**: Profitable quarters in FY24/FY25; Blinkit division growing 80% YoY.
* **Financials**: Zero debt, expanding cash reserves.
* **Competition**: Leading quick commerce; stable duopoly with Swiggy in food delivery.
* **Verdict**: **INVEST** (Conviction Score: 74/100)
* **Bull Case**: Quick commerce first-mover advantage; strong logistics moat.
* **Bear Case**: High trailing valuations; intense competition from Zepto/Swiggy.

### Byju's — Verdict: ❌ PASS
* **News**: Insolvency proceedings, board disputes, founder controversies, tax litigation.
* **Financials**: Delayed audits; zero financial transparency; massive losses.
* **Competition**: Market share eroded by PhysicsWallah and Unacademy.
* **Verdict**: **PASS** (Conviction Score: 92/100 to avoid)
* **Justification**: Severe corporate governance breakdown; operational collapse with no clear recovery path.

### Infosys (NSE: INFY) — Verdict: ✅ INVEST (Moderate)
* **News**: Steady AI deal pipeline; soft revenue guidance for generic IT service agreements.
* **Financials**: 21% operating margins, stable cash flow, 3%+ dividend yield.
* **Verdict**: **INVEST** (Conviction Score: 63/100)
* **Justification**: Stable, cash-generative business with strong yield. Defensive capital allocation play.

---

## Technical Decisions & Trade-Offs

1. **Sequential vs. Parallel Graph**: Currently, nodes execute sequentially to allow cleaner step-by-step progress logging in the terminal console. In production, we could parallelize `newsResearch`, `financialAnalysis`, and `competitiveAnalysis` to cut latency from 50s down to 15-20s.
2. **Streaming Protocol**: Used Server-Sent Events (SSE) instead of WebSockets. SSE is native to HTTP, handles unidirectional server-to-client updates out of the box, and fits cleanly with Next.js App Router API endpoints.
3. **Flexible LLM Adapter**: Created a custom configuration helper in `lib/agent/llm.ts` to route requests to Google AI Studio's Gemini OpenAI-compatible API base URL (`https://generativelanguage.googleapis.com/v1beta/openai/`) if no OpenAI key is set. This makes it extremely easy to use Gemini.

---

## AI Collaboration Log (Thought Process)

As requested, below are key technical logs showing how I collaborated with AI to solve complex architecture decisions during the implementation:

### Session 1: State Accumulation in LangGraph
* **Problem**: LangGraph merges node outputs into the shared state. I wanted to append logs and sources sequentially without overwriting arrays returned by prior nodes.
* **Resolution**: Configured custom `reducers` in the `AgentState` schema ([state.ts](file:///c:/Users/jabhi/Desktop/AI%20Investment%20Research/lib/agent/state.ts)). By passing a reducer function `(x, y) => (x || []).concat(y || [])`, the graph automatically joins new log lines and source links to the array state.

### Session 2: SSE ReadableStream inside Next.js App Router
* **Problem**: Standard `EventSource` in browsers only supports GET requests out-of-the-box, making it hard to pass complex payloads like the company name.
* **Resolution**: Structured the API endpoint as a POST route returning a standard `ReadableStream` encoded via `TextEncoder`. On the client page, I consumed the response body chunk-by-chunk using a `TextDecoder` and split the incoming events manually by `\n\n`. This allows POST request payloads with full SSE capabilities.

### Session 3: TypeScript Dynamic Indexing Compiler Failure
* **Problem**: Next.js Turbopack build failed compilation with type errors: *"Element implicitly has an 'any' type because expression of type 'string' can't be used to index type..."* inside the chunk reader loop.
* **Resolution**: The compiler could not guarantee the returned node name matched the exact keys of the Graph chunk. Solved this by casting the chunk as `any` during dynamic indexing: `const nodeOutput = (chunk as any)[nodeName]`, and wrapped it in a safety null check `if (nodeOutput)` to ensure compile-time and runtime robustness.

---

*Author: Abhinav Jindal | abhinavjindal26@gmail.com | [GitHub](https://github.com/ABHINAVJINDAL26)*
