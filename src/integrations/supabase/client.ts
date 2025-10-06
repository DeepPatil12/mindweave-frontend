import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cgdqavnvnzrfmhiuezgb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZHFhdm52bnpyZm1oaXVlemdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODQwMzQsImV4cCI6MjA2MjM2MDAzNH0.8LrQVLhQiAjNQSuEkK9tRf6d8Xhx_fSd_L-uGOhZW-g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
