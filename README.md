# NeuroMatch - AI-Powered Neural Matching Platform

A production-ready social matching platform that connects people based on **how they think**, not how they look. Built with React, Supabase, and Lovable AI for intelligent personality analysis and semantic matching.

---

## 🚀 Features

- ✅ **Privacy-First Design**: Pseudonym-only matching system
- ✅ **AI-Powered Mindprints**: Semantic embeddings + OCEAN personality analysis
- ✅ **Production Backend**: Supabase database + Edge Functions + Lovable AI
- ✅ **Beautiful UI**: Calm, soulful interface with smooth animations
- ✅ **Real-time Chat**: Message your matches instantly
- ✅ **Fully Responsive**: Works on all devices

---

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (already configured in this project)
- Lovable AI enabled (already configured)

---

## 🛠️ Setup Instructions

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd neuromatch

# Install dependencies
npm install
```

### 2. Run Database Migration

**CRITICAL:** You must run the database migration before the app will work.

1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/kinwixjeoghoeoubnoln/sql/new)
2. Copy the entire contents of `BACKEND_MIGRATION.sql`
3. Paste into the SQL Editor
4. Click **Run** to execute

This will create all necessary tables:
- `profiles` - User profiles with pseudonyms
- `quiz_questions` - Mindprint quiz questions
- `quiz_answers` - User responses
- `user_embeddings` - AI-generated semantic vectors
- `personalities` - OCEAN personality scores
- `matches` - Calculated user matches
- `conversations` + `messages` - Chat system

### 3. Configure Email Settings (Optional)

For faster development, disable email confirmation:

1. Go to [Authentication Settings](https://supabase.com/dashboard/project/kinwixjeoghoeoubnoln/auth/providers)
2. Scroll to "Email" provider
3. Toggle **OFF** "Confirm email"
4. Save changes

This allows immediate login during testing without email verification.

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:8080` to see the application.

---

## 🏗️ Project Structure

```
neuromatch/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Avatar.tsx       # Avatar selection grid
│   │   ├── ChatMessage.tsx  # Chat message bubbles
│   │   ├── MatchCard.tsx    # Match display cards
│   │   ├── QuizQuestion.tsx # Quiz question renderer
│   │   └── RadarChart.tsx   # Personality visualization
│   ├── pages/               # Main application pages
│   │   ├── Landing.tsx      # Homepage
│   │   ├── Auth.tsx         # Login/signup
│   │   ├── Signup.tsx       # Profile creation
│   │   ├── Quiz.tsx         # Mindprint quiz
│   │   ├── Processing.tsx   # AI analysis screen
│   │   ├── Profile.tsx      # User profile + radar
│   │   ├── Matches.tsx      # Match results
│   │   └── Chat.tsx         # Messaging interface
│   ├── lib/
│   │   └── api.ts           # API client (Supabase Edge Functions)
│   ├── integrations/
│   │   └── supabase/        # Supabase client & types
│   ├── index.css            # Design system tokens
│   └── main.tsx             # App entry point
├── supabase/
│   ├── functions/           # Edge Functions (serverless API)
│   │   ├── quiz-questions/  # GET quiz questions
│   │   ├── quiz-submit/     # POST quiz + AI processing
│   │   ├── get-matches/     # GET user matches
│   │   ├── conversations/   # Chat management
│   │   ├── messages/        # Message CRUD
│   │   └── me/              # Get current user profile
│   └── config.toml          # Supabase configuration
├── BACKEND_MIGRATION.sql    # Database schema
├── AI_MATCHING_SYSTEM.md    # AI matching documentation
└── README.md                # This file
```

---

## 🤖 How AI Matching Works

NeuroMatch uses two complementary AI techniques:

### 1. **Semantic Embeddings**
- User's bio + quiz answers → AI generates 1536-dimensional vector
- Represents the "meaning" of their thoughts
- Similar vectors = similar thinking patterns
- Uses OpenAI's `text-embedding-3-small` via Lovable AI Gateway

### 2. **OCEAN Personality Scores**
- AI analyzes quiz responses for Big Five traits:
  - **O**penness: Curiosity, creativity
  - **C**onscientiousness: Organization, discipline
  - **E**xtraversion: Sociability, energy
  - **A**greeableness: Compassion, cooperation
  - **N**euroticism: Emotional stability
- Uses Google's `gemini-2.5-flash` via Lovable AI Gateway
- Structured output ensures valid scores (0.0 - 1.0)

### 3. **Match Calculation**
- Cosine similarity between embeddings
- Finds top 5 most compatible users
- Stored in `matches` table with score (0-100%)

**For detailed information, see [AI_MATCHING_SYSTEM.md](./AI_MATCHING_SYSTEM.md)**

---

## 🔧 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **shadcn/ui** - Pre-built component library

### Backend
- **Supabase** - PostgreSQL database + Auth + Edge Functions
- **Lovable AI Gateway** - Unified AI model access
  - OpenAI GPT-5 & embeddings
  - Google Gemini 2.5 family
- **Row-Level Security (RLS)** - Database-level authorization

### AI Models
- `text-embedding-3-small` - Semantic embeddings (1536-dim)
- `google/gemini-2.5-flash` - OCEAN personality analysis

---

## 📡 API Endpoints

All endpoints are serverless Supabase Edge Functions:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/functions/v1/quiz-questions` | GET | Fetch quiz questions |
| `/functions/v1/quiz-submit` | POST | Submit quiz + generate AI analysis |
| `/functions/v1/get-matches` | GET | Get user's top matches |
| `/functions/v1/me` | GET | Get current user profile |
| `/functions/v1/conversations` | GET/POST | List or create conversations |
| `/functions/v1/messages` | GET/POST | Get or send messages |

**Authentication:** All endpoints (except `quiz-questions`) require a valid Supabase session token in the `Authorization` header.

---

## 🎨 Design System

Colors and styles are defined in `src/index.css` using HSL semantic tokens:

```css
:root {
  --primary: 263 85% 67%;        /* Purple gradient base */
  --primary-glow: 263 85% 77%;   /* Lighter purple */
  --secondary: 340 100% 86%;     /* Soft pink accent */
  --background: 0 0% 98%;        /* Off-white */
  --foreground: 240 10% 15%;     /* Dark text */
  --muted: 240 4.8% 95.9%;       /* Subtle backgrounds */
}
```

**Key Classes:**
- `.card-elevated` - Elevated cards with shadow
- `.card-soft` - Subtle background cards
- `.shadow-soft` - Gentle drop shadow
- `.transition-smooth` - Smooth animations
- Buttons: `variant="hero"`, `variant="ghost-primary"`, `variant="soft"`

---

## 🔐 Authentication Flow

1. **Signup** (`/auth`)
   - User enters email + password
   - Supabase Auth creates account
   - Email confirmation (optional)
   
2. **Profile Creation** (`/signup`)
   - Choose pseudonym + avatar
   - Creates row in `profiles` table
   
3. **Mindprint Quiz** (`/quiz`)
   - Answer 8 personality questions
   - Submit triggers AI analysis
   
4. **AI Processing** (`/processing`)
   - Edge function generates embeddings
   - Edge function analyzes OCEAN scores
   - Calculates matches with other users
   
5. **Profile & Matches** (`/profile`, `/matches`)
   - View personality radar chart
   - Browse top matches
   - Start conversations

---

## 🗄️ Database Schema

### Core Tables

**profiles**
```sql
id UUID PRIMARY KEY
username TEXT
avatar_id TEXT
bio TEXT
age INTEGER
gender TEXT
```

**quiz_answers**
```sql
id UUID PRIMARY KEY
user_id UUID → profiles(id)
question_id UUID → quiz_questions(id)
answer_value JSONB
```

**user_embeddings**
```sql
user_id UUID PRIMARY KEY → profiles(id)
embedding_vector TEXT (JSON array of 1536 floats)
```

**personalities**
```sql
user_id UUID PRIMARY KEY → profiles(id)
openness FLOAT (0-1)
conscientiousness FLOAT (0-1)
extraversion FLOAT (0-1)
agreeableness FLOAT (0-1)
neuroticism FLOAT (0-1)
```

**matches**
```sql
id UUID PRIMARY KEY
user1_id UUID → profiles(id)
user2_id UUID → profiles(id)
match_score FLOAT (0-100)
```

---

## 🧪 Testing

### Manual Testing
1. Create 2+ test accounts with different emails
2. Complete quiz with varied answers
3. Check matches appear correctly
4. Test chat functionality

### Database Inspection
```sql
-- View all user embeddings
SELECT user_id, generated_at FROM user_embeddings;

-- View personality scores
SELECT p.username, per.* 
FROM personalities per
JOIN profiles p ON p.id = per.user_id;

-- View matches
SELECT 
  p1.username as user1,
  p2.username as user2,
  m.match_score
FROM matches m
JOIN profiles p1 ON p1.id = m.user1_id
JOIN profiles p2 ON p2.id = m.user2_id
ORDER BY m.match_score DESC;
```

### Edge Function Logs
Check logs in [Supabase Dashboard](https://supabase.com/dashboard/project/kinwixjeoghoeoubnoln/functions)

---

## 📚 Additional Documentation

- **[AI_MATCHING_SYSTEM.md](./AI_MATCHING_SYSTEM.md)** - Deep dive into embedding generation, OCEAN analysis, and match calculation
- **[BACKEND_MIGRATION.sql](./BACKEND_MIGRATION.sql)** - Complete database schema with RLS policies
- **[Lovable AI Docs](https://docs.lovable.dev/features/ai)** - AI Gateway usage and pricing
- **[Supabase Docs](https://supabase.com/docs)** - Database and auth guides

---

## 🚢 Deployment

### Deploy Frontend
The app auto-deploys via Lovable when you click **Publish**.

### Deploy Edge Functions
Edge Functions are auto-deployed with your code. No manual deployment needed.

### Environment Variables
All secrets are pre-configured:
- `LOVABLE_API_KEY` - Auto-provisioned
- `SUPABASE_URL` - Set in `.env`
- `SUPABASE_ANON_KEY` - Set in `.env`

---

## 🐛 Troubleshooting

### "Table 'profiles' not found" errors
→ Run `BACKEND_MIGRATION.sql` in Supabase SQL Editor

### TypeScript errors about missing types
→ Types auto-regenerate after running migration

### "Email not confirmed" on login
→ Disable email confirmation in Supabase Auth settings

### Edge function errors
→ Check logs in [Supabase Functions Dashboard](https://supabase.com/dashboard/project/kinwixjeoghoeoubnoln/functions)

### No matches appearing
→ Create multiple test users (need 2+ users with completed quizzes)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered full-stack platform
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Lovable AI Gateway](https://docs.lovable.dev/features/ai)
- Database by [Supabase](https://supabase.com)

---

## 📞 Support

- Documentation: [docs.lovable.dev](https://docs.lovable.dev)
- Community: [Lovable Discord](https://discord.gg/lovable)
- Issues: Open an issue in this repository

---

**Ready to match minds?** 🧠✨

Run `npm run dev` and visit `http://localhost:8080` to start your neural journey!