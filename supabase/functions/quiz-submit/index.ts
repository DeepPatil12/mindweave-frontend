import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { answers } = await req.json();

    // Store quiz answers
    const answerRecords = answers.map((answer: any) => ({
      user_id: user.id,
      question_id: answer.questionId,
      answer_value: answer.value
    }));

    const { error: insertError } = await supabase
      .from('quiz_answers')
      .upsert(answerRecords);

    if (insertError) throw insertError;

    // Get profile with bio
    const { data: profile } = await supabase
      .from('profiles')
      .select('bio')
      .eq('id', user.id)
      .single();

    // Create text for embedding generation
    const answerTexts = answers
      .filter((a: any) => typeof a.value === 'string')
      .map((a: any) => a.value)
      .join(' ');
    const bioText = profile?.bio || '';
    const combinedText = `${bioText} ${answerTexts}`.trim();

    // Generate embedding using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    console.log('Generating embedding for user:', user.id);
    
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: combinedText,
        model: 'text-embedding-3-small' // OpenAI embedding model
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('Embedding API error:', errorText);
      throw new Error(`Embedding generation failed: ${errorText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Store embedding
    await supabase
      .from('user_embeddings')
      .upsert({
        user_id: user.id,
        embedding_vector: JSON.stringify(embedding)
      });

    console.log('Generating OCEAN personality scores for user:', user.id);

    // Generate OCEAN personality using Lovable AI
    const oceanPrompt = `Analyze the following user responses and bio to generate OCEAN (Big Five) personality scores. Return ONLY a JSON object with scores between 0 and 1 for: openness, conscientiousness, extraversion, agreeableness, neuroticism.

Bio: ${bioText}
Responses: ${answerTexts}

Return format: {"openness": 0.0-1.0, "conscientiousness": 0.0-1.0, "extraversion": 0.0-1.0, "agreeableness": 0.0-1.0, "neuroticism": 0.0-1.0}`;

    const oceanResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a personality analysis expert. Always respond with valid JSON only.' },
          { role: 'user', content: oceanPrompt }
        ],
        temperature: 0.3
      }),
    });

    if (!oceanResponse.ok) {
      const errorText = await oceanResponse.text();
      console.error('OCEAN API error:', errorText);
      throw new Error(`OCEAN generation failed: ${errorText}`);
    }

    const oceanData = await oceanResponse.json();
    const oceanScoresText = oceanData.choices[0].message.content;
    
    // Parse JSON from response
    const oceanScores = JSON.parse(oceanScoresText.replace(/```json\n?|\n?```/g, '').trim());

    // Store OCEAN scores
    await supabase
      .from('personalities')
      .upsert({
        user_id: user.id,
        ...oceanScores
      });

    console.log('Computing matches for user:', user.id);

    // Find matches by comparing embeddings
    const { data: otherUsers, error: usersError } = await supabase
      .from('user_embeddings')
      .select('user_id, embedding_vector')
      .neq('user_id', user.id);

    if (usersError) throw usersError;

    const userEmbedding = embedding;
    const matches = [];

    for (const other of otherUsers || []) {
      const otherEmbedding = JSON.parse(other.embedding_vector);
      
      // Calculate cosine similarity
      const dotProduct = userEmbedding.reduce((sum: number, val: number, i: number) => 
        sum + val * otherEmbedding[i], 0);
      const magA = Math.sqrt(userEmbedding.reduce((sum: number, val: number) => sum + val * val, 0));
      const magB = Math.sqrt(otherEmbedding.reduce((sum: number, val: number) => sum + val * val, 0));
      const similarity = dotProduct / (magA * magB);
      
      // Convert to 0-100 score
      const matchScore = ((similarity + 1) / 2) * 100;
      
      matches.push({
        user1_id: user.id < other.user_id ? user.id : other.user_id,
        user2_id: user.id < other.user_id ? other.user_id : user.id,
        match_score: matchScore
      });
    }

    // Store top 5 matches
    const topMatches = matches
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 5);

    if (topMatches.length > 0) {
      await supabase
        .from('matches')
        .upsert(topMatches);
    }

    console.log('Quiz processing complete for user:', user.id);

    return new Response(
      JSON.stringify({ profileId: user.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing quiz:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
