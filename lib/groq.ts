import OpenAI from "openai";
import { jsonrepair } from "jsonrepair";
import { z } from "zod";

import type { MovieData, ParsedSentiment } from "@/lib/types";
import { clampScore } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a brutally honest film critic and sentiment analyst with 20 years of experience.
Your job is to analyze audience reviews and return a precise, data-driven sentiment analysis.

RULES YOU MUST FOLLOW:
1. Respond ONLY with a raw JSON object — no markdown, no code blocks, no text before or after
2. Every string value MUST be wrapped in double quotes
3. Use the FULL score range (0–100). Map scores as: 0–40 = negative, 41–65 = mixed, 66–100 = positive
4. DO NOT round to generic scores like 85, 88, 90, 92, 95. Use specific scores like 73, 81, 67, 94
5. If reviews mention flaws, pacing issues, or disappointments — reflect that honestly in the score
6. Your summary must reference SPECIFIC things audiences said, not generic praise
7. Insights must be concrete observations, not vague platitudes`;

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const sentimentSchema = z
  .object({
    sentiment: z.enum(["positive", "mixed", "negative"]),
    score: z.coerce.number().int(),
    summary: z.string().min(20),
    insights: z.array(z.string().min(10)).length(3),
    audienceVsCritics: z.string().optional(),
  })
  .transform((value) => ({
    ...value,
    score: clampScore(value.score),
  }));

// ─── Error Class ─────────────────────────────────────────────────────────────

export class AIClientError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AIClientError";
    this.statusCode = statusCode;
  }
}

export function isAIClientError(error: unknown): error is AIClientError {
  return error instanceof AIClientError;
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildUserPrompt(movie: MovieData, reviews: string[]): string {
  const reviewBlock = reviews
    .map((r, i) => `Review ${i + 1}: "${r}"`)
    .join("\n");

  // Extract RT and Metacritic scores if available
  const rtRating = movie.Ratings?.find((r) => r.Source === "Rotten Tomatoes");
  const metaRating = movie.Ratings?.find((r) => r.Source === "Metacritic");
  const criticsBlock =
    rtRating || metaRating
      ? `\nCritic Scores: ${rtRating ? `Rotten Tomatoes ${rtRating.Value}` : ""} ${metaRating ? `| Metacritic ${metaRating.Value}` : ""}`.trim()
      : "";

  return `Analyze audience sentiment for the following film:

MOVIE DETAILS:
Title: ${movie.Title} (${movie.Year})
Genre: ${movie.Genre}
Director: ${movie.Director}
IMDb Rating: ${movie.imdbRating}/10 (${movie.imdbVotes ?? "N/A"} votes)${criticsBlock}
Plot: ${movie.Plot}

AUDIENCE REVIEWS (${reviews.length} reviews sampled):
${reviewBlock}

TASK:
1. Analyze the emotional tone and recurring themes across the reviews
2. Note whether audience sentiment aligns or diverges from critics
3. Identify what audiences specifically loved and criticized
4. Assign a score that reflects the AVERAGE audience experience, not just the highlights

Respond ONLY with this exact JSON structure — all string values in double quotes:
{
  "sentiment": "positive" | "mixed" | "negative",
  "score": <integer 0-100>,
  "summary": "<3-4 sentences synthesizing what audiences genuinely felt, referencing specific aspects>",
  "insights": [
    "<what audiences consistently praised with specifics>",
    "<what audiences criticized or found lacking>",
    "<overall cultural impact or rewatchability observation>"
  ],
  "audienceVsCritics": "<1 sentence on whether audience and critic reception aligned or diverged>"
}`;
}

// ─── Mock Reviews Generator ──────────────────────────────────────────────────

const GENRE_REVIEWS: Record<string, string[]> = {
  Drama: [
    "Emotionally devastating and beautifully acted. The performances carry every scene.",
    "Slow burn that rewards patience. Not for everyone but deeply affecting.",
    "Overlong and self-indulgent in places, but the core story is powerful.",
    "The writing feels authentic, unlike most Hollywood dramas.",
    "Cried twice. The ending hits differently on rewatch.",
    "Pacing drags in the second act but the payoff is worth it.",
    "More interested in mood than plot, which frustrated me.",
  ],
  Action: [
    "Pure adrenaline. Best action sequences I've seen in years.",
    "Style over substance, but what style! Visually stunning.",
    "Plot is thin but the set pieces are incredible.",
    "Mindless fun done right. Exactly what I wanted.",
    "The CGI gets overwhelming. Practical effects would've been better.",
    "Exhausting in a good way. Never a dull moment.",
  ],
  Comedy: [
    "Genuinely funny, not just cheap jokes. Smart writing throughout.",
    "Hit and miss comedy but when it lands it's hilarious.",
    "Funnier than expected. The chemistry between leads is electric.",
    "Tries too hard in places but has a lot of heart.",
    "The humor is inconsistent but the comedic timing is excellent.",
  ],
  Horror: [
    "Actually scary, which is rare. Sustained dread throughout.",
    "Relies too much on jump scares, but the atmosphere is unsettling.",
    "The third act falls apart but the first two are terrifying.",
    "Slow build that pays off spectacularly.",
    "More psychological than gory, which elevated it significantly.",
  ],
  "Sci-Fi": [
    "Ideas-first filmmaking. Rare to see a blockbuster that respects its audience.",
    "Visually groundbreaking but the emotional core is thin.",
    "The world-building is exceptional. Could watch an entire series set here.",
    "Ambiguous ending divided audiences but I loved the lack of easy answers.",
    "Hard science wrapped in accessible storytelling. Near-perfect.",
  ],
  default: [
    "Exceeded my expectations in almost every way.",
    "Competently made but forgettable.",
    "The performances elevate what could've been generic material.",
    "Technical achievements are impressive but the story needed more work.",
    "Rewatched three times. Gets better each viewing.",
    "Important film even if it's not always enjoyable.",
    "The direction is assured and the cinematography is gorgeous.",
  ],
};

export function getMockReviews(genre: string): string[] {
  const genreKey =
    Object.keys(GENRE_REVIEWS).find((key) =>
      genre.toLowerCase().includes(key.toLowerCase())
    ) ?? "default";

  const pool = GENRE_REVIEWS[genreKey];
  // Shuffle and return 6 reviews
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
}

// ─── JSON Extractor ───────────────────────────────────────────────────────────

function extractJsonObject(raw: string): string {
  let text = raw.trim();

  // Decode HTML entities
  text = text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // Strip markdown fences
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  if (text.startsWith("{") && text.endsWith("}")) return text;

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new AIClientError("AI response contained no JSON object.", 502);
  }

  return match[0];
}

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseSentimentResponse(rawResponse: string): ParsedSentiment {
  console.log("[parseSentimentResponse] Raw response:", rawResponse);

  try {
    const jsonPayload = extractJsonObject(rawResponse);

    // 🔧 Repair malformed JSON (unquoted strings, trailing commas, etc.)
    const repairedPayload = jsonrepair(jsonPayload);

    const parsed = JSON.parse(repairedPayload) as unknown;
    return sentimentSchema.parse(parsed);
  } catch (error: unknown) {
    console.error("[parseSentimentResponse] Parse error:", error);

    if (error instanceof AIClientError) throw error;

    throw new AIClientError(
      "AI response could not be parsed into the required sentiment JSON format.",
      502
    );
  }
}

// ─── Groq API Caller ──────────────────────────────────────────────────────────

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AIClientError(
      "GROQ_API_KEY is missing from environment variables.",
      500
    );
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,           // low = more consistent JSON output
    max_tokens: 600,            // enough for our schema, prevents runaway output
    response_format: { type: "json_object" }, // 🔒 forces JSON mode on Groq
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new AIClientError("Groq returned empty content.", 502);
  }

  console.log("[callGroq] Raw response:", content);
  return content;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function analyzeAudienceSentiment(
  movie: MovieData,
  reviews: string[]
): Promise<ParsedSentiment> {
  // Fallback to mock reviews if none provided
  const effectiveReviews =
    reviews.length >= 3 ? reviews : getMockReviews(movie.Genre);

  const userPrompt = buildUserPrompt(movie, effectiveReviews);

  try {
    const rawResponse = await callGroq(userPrompt);
    return parseSentimentResponse(rawResponse);
  } catch (error: unknown) {
    if (error instanceof AIClientError) throw error;

    throw new AIClientError(
      "AI sentiment analysis failed unexpectedly. Please retry shortly.",
      503
    );
  }
}