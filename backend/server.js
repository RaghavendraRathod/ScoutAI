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

app.get("/", (req, res) => {
  res.json({
    message: "ScoutAI backend is running",
  });
});

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
- Return valid JSON only.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text;

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
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

app.post("/api/scout", async (req, res) => {
  const { query, profile } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({
      error: "Query is required",
    });
  }

  try {
    // 1. Search the web with SerpApi
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

    // Keep only the most useful fields and limit the number
    // of results sent to Gemini.
    const resultsForAI = searchResults.slice(0, 8).map((result) => ({
      position: result.position,
      title: result.title,
      link: result.link,
      displayed_link: result.displayed_link,
      snippet: result.snippet,
    }));

    // 2. Ask Gemini to analyze the search results
    const prompt = `
You are ScoutAI, an AI research assistant that helps students discover relevant opportunities.

The user searched for:
"${query}"

The user's profile is:
${JSON.stringify(profile || {}, null, 2)}

Analyze the following web search results:

${JSON.stringify(resultsForAI, null, 2)}



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
      "whyRelevant": "string"
    }
  ]
}

Rules:
- relevanceScore must be between 0 and 100.
- The relevanceScore should reflect how well the opportunity matches BOTH the user's search query and the user's profile.
- Give higher scores when the opportunity matches the user's skills, education, year, interests, and requested location.
- Do not give a high score simply because the result contains the word "AI".
- Only include results genuinely relevant to the user's query.
- Do not invent information.
- If information is unavailable, use "Not specified".
- Keep whyRelevant concise.
- Use the original result URL.
- Return valid JSON only.
`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = aiResponse.text;

    let analysis;

    try {
      analysis = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "Gemini returned invalid JSON",
        raw: text,
      });
    }

    // 3. Send the final ScoutAI response to React
    res.json({
      query,
      opportunities: analysis.opportunities || [],
    });
  } catch (error) {
    console.error("ScoutAI error:", error);

    res.status(500).json({
      error: "ScoutAI search failed",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`ScoutAI backend running on http://localhost:${PORT}`);
});