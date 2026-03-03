"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Suspense, lazy, useState } from "react";

import { SearchBar } from "@/components/SearchBar";
import { ShinyButton } from "@/components/ui/flow-button";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);

const EXAMPLE_MOVIES = [
  { label: "The Matrix tt0133093", imdbId: "tt0133093" },
  { label: "Inception tt1375666", imdbId: "tt1375666" },
  { label: "Parasite tt6751668", imdbId: "tt6751668" }
];

const REVEAL_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const PARTICLES = [
  { left: "10%", top: "18%", duration: 14, delay: 0 },
  { left: "82%", top: "24%", duration: 18, delay: 1.1 },
  { left: "22%", top: "72%", duration: 16, delay: 0.6 },
  { left: "74%", top: "66%", duration: 20, delay: 0.3 }
] as const;

export function CTASection(): JSX.Element {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  function handleSubmit(imdbId: string): void {
    router.push(`/movie/${imdbId}`);
  }

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
      <div
        className="relative w-full max-w-[1100px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-[28px] border border-border bg-card/90 shadow-[0_30px_86px_rgba(0,0,0,0.62)] backdrop-blur-sm transition duration-500 sm:rounded-[36px] lg:rounded-[42px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 85% 58% at 50% 0%, rgba(236,78,2,0.2) 0%, transparent 70%), radial-gradient(ellipse 70% 44% at 88% 85%, rgba(150,50,8,0.16) 0%, transparent 58%), radial-gradient(ellipse 62% 42% at 12% 82%, rgba(120,40,10,0.16) 0%, transparent 60%)"
            }}
          />

          <Suspense fallback={<div className="absolute inset-0 bg-muted/20" />}>
            <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.15] mix-blend-screen">
              <Dithering
                colorBack="#00000000"
                colorFront="#EC4E02"
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.6 : 0.2}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          {PARTICLES.map((particle) => (
            <motion.span
              key={`${particle.left}-${particle.top}`}
              className="pointer-events-none absolute z-10 h-1 w-1 rounded-full bg-primary shadow-[0_0_10px_rgba(232,185,35,0.45)]"
              style={{ left: particle.left, top: particle.top }}
              animate={{ x: [0, 14, -10, 0], y: [0, -18, 8, 0], opacity: [0.2, 0.7, 0.28, 0.2] }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: particle.delay
              }}
              aria-hidden
            />
          ))}

          <div className="relative z-20 mx-auto flex min-h-[520px] w-full max-w-[760px] flex-col items-center justify-center px-5 py-12 text-center sm:min-h-[590px] sm:px-8 sm:py-14 md:px-12 lg:min-h-[640px]">
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: REVEAL_EASE, delay: 0.04 }}
              className="mb-5 inline-flex items-center rounded-full border border-[rgba(255,235,214,0.16)] bg-[rgba(11,9,7,0.65)] px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-primary/90 sm:mb-6"
            >
              Brew-Powered Cinema Intelligence
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: REVEAL_EASE, delay: 0.16 }}
              className="font-serif text-[clamp(2rem,8vw,5.1rem)] font-bold leading-[1.06] tracking-[-0.022em] text-[color:var(--text-primary)]"
            >
              Understand What
              <br />
              <span
                className="italic"
                style={{
                  background:
                    "linear-gradient(135deg, #f89a62 0%, #ec4e02 55%, #b23d06 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Your Audience Feels
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: REVEAL_EASE, delay: 0.28 }}
              className="mt-6 max-w-[450px] text-[0.95rem] leading-[1.78] text-[color:var(--text-secondary)] sm:text-[1rem]"
            >
              Enter any IMDb movie ID to get emotionally rich, filmmaker-friendly sentiment analysis
              in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: REVEAL_EASE, delay: 0.4 }}
              className="mt-9 w-full max-w-[520px] sm:mt-10"
            >
              <SearchBar onSubmit={handleSubmit} exampleChips={EXAMPLE_MOVIES} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: REVEAL_EASE, delay: 0.52 }}
              className="mt-8"
            >
              <ShinyButton onClick={() => handleSubmit("tt0133093")}>Try The Matrix</ShinyButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
