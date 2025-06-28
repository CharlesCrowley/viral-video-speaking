# ESL Video Description App

A mobile-first web application for English as a Second Language (ESL) learners to practice speaking skills through viral video descriptions. Built with Next.js, Supabase, and AI-powered feedback.

## 🎯 Project Overview

This micro-learning app provides ESL learners with bite-sized speaking practice sessions. Users complete vocabulary exercises, watch viral videos, record spoken descriptions, and receive AI-powered feedback with IELTS-style scoring.

### Key Features

- **Vocabulary Practice**: Interactive matching and gap-fill exercises
- **Single-Play Video Viewing**: Encourages spontaneous descriptions
- **60-Second Recording**: Timed audio capture with visual countdown
- **AI-Powered Feedback**: Deepgram transcription + Groq scoring
- **IELTS-Style Grading**: Comprehensive scoring with specific feedback
- **Progress Tracking**: Lesson completion status and attempt history
- **Mobile-First Design**: Optimized for 360×640px+ viewports

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **dnd-kit** - Drag-and-drop interactions

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Edge Functions** - Serverless functions (Deno runtime)
- **Row Level Security (RLS)** - Fine-grained access control
- **Supabase Storage** - File storage for videos and recordings

### AI Services
- **Deepgram** - Speech-to-text transcription
- **Groq Cloud** - LLaMA 3.3 70B for AI scoring

### Deployment
- **Vercel** - Frontend hosting and deployment
- **GitHub Actions** - CI/CD pipeline

## 🗄️ Database Migration to Neon

> **Important:** We are migrating from Supabase PostgreSQL to Neon PostgreSQL to take advantage of Neon's serverless architecture, better pricing, and enhanced developer experience.

The migration will involve:
- Exporting existing data from Supabase
- Setting up Neon database with the same schema
- Updating connection strings and environment variables
- Testing all functionality post-migration

## 📊 Database Schema

The application uses the following main tables:

```sql
profiles         # User profiles extending Supabase auth
lessons          # Video lessons with vocab and exercises
attempts         # User recording attempts with scores
```

Key relationships:
- Users have many attempts
- Lessons have many attempts
- Profiles extend Supabase auth.users

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Deepgram API key
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd viral-video-description-app
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your `.env.local`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # AI Services
   DEEPGRAM_API_KEY=your_deepgram_key
   GROQ_API_KEY=your_groq_key
   ```

3. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL from `supabase-schema.sql` in the SQL Editor
   - Set up storage buckets for videos and recordings

4. **Deploy Edge Functions**
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   supabase functions deploy transcribe
   supabase functions deploy score
   supabase secrets set DEEPGRAM_API_KEY=your_key
   supabase secrets set GROQ_API_KEY=your_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📱 User Flow

```
Home → Lesson List → Prepare Screen
├─ Matching Exercise (vocab terms ↔ definitions)
└─ Gap-fill Exercise (drag words to blanks)
  ↓
Video Screen
├─ Single-play video
├─ 60-second recording with countdown
└─ Audio upload & processing
  ↓
Feedback Screen
├─ IELTS score (1.0-9.0)
├─ CEFR level (A1-C2)
├─ Detailed mistake analysis
└─ Share recap (optional)
```

## 🧪 Testing

### Manual Testing Checklist

1. **Authentication Flow**
   - [ ] Email signup/login works
   - [ ] Magic link authentication
   - [ ] Protected routes redirect properly

2. **Lesson Flow**
   - [ ] Lessons load on homepage
   - [ ] Progress indicators work
   - [ ] Vocabulary exercises validate correctly
   - [ ] Continue button enables after completion

3. **Recording & Feedback**
   - [ ] Video plays once and controls hide
   - [ ] Microphone permission requested
   - [ ] 60-second countdown works
   - [ ] Audio uploads successfully
   - [ ] Transcription and scoring complete
   - [ ] Feedback displays correctly

### Automated Testing

Currently, the project needs test coverage. Priority areas:
- Component unit tests with Jest/React Testing Library
- API route testing
- Edge Function testing
- E2E testing with Playwright

## 🎨 Component Architecture

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication pages
│   └── lesson/[id]/    # Dynamic lesson routes
├── components/         # Reusable components
│   ├── ui/            # shadcn/ui components
│   ├── exercises/     # Vocabulary exercise components
│   └── ...
├── contexts/          # React contexts (Auth)
├── hooks/             # Custom hooks (MediaRecorder)
├── lib/               # Utilities and configurations
└── types/             # TypeScript definitions
```

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Authentication required** for all lesson interactions
- **File upload restrictions** in Supabase Storage
- **API key protection** in Edge Functions
- **Input validation** with Zod schemas

## 🚀 Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set these in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPGRAM_API_KEY`
- `GROQ_API_KEY`

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for all files
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer functional components with hooks

### Commit Convention
```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

### Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

## 📝 API Documentation

### Edge Functions

#### `/functions/transcribe`
- **Input**: `{ attemptId: string }`
- **Output**: `{ transcript: string, confidence: number }`
- **Purpose**: Convert audio to text via Deepgram

#### `/functions/score`
- **Input**: `{ attemptId: string, lessonVocab: string[] }`
- **Output**: `{ ielts: number, cefr: string, feedback: object }`
- **Purpose**: Generate AI-powered scoring via Groq

## 🐛 Troubleshooting

### Common Issues

1. **Recording not working**
   - Check microphone permissions
   - Verify HTTPS in production
   - Check browser compatibility

2. **AI processing fails**
   - Verify API keys are set
   - Check Edge Function logs
   - Ensure audio file is valid

3. **Build errors**
   - Clear Next.js cache: `rm -rf .next`
   - Verify all environment variables
   - Check TypeScript errors

### Debug Tools

- Browser DevTools Console
- Supabase Dashboard Logs
- Vercel Function Logs
- Network tab for API calls

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Deepgram API](https://developers.deepgram.com/)
- [Groq Documentation](https://console.groq.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

[Add your license information here]

## 📞 Support

For technical issues or questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include browser, OS, and reproduction steps 