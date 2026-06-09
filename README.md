# The Date Crew 💕

**Where Tradition Meets Technology** — An AI-powered Indian matchmaking platform with gender-specific compatibility scoring, personalized introductions, compatibility insights, and a premium glassmorphic UI.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green) ![AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan)

---

## ✨ Features

### Matching Engine
- **7-dimension scoring algorithm** — Age, Location, Values, Lifestyle, Professional, Height, Income
- **Gender-specific logic** — Configurable weight-based compatibility for Indian matchmaking context
- **Smart filtering** — Religion, diet, city, relocate/pets/children preferences, and more
- **Category labels** — "Recommended", "Strong Match", "Good Match", "Review"

### AI Integration (Groq — Free)
- **Personalized introductions** — AI-generated culturally appropriate intro messages via Groq (Llama 3.3 70B)
- **Compatibility insights** — AI commentary explaining why two profiles are compatible
- **Match Brief generation** — AI-powered summary of compatibility strengths, risks, and recommendations
- **Acceptance probability indicators** — Helps prioritize high-potential matches
- **Smart template fallback** — Works perfectly without API key using intelligent templates that reference shared hobbies, cities, and professions

### Matchmaker Workflow Features
- **AI Copilot Dashboard** — Daily matchmaking insights and recommendations
- **Today's Priorities** — Quick overview of important actions
- **Matchmaking Pipeline** — Workflow visibility for profile review and introductions
- **Activity Timeline** — Tracks profile interactions and actions
- **Persistent Matchmaker Notes** — Stored locally and retained across refreshes
- **Compatibility Risk Analysis** — Highlights potential discussion areas
- **Matchmaker Recommendations** — AI-assisted decision support

### Premium UI/UX
- **Dark mode glassmorphism** — Translucent cards with backdrop blur and neon accents
- **Animated score rings** — SVG circular progress with smooth fill animations
- **Floating hearts** — CSS-only particle animation on the login page
- **Micro-animations** — Hover effects, staggered card entrance, loading skeletons
- **Responsive design** — Mobile-first with collapsible filter sidebar

### Indian-Specific Attributes
- Caste, Religion, Mother Tongue, Diet (Veg/Non-Veg/Eggetarian/Vegan)
- Open to Relocate, Open to Pets, Wants Children
- Smoking/Drinking preferences, Income in LPA
- 15 diverse female + 3 male profiles across 10 Indian cities

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.10+

### Backend

```bash
cd backend
pip install -r requirements.txt

# (Optional) For AI features — get a free key at https://console.groq.com/keys
# Create .env file:
echo "GROQ_API_KEY=your_key_here" > .env

# Start the server
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies API calls to the backend.

### Demo Login
- **Email**: `demo@thedatecrew.com`
- **Password**: `password`
- Or click **"Continue with Google"** for instant mock auth

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 6 + Tailwind CSS 4 |
| **Backend** | FastAPI (Python) |
| **AI** | Groq API (Llama 3.3 70B) with template fallback |
| **Data** | In-memory JSON (no database needed) |
| **Storage** | LocalStorage + In-memory JSON |
| **Icons** | Lucide React |
| **Avatars** | DiceBear Avataaars |
| **Fonts** | Outfit (headings) + Inter (body) via Google Fonts |

---

## 📁 Project Structure

```text
├── backend/
│   ├── main.py              # FastAPI server (8 endpoints)
│   ├── profiles.py          # 18 diverse Indian profiles
│   ├── matching.py          # 7-dimension scoring engine
│   ├── ai_engine.py         # Groq AI + template fallback
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
├── frontend/
│   ├── index.html           # Entry point with Google Fonts
│   ├── vite.config.js       # Vite + Tailwind + API proxy
│   └── src/
│       ├── App.jsx          # Router + auth state
│       ├── index.css        # Premium design system
│       ├── components/
│       │   ├── LoginPage.jsx     # Auth with floating hearts
│       │   ├── Navbar.jsx        # Glassmorphic top nav
│       │   ├── FilterPanel.jsx   # Indian-specific filters
│       │   ├── ProfileCard.jsx   # Match card with AI recommendations
│       │   ├── MatchScore.jsx    # Animated compatibility score ring
│       │   ├── EmailModal.jsx    # AI-generated introduction workflow
│       │   └── Toast.jsx         # Notification system
│       └── pages/
│           ├── Dashboard.jsx     # AI Copilot + priorities + pipeline
│           └── ProfileDetail.jsx # Profile analysis, notes, activity & AI insights
│
└── README.md
```

---

## 🧠 Matching Algorithm

The compatibility score is calculated across 7 weighted dimensions:

| Dimension | Weight | Logic |
|-----------|--------|-------|
| **Values** | 20% | Religion match, diet compatibility, children alignment |
| **Age** | 20% | Prefers 1-5 year gap (configurable by gender) |
| **Location** | 15% | Same city > same state > different |
| **Lifestyle** | 15% | Hobbies overlap, pets, relocate, smoking/drinking |
| **Professional** | 15% | Profession group pairing + education proximity |
| **Income** | 10% | Relative balance (ratio-based, not absolute) |
| **Height** | 5% | Gender-aware preference modeling |

---

## 🤖 AI Features

### With Groq API Key (Free)
- Generates warm, culturally appropriate intro messages
- Provides compatibility insights based on profile attributes
- Generates Match Brief summaries
- Uses `llama-3.3-70b-versatile` model

### Without API Key (Fallback)
- Smart template-based intros that reference shared hobbies, cities, professions
- Template-based insights highlighting key compatibility dimensions
- AI-style recommendations and summaries
- **The app works perfectly without any API key**

### Additional Matchmaker Features
- Match Brief generation
- Persistent Matchmaker Notes
- Activity Timeline
- Compatibility Risk Analysis
- AI Recommendations
- Acceptance Probability indicators

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Email/password login |
| POST | `/auth/google` | Mock Google OAuth |
| GET | `/api/profiles/me` | Current user profile |
| GET | `/api/matches` | Filtered + scored matches |
| GET | `/api/match/{id}` | Single match detail |
| POST | `/api/ai/intro` | AI-generated intro message |
| POST | `/api/ai/insight` | AI compatibility insight |
| POST | `/api/email/send` | Mock email send |

---

## 📝 Assumptions

1. **Gender-specific matching**: Default demo user is male, matching with female profiles
2. **Mock authentication**: No real OAuth — simulated for demo purposes
3. **No database**: All data is in-memory JSON for simplicity
4. **Mock email workflow**: Introduction messages are generated and simulated within the application
5. **Indian context**: Profiles, filters, and matching logic are designed for Indian matrimonial/dating conventions
6. **Income in LPA**: Indian standard — Lakhs Per Annum
7. **Local persistence**: Matchmaker notes and activity history are stored using browser LocalStorage

---

*Built with ❤️ for modern Indian matchmaking*