-- Complete backend schema for NeuroMatch
-- Run this in your Lovable Cloud SQL Editor

-- Extend profiles table with additional fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Quiz Questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'multi-select', 'open')),
  options JSONB,
  placeholder TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE NOT NULL,
  answer_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- User Embeddings table (stores AI-generated embeddings)
CREATE TABLE IF NOT EXISTS user_embeddings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  embedding_vector TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personalities table (OCEAN scores)
CREATE TABLE IF NOT EXISTS personalities (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  openness FLOAT NOT NULL CHECK (openness >= 0 AND openness <= 1),
  conscientiousness FLOAT NOT NULL CHECK (conscientiousness >= 0 AND conscientiousness <= 1),
  extraversion FLOAT NOT NULL CHECK (extraversion >= 0 AND extraversion <= 1),
  agreeableness FLOAT NOT NULL CHECK (agreeableness >= 0 AND agreeableness <= 1),
  neuroticism FLOAT NOT NULL CHECK (neuroticism >= 0 AND neuroticism <= 1),
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_score FLOAT NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('1v1', 'group')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants junction table
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'system', 'ai-prompt')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_answers_user ON quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);

-- Row Level Security Policies

-- Profiles: Users can read all profiles, update only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Quiz Questions: Public read
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quiz questions are public" ON quiz_questions;
CREATE POLICY "Quiz questions are public"
  ON quiz_questions FOR SELECT
  USING (true);

-- Quiz Answers: Users can only see/manage their own
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quiz answers" ON quiz_answers;
CREATE POLICY "Users can view own quiz answers"
  ON quiz_answers FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz answers" ON quiz_answers;
CREATE POLICY "Users can insert own quiz answers"
  ON quiz_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Embeddings: Users can view their own
ALTER TABLE user_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own embeddings" ON user_embeddings;
CREATE POLICY "Users can view own embeddings"
  ON user_embeddings FOR SELECT
  USING (auth.uid() = user_id);

-- Personalities: Users can view all (for matching)
ALTER TABLE personalities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Personalities viewable by authenticated users" ON personalities;
CREATE POLICY "Personalities viewable by authenticated users"
  ON personalities FOR SELECT
  TO authenticated
  USING (true);

-- Matches: Users can see matches they're part of
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their matches" ON matches;
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Conversations: Users can see conversations they're in
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

-- Conversation Participants
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
CREATE POLICY "Users can view participants of their conversations"
  ON conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Messages: Users can view/send in their conversations
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Insert default quiz questions
INSERT INTO quiz_questions (text, question_type, options, order_index) VALUES
  ('When you''re stressed, you usually:', 'mcq', '["Overthink everything", "Take immediate action", "Talk it through with others", "Retreat into silence"]'::jsonb, 1),
  ('Complete this sentence: "The world feels..."', 'open', NULL, 2),
  ('Your ideal weekend involves:', 'mcq', '["Deep conversations with close friends", "Exploring somewhere new alone", "Learning something completely new", "Creating something with your hands"]'::jsonb, 3),
  ('Which of these resonate with you? (Choose all that apply)', 'multi-select', '["I think in images and metaphors", "Logic guides most of my decisions", "I feel others'' emotions deeply", "I need time alone to recharge", "I love connecting patterns", "I trust my gut instincts"]'::jsonb, 4),
  ('What''s a question you''ve been carrying with you lately?', 'open', NULL, 5),
  ('In a group discussion, you typically:', 'mcq', '["Listen carefully before speaking", "Jump in with ideas immediately", "Ask clarifying questions", "Help others feel heard"]'::jsonb, 6),
  ('Change excites you most when it''s:', 'mcq', '["Gradual and thoughtful", "Bold and transformative", "Collaborative and inclusive", "Unexpected and spontaneous"]'::jsonb, 7),
  ('Describe a moment when you felt most like yourself.', 'open', NULL, 8)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
