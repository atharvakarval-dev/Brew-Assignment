"use client";

import Image from "next/image";

import type { MovieData } from "@/lib/types";
import { BLUR_DATA_URL, getPosterUrl, getRottenTomatoesScore, splitCsvValues } from "@/lib/utils";

interface MovieCardProps {
  movie: MovieData;
}

function getRottenTomatoesTone(score: string): string {
  const parsed = Number.parseInt(score.replace("%", ""), 10);

  if (!Number.isFinite(parsed)) {
    return "#f87171";
  }

  return parsed >= 60 ? "#4ade80" : "#f87171";
}

function safeValue(value: string | undefined): string {
  if (!value || value === "N/A") {
    return "Unknown";
  }

  return value;
}

export function MovieCard({ movie }: MovieCardProps): JSX.Element {
  const rottenTomatoes = getRottenTomatoesScore(movie);
  const posterUrl = getPosterUrl(movie.Poster);
  const posterIsInline = posterUrl.startsWith("data:image");
  const genres = splitCsvValues(movie.Genre);

  return (
    <article className="w-full">
      <div
        className={[
          "group relative overflow-hidden rounded-[16px] border border-border bg-card",
          "shadow-[0_32px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]",
          "transition-[transform,box-shadow] [transition-duration:400ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
          "hover:scale-[1.02] hover:shadow-[0_36px_72px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.12)]"
        ].join(" ")}
      >
        <Image
          src={posterUrl}
          alt={`${movie.Title} poster`}
          width={500}
          height={750}
          className="h-auto w-full object-cover"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          unoptimized={posterIsInline}
          priority
        />
      </div>

      <div className="mt-6 rounded-[16px] border border-border bg-card p-6">
        <div>
          <p className="eyebrow">IMDb Rating</p>
          <div className="mt-2 flex items-end gap-2">
            <span aria-hidden className="text-[1.1rem] leading-none text-primary">
              ★
            </span>
            <span className="font-mono text-[1.4rem] leading-none text-[color:var(--text-primary)]">
              {safeValue(movie.imdbRating)}
            </span>
            <span className="pb-[2px] text-[0.8rem] text-[color:var(--text-tertiary)]">/10</span>
          </div>
          <p className="mt-1 text-[0.75rem] text-[color:var(--text-tertiary)]">
            {movie.imdbVotes ? `(${movie.imdbVotes} votes)` : "(Votes unavailable)"}
          </p>
          <p className="sr-only">{`IMDb ${movie.imdbRating}`}</p>
        </div>

        <div className="my-5 h-px w-full bg-border" />

        <div className="grid grid-cols-2 gap-3 text-[0.85rem]">
          <div className="border-l-2 border-border pl-2">
            <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
              Year
            </p>
            <p className="mt-1 text-[color:var(--text-secondary)]">{safeValue(movie.Year)}</p>
          </div>
          <div className="border-l-2 border-border pl-2">
            <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
              Runtime
            </p>
            <p className="mt-1 text-[color:var(--text-secondary)]">{safeValue(movie.Runtime)}</p>
          </div>
          <div className="border-l-2 border-border pl-2">
            <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
              Rated
            </p>
            <p className="mt-1 text-[color:var(--text-secondary)]">{safeValue(movie.Rated)}</p>
          </div>
          <div className="border-l-2 border-border pl-2">
            <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
              Genre
            </p>
            <p className="mt-1 text-[color:var(--text-secondary)]">{safeValue(movie.Genre)}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {genres.map((genre) => (
            <span
              key={genre}
              className={[
                "rounded-full border border-border bg-[color:var(--bg-elevated)] px-2.5 py-1 text-[0.72rem]",
                "text-[color:var(--text-secondary)] transition duration-150 ease-out hover:border-primary/45 hover:text-[color:var(--text-primary)]"
              ].join(" ")}
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="mt-5 space-y-2 text-[0.85rem] text-[color:var(--text-secondary)]">
          <p>
            <span className="text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
              Director:
            </span>{" "}
            {safeValue(movie.Director)}
          </p>
          <p>
            <span className="text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
              Writer:
            </span>{" "}
            {safeValue(movie.Writer)}
          </p>
          {rottenTomatoes ? (
            <p>
              <span className="text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
                Rotten Tomatoes:
              </span>{" "}
              <span style={{ color: getRottenTomatoesTone(rottenTomatoes) }}>{`RT ${rottenTomatoes}`}</span>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
