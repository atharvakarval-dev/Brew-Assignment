# AI Movie Insight Builder

## Setup
1. Clone repo
2. cp .env.local.example .env.local
3. Add OMDB_API_KEY (get free at omdbapi.com) and GROQ_API_KEY (get free at console.groq.com)
4. npm install && npm run dev
5. Run tests: npm test

## Tech Stack Rationale
- Next.js 14 App Router: SSR + API routes in one framework, optimal for SEO and performance
- Tailwind CSS: Rapid UI development with consistent design tokens
- Framer Motion: Production-grade animations without bloat
- Groq + Llama 3.3 70B: Ultra-fast inference with JSON mode for structured output
- OMDB API: Free, reliable, covers 500k+ titles

## Assumptions
- Reviews are simulated since IMDb blocks scraping; mock reviews are genre-representative for realistic sentiment analysis
- OMDB free tier (1000 req/day) is sufficient for demo purposes
- Sentiment is cached for 24h as it's computationally expensive

## Architecture Decisions
- Edge-compatible API routes for low latency
- Zod validation on all AI responses to prevent runtime crashes
- next/image for automatic WebP conversion and lazy loading

---

## .env.local.example
OMDB_API_KEY=your_omdb_api_key_here
GROQ_API_KEY=your_groq_api_key_here

---
# Brew-Assignment
