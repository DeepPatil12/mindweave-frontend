// API client for NeuroMatch
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  avatarId: string;
  tags?: string[];
  radar?: RadarData;
  preferences?: UserPreferences;
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
  // Authentication & Signup
  async signup(data: { username: string; avatarId: string }): Promise<User> {
    await delay(500);
    
    // Check username uniqueness
    const existingUser = mockUsers.find(u => u.username.toLowerCase() === data.username.toLowerCase());
    if (existingUser) {
      throw new Error('Username already taken');
    }

    const user: User = {
      id: generateId(),
      username: data.username,
      avatarId: data.avatarId,
      preferences: {
        openTo1v1: true,
        onlyGroupChats: false,
        dailyPrompts: true
      }
    };

    mockUsers.push(user);
    localStorage.setItem('neuromatch_user', JSON.stringify(user));
    return user;
  },

  // Quiz Management
  async getQuizQuestions(): Promise<QuizQuestion[]> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error fetching quiz questions:', error);
      // Fallback to mock questions if database fetch fails
      return [
        {
          id: 'q1',
          type: 'mcq',
          text: 'When you\'re stressed, you usually:',
          options: ['Overthink everything', 'Take immediate action', 'Talk it through with others', 'Retreat into silence']
        },
        {
          id: 'q2',
          type: 'open',
          text: 'Complete this sentence: "The world feels..."',
          placeholder: 'Type a short response...'
        },
        {
          id: 'q3',
          type: 'mcq',
          text: 'Your ideal weekend involves:',
          options: ['Deep conversations with close friends', 'Exploring somewhere new alone', 'Learning something completely new', 'Creating something with your hands']
        },
        {
          id: 'q4',
          type: 'multi-select',
          text: 'Which of these resonate with you? (Choose all that apply)',
          options: ['I think in images and metaphors', 'Logic guides most of my decisions', 'I feel others\' emotions deeply', 'I need time alone to recharge', 'I love connecting patterns', 'I trust my gut instincts']
        },
        {
          id: 'q5',
          type: 'open',
          text: 'What\'s a question you\'ve been carrying with you lately?',
          placeholder: 'Share what\'s on your mind...'
        },
        {
          id: 'q6',
          type: 'mcq',
          text: 'In a group discussion, you typically:',
          options: ['Listen carefully before speaking', 'Jump in with ideas immediately', 'Ask clarifying questions', 'Help others feel heard']
        },
        {
          id: 'q7',
          type: 'mcq',
          text: 'Change excites you most when it\'s:',
          options: ['Gradual and thoughtful', 'Bold and transformative', 'Collaborative and inclusive', 'Unexpected and spontaneous']
        },
        {
          id: 'q8',
          type: 'open',
          text: 'Describe a moment when you felt most like yourself.',
          placeholder: 'What was happening? How did it feel?'
        }
      ];
    }

    // Transform database format to QuizQuestion format
    return data.map(q => ({
      id: q.id,
      type: q.question_type as 'mcq' | 'multi-select' | 'open',
      text: q.text,
      options: q.options as string[] | undefined,
      placeholder: q.placeholder || undefined
    }));
  },

  async submitQuiz(userId: string, answers: QuizAnswer[]): Promise<{ profileId: string }> {
    try {
      // Save each answer to the database
      const answerInserts = answers.map(answer => ({
        user_id: userId,
        question_id: answer.questionId,
        answer_value: typeof answer.value === 'string' ? answer.value : answer.value
      }));

      const { error: answersError } = await supabase
        .from('quiz_answers')
        .insert(answerInserts);

      if (answersError) throw answersError;

      // Generate personality traits using Big Five model
      const traits = {
        openness: Math.random() * 0.4 + 0.6,
        conscientiousness: Math.random() * 0.4 + 0.5,
        extraversion: Math.random() * 0.4 + 0.4,
        agreeableness: Math.random() * 0.4 + 0.5,
        neuroticism: Math.random() * 0.3 + 0.3
      };

      // Save personality traits
      const { error: traitsError } = await supabase
        .from('personalities')
        .upsert({
          user_id: userId,
          ...traits
        }, {
          onConflict: 'user_id'
        });

      if (traitsError) throw traitsError;

      // Generate simple embedding vector as JSON string (in production, this would use AI)
      const embedding = Array.from({ length: 384 }, () => Math.random());
      const embeddingVector = JSON.stringify(embedding);

      const { error: embeddingError } = await supabase
        .from('user_embeddings')
        .upsert({
          user_id: userId,
          embedding_vector: embeddingVector
        }, {
          onConflict: 'user_id'
        });

      if (embeddingError) throw embeddingError;

      return { profileId: userId };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  },

  // Profile Management
  async getProfile(userId: string): Promise<User | null> {
    await delay(400);
    const user = mockUsers.find(u => u.id === userId) || JSON.parse(localStorage.getItem('neuromatch_user') || 'null');
    return user;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(500);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      localStorage.setItem('neuromatch_user', JSON.stringify(mockUsers[userIndex]));
      return mockUsers[userIndex];
    }
    throw new Error('User not found');
  },

  // Matches
  async getMatches(userId: string): Promise<Match[]> {
    await delay(600);
    return mockMatches;
  },

  // Chat Management
  async createChat(participants: string[]): Promise<{ chatId: string }> {
    await delay(400);
    const chatId = `chat_${generateId()}`;
    
    const newChat: Chat = {
      id: chatId,
      participants,
      type: participants.length === 2 ? '1v1' : 'group',
      messages: []
    };
    
    mockChats.push(newChat);
    return { chatId };
  },

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    await delay(300);
    const chat = mockChats.find(c => c.id === chatId);
    return chat?.messages || [];
  },

  async sendMessage(chatId: string, from: string, text: string): Promise<{ messageId: string }> {
    await delay(200);
    const messageId = generateId();
    
    const chat = mockChats.find(c => c.id === chatId);
    if (chat) {
      const message: ChatMessage = {
        id: messageId,
        from,
        text,
        timestamp: new Date().toISOString(),
        type: 'user'
      };
      chat.messages.push(message);
    }
    
    return { messageId };
  },

  // Daily Micro-Test
  async submitDailyTest(userId: string, answer: string): Promise<{ updatedRadar: RadarData }> {
    await delay(500);
    
    const user = mockUsers.find(u => u.id === userId);
    if (user && user.radar) {
      // Slightly adjust radar based on daily test
      const adjustment = answer === 'novelty' ? 0.02 : -0.01;
      user.radar.novelty = Math.min(1, Math.max(0, user.radar.novelty + adjustment));
      
      localStorage.setItem('neuromatch_user', JSON.stringify(user));
      return { updatedRadar: user.radar };
    }
    
    throw new Error('User not found');
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