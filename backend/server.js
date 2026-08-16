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
app.post("/api/scout", async (req, res) => {
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
You are ScoutAI, an AI research assistant that helps students discover relevant opportunities.

The user searched for:
"${query}"

The user's profile is:
${JSON.stringify(profile || {}, null, 2)}

Analyze the following web search results:

${JSON.stringify(resultsForAI, null, 2)}

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

Rules:
- relevanceScore must be between 0 and 100.
- The relevanceScore should reflect how well the opportunity matches BOTH the user's search query and the user's profile.
- Give higher scores when the opportunity matches the user's skills, education, year, interests, and requested location.
- Do not give a high score simply because the result contains the word "AI".
- matchReasons must contain 2 to 4 concise reasons explaining why this opportunity matches the user.
- potentialGaps must contain 0 to 3 concise potential gaps.
- Only mention a skill as a match if that skill is actually present in the user's profile or clearly supported by the search result.
- Do not invent eligibility requirements, skills, salary, deadlines, or experience requirements.
- If there are no meaningful gaps, return an empty array for potentialGaps.
- Only include results genuinely relevant to the user's query.
- Do not invent information.
- If information is unavailable, use "Not specified".
- Keep whyRelevant concise.
- Use the original result URL.
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