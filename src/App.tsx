import { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
const [opportunities, setOpportunities] = useState<any[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const [savedOpportunities, setSavedOpportunities] = useState<any[]>(() => {
  const saved = localStorage.getItem("scoutai_saved_opportunities");

  return saved ? JSON.parse(saved) : [];
});

const [profile, setProfile] = useState({
  education: "",
  year: "",
  skills: "",
  interests: "",
});

  
async function handleScout() {
   if (!query.trim()) return;

  setLoading(true);
   setError("");
  setOpportunities([]);

  try {
    const response = await fetch("http://localhost:5000/api/scout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
         query,
         profile,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
  throw new Error(data.error || "ScoutAI request failed");
}

console.log("Backend response:", data);

setOpportunities(data.opportunities || []);
} catch (error) {
  console.error("Scout error:", error);

  setError(
    error instanceof Error
      ? error.message
      : "Something went wrong while scouting."
  );
}finally {
    setLoading(false);
  }
}

function toggleSaveOpportunity(opportunity: any) {
  setSavedOpportunities((currentSaved) => {
    const alreadySaved = currentSaved.some(
      (item) => item.url === opportunity.url
    );

    const updated = alreadySaved
      ? currentSaved.filter((item) => item.url !== opportunity.url)
      : [...currentSaved, opportunity];

    localStorage.setItem(
      "scoutai_saved_opportunities",
      JSON.stringify(updated)
    );

    return updated;
  });
}

function updateApplicationStatus(url: string, status: string) {
  setSavedOpportunities((currentSaved) => {
    const updated = currentSaved.map((opportunity) =>
      opportunity.url === url
        ? {
            ...opportunity,
            applicationStatus: status,
          }
        : opportunity
    );

    localStorage.setItem(
      "scoutai_saved_opportunities",
      JSON.stringify(updated)
    );

    return updated;
  });
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

         <button
  type="button"
  onClick={handleScout}
  disabled={loading}
>
  {loading ? "Scouting..." : "Start Scouting"}
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

{loading && (
  <div className="scout-loading">
    <div className="loading-spinner"></div>

    <h3>ScoutAI is working...</h3>

    <p>
      Searching the web and analyzing opportunities
      based on your profile.
    </p>
  </div>
)}

{error && (
  <div className="scout-error">
    <h3>ScoutAI couldn't complete the search</h3>
    <p>{error}</p>
    <button type="button" onClick={handleScout}>
      Try again
    </button>
  </div>
)}

{!loading && !error && query.trim() && opportunities.length === 0 && (
  <div className="no-results">
    <h3>No strong matches found</h3>
    <p>
      Try a broader search or change your profile interests.
    </p>
  </div>
)}

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

{opportunity.matchReasons?.length > 0 && (
  <div className="match-reasons">
    <h4>Why you're a good match</h4>

    <ul>
      {opportunity.matchReasons.map(
        (reason: string, reasonIndex: number) => (
          <li key={reasonIndex}>✓ {reason}</li>
        )
      )}
    </ul>
  </div>
)}

{opportunity.potentialGaps?.length > 0 && (
  <div className="potential-gaps">
    <h4>Potential gaps</h4>

    <ul>
      {opportunity.potentialGaps.map(
        (gap: string, gapIndex: number) => (
          <li key={gapIndex}>⚠ {gap}</li>
        )
      )}
    </ul>
  </div>
)}

<button
  type="button"
  className="save-button"
  onClick={() => toggleSaveOpportunity(opportunity)}
>
  {savedOpportunities.some(
    (item) => item.url === opportunity.url
  )
    ? "★ Saved"
    : "☆ Save"}
</button>

        <a
          href={opportunity.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View opportunity →
        </a>
      </article>
    ))}

    <section className="tracker-section">
  <div className="tracker-header">
    <h2>Application Tracker</h2>
    <p>Keep track of your opportunity pipeline.</p>
  </div>

  <div className="tracker-grid">
    {["Saved", "Interested", "Applied", "Interview", "Accepted", "Rejected"].map(
      (status) => {
        const count = savedOpportunities.filter(
          (opportunity) =>
            (opportunity.applicationStatus || "Saved") === status
        ).length;

        return (
          <div className="tracker-card" key={status}>
            <span>{status}</span>
            <strong>{count}</strong>
          </div>
        );
      }
    )}
  </div>
</section>

    <section className="saved-section">
  <div className="saved-header">
    <h2>Saved Opportunities</h2>
    <span>{savedOpportunities.length}</span>
  </div>

  {savedOpportunities.length === 0 ? (
    <p className="saved-empty">
      You haven't saved any opportunities yet.
    </p>
  ) : (
    <div className="saved-list">
      {savedOpportunities.map((opportunity) => (
        <div className="saved-item" key={opportunity.url}>
          <div>
            <h3>{opportunity.title}</h3>
            <p>
              {opportunity.source} · {opportunity.location}
            </p>
          </div>

<select
  value={opportunity.applicationStatus || "Saved"}
  onChange={(e) =>
    updateApplicationStatus(
      opportunity.url,
      e.target.value
    )
  }
>
  <option value="Saved">Saved</option>
  <option value="Interested">Interested</option>
  <option value="Applied">Applied</option>
  <option value="Interview">Interview</option>
  <option value="Accepted">Accepted</option>
  <option value="Rejected">Rejected</option>
</select>

          <div className="saved-actions">
            <button
              type="button"
              onClick={() => toggleSaveOpportunity(opportunity)}
            >
              ★ Remove
            </button>

            <a
              href={opportunity.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View →
            </a>
          </div>
        </div>
      ))}
    </div>
  )}
</section>
  </div>
</section>
    </main>
  );
}

export default App;