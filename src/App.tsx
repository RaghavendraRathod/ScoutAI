import { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
const [opportunities, setOpportunities] = useState<any[]>([]);

const [profile, setProfile] = useState({
  education: "",
  year: "",
  skills: "",
  interests: "",
});

  
async function handleScout() {
  try {
    const response = await fetch("http://localhost:5000/api/scout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        profile: profile,
      }),
    });

    const data = await response.json();

console.log("Backend response:", data);

setOpportunities(data.opportunities || []);

  } catch (error) {
    console.error("ScoutAI request failed:", error);
  }
}

  return (
    <main className="app">
      <section className="hero">
        <div className="badge">AI-POWERED RESEARCH</div>

        <h1>
          Find opportunities.
          <br />
          <span>Scout smarter.</span>
        </h1>

        <p className="subtitle">
          Tell ScoutAI what you're looking for and let AI search,
          analyze, and organize the web for you.
        </p>

<div className="profile-panel">
  <h2>Your Scout Profile</h2>
  <p>Help ScoutAI find opportunities that fit you.</p>

  <input
    type="text"
    placeholder="Education (e.g. B.E. Computer Science)"
    value={profile.education}
    onChange={(e) =>
      setProfile({
        ...profile,
        education: e.target.value,
      })
    }
  />

  <select
    value={profile.year}
    onChange={(e) =>
      setProfile({
        ...profile,
        year: e.target.value,
      })
    }
  >
    <option value="">Select your year</option>
    <option value="1st year">1st year</option>
    <option value="2nd year">2nd year</option>
    <option value="3rd year">3rd year</option>
    <option value="4th year">4th year</option>
  </select>

  <input
    type="text"
    placeholder="Skills (e.g. Python, C++, React)"
    value={profile.skills}
    onChange={(e) =>
      setProfile({
        ...profile,
        skills: e.target.value,
      })
    }
  />

  <input
    type="text"
    placeholder="Interests (e.g. AI, ML, cloud)"
    value={profile.interests}
    onChange={(e) =>
      setProfile({
        ...profile,
        interests: e.target.value,
      })
    }
  />
</div>

        <div className="search-box">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Example: Find AI internships in Bengaluru for 2028 engineering students"
            rows={3}
          />

          <button onClick={handleScout} disabled={!query.trim()}>
            Start Scouting
          </button>
        </div>

        <div className="examples">
          <span>Try:</span>
          <button onClick={() => setQuery("Find AI internships in Bengaluru")}>
            AI internships
          </button>

          <button onClick={() => setQuery("Find upcoming AI hackathons")}>
            AI hackathons
          </button>

          <button onClick={() => setQuery("Find software engineering jobs for students")}>
            Student jobs
          </button>
        </div>
      </section>

     <section className="results">
  <div className="results-header">
    <h2>Scout Results</h2>
    <p>{opportunities.length} opportunities found</p>
  </div>

  <div className="results-grid">
    {opportunities.map((opportunity, index) => (
      <article className="result-card" key={index}>
        <span className="result-position">
          {opportunity.relevanceScore}% match
        </span>

        <h3>{opportunity.title}</h3>

        <p className="result-source">
          {opportunity.source}
        </p>

        <p>
          📍 {opportunity.location}
        </p>

        <p>
          💼 {opportunity.category}
        </p>

        <div>
          <strong>Skills:</strong>{" "}
          {opportunity.skills?.join(", ") || "Not specified"}
        </div>

        <p className="result-snippet">
          {opportunity.whyRelevant}
        </p>

        <a
          href={opportunity.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View opportunity →
        </a>
      </article>
    ))}
  </div>
</section>
    </main>
  );
}

export default App;