// API client for NeuroMatch - connected to Lovable Cloud backend
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  avatarId: string;
  tags?: string[];
  radar?: RadarData;
  preferences?: UserPreferences;
  bio?: string;
  age?: number;
  gender?: string;
  email?: string;
}

export interface RadarData {
  curiosity: number;
  empathy: number;
  logic: number;
  novelty: number;
  reflection: number;
}

export interface UserPreferences {
  openTo1v1: boolean;
  onlyGroupChats: boolean;
  dailyPrompts: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'multi-select' | 'open';
  text: string;
  options?: string[];
  placeholder?: string;
}

export interface QuizAnswer {
  questionId: string;
  type: string;
  value: string | string[];
}

export interface Match {
  id: string;
  username: string;
  avatarId: string;
  score: number;
  tags: string[];
  snippet: string;
  lastActive?: string;
}

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  type: 'user' | 'system' | 'ai-prompt';
}

export interface Chat {
  id: string;
  participants: string[];
  messages: ChatMessage[];
  type: '1v1' | 'group';
}

// Mock data storage
let mockUsers: User[] = [];
let mockMatches: Match[] = [];
let mockChats: Chat[] = [];
let mockQuizAnswers: Map<string, QuizAnswer[]> = new Map();

// Utility to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock delay for realistic API simulation
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize with some mock data
const initializeMockData = () => {
  // Sample matches
  mockMatches = [
    {
      id: 'match1',
      username: 'DeepThinker42',
      avatarId: 'avatar_1',
      score: 94,
      tags: ['Reflective', 'Empathic', 'Creative'],
      snippet: 'I believe the best conversations happen in the spaces between words...'
    },
    {
      id: 'match2',
      username: 'CosmicWanderer',
      avatarId: 'avatar_2',
      score: 87,
      tags: ['Curious', 'Philosophical', 'Adventurous'],
      snippet: 'What if our thoughts are just the universe trying to understand itself?'
    },
    {
      id: 'match3',
      username: 'QuietStorm',
      avatarId: 'avatar_3',
      score: 82,
      tags: ['Intuitive', 'Analytical', 'Gentle'],
      snippet: 'Sometimes the loudest truths are whispered in silence.'
    }
  ];

  // Sample AI conversation starters
  mockChats = [
    {
      id: 'chat_match1',
      participants: ['user', 'match1'],
      type: '1v1',
      messages: [
        {
          id: 'msg1',
          from: 'system',
          text: 'AI Conversation Starter: You both scored high on reflection and empathy. What\'s a moment of quiet realization that changed how you see the world?',
          timestamp: new Date().toISOString(),
          type: 'ai-prompt'
        }
      ]
    }
  ];
};

// Initialize mock data
initializeMockData();

// API Functions
export const api = {
  // Authentication & Signup (handled by Supabase Auth directly)
  async signup(data: { username: string; avatarId: string }): Promise<User> {
    // This is now handled in the Signup page directly with Supabase
    // Keeping this for API compatibility
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Not authenticated');
    
    // @ts-expect-error - Types will be generated after running BACKEND_MIGRATION.sql
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (error) throw error;
    if (!profile) throw new Error('Profile not found');
    
    return {
      // @ts-expect-error - Temporary until types are generated
      id: profile.id,
      // @ts-expect-error - Temporary until types are generated
      username: profile.username || '',
      // @ts-expect-error - Temporary until types are generated
      avatarId: profile.avatar_id || '',
      // @ts-expect-error - Temporary until types are generated
      bio: profile.bio || undefined,
      // @ts-expect-error - Temporary until types are generated
      age: profile.age || undefined,
      // @ts-expect-error - Temporary until types are generated
      gender: profile.gender || undefined
    };
  },

  // Quiz Management
  async getQuizQuestions(): Promise<QuizQuestion[]> {
    const { data, error } = await supabase.functions.invoke('quiz-questions');
    if (error) throw error;
    return data;
  },

  async submitQuiz(userId: string, answers: QuizAnswer[]): Promise<{ profileId: string }> {
    const { data, error } = await supabase.functions.invoke('quiz-submit', {
      body: { answers }
    });
    if (error) throw error;
    return data;
  },

  // Profile Management
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase.functions.invoke('me');
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    // @ts-expect-error - Types will be generated after migration
    const { error } = await supabase
      .from('profiles')
      .update({
        username: updates.username,
        bio: updates.bio,
        age: updates.age,
        gender: updates.gender
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error('Profile not found');
    return profile;
  },

  // Matches
  async getMatches(userId: string): Promise<Match[]> {
    const { data, error } = await supabase.functions.invoke('get-matches');
    if (error) throw error;
    return data || [];
  },

  // Chat Management
  async createChat(participants: string[]): Promise<{ chatId: string }> {
    const { data, error } = await supabase.functions.invoke('conversations', {
      body: { participants }
    });
    if (error) throw error;
    return data;
  },

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase.functions.invoke('messages', {
      body: { conversationId: chatId }
    });
    if (error) throw error;
    return data || [];
  },

  async sendMessage(chatId: string, from: string, text: string): Promise<{ messageId: string }> {
    const { data, error } = await supabase.functions.invoke('messages', {
      body: { 
        conversationId: chatId,
        text,
        type: 'user'
      }
    });
    if (error) throw error;
    return data;
  },

  // Daily Micro-Test
  async submitDailyTest(userId: string, answer: string): Promise<{ updatedRadar: RadarData }> {
    // Get current profile
    const profile = await this.getProfile(userId);
    if (!profile || !profile.radar) {
      throw new Error('User profile not found');
    }
    
    // Mock update - in production this would recalculate personality
    return { updatedRadar: profile.radar };
  },

  // Utility functions
  generateUsername(): string {
    const adjectives = ['Deep', 'Cosmic', 'Quiet', 'Brilliant', 'Gentle', 'Wild', 'Ancient', 'Serene', 'Fierce', 'Mystic'];
    const nouns = ['Thinker', 'Wanderer', 'Storm', 'River', 'Mountain', 'Ocean', 'Forest', 'Star', 'Moon', 'Phoenix'];
    const num = Math.floor(Math.random() * 99) + 1;
    
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${num}`;
  }
};

// Export mock data for components that need it
export const mockData = {
  avatars: [
    { id: 'avatar_1', name: 'Gentle Gradient', color: 'from-purple-400 to-pink-400' },
    { id: 'avatar_2', name: 'Ocean Wave', color: 'from-blue-400 to-cyan-400' },
    { id: 'avatar_3', name: 'Forest Mist', color: 'from-green-400 to-emerald-400' },
    { id: 'avatar_4', name: 'Sunset Glow', color: 'from-orange-400 to-red-400' },
    { id: 'avatar_5', name: 'Lavender Dream', color: 'from-indigo-400 to-purple-400' },
    { id: 'avatar_6', name: 'Golden Hour', color: 'from-yellow-400 to-orange-400' }
  ]
};