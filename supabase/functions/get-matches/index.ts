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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get matches where user is either user1 or user2
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        id,
        match_score,
        user1_id,
        user2_id
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('match_score', { ascending: false });

    if (error) throw error;

    // Get matched user profiles
    const matchedUserIds = matches.map(m => 
      m.user1_id === user.id ? m.user2_id : m.user1_id
    );

    if (matchedUserIds.length === 0) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_id, bio')
      .in('id', matchedUserIds);

    if (profilesError) throw profilesError;

    // Get a sample answer for snippet
    const { data: answers } = await supabase
      .from('quiz_answers')
      .select('user_id, answer_value')
      .in('user_id', matchedUserIds)
      .limit(1);

    // Format matches for frontend
    const formattedMatches = matches.map(match => {
      const matchedUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      const profile = profiles.find(p => p.id === matchedUserId);
      const answer = answers?.find(a => a.user_id === matchedUserId);
      
      const snippet = answer && typeof answer.answer_value === 'string'
        ? answer.answer_value.substring(0, 100) + '...'
        : profile?.bio?.substring(0, 100) + '...' || 'No bio available';

      return {
        id: match.id,
        userId: matchedUserId,
        username: profile?.username || 'Anonymous',
        avatarId: profile?.avatar_id || 'avatar_1',
        score: Math.round(match.match_score),
        tags: ['Deep Thinker', 'Empathetic', 'Creative'], // Could be derived from OCEAN scores
        snippet: snippet,
        lastActive: new Date().toISOString()
      };
    });

    return new Response(
      JSON.stringify(formattedMatches),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching matches:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
