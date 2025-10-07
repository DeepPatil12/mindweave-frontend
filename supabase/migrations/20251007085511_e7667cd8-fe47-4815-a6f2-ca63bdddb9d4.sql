-- Add INSERT policy for personalities table so users can insert their own personality data
CREATE POLICY "Users can insert own personality"
ON public.personalities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add INSERT policy for user_embeddings table so users can insert their own embeddings
CREATE POLICY "Users can insert own embeddings"
ON public.user_embeddings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for personalities table for upsert operations
CREATE POLICY "Users can update own personality"
ON public.personalities
FOR UPDATE
USING (auth.uid() = user_id);

-- Add UPDATE policy for user_embeddings table for upsert operations
CREATE POLICY "Users can update own embeddings"
ON public.user_embeddings
FOR UPDATE
USING (auth.uid() = user_id);