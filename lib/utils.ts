import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { MovieData } from "@/lib/types";

export const IMDB_ID_REGEX = /^tt\d{7,8}$/;

export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAnIGhlaWdodD0nNDUiIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzMwJyBoZWlnaHQ9JzQ1JyBmaWxsPScjMWExYTI3Jy8+PC9zdmc+";

const FALLBACK_POSTER_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='500' height='750'><rect width='100%' height='100%' fill='#1a1a27'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#f5c518' font-size='36' font-family='Arial, sans-serif'>No Poster</text></svg>";

export const FALLBACK_POSTER_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  FALLBACK_POSTER_SVG
)}`;

type GenreReviewLibrary = Record<string, string[]>;

const REVIEW_LIBRARY: GenreReviewLibrary = {
  action: [
    "The pacing never lets up, and the action set pieces feel earned instead of noisy.",
    "Explosive visuals, but the emotional core still lands in the final act.",
    "Some dialogue is clunky, yet the momentum and choreography make it worth the ride.",
    "It balances spectacle with character stakes better than most modern blockbusters.",
    "A little too long, but the payoff scenes deliver pure adrenaline.",
    "The villain motivations are thin, though the hero arc is surprisingly compelling.",
    "Sound design and score amplify every major sequence in the best way.",
    "Not groundbreaking, but it is the kind of crowd-pleasing action movie audiences rewatch.",
    "Mindless action with paper-thin plot. Fun for 20 minutes, then exhausting.",
    "CGI overload ruins what could have been decent practical stunts."
  ],
  "sci-fi": [
    "The world-building is detailed and immersive without dumping too much exposition.",
    "It asks big philosophical questions while still staying emotionally accessible.",
    "The concept is brilliant, even if the middle section gets dense for casual viewers.",
    "Visually stunning and thematically ambitious, with a few pacing hiccups.",
    "The ending sparked debate in our group, which is always a good sign for sci-fi.",
    "Strong performances ground a story that could have felt too abstract.",
    "Some plot mechanics are messy, but the atmosphere is unforgettable.",
    "It feels original in a genre that often recycles the same ideas.",
    "Pretentious and confusing. Tries too hard to be deep but lacks substance.",
    "Beautiful visuals can't save a boring, convoluted mess of a story."
  ],
  drama: [
    "The performances carry every scene, especially in the quieter emotional moments.",
    "A grounded, patient drama that earns its catharsis by the final act.",
    "The writing is sharp and humane, though the pacing may feel slow to some.",
    "It handles difficult themes with restraint and empathy.",
    "The supporting cast adds texture without pulling focus from the central story.",
    "Emotionally heavy but never manipulative, which makes it more impactful.",
    "A few subplots feel underdeveloped, yet the core narrative is strong.",
    "This is the kind of character-driven film that sticks with you for days.",
    "Painfully slow and self-indulgent. Nothing really happens for two hours.",
    "Tries to be profound but comes off as pretentious and dull."
  ],
  comedy: [
    "The humor lands consistently, and the cast chemistry sells every punchline.",
    "It avoids cheap jokes and leans into smart character-based comedy.",
    "Some bits are hit-or-miss, but the energy keeps things fun throughout.",
    "Unexpectedly heartfelt under the laughs, especially in the final third.",
    "The script is quick and witty without feeling overstuffed.",
    "Not every gag works, yet the performances are charming enough to carry it.",
    "A breezy watch with several genuinely memorable comedic scenes.",
    "It feels fresh compared to formulaic studio comedies.",
    "Jokes fall flat. Feels like a bad SNL sketch stretched to 90 minutes.",
    "Tries way too hard to be funny. Cringe-worthy and unfunny throughout."
  ],
  horror: [
    "The tension builds slowly and pays off with genuinely unsettling moments.",
    "Atmosphere and sound design do most of the heavy lifting, and it works.",
    "Some scares are predictable, but the dread never really goes away.",
    "The practical effects elevate the horror beyond cheap jump scares.",
    "It mixes psychological fear with visceral horror in a smart way.",
    "The ending is divisive, but the journey there is intense.",
    "Strong direction turns familiar genre beats into something fresh.",
    "One of the better modern horror entries for fans of mood and suspense.",
    "All jump scares, no substance. Predictable and boring.",
    "Not scary at all. Relies on loud noises instead of actual horror."
  ],
  romance: [
    "The central relationship feels authentic and emotionally layered.",
    "It avoids cliches long enough to make the big moments land.",
    "The leads have believable chemistry that carries the quieter scenes.",
    "A warm, sincere romance with just enough conflict to feel real.",
    "Some plot turns are predictable, but the emotional payoff is satisfying.",
    "The dialogue occasionally gets sentimental, but never overly artificial.",
    "It balances tenderness and humor effectively across the runtime.",
    "A heartfelt watch for audiences who want romance with substance.",
    "Formulaic and predictable. Every rom-com cliche in the book.",
    "Zero chemistry between leads. Felt forced and unbelievable."
  ],
  animation: [
    "Beautiful visual design paired with a story that works for all ages.",
    "The film is playful on the surface but emotionally mature underneath.",
    "Great voice performances and strong pacing make it consistently engaging.",
    "It uses animation as storytelling, not just spectacle.",
    "A few jokes are aimed squarely at kids, but adults still get plenty to enjoy.",
    "The emotional beats are simple but surprisingly effective.",
    "Inventive art direction gives the movie a distinct identity.",
    "A strong family film that does not talk down to its audience.",
    "Annoying characters and juvenile humor. Kids might like it, adults will suffer.",
    "Generic animation with a recycled plot. Nothing new or interesting."
  ],
  general: [
    "The movie has strong highs, though a few scenes feel uneven in execution.",
    "Audiences seem to connect with the performances more than the plot mechanics.",
    "It is visually polished and mostly engaging from start to finish.",
    "Some pacing issues appear in the middle, but the ending lands well.",
    "The tone shifts occasionally, yet the overall experience remains satisfying.",
    "A solid watch that delivers enough memorable moments to recommend.",
    "Disappointing and forgettable. Couldn't wait for it to end.",
    "Mediocre in every way. Nothing stands out, good or bad."
  ]
};

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function validateImdbId(imdbId: string): boolean {
  return IMDB_ID_REGEX.test(imdbId.trim());
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function splitCsvValues(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(" ")
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function getRottenTomatoesScore(movie: Pick<MovieData, "Ratings">): string | null {
  const rottenTomatoesRating = movie.Ratings.find(
    (rating) => rating.Source === "Rotten Tomatoes"
  );

  return rottenTomatoesRating?.Value ?? null;
}

export function getPosterUrl(poster: string): string {
  if (!poster || poster === "N/A") {
    return FALLBACK_POSTER_DATA_URI;
  }

  return poster;
}

function mapGenreKey(rawGenre: string): keyof GenreReviewLibrary {
  const normalized = rawGenre.toLowerCase();

  if (normalized.includes("sci-fi") || normalized.includes("science fiction")) {
    return "sci-fi";
  }

  if (normalized.includes("action")) {
    return "action";
  }

  if (normalized.includes("drama")) {
    return "drama";
  }

  if (normalized.includes("comedy")) {
    return "comedy";
  }

  if (normalized.includes("horror")) {
    return "horror";
  }

  if (normalized.includes("romance")) {
    return "romance";
  }

  if (normalized.includes("animation")) {
    return "animation";
  }

  return "general";
}

export function getMockReviewsByGenre(genre: string, limit = 6): string[] {
  const genreKey = mapGenreKey(genre);
  const reviews = REVIEW_LIBRARY[genreKey] ?? REVIEW_LIBRARY.general;
  const cappedLimit = Math.max(5, Math.min(10, limit));

  const shuffled = [...reviews].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, cappedLimit);
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
