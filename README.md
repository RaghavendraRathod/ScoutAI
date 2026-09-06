# ScoutAI 🚀

> **Find opportunities. Scout smarter.**

ScoutAI is an AI-powered opportunity discovery platform that helps students find internships, jobs, and career opportunities that match their **skills, interests, education, and goals**.

Instead of manually searching through multiple job boards and internship portals, users can describe what they are looking for in natural language. ScoutAI searches the live web through **SerpApi**, analyzes the results using **Google Gemini**, and ranks opportunities based on their relevance to the user's profile.

## 🌐 Live Demo

**[🚀 Try ScoutAI](https://scout-ai-ecru.vercel.app/)**

**[💻 View Source Code](https://github.com/RaghavendraRathod/ScoutAI)**

---

## ✨ Features

* 🔎 **Natural-language opportunity search**
* 🌐 **Live web search through SerpApi**
* 🤖 **Gemini-powered opportunity analysis**
* 👤 **Personalized profile matching**
* 📊 **AI-generated relevance scores**
* ✅ **Match reasons explaining why an opportunity fits**
* ⚠️ **Potential skill-gap identification**
* 🏷️ **Opportunity category detection and filtering**
* 📈 **Sort opportunities by relevance**
* 💾 **Save and unsave opportunities**
* 📋 **Application tracker**
* 🔗 **Direct links to original opportunity sources**
* 💡 **Personalized results based on education, academic year, skills, interests, and query**
* 🛡️ **Backend API protection with CORS restrictions**
* 🚦 **Basic rate limiting for search requests**
* 🔐 **API credentials kept server-side**

---

## 🧠 How ScoutAI Works

```text
User Profile + Natural Language Query
                ↓
       React + TypeScript Frontend
                ↓
          Express Backend
                ↓
       SerpApi Live Web Search
                ↓
        Search Result Collection
                ↓
          Google Gemini AI
                ↓
     Relevance + Profile Analysis
                ↓
       Ranked Opportunities
                ↓
       Personalized Results
                ↓
       Save / Track Applications
                ↓
          Browser Storage
```

ScoutAI combines **live web discovery** with **AI-powered analysis** instead of relying only on a static database of opportunities.

### 🔍 Search Flow

1. The user enters a natural-language request.
2. ScoutAI sends the search request to the backend.
3. The backend queries SerpApi for live web results.
4. Relevant search results are collected and structured.
5. Google Gemini analyzes the results against the user's profile.
6. Each opportunity receives a relevance score and explanation.
7. ScoutAI displays the ranked opportunities with source links.
8. Users can save opportunities and track their application status.

---

## 🎯 AI Matching

ScoutAI evaluates opportunities using:

* **Education**
* **Academic year**
* **Technical skills**
* **Interests**
* **Search query**
* **Location requirements**
* **Opportunity relevance**

Each opportunity can include:

* **Match score**
* **Why it is relevant**
* **Match reasons**
* **Potential skill gaps**
* **Required or identified skills**
* **Original source**

The goal is to move beyond:

> **"What opportunities exist?"**

and help answer:

> **"Which opportunities are most relevant to me, and why?"**

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │        User         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + TypeScript  │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Node.js + Express  │
                    │       Backend       │
                    └──────┬───────┬──────┘
                           │       │
                  ┌────────┘       └────────┐
                  ▼                         ▼
          ┌───────────────┐        ┌────────────────┐
          │    SerpApi    │        │  Google Gemini │
          │ Live Web Data │        │ AI Analysis    │
          └───────┬───────┘        └────────┬───────┘
                  │                         │
                  └──────────┬──────────────┘
                             ▼
                  ┌─────────────────────┐
                  │ Ranked Opportunities│
                  │ + AI Explanations   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Save / Application   │
                  │      Tracker         │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Browser localStorage │
                  └─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS

### Backend

* Node.js
* Express.js
* CORS
* dotenv

### AI & Search

* Google Gemini API
* SerpApi

### Client-Side Persistence

* Browser `localStorage`

### Deployment

* **Vercel** — Frontend
* **Render** — Backend

---

## 📁 Project Structure

```text
ScoutAI/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env                  # Local only, not committed
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

> `.env` files contain private API credentials and are excluded from version control.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/RaghavendraRathod/ScoutAI.git
cd ScoutAI
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure backend environment variables

Inside the `backend` directory, create:

```text
.env
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
SERPAPI_KEY=your_serpapi_api_key
```

**Never commit API keys or other secrets to GitHub.**

### 5. Configure frontend environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
```

### 6. Start the backend

From the `backend` directory:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### 7. Start the frontend

Open a second terminal and return to the project root:

```bash
cd ..
npm run dev
```

Vite will provide the local development URL, typically:

```text
http://localhost:5173
```

---

## 🌐 Deployment

ScoutAI is deployed using separate frontend and backend services.

### Frontend

**Vercel**

https://scout-ai-ecru.vercel.app/

### Backend

**Render**

https://scoutai-backend-agg4.onrender.com/

The frontend communicates with the deployed Express backend through the configured `VITE_API_URL` environment variable.

---

## 🔐 Security

ScoutAI follows several basic security practices:

* 🔑 Gemini API credentials remain on the backend.
* 🔑 SerpApi credentials remain on the backend.
* 🚫 API keys are never exposed through the frontend application.
* 📁 `.env` files are excluded from Git.
* 🌐 Backend CORS is restricted to the deployed frontend and local development environment.
* 🚦 Scout search requests are rate-limited to reduce excessive API usage and abuse.
* 🖥️ External API calls are handled by the backend rather than directly from the browser.

> This project uses a lightweight in-memory rate limiter intended for the current deployed application and hackathon/portfolio scale.

---

## 🎯 Example Queries

Try ScoutAI with natural-language requests such as:

```text
Find AI internships for students in Bengaluru
```

```text
Find software engineering internships for 3rd year students
```

```text
Find machine learning internships that match my skills
```

```text
Find backend development opportunities for students
```

```text
Find GenAI internships in India
```

The profile information can further personalize the ranking and explanations.

---

## 💡 Why ScoutAI?

Students often have to search across multiple job boards, company websites, internship portals, and career platforms.

The challenge is not simply **finding opportunities**. It is determining:

* Is this opportunity relevant to me?
* Do I meet the requirements?
* Which skills match?
* What skills am I missing?
* Is the opportunity worth prioritizing?

ScoutAI brings live opportunity discovery and AI-powered analysis into one workflow.

Instead of simply returning a list of links, ScoutAI attempts to provide **context and prioritization** for each opportunity.

---

## 📌 Current Limitations

ScoutAI currently relies on search-result information returned through SerpApi and AI analysis.

Therefore:

* Opportunity details may change after the search result is indexed.
* Deadlines and eligibility information should be verified on the original source.
* Some search results may represent job directories rather than individual openings.
* Saved opportunities and application tracking are currently stored in browser `localStorage`.
* The current rate limiter is in-memory and resets when the backend restarts.

Users should always verify important details on the original opportunity page before applying.

---

## 🔮 Future Improvements

Planned improvements include:

* 🔍 Multi-query search expansion for broader discovery
* 🌐 Additional opportunity sources and search types
* ✅ Direct webpage fetching for stronger evidence verification
* 📅 Opportunity deadline extraction and verification
* 📍 Advanced location and salary filters
* 🔔 Email and job alerts
* 📄 Resume-aware opportunity matching
* 🧠 Skill-gap learning recommendations
* 👤 User authentication
* ☁️ Cloud-synced saved opportunities
* 🗄️ Persistent database storage
* 🧹 Duplicate opportunity detection
* 📈 More advanced ranking and recommendation models

---

## 📄 License

This project was built as a portfolio and hackathon project for educational and demonstration purposes.
