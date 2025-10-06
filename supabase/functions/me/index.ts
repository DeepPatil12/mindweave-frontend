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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Get personality data if available
    const { data: personality } = await supabase
      .from('personalities')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Format radar data from OCEAN scores (map to app's radar format)
    let radar = null;
    if (personality) {
      radar = {
        curiosity: personality.openness,
        empathy: personality.agreeableness,
        logic: personality.conscientiousness,
        novelty: personality.openness, // Could be derived differently
        reflection: 1 - personality.neuroticism // Inverse of neuroticism
      };
    }

    const userProfile = {
      id: profile.id,
      username: profile.username,
      avatarId: profile.avatar_id,
      bio: profile.bio,
      age: profile.age,
      gender: profile.gender,
      email: user.email,
      radar: radar,
      tags: personality ? ['Deep Thinker', 'Empathetic', 'Creative'] : undefined,
      preferences: {
        openTo1v1: true,
        onlyGroupChats: false,
        dailyPrompts: true
      }
    };

    return new Response(
      JSON.stringify(userProfile),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
