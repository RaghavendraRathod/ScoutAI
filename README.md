# ScoutAI 🚀

> **Find opportunities. Scout smarter.**

ScoutAI is an AI-powered opportunity discovery platform that helps students find internships, jobs, and career opportunities that actually match their skills, interests, education, and goals.

Instead of manually searching through dozens of job boards, ScoutAI lets users describe what they are looking for in natural language. It searches the web, analyzes the results using Google Gemini, and ranks opportunities based on relevance to the user's profile.

## ✨ Features

- 🔎 **Natural-language opportunity search**
- 🤖 **AI-powered relevance scoring**
- 👤 **Personalized profile matching**
- 📊 **Match scores for every opportunity**
- ✅ **"Why you're a good match" explanations**
- ⚠️ **Potential skill-gap identification**
- 🏷️ **Category filtering**
- 📈 **Sort by relevance**
- 💾 **Save opportunities**
- 📋 **Application tracker**
- 🔗 **Direct links to original opportunities**
- 🌐 **Real-time web search through SerpApi**

## 🧠 How ScoutAI Works

```text
User Profile + Natural Language Query
                ↓
          ScoutAI Frontend
                ↓
          Express Backend
                ↓
          SerpApi Web Search
                ↓
       Search Results Collection
                ↓
          Google Gemini AI
                ↓
     Relevance & Profile Analysis
                ↓
      Ranked Opportunities
                ↓
        Personalized Results

        
     
AI Matching

ScoutAI evaluates opportunities using:

User's education
Academic year
Technical skills
Interests
Search query
Location preferences
Opportunity relevance

Each opportunity receives a relevance score along with explanations describing why it matches the user's profile and what potential gaps may exist.

🛠️ Tech Stack
Frontend
React
TypeScript
Vite
CSS
Backend
Node.js
Express.js
CORS
dotenv
AI & Search
Google Gemini API
SerpApi
Deployment
Vercel — Frontend
Render — Backend

📁 Project Structure

ScoutAI/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── public/
├── src/
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── .gitignore
├── package.json
├── vite.config.ts
└── README.md

🚀 Getting Started
1. Clone the repository
git clone https://github.com/RaghavendraRathod/ScoutAI.git
cd ScoutAI
2. Install frontend dependencies
npm install
3. Install backend dependencies
cd backend
npm install
4. Configure backend environment variables

Create:

backend/.env

Add:

GEMINI_API_KEY=your_gemini_api_key
SERPAPI_KEY=your_serpapi_api_key

Never commit API keys to GitHub.

5. Configure frontend environment variables

Create a .env file in the project root:

VITE_API_URL=http://localhost:5000
6. Start the backend

From the backend directory:

npm start

The backend will run on:

http://localhost:5000
7. Start the frontend

From the project root:

npm run dev

The frontend will run on the Vite development server.

🌐 Live Demo

Frontend:

https://scout-ai-ecru.vercel.app/

Backend:

https://scoutai-backend-agg4.onrender.com/

🔐 Security

ScoutAI keeps API credentials on the backend.

Gemini API key is never exposed to the frontend.
SerpApi key is never exposed to the frontend.
Environment files are excluded from Git.
Backend CORS is restricted to the deployed frontend and local development environment.
Scout searches are rate-limited to reduce abuse and excessive API usage.

🎯 Example Queries
Find AI internships for students in Bengaluru

Find software engineering internships for 3rd year students

Find machine learning internships that match my skills

Find backend development opportunities for students

Find GenAI internships in India

💡 Why ScoutAI?

Students often have to search across multiple platforms such as job boards, company websites, and internship portals.

ScoutAI brings the discovery process into one place and adds an AI-powered layer of personalization.

Instead of simply asking:

"What opportunities exist?"

ScoutAI helps answer:

"Which opportunities are most relevant to me, and why?"

🔮 Future Improvements
More opportunity sources
Opportunity freshness and verification
Advanced location and salary filters
Email/job alerts
Application deadline tracking
Resume-aware matching
Skill-gap learning recommendations
User accounts and cloud-synced saved opportunities
More advanced ranking and recommendation models
📄 License

This project is built as a hackathon project and is intended for educational and demonstration purposes.