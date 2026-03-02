"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import type { SentimentResult } from "@/lib/types";

interface SentimentBadgeProps {
  sentiment: SentimentResult["sentiment"];
}

const SENTIMENT_CONFIG: Record<
  SentimentResult["sentiment"],
  {
    label: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
    pulseColor: string;
    toneClassName: string;
  }
> = {
  positive: {
    label: "POSITIVE",
    color: "#4ade80",
    backgroundColor: "rgba(74,222,128,0.08)",
    borderColor: "rgba(74,222,128,0.3)",
    pulseColor: "rgba(74,222,128,0.45)",
    toneClassName: "text-cinematic-positive"
  },
  mixed: {
    label: "MIXED",
    color: "#fbbf24",
    backgroundColor: "rgba(251,191,36,0.08)",
    borderColor: "rgba(251,191,36,0.3)",
    pulseColor: "rgba(251,191,36,0.4)",
    toneClassName: "text-cinematic-mixed"
  },
  negative: {
    label: "NEGATIVE",
    color: "#f87171",
    backgroundColor: "rgba(248,113,113,0.08)",
    borderColor: "rgba(248,113,113,0.3)",
    pulseColor: "rgba(248,113,113,0.4)",
    toneClassName: "text-cinematic-negative"
  }
};

export function SentimentBadge({ sentiment }: SentimentBadgeProps): JSX.Element {
  const config = SENTIMENT_CONFIG[sentiment];
  const [showPulse, setShowPulse] = useState<boolean>(true);

  useEffect(() => {
    setShowPulse(true);
    const timer = window.setTimeout(() => {
      setShowPulse(false);
    }, 2000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [sentiment]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22, mass: 0.8 }}
      className="inline-flex"
    >
      <span
        className={`relative inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[0.8rem] font-bold uppercase tracking-[0.08em] ${config.toneClassName}`}
        style={{
          color: config.color,
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor
        }}
      >
        {showPulse ? (
          <motion.span
            initial={{ opacity: 0.45, scale: 1 }}
            animate={{ opacity: [0.45, 0], scale: [1, 1.5] }}
            transition={{ duration: 2, ease: "easeOut", repeat: 1 }}
            className="pointer-events-none absolute inset-0 rounded-full border"
            style={{ borderColor: config.pulseColor }}
            aria-hidden
          />
        ) : null}
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" aria-hidden />
        <span className="relative">{config.label}</span>
      </span>
    </motion.div>
  );
}
