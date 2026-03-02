"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { CastList } from "@/components/CastList";
import { ErrorState } from "@/components/ErrorState";
import { MovieDetailSkeleton } from "@/components/LoadingSkeleton";
import { MovieCard } from "@/components/MovieCard";
import { SentimentSection } from "@/components/SentimentSection";
import { useMovieData } from "@/hooks/useMovieData";
import { useSentiment } from "@/hooks/useSentiment";
import { splitCsvValues } from "@/lib/utils";

function splitPlotByFirstSentence(plot: string): { lead: string; rest: string } {
  const match = plot.match(/^(.+?\.)\s*(.*)$/);
  if (!match) {
    return { lead: plot, rest: "" };
  }

  return { lead: match[1], rest: match[2] };
}

const stagger = {
  container: {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  }
};

export default function MovieDetailPage(): JSX.Element {
  const params = useParams<{ imdbId: string }>();
  const imdbId = params.imdbId || "";

  const {
    movie,
    isLoading: isMovieLoading,
    error: movieError,
    retry: retryMovie
  } = useMovieData(imdbId);

  const {
    sentiment,
    isLoading: isSentimentLoading,
    error: sentimentError,
    retry: retrySentiment
  } = useSentiment(imdbId);

  const genreTags = useMemo(() => (movie ? splitCsvValues(movie.Genre) : []), [movie]);
  const plotParts = movie ? splitPlotByFirstSentence(movie.Plot) : null;

  if (isMovieLoading) {
    return <MovieDetailSkeleton />;
  }

  if (movieError) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg">
          <ErrorState message={movieError} onRetry={retryMovie} />
          <div className="mt-5 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[color:var(--text-secondary)] transition duration-150 hover:-translate-x-0.5 hover:text-[color:var(--text-primary)] active:scale-[0.96]"
            >
              {"<-"} Search
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!movie) {
    return <MovieDetailSkeleton />;
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-background">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 75% 50% at 68% 0%, rgba(232,185,35,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 14% 84%, rgba(96,77,190,0.05) 0%, transparent 64%)"
        }}
        aria-hidden
      />

      <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[color:var(--text-secondary)] transition duration-150 hover:-translate-x-0.5 hover:text-[color:var(--text-primary)] active:scale-[0.96]"
          >
            {"<-"} Search
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[0.76rem] text-[color:var(--text-secondary)]">
              {imdbId}
            </span>
            <a
              href={`https://www.imdb.com/title/${imdbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[0.74rem] text-[color:var(--text-secondary)] transition duration-150 hover:border-primary/40 hover:text-[color:var(--text-primary)]"
            >
              IMDb
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="mt-6 grid grid-cols-1 gap-9 md:mt-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12"
        >
          <motion.aside variants={stagger.item}>
            <MovieCard movie={movie} />
          </motion.aside>

          <div className="flex min-w-0 flex-col gap-8 sm:gap-9">
            <motion.section variants={stagger.item} className="min-h-[100px]">
              <div className="mb-4 flex flex-wrap gap-2">
                {genreTags.map((genre) => (
                  <span
                    key={genre}
                    className="inline-flex items-center rounded-full border border-border bg-[color:var(--bg-elevated)] px-[10px] py-[3px] text-[0.72rem] text-[color:var(--text-secondary)] transition duration-150 hover:border-primary/45 hover:text-[color:var(--text-primary)]"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="font-serif text-[clamp(2rem,6vw,4rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[color:var(--text-primary)]">
                {movie.Title}
                <span className="ml-2 align-middle font-sans text-[0.95rem] font-normal text-[color:var(--text-tertiary)] sm:ml-3 sm:text-[1rem]">
                  ({movie.Year})
                </span>
              </h1>
            </motion.section>

            <motion.section variants={stagger.item} className="min-h-[120px]">
              <p className="eyebrow mb-3">Plot Summary</p>
              <p className="max-w-[72ch] text-[0.9375rem] leading-[1.75] text-[color:var(--text-secondary)]">
                <span className="font-medium text-[color:var(--text-primary)]">{plotParts?.lead}</span>{" "}
                {plotParts?.rest}
              </p>
            </motion.section>

            {movie.Actors && movie.Actors !== "N/A" ? (
              <motion.section variants={stagger.item} className="min-h-[96px]">
                <p className="eyebrow mb-4">Starring</p>
                <CastList actors={movie.Actors} />
              </motion.section>
            ) : null}

            <motion.section variants={stagger.item} className="min-h-[320px]">
              <SentimentSection
                sentiment={sentiment}
                loading={isSentimentLoading}
                error={sentimentError}
                onRetry={retrySentiment}
              />
            </motion.section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
