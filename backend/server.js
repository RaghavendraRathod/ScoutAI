require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const express = require("express");
const cors = require("cors");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const app = express();

app.use(cors());
app.use(express.json());

// Simple rate limiter for Scout searches
const rateLimitStore = new Map();

const SEARCH_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function scoutRateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  const entry = rateLimitStore.get(ip);

  // Start a new window
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    rateLimitStore.set(ip, {
      count: 1,
      windowStart: now,
    });

    return next();
  }

  // Limit reached
  if (entry.count >= SEARCH_LIMIT) {
    const retryAfterSeconds = Math.ceil(
      (WINDOW_MS - (now - entry.windowStart)) / 1000
    );

    res.set("Retry-After", String(retryAfterSeconds));

    return res.status(429).json({
      error: "Search limit reached. Please try again in a few minutes.",
    });
  }

  entry.count += 1;
  return next();
}

/*
 * Safely parse JSON returned by Gemini.
 * Gemini may occasionally wrap JSON in Markdown code fences.
 */
function parseGeminiJson(text) {
  let cleaned = String(text || "").trim();

  // Remove ```json ... ``` fences
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  return JSON.parse(cleaned.trim());
}

/*
 * Health check
 */
app.get("/", (req, res) => {
  res.json({
    message: "ScoutAI backend is running",
  });
});

/*
 * Test Gemini
 */
app.get("/api/test-ai", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Explain in one sentence what an AI internship is.",
    });

    res.json({
      response: response.text,
    });
  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      error: "Gemini request failed",
    });
  }
});

/*
 * Analyze search results
 */
app.post("/api/analyze", async (req, res) => {
  const { query, results } = req.body;

  if (!query || !Array.isArray(results)) {
    return res.status(400).json({
      error: "Query and results are required",
    });
  }

  try {
    const prompt = `
You are ScoutAI, an AI research assistant.

The user searched for:
"${query}"

Below are web search results:

${JSON.stringify(results, null, 2)}

Analyze these results and return ONLY valid JSON.

Return this exact structure:

{
  "opportunities": [
    {
      "title": "string",
      "source": "string",
      "url": "string",
      "location": "string",
      "category": "string",
      "skills": ["string"],
      "relevanceScore": 0,
      "whyRelevant": "string"
    }
  ]
}

Rules:
- relevanceScore must be between 0 and 100.
- Only include opportunities that are genuinely relevant to the user's query.
- Do not invent information that isn't present in the search result.
- If a field cannot be determined, use "Not specified".
- Keep whyRelevant concise.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    let parsed;

    try {
      parsed = parseGeminiJson(text);
    } catch (error) {
      console.error("Gemini JSON parsing error:", error);
      console.error("Gemini raw response:", text);

      return res.status(500).json({
        error: "Gemini returned invalid JSON",
        raw: text,
      });
    }

    res.json(parsed);
  } catch (error) {
    console.error("Gemini analysis error:", error);

    res.status(500).json({
      error: "AI analysis failed",
    });
  }
});

/*
 * Main ScoutAI endpoint
 */
app.post("/api/scout", scoutRateLimit, async (req, res) => {
  const { query, profile } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({
      error: "Query is required",
    });
  }

  try {
    /*
     * 1. Search the web with SerpApi
     */
    const params = new URLSearchParams({
      engine: "google",
      q: query,
      api_key: process.env.SERPAPI_KEY,
    });

    const searchResponse = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      return res.status(searchResponse.status).json({
        error: searchData.error || "SerpApi request failed",
      });
    }

    const searchResults = searchData.organic_results || [];

    /*
     * Keep only the most useful fields
     * and limit results sent to Gemini.
     */
    const resultsForAI = searchResults.slice(0, 8).map((result) => ({
      position: result.position,
      title: result.title,
      link: result.link,
      displayed_link: result.displayed_link,
      snippet: result.snippet,
    }));

    /*
     * 2. Ask Gemini to analyze the results
     */
    const prompt = `
You are ScoutAI, an AI research assistant that helps students discover and prioritize genuinely relevant career opportunities.

USER QUERY:
"${query}"

USER PROFILE:
${JSON.stringify(profile || {}, null, 2)}

WEB SEARCH RESULTS:
${JSON.stringify(resultsForAI, null, 2)}

Your task is to analyze each search result and rank it based on BOTH:
1. How well it satisfies the user's search query.
2. How well it matches the user's profile.

IMPORTANT:
The search results are web-search results, not necessarily individual job postings. Some results may be aggregate listing pages, directories, career portals, articles, or specific opportunities. You MUST distinguish between them.

Return ONLY valid JSON using exactly this structure:

{
  "opportunities": [
    {
      "title": "string",
      "source": "string",
      "url": "string",
      "location": "string",
      "category": "string",
      "skills": ["string"],
      "relevanceScore": 0,
      "whyRelevant": "string",
      "matchReasons": ["string"],
      "potentialGaps": ["string"]
    }
  ]
}

SCORING RULES:

- relevanceScore must be an integer from 0 to 100.
- Do NOT give a high score simply because the result contains words such as "software", "engineering", "AI", "internship", or "Bengaluru".
- The score must reflect actual evidence in the search result.

Use this approximate scoring logic:

QUERY FIT:
- Exact role/type requested: +25
- Strongly related role/type: +15
- Weakly related role/type: +5
- Does not meaningfully match the requested role/type: +0

LOCATION FIT:
- Exact requested location: +15
- Same metropolitan area or clearly equivalent location: +12
- Location is nearby but not exact: +5
- Location is unclear/not specified: +0

PROFILE FIT:
- Strong match to the user's listed skills: +20
- Partial skill match: +10
- No evidence of skill match: +0
- Strong match to education/year/eligibility when explicitly supported: +10
- Strong match to interests/career direction: +10

OPPORTUNITY QUALITY:
- Specific individual opportunity with meaningful details: +10
- Partially detailed opportunity: +5
- Aggregate/search/directory page containing many opportunities: +0

PENALTIES:
- Generic job-search or aggregate listing page: subtract 10 to 20 points from the final score.
- Location is missing when location is important to the query: subtract 5.
- The result is only loosely related to the requested role: subtract 10 to 25.
- The result clearly conflicts with the user's requested role/location: subtract 20 or more.

Keep the final score realistic.

As a general guideline:
- 90–100 = exceptional match with strong evidence
- 80–89 = strong match
- 70–79 = useful/relevant match
- 60–69 = somewhat relevant
- below 60 = weak match

Do NOT force every result into the 80–90 range.

AGGREGATE PAGE RULE:

If the result is an aggregate page such as:
- "Software Engineer Intern jobs in Bengaluru"
- "Software internships in Bangalore"
- a jobs search directory
- a collection of many vacancies

do NOT treat the page itself as a specific internship.

It may still be useful, but its score should normally be lower than a specific opportunity that directly matches the user's profile.

SKILLS RULES:

- The "skills" array should contain skills that are explicitly supported by the search result.
- If the result does not provide specific technical skills, use a broad category only when clearly supported.
- Do NOT automatically add the user's profile skills to the result.
- For example, if the user has Java and Spring Boot but the result does not mention Java or Spring Boot, do NOT claim that the opportunity requires Java or Spring Boot.
- Never invent skills.

PERSONALIZATION RULES:

Consider all relevant profile information:
- education
- academic year
- skills
- interests

For example, if the user has:
Java, Spring Boot, SQL
and is interested in:
Backend Development, Cloud Computing

then a specific Java/Spring Boot backend internship should rank substantially higher than a generic software internship.

However, never claim a technology is required merely because it appears in the user's profile.

MATCH REASONS:

- Provide 2 to 4 concise reasons.
- Every reason must be supported by the query, user profile, or search result.
- Clearly distinguish between:
  1. Query match
  2. Profile match
  3. Location match
  4. Opportunity characteristics
- Do not repeat essentially the same reason in different wording.

POTENTIAL GAPS:

This field describes potential gaps between the USER and the OPPORTUNITY.

Examples:
- "Java experience is not mentioned in the available listing details."
- "The listing does not specify whether Spring Boot is used."
- "The opportunity may require skills not shown in the user's profile."

Do NOT put search-result quality issues in potentialGaps.

For example, do NOT write:
- "Aggregate job listing page requiring manual filtering"
- "Large directory requiring further searching"

Those are characteristics of the result, not gaps in the user's profile.

Only include 0 to 3 meaningful potential gaps.

If there are no meaningful candidate-related gaps, return:
[]

WHY RELEVANT:

- Keep this concise: approximately one or two sentences.
- Explain why the result is useful specifically for this user.
- Do not make claims that are not supported by the available information.

FACTUAL ACCURACY:

- Never invent eligibility requirements.
- Never invent salary.
- Never invent deadlines.
- Never invent company details.
- Never invent technical requirements.
- Never invent years of experience.
- Never invent location information.
- Never claim that a user skill matches a job requirement unless the result supports it.
- If information is unavailable, use "Not specified".
- Use the original result URL exactly as provided.
- Do not modify or fabricate URLs.

RELEVANCE FILTER:

Only include results that have meaningful relevance to the user's query.

If a result is clearly unrelated, omit it rather than giving it a misleading score.

FINAL CHECK BEFORE RESPONDING:

For every opportunity, ask yourself:
1. Does it actually match the user's query?
2. Does it match the requested location?
3. Does it match the user's profile?
4. Is it a specific opportunity or merely an aggregate page?
5. Is the score justified by evidence?
6. Are the matchReasons supported?
7. Are potentialGaps actually gaps for the user?
8. Did I avoid inventing information?

Return ONLY the JSON object.
`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = aiResponse.text;

    let analysis;

    try {
      analysis = parseGeminiJson(text);
    } catch (error) {
      console.error("Gemini JSON parsing error:", error);
      console.error("Gemini raw response:", text);

      return res.status(500).json({
        error: "Gemini returned invalid JSON",
        raw: text,
      });
    }

    /*
     * 3. Send the final ScoutAI response to React
     */
    res.json({
      query,
      opportunities: Array.isArray(analysis.opportunities)
        ? analysis.opportunities
        : [],
    });
  } catch (error) {
    console.error("ScoutAI error:", error);

    res.status(500).json({
      error: "ScoutAI search failed",
    });
  }
});

/*
 * Start server
 */
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`ScoutAI backend running on http://localhost:${PORT}`);
});