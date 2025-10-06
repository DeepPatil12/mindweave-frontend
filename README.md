# NeuroMatch MVP - Privacy-First Neural Matching

A beautiful React application that connects people based on how they think, not how they look.

## Features

- **Privacy-First**: Pseudonym-only matching system
- **AI-Powered Mindprints**: Unique cognitive fingerprint analysis  
- **Beautiful Design**: Calm, soulful interface inspired by modern AI apps
- **Responsive**: Works perfectly on mobile and desktop
- **Complete MVP**: Full user journey from signup to chat

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:8080` to see the application.

## Project Structure

- `/src/pages/*` - Main application pages (Landing, Quiz, Profile, etc.)
- `/src/components/*` - Reusable UI components
- `/src/lib/api.ts` - Mock API layer (replace with real backend)
- `/src/mock/*.json` - Sample data for development

## Key Components

- **Button**: Hero, ghost-primary, soft variants using design system
- **RadarChart**: Mindprint visualization using Recharts  
- **MatchCard**: Beautiful match display with resonance scores
- **ChatMessage**: Full chat interface with AI prompts
- **QuizQuestion**: Multi-format question component

## Design System

Colors and styles are defined in `src/index.css` using HSL semantic tokens:
- Primary: Purple gradient (#6C5CE7 → #8E7DFF) 
- Secondary: Soft pink accent (#FFB4C4)
- Success, muted, and card variants
- Custom shadows, gradients, and animations

## API Integration

Replace mock API in `src/lib/api.ts` with real endpoints:
- `POST /api/signup` - User registration
- `POST /api/quiz/submit` - Mindprint analysis
- `GET /api/matches/:userId` - Find neural matches
- `POST /api/chat/create` - Start conversations

## What's Next?

- **Refine & Customize**: Tweak the design, animations, and layouts via prompts or visual edits.
- **Master Prompting**: Use "chat mode" to plan out your project without making edits. Use clear, detailed, and iterative prompts for best results.
- **Add Backend**: Connect to Supabase for user data, real-time chat, and AI processing.

This MVP demonstrates the complete NeuroMatch experience with beautiful UI and solid architecture ready for production scaling.