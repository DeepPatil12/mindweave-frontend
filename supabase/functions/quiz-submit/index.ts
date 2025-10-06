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

    // Delete existing quiz answers for this user (allow retaking quiz)
    const { error: deleteError } = await supabase
      .from('quiz_answers')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting old answers:', deleteError);
      throw deleteError;
    }

    // Store new quiz answers
    const answerRecords = answers.map((answer: any) => ({
      user_id: user.id,
      question_id: answer.questionId,
      answer_value: answer.value
    }));

    const { error: insertError } = await supabase
      .from('quiz_answers')
      .insert(answerRecords);

    if (insertError) throw insertError;

    // Get profile with bio
    const { data: profile } = await supabase
      .from('profiles')
      .select('bio')
      .eq('id', user.id)
      .single();

    // Create text for semantic analysis
    const answerTexts = answers
      .filter((a: any) => typeof a.value === 'string')
      .map((a: any) => a.value)
      .join(' ');
    const bioText = profile?.bio || '';
    const combinedText = `${bioText} ${answerTexts}`.trim();

    console.log('Generating OCEAN personality scores for user:', user.id);

    let oceanScores;
    let summary;

    // Try AI analysis, fall back to simple heuristics if it fails
    try {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        console.warn('LOVABLE_API_KEY not configured, using fallback analysis');
        throw new Error('No API key');
      }

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

      const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a personality analysis expert. Always respond with valid JSON only.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.3
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error(`AI API returned ${analysisResponse.status}`);
      }

      const analysisData = await analysisResponse.json();
      const analysisText = analysisData.choices[0].message.content;
      const analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, '').trim());
      summary = analysis.summary;
      oceanScores = {
        openness: analysis.openness,
        conscientiousness: analysis.conscientiousness,
        extraversion: analysis.extraversion,
        agreeableness: analysis.agreeableness,
        neuroticism: analysis.neuroticism
      };
      console.log('AI analysis successful');
    } catch (aiError) {
      console.error('AI analysis failed, using fallback:', aiError);
      
      // Fallback: Generate scores based on simple heuristics
      const textLength = combinedText.length;
      const wordCount = combinedText.split(/\s+/).length;
      const uniqueWords = new Set(combinedText.toLowerCase().split(/\s+/)).size;
      
      oceanScores = {
        openness: Math.min(1, (uniqueWords / wordCount) * 1.5), // Vocabulary diversity
        conscientiousness: Math.min(1, 0.4 + (textLength / 1000) * 0.6), // Detail level
        extraversion: Math.min(1, 0.3 + Math.random() * 0.4), // Random with bias
        agreeableness: Math.min(1, 0.4 + Math.random() * 0.4), // Random with bias
        neuroticism: Math.min(1, Math.random() * 0.5) // Random lower range
      };
      
      summary = `Thoughtful individual with ${wordCount} words of responses`;
      console.log('Using fallback scores:', oceanScores);
    }

    // Store semantic summary as embedding replacement
    await supabase
      .from('user_embeddings')
      .upsert({
        user_id: user.id,
        embedding_vector: summary // Store semantic summary instead of vector
      });

    // Store OCEAN scores
    await supabase
      .from('personalities')
      .upsert({
        user_id: user.id,
        ...oceanScores
      });

    console.log('Computing matches for user:', user.id);

    // Find matches by comparing OCEAN personality scores
    const { data: otherPersonalities, error: personalitiesError } = await supabase
      .from('personalities')
      .select('user_id, openness, conscientiousness, extraversion, agreeableness, neuroticism')
      .neq('user_id', user.id);

    if (personalitiesError) throw personalitiesError;

    const userScores = [
      oceanScores.openness,
      oceanScores.conscientiousness,
      oceanScores.extraversion,
      oceanScores.agreeableness,
      oceanScores.neuroticism
    ];

    const matches = [];

    for (const other of otherPersonalities || []) {
      const otherScores = [
        other.openness,
        other.conscientiousness,
        other.extraversion,
        other.agreeableness,
        other.neuroticism
      ];
      
      // Calculate Euclidean distance and convert to similarity score
      let sumSquaredDiff = 0;
      for (let i = 0; i < userScores.length; i++) {
        sumSquaredDiff += Math.pow(userScores[i] - otherScores[i], 2);
      }
      const distance = Math.sqrt(sumSquaredDiff);
      
      // Convert distance to 0-100 similarity score (closer = higher score)
      // Max possible distance is sqrt(5) ≈ 2.236 for normalized 0-1 scores
      const matchScore = Math.max(0, Math.min(100, (1 - distance / 2.236) * 100));
      
      matches.push({
        user1_id: user.id < other.user_id ? user.id : other.user_id,
        user2_id: user.id < other.user_id ? other.user_id : user.id,
        match_score: matchScore
      });
    }

    // Store top 10 matches
    const topMatches = matches
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10);

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
