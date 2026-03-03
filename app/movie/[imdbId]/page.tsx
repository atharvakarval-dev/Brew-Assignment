"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { CastList } from "@/components/CastList";
import { ErrorState } from "@/components/ErrorState";
import { MovieDetailSkeleton } from "@/components/LoadingSkeleton";
import { MovieCard } from "@/components/MovieCard";
import { PerformanceOverlay } from "@/components/PerformanceOverlay";
import { SentimentSection } from "@/components/SentimentSection";
import { TimelineContent } from "@/components/ui/timeline-animation";
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

function getAuthorInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatReviewText(text: string): JSX.Element {
  // Handle multiple markdown patterns: ***bold***, **bold**, *italic*, _italic_, __bold__
  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/);
  
  return (
    <>
      {parts.map((part, index) => {
        // Bold and italic with triple asterisks
        if (part.startsWith('***') && part.endsWith('***')) {
          const text = part.slice(3, -3);
          return <strong key={index}><em>{text}</em></strong>;
        }
        // Bold with double asterisks
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return <strong key={index}>{boldText}</strong>;
        }
        // Bold with double underscores
        if (part.startsWith('__') && part.endsWith('__')) {
          const boldText = part.slice(2, -2);
          return <strong key={index}>{boldText}</strong>;
        }
        // Italic with single asterisk
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          const italicText = part.slice(1, -1);
          return <em key={index}>{italicText}</em>;
        }
        // Italic with single underscore
        if (part.startsWith('_') && part.endsWith('_') && !part.startsWith('__')) {
          const italicText = part.slice(1, -1);
          return <em key={index}>{italicText}</em>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
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

const REVIEW_TONES = [
  "from-[rgba(236,78,2,0.2)] to-transparent",
  "from-[rgba(166,55,6,0.2)] to-transparent",
  "from-[rgba(138,69,21,0.2)] to-transparent"
] as const;

export default function MovieDetailPage(): JSX.Element {
  const params = useParams<{ imdbId: string }>();
  const imdbId = params.imdbId || "";
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [showReviews, setShowReviews] = useState(false);

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
  const detailPills = useMemo(
    () =>
      movie
        ? [
            { label: "Year", value: movie.Year },
            { label: "Runtime", value: movie.Runtime },
            { label: "Rated", value: movie.Rated },
            { label: "Released", value: movie.Released }
          ].filter((item) => Boolean(item.value) && item.value !== "N/A")
        : [],
    [movie]
  );

  useEffect(() => {
    setShowReviews(false);
    if (!sentiment?.reviews || sentiment.reviews.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowReviews(true);
    }, 80);

    return () => {
      window.clearTimeout(timer);
    };
  }, [sentiment?.reviews]);

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
            "radial-gradient(ellipse 78% 52% at 72% 0%, rgba(236,78,2,0.16) 0%, transparent 70%), radial-gradient(ellipse 58% 42% at 16% 84%, rgba(132,48,12,0.14) 0%, transparent 64%)"
        }}
        aria-hidden
      />

      <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-9">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[color:var(--text-secondary)] transition duration-150 hover:-translate-x-0.5 hover:text-[color:var(--text-primary)] active:scale-[0.96]"
          >
            {"<-"} All Movies
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-card/85 px-3 py-1 font-mono text-[0.76rem] text-[color:var(--text-secondary)]">
              {imdbId}
            </span>
            <a
              href={`https://www.imdb.com/title/${imdbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/85 px-3 py-1 text-[0.74rem] text-[color:var(--text-secondary)] transition duration-150 hover:border-primary/50 hover:text-[color:var(--text-primary)]"
            >
              IMDb
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mt-5 overflow-hidden rounded-[20px] border border-border bg-card/85 p-5 sm:mt-6 sm:p-7"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 70% at 88% 6%, rgba(236,78,2,0.17) 0%, transparent 72%)"
            }}
          />

          <div className="relative z-10">
            <p className="eyebrow mb-3">Film Profile</p>
            <h1 className="break-words font-serif text-[clamp(2rem,6vw,4rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[color:var(--text-primary)]">
              {movie.Title}
              <span className="ml-2 align-middle font-sans text-[0.95rem] font-normal text-[color:var(--text-tertiary)] sm:ml-3 sm:text-[1rem]">
                ({movie.Year})
              </span>
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              {genreTags.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex items-center rounded-full border border-border bg-[color:var(--bg-elevated)] px-[10px] py-[3px] text-[0.72rem] text-[color:var(--text-secondary)] transition duration-150 hover:border-primary/50 hover:text-[color:var(--text-primary)]"
                >
                  {genre}
                </span>
              ))}
            </div>

            {detailPills.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {detailPills.map((item) => (
                  <span
                    key={`${item.label}-${item.value}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-[rgba(13,10,8,0.72)] px-3 py-1 text-[0.72rem]"
                  >
                    <span className="uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
                      {item.label}
                    </span>
                    <span className="text-[color:var(--text-secondary)]">{item.value}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </motion.section>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="mt-7 grid grid-cols-1 gap-9 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12"
        >
          <motion.aside variants={stagger.item} className="lg:sticky lg:top-6 lg:self-start">
            <MovieCard movie={movie} />
          </motion.aside>

          <div className="flex min-w-0 flex-col gap-5 sm:gap-7">
            <motion.section
              variants={stagger.item}
              className="rounded-[16px] border border-border bg-card/72 p-5 sm:p-6"
            >
              <p className="eyebrow mb-3">Plot Summary</p>
              <p className="max-w-[72ch] text-[0.9375rem] leading-[1.78] text-[color:var(--text-secondary)]">
                <span className="font-medium text-[color:var(--text-primary)]">{plotParts?.lead}</span>{" "}
                {plotParts?.rest}
              </p>
            </motion.section>

            {movie.Actors && movie.Actors !== "N/A" ? (
              <motion.section
                variants={stagger.item}
                className="rounded-[16px] border border-border bg-card/72 p-5 sm:p-6"
              >
                <p className="eyebrow mb-4">Starring</p>
                <CastList actors={movie.Actors} />
              </motion.section>
            ) : null}

            <motion.section variants={stagger.item}>
              <SentimentSection
                sentiment={sentiment}
                loading={isSentimentLoading}
                error={sentimentError}
                onRetry={retrySentiment}
              />
            </motion.section>

            {showReviews && sentiment?.reviews && sentiment.reviews.length > 0 ? (
              <motion.section variants={stagger.item} ref={reviewsRef}>
                <p className="eyebrow mb-4">Audience Reviews</p>
                <div className="grid grid-cols-1 gap-4 sm:gap-5">
                  {sentiment.reviews.map((review, index) => {
                    const toneClass = REVIEW_TONES[index % REVIEW_TONES.length];
                    const avatarSrc = review.avatar && review.avatar.trim() ? review.avatar : null;

                    return (
                      <TimelineContent
                        key={`${review.author}-${index.toString()}`}
                        as="article"
                        animationNum={index}
                        timelineRef={reviewsRef}
                        className="relative overflow-hidden rounded-[14px] border border-border bg-card/88 p-4 sm:p-6"
                      >
                        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneClass}`} />
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 opacity-[0.09]"
                          style={{
                            backgroundImage:
                              "linear-gradient(to right, rgba(255,238,220,0.28) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,238,220,0.28) 1px, transparent 1px)",
                            backgroundSize: "34px 34px"
                          }}
                        />

                        <div className="relative z-10">
                          <p className="text-[0.95rem] leading-[1.72] text-[color:var(--text-secondary)]">
                            <span className="mr-1 text-[1.2rem] leading-none text-primary">&quot;</span>
                            {formatReviewText(review.content)}
                          </p>

                          <div className="mt-5 flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div>
                              <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                                {review.author}
                              </h3>
                              <p className="text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
                                Audience Member
                              </p>
                            </div>

                            {avatarSrc ? (
                              <Image
                                src={avatarSrc}
                                alt={review.author}
                                width={44}
                                height={44}
                                className="h-11 w-11 rounded-[10px] border border-border object-cover shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
                              />
                            ) : (
                              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-border bg-[rgba(16,12,9,0.8)] text-xs font-semibold text-[color:var(--text-primary)]">
                                {getAuthorInitials(review.author)}
                              </span>
                            )}
                          </div>
                        </div>
                      </TimelineContent>
                    );
                  })}
                </div>
              </motion.section>
            ) : null}
          </div>
        </motion.div>
      </div>
      <PerformanceOverlay imdbId={imdbId} />
    </main>
  );
}
