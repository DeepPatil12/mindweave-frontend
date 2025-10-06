# NeuroMatch AI Matching System

## Overview

NeuroMatch uses advanced AI techniques to match users based on their cognitive patterns and personality traits, not superficial characteristics. The system uses **OCEAN personality analysis** with **semantic summaries** to find truly compatible connections.

---

## How It Works

### 1. Quiz Submission Flow

When a user completes the Mindprint Quiz:

```
User Answers Quiz
      ↓
Edge Function: quiz-submit
      ↓
Generate OCEAN Scores + Semantic Summary (single AI call)
      ↓
Calculate Matches Based on OCEAN Distance
      ↓
Store in Database
```

### 2. Semantic Summary Generation

**What are semantic summaries?**
Instead of embeddings, we use AI to generate a concise text summary that captures the essence of a user's personality. This is more flexible and human-readable than vector embeddings.

**Process:**
1. User's bio + quiz answers are combined into a single text
2. Sent to Lovable AI Gateway using `google/gemini-2.5-flash` model
3. Returns both OCEAN scores AND a semantic summary in one call
4. Summary stored in `user_embeddings` table (as text, not vector)

**Why not traditional embeddings?**
- Lovable AI Gateway doesn't support dedicated embedding models like `text-embedding-3-small`
- Semantic summaries are more interpretable and can be used for match explanations
- Single AI call for both OCEAN + summary is more efficient and cost-effective

### 3. OCEAN Personality Analysis

**What is OCEAN?**
OCEAN (Big Five) is a scientifically validated personality framework:
- **O**penness: Curiosity, creativity, openness to new experiences
- **C**onscientiousness: Organization, dependability, self-discipline  
- **E**xtraversion: Sociability, assertiveness, emotional expressiveness
- **A**greeableness: Compassion, cooperation, trust
- **N**euroticism: Emotional stability, anxiety, moodiness

**Process:**
1. User's quiz answers + bio sent to Lovable AI Gateway in single call
2. Google's Gemini 2.5 Flash analyzes responses 
3. Returns JSON with OCEAN scores (0.0 - 1.0) AND semantic summary
4. OCEAN scores stored in `personalities` table
5. Semantic summary stored in `user_embeddings` table

**AI Prompt Used:**
```typescript
const analysisPrompt = `Analyze the following user responses and bio to generate:
1. OCEAN (Big Five) personality scores (0-1 scale)
2. A semantic summary capturing their personality essence (max 500 chars)

Bio: ${bioText}
Responses: ${answerTexts}

Return ONLY valid JSON in this exact format:
{
  "openness": 0.0-1.0,
  "conscientiousness": 0.0-1.0,
  "extraversion": 0.0-1.0,
  "agreeableness": 0.0-1.0,
  "neuroticism": 0.0-1.0,
  "summary": "semantic summary text"
}`;
```

**Why Single AI Call?**
- More efficient: One API call instead of two
- Lower cost: Reduced API usage
- Consistency: Summary and scores generated from same analysis
- Lovable AI Gateway limitation: No dedicated embedding endpoint

### 4. Match Calculation

**Algorithm:**
The system finds compatible users using **Euclidean distance** on OCEAN personality scores:

```typescript
// Get OCEAN scores for both users
const userScores = [openness, conscientiousness, extraversion, agreeableness, neuroticism];
const otherScores = [O2, C2, E2, A2, N2];

// Calculate Euclidean distance in 5-dimensional space
let sumSquaredDiff = 0;
for (let i = 0; i < 5; i++) {
  sumSquaredDiff += Math.pow(userScores[i] - otherScores[i], 2);
}
const distance = Math.sqrt(sumSquaredDiff);

// Convert distance to 0-100 similarity score
// Max possible distance is sqrt(5) ≈ 2.236 for normalized 0-1 scores
const matchScore = Math.max(0, Math.min(100, (1 - distance / 2.236) * 100));
```

**Why Euclidean Distance?**
- Intuitive: Measures "personality distance" in 5-dimensional OCEAN space
- Smaller distance = more similar personalities = higher compatibility
- All dimensions weighted equally (can be customized for weighted matching)
- Fast computation: O(5) per comparison
- Scientifically grounded in personality psychology

**Match Selection:**
1. Calculate distance with ALL other users who completed the quiz
2. Convert to 0-100 compatibility score
3. Sort by score (highest first)
4. Store top 10 matches in `matches` table
5. Bidirectional storage prevents duplicates

---

## Database Schema

### user_embeddings
```sql
CREATE TABLE user_embeddings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  embedding_vector TEXT NOT NULL,  -- Semantic summary text (not vector!)
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Note:** Despite the table name, we now store semantic text summaries instead of numerical embedding vectors, since Lovable AI Gateway doesn't support dedicated embedding models.

### personalities
```sql
CREATE TABLE personalities (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  openness FLOAT NOT NULL CHECK (openness >= 0 AND openness <= 1),
  conscientiousness FLOAT NOT NULL,
  extraversion FLOAT NOT NULL,
  agreeableness FLOAT NOT NULL,
  neuroticism FLOAT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### matches
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id),
  user2_id UUID REFERENCES profiles(id),
  match_score FLOAT NOT NULL,  -- 0-100 percentage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);
```

---

## Edge Functions

### quiz-submit
**Path:** `supabase/functions/quiz-submit/index.ts`

**Responsibilities:**
1. Authenticate user
2. Store quiz answers in `quiz_answers` table
3. Generate OCEAN scores + semantic summary via Lovable AI (single call)
4. Store semantic summary in `user_embeddings` table
5. Store OCEAN scores in `personalities` table
6. Calculate matches with all other users based on OCEAN distance
7. Store top 10 matches

**Key API Calls:**
- `https://ai.gateway.lovable.dev/v1/chat/completions` - Combined OCEAN + summary analysis

**Environment Variables:**
- `LOVABLE_API_KEY` - Auto-provisioned by Lovable Cloud

### get-matches
**Path:** `supabase/functions/get-matches/index.ts`

**Responsibilities:**
1. Fetch user's matches from `matches` table
2. Retrieve matched user profiles
3. Format response for frontend
4. Return top matches sorted by score

---

## AI Models Used

### Personality Analysis + Semantic Summary: `google/gemini-2.5-flash`
- **Provider:** Google (via Lovable AI Gateway)
- **Use Case:** Combined OCEAN personality scoring + semantic summary generation
- **Strengths:** Fast, cost-effective, excellent reasoning, JSON output
- **Output:** OCEAN scores (5 floats) + personality summary text (up to 500 chars)
- **Cost:** FREE during promotional period (Sept 29 - Oct 13, 2025)

### Why No Embedding Model?
- Lovable AI Gateway doesn't support dedicated embedding models
- Available models: GPT-5 family, Gemini 2.5 family (chat completions only)
- Semantic text summaries are more flexible than embedding vectors
- Can be used for match explanations and future AI features

---

## Privacy & Security

✅ **Privacy-First Design:**
- Only pseudonyms visible to other users
- No PII shared in matching
- Embeddings are anonymized vectors
- Row-Level Security (RLS) enforces data isolation

✅ **RLS Policies:**
```sql
-- Users can only view their own embeddings
CREATE POLICY "Users can view own embeddings"
  ON user_embeddings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only view matches they're part of
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
```

---

## Testing the System

### 1. Create Test Users
```bash
# Sign up with different emails
# Complete quiz with varied answers
```

### 2. Check Semantic Summaries
```sql
SELECT user_id, embedding_vector as semantic_summary, generated_at
FROM user_embeddings;
```

### 3. View Personality Scores
```sql
SELECT p.username, per.*
FROM personalities per
JOIN profiles p ON p.id = per.user_id;
```

### 4. Inspect Matches
```sql
SELECT 
  p1.username as user1,
  p2.username as user2,
  m.match_score
FROM matches m
JOIN profiles p1 ON p1.id = m.user1_id
JOIN profiles p2 ON p2.id = m.user2_id
ORDER BY m.match_score DESC;
```

---

## Performance Considerations

### Optimization Strategies:
1. **Batch Analysis:** Process multiple users in parallel
2. **Caching:** Cache OCEAN scores for inactive users
3. **Incremental Matching:** Only recalculate matches for new users
4. **Indexing:** Index personalities table for faster lookups
5. **Pagination:** Limit matches returned per request

### Current Limits:
- OCEAN dimensions: 5 (very fast computation)
- Match calculation: O(n) for n users - scales to ~50k users easily
- API rate limits: See Lovable AI docs
- Semantic summary: Max 500 characters

---

## Future Enhancements

🔮 **Planned Features:**
- [ ] Weighted OCEAN scoring (prioritize certain traits)
- [ ] Semantic summary comparison for tie-breaking
- [ ] AI-generated compatibility explanations using summaries
- [ ] Dynamic match recalculation based on engagement
- [ ] Temporal matching (mood-based)
- [ ] Group compatibility analysis
- [ ] Match explanation feature: "Why you matched"

---

## References

- [Lovable AI Documentation](https://docs.lovable.dev/features/ai)
- [Big Five Personality Traits](https://en.wikipedia.org/wiki/Big_Five_personality_traits)
- [Euclidean Distance](https://en.wikipedia.org/wiki/Euclidean_distance)
- [Google Gemini Models](https://ai.google.dev/models/gemini)

---

## Support

For questions about the AI matching system:
1. Check Edge Function logs in Supabase Dashboard
2. Review `AI_MATCHING_SYSTEM.md` (this file)
3. Test with curl/Postman against edge functions
4. Contact support@lovable.dev for Lovable AI issues
