# NeuroMatch AI Matching System

## Overview

NeuroMatch uses advanced AI techniques to match users based on their cognitive patterns and personality traits, not superficial characteristics. The system combines **semantic embeddings** and **OCEAN personality analysis** to find truly compatible connections.

---

## How It Works

### 1. Quiz Submission Flow

When a user completes the Mindprint Quiz:

```
User Answers Quiz
      ↓
Edge Function: quiz-submit
      ↓
Generate Embedding → Generate OCEAN Scores → Calculate Matches
      ↓
Store in Database
```

### 2. Embedding Generation

**What are embeddings?**
Embeddings are numerical representations (vectors) that capture the semantic meaning of text. Similar thoughts produce similar vectors.

**Process:**
1. User's bio + quiz answers are combined into a single text
2. Sent to Lovable AI Gateway using `text-embedding-3-small` model
3. Returns a 1536-dimensional vector
4. Stored in `user_embeddings` table

**Example:**
```typescript
const textForEmbedding = `
  Bio: ${userBio}
  
  Quiz Answers:
  Q: When you're stressed, you usually:
  A: Overthink everything
  
  Q: Complete this sentence: "The world feels..."
  A: Like an interconnected web of stories waiting to be understood
`;

// Lovable AI generates embedding
const embedding = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
  method: 'POST',
  body: JSON.stringify({
    model: 'text-embedding-3-small',
    input: textForEmbedding
  })
});
```

### 3. OCEAN Personality Analysis

**What is OCEAN?**
OCEAN (Big Five) is a scientifically validated personality framework:
- **O**penness: Curiosity, creativity, openness to new experiences
- **C**onscientiousness: Organization, dependability, self-discipline  
- **E**xtraversion: Sociability, assertiveness, emotional expressiveness
- **A**greeableness: Compassion, cooperation, trust
- **N**euroticism: Emotional stability, anxiety, moodiness

**Process:**
1. User's quiz answers are sent to Lovable AI Gateway
2. Google's Gemini 2.5 Flash analyzes responses using structured output
3. Returns scores (0.0 - 1.0) for each trait
4. Stored in `personalities` table

**AI Prompt Used:**
```typescript
const systemPrompt = `You are a personality analysis expert. Analyze the user's quiz responses and generate OCEAN (Big Five) personality scores.

Return scores between 0.0 and 1.0 for:
- Openness: Curiosity, creativity, intellectual interests
- Conscientiousness: Organization, responsibility, goal-directed
- Extraversion: Sociability, assertiveness, energy in social settings
- Agreeableness: Compassion, cooperation, trust in others
- Neuroticism: Emotional instability, anxiety, stress response

Base your analysis on the actual responses, considering both explicit answers and implicit patterns.`;
```

**Structured Output Schema:**
```typescript
{
  tools: [{
    type: "function",
    function: {
      name: "analyze_personality",
      parameters: {
        type: "object",
        properties: {
          openness: { type: "number", minimum: 0, maximum: 1 },
          conscientiousness: { type: "number", minimum: 0, maximum: 1 },
          extraversion: { type: "number", minimum: 0, maximum: 1 },
          agreeableness: { type: "number", minimum: 0, maximum: 1 },
          neuroticism: { type: "number", minimum: 0, maximum: 1 }
        }
      }
    }
  }],
  tool_choice: { type: "function", function: { name: "analyze_personality" } }
}
```

### 4. Match Calculation

**Algorithm:**
The system finds compatible users using **cosine similarity** between embeddings:

```typescript
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }
  
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

// Convert to percentage score
const matchScore = cosineSimilarity(userEmbedding, otherUserEmbedding) * 100;
```

**Why Cosine Similarity?**
- Measures the angle between vectors (not just distance)
- Values range from -1 to 1 (we scale to 0-100%)
- Captures semantic similarity effectively
- Used by major search engines and recommendation systems

**Match Selection:**
1. Calculate similarity with ALL other users
2. Sort by score (highest first)
3. Store top 5 matches in `matches` table
4. Includes both embedding similarity AND OCEAN compatibility

---

## Database Schema

### user_embeddings
```sql
CREATE TABLE user_embeddings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  embedding_vector TEXT NOT NULL,  -- JSON array of 1536 floats
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

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
3. Generate embedding via Lovable AI
4. Generate OCEAN scores via Lovable AI  
5. Calculate matches with all other users
6. Store top 5 matches

**Key API Calls:**
- `https://ai.gateway.lovable.dev/v1/embeddings` - Text embedding
- `https://ai.gateway.lovable.dev/v1/chat/completions` - OCEAN analysis

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

### Text Embedding: `text-embedding-3-small`
- **Provider:** OpenAI (via Lovable AI Gateway)
- **Dimensions:** 1536
- **Use Case:** Converting text to semantic vectors
- **Cost:** ~$0.02 per 1M tokens

### Personality Analysis: `google/gemini-2.5-flash`
- **Provider:** Google (via Lovable AI Gateway)
- **Use Case:** OCEAN personality scoring with structured output
- **Strengths:** Fast, cost-effective, excellent reasoning
- **Cost:** FREE during promotional period (Sept 29 - Oct 13, 2025)

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

### 2. Check Embeddings
```sql
SELECT user_id, generated_at
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
1. **Batch Embeddings:** Process multiple users at once
2. **Caching:** Store frequently accessed embeddings in memory
3. **Indexing:** Use `GIN` indexes for JSONB columns
4. **Async Processing:** Run matching in background jobs
5. **Pagination:** Limit matches returned per request

### Current Limits:
- Max embedding dimension: 1536
- Match calculation: O(n) for n users
- API rate limits: See Lovable AI docs

---

## Future Enhancements

🔮 **Planned Features:**
- [ ] Weighted OCEAN scoring in matching
- [ ] Dynamic match recalculation
- [ ] Compatibility explanations
- [ ] Temporal matching (mood-based)
- [ ] Group compatibility analysis
- [ ] Visual similarity mapping

---

## References

- [Lovable AI Documentation](https://docs.lovable.dev/features/ai)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Big Five Personality Traits](https://en.wikipedia.org/wiki/Big_Five_personality_traits)
- [Cosine Similarity Explained](https://en.wikipedia.org/wiki/Cosine_similarity)

---

## Support

For questions about the AI matching system:
1. Check Edge Function logs in Supabase Dashboard
2. Review `AI_MATCHING_SYSTEM.md` (this file)
3. Test with curl/Postman against edge functions
4. Contact support@lovable.dev for Lovable AI issues
