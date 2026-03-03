# CineInsight - AI Movie Insight Builder

Confidential assignment submission for Brew (Full-Stack Developer Internship, Round 1).

## Live Deployment
- Live URL: https://brew-assignment-cyan.vercel.app/

## Objective
Given an IMDb ID (example: `tt0133093`), the app shows:
- Movie details (title, poster, cast, metadata, plot)
- Audience review data (TMDB when available, fallback dataset otherwise)
- AI-generated audience sentiment summary
- Sentiment classification (`positive`, `mixed`, `negative`) with a score

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Framer Motion
- TypeScript (strict)

### Backend
- Next.js Route Handlers
- OMDb API (movie metadata)
- TMDB API (audience reviews)
- Groq API (LLaMA model for sentiment synthesis)

### Testing
- Jest
- React Testing Library

## Tech Stack Rationale
- Next.js App Router keeps frontend and API routes in one codebase and supports clean deployment to Vercel.
- TypeScript strict mode reduces runtime bugs and improves maintainability.
- Tailwind enables consistent, fast iteration for responsive UI.
- Framer Motion supports premium UX interactions with controlled complexity.
- Route-level caching (`unstable_cache` + cache headers) improves latency and lowers API cost.

## Core Features Implemented
- IMDb ID input with validation (`tt` + 7/8 digits)
- Movie metadata fetch and display
- Cast list, release details, rating and plot summary
- Audience review retrieval (TMDB + fallback strategy)
- AI sentiment summary and key insights
- Sentiment badge + numerical score bar
- Error states, retry actions, loading skeletons
- Responsive UI for desktop and mobile

## Project Structure
```txt
app/
  page.tsx
  movie/[imdbId]/page.tsx
  api/movie/[imdbId]/route.ts
  api/sentiment/[imdbId]/route.ts
components/
  SearchBar.tsx
  MovieCard.tsx
  CastList.tsx
  SentimentSection.tsx
  SentimentBadge.tsx
  LoadingSkeleton.tsx
hooks/
  useMovieData.ts
  useSentiment.ts
lib/
  omdb.ts
  tmdb.ts
  groq.ts
  telemetry.ts
  utils.ts
```

## Environment Variables
Create `.env.local` using `.env.local.example`:

```env
OMDB_API_KEY=your_omdb_api_key_here
GROQ_API_KEY=your_groq_api_key_here
TMDB_API_KEY=your_tmdb_api_key_here
```

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env.local`
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`

## Validation Commands
- Run tests:
  ```bash
  npm test
  ```
- Type check:
  ```bash
  npx tsc --noEmit
  ```
- Production build:
  ```bash
  npm run build
  ```

## Deployment (Vercel)
1. Push repo to GitHub
2. Import project into Vercel
3. Add env vars (`OMDB_API_KEY`, `GROQ_API_KEY`, `TMDB_API_KEY`)
4. Deploy

## Performance Notes
- Cached movie responses (`s-maxage`/`stale-while-revalidate`)
- Cached sentiment responses (longer TTL due to AI cost)
- Parallelized upstream fetches in sentiment route
- Lightweight payload shaping for AI prompt inputs
- Server-Timing headers and telemetry utility for analysis

## Assumptions
- IMDb scraping is avoided; TMDB is used as the review source where possible.
- If TMDB reviews are insufficient/unavailable, fallback review samples are used.
- Sentiment generation quality depends on available review text quality and volume.
- Assignment scope favors maintainability and reliability over over-engineered infra.

## Known Limitations
- External API quotas/rate limits can affect real-time responses.
- AI output is constrained and validated but remains probabilistic.
- No authentication/rate-limiting layer is implemented (outside assignment scope).

