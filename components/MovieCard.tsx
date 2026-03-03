"use client";

import { Star } from "lucide-react";
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
  const imdbVotes = movie.imdbVotes && movie.imdbVotes !== "N/A" ? movie.imdbVotes : null;

  return (
    <article className="w-full">
      <div
        className={[
          "group relative overflow-hidden rounded-[16px] border border-border bg-card",
          "shadow-[0_32px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,214,177,0.08)]",
          "transition-[transform,box-shadow] [transition-duration:400ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
          "hover:scale-[1.02] hover:shadow-[0_36px_72px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,214,177,0.2)]"
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

      <div className="mt-6 rounded-[16px] border border-border bg-card p-6 transition duration-200 hover:-translate-y-px hover:border-[color:var(--border-hover)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div>
          <p className="eyebrow">IMDb Rating</p>
          <div className="mt-2 flex items-end gap-2">
            <Star aria-hidden className="h-[1.05rem] w-[1.05rem] fill-primary text-primary" />
            <span className="font-mono text-[1.4rem] leading-none text-[color:var(--text-primary)]">
              {safeValue(movie.imdbRating)}
            </span>
            <span className="pb-[2px] text-[0.8rem] text-[color:var(--text-tertiary)]">/10</span>
          </div>
          {imdbVotes ? (
            <p className="mt-2 font-mono text-[0.74rem] text-[color:var(--text-tertiary)]">{`${imdbVotes} votes`}</p>
          ) : null}

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
            <p className="mt-1 break-words text-[color:var(--text-secondary)]">{safeValue(movie.Genre)}</p>
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

        <div className="mt-5 space-y-2 text-[0.85rem] leading-[1.65] text-[color:var(--text-secondary)]">
          <p className="break-words">
            <span className="text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
              Director:
            </span>{" "}
            {safeValue(movie.Director)}
          </p>
          <p className="break-words">
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
