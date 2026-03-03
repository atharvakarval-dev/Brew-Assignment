"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

import type { SentimentResult } from "@/lib/types";

import { SentimentBadge } from "@/components/SentimentBadge";

const SENTIMENT_COLORS = {
  positive: { color: "#4ade80", dim: "rgba(74,222,128,0.16)" },
  mixed: { color: "#fbbf24", dim: "rgba(251,191,36,0.16)" },
  negative: { color: "#f87171", dim: "rgba(248,113,113,0.16)" }
} as const;

interface ScoreBarProps {
  score: number;
}

function getScoreGradient(score: number): string {
  if (score <= 40) {
    return "linear-gradient(90deg, #f87171, #ef4444)";
  }
  if (score <= 65) {
    return "linear-gradient(90deg, #fbbf24, #f59e0b)";
  }
  return "linear-gradient(90deg, #4ade80, #22c55e)";
}

function AnimatedScore({ score }: { score: number }): JSX.Element {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (value) => Math.round(value));

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 1.2,
      ease: [0.25, 1, 0.5, 1],
      delay: 0.2
    });

    return () => {
      controls.stop();
    };
  }, [score, count]);

  return <motion.span>{rounded}</motion.span>;
}

function ScoreBar({ score }: ScoreBarProps): JSX.Element {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-end justify-between gap-3">
        <span className="eyebrow">Audience Score</span>
        <span className="font-mono text-[1.5rem] leading-none text-[color:var(--text-primary)]">
          <AnimatedScore score={score} />
          <span className="ml-1 text-[0.9rem] text-[color:var(--text-tertiary)]">/100</span>
        </span>
      </div>

      <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-[color:var(--bg-elevated)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: getScoreGradient(score) }}
        />
      </div>
    </div>
  );
}

interface SentimentSectionProps {
  sentiment: SentimentResult | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function SentimentSection({
  sentiment,
  loading,
  error,
  onRetry
}: SentimentSectionProps): JSX.Element {
  const colorSet = sentiment ? SENTIMENT_COLORS[sentiment.sentiment] : SENTIMENT_COLORS.mixed;
  const hasPayload = !loading && !error && Boolean(sentiment);

  const audienceVsCritics =
    sentiment &&
    "audienceVsCritics" in sentiment &&
    typeof (sentiment as Record<string, unknown>).audienceVsCritics === "string"
      ? ((sentiment as Record<string, unknown>).audienceVsCritics as string)
      : null;

  return (
    <section
      className={[
        "relative overflow-hidden rounded-[16px] border border-border bg-card p-6 sm:p-7",
        hasPayload ? "min-h-[340px]" : "min-h-[280px]"
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-[180px] w-[180px] rounded-full"
        style={{ background: `radial-gradient(${colorSet.dim}, transparent 70%)` }}
      />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">AI Sentiment Analysis</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[rgba(24,16,13,0.72)] px-2.5 py-1 text-[0.65rem] text-[color:var(--text-tertiary)]">
            <span aria-hidden>*</span>
            Powered by Groq x LLaMA
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-[170px] skeleton" />
            <div className="h-[6px] w-full rounded-full skeleton" />
            <div className="space-y-2">
              <div className="h-4 w-full skeleton" />
              <div className="h-4 w-[90%] skeleton" />
              <div className="h-4 w-[70%] skeleton" />
            </div>
            <div className="h-[132px] w-full skeleton" />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f89a62] via-primary to-[#a63706] px-5 text-xs font-semibold text-primary-foreground transition duration-200 hover:-translate-y-px hover:brightness-110 active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary"
            >
              Retry Analysis
            </button>
          </div>
        ) : null}

        {!loading && !error && sentiment ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="space-y-6"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
              }}
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <SentimentBadge sentiment={sentiment.sentiment} />
              <div className="flex-1">
                <ScoreBar score={sentiment.score} />
              </div>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
              }}
            >
              <p className="eyebrow mb-3">Summary</p>
              <div className="relative pl-6">
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-1 select-none text-[2.5rem] leading-[0.5] text-primary"
                >
                  &quot;
                </span>
                <p className="text-[0.9375rem] leading-[1.8] text-[color:var(--text-secondary)]">
                  {sentiment.summary}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
              }}
            >
              <p className="eyebrow mb-3">Key Insights</p>
              <ul className="flex flex-col">
                {sentiment.insights.map((insight, index) => (
                  <li
                    key={`${insight.slice(0, 28)}-${index.toString()}`}
                    className={[
                      "group flex items-start gap-3 py-3 text-[0.875rem] text-[color:var(--text-secondary)]",
                      "border-b border-dashed border-border transition duration-150",
                      "hover:translate-x-1 hover:bg-[color:var(--bg-elevated)] hover:px-2 hover:text-[color:var(--text-primary)]",
                      index === sentiment.insights.length - 1 ? "border-b-0" : ""
                    ].join(" ")}
                  >
                    <span
                      aria-hidden
                      className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full"
                      style={{ backgroundColor: colorSet.color }}
                    />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {audienceVsCritics ? (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
                }}
                className="rounded-[12px] border border-border bg-[color:var(--bg-elevated)] px-4 py-3"
                style={{ borderLeft: "3px solid var(--gold-dim)" }}
              >
                <p className="eyebrow mb-1">Critics vs Audience</p>
                <p className="text-[0.85rem] italic leading-[1.7] text-[color:var(--text-secondary)]">
                  {audienceVsCritics}
                </p>
              </motion.div>
            ) : null}

            <p className="text-right font-mono text-[0.72rem] text-[color:var(--text-tertiary)]">
              Cached - {new Date(sentiment.cachedAt).toLocaleDateString()}
            </p>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
