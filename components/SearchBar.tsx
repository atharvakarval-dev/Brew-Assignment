"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { validateImdbId } from "@/lib/utils";

interface SearchExampleChip {
  imdbId: string;
  label: string;
}

interface SearchBarProps {
  onSubmit: (imdbId: string) => void | Promise<void>;
  initialValue?: string;
  isLoading?: boolean;
  exampleChips?: SearchExampleChip[];
}

export function SearchBar({
  onSubmit,
  initialValue = "",
  isLoading = false,
  exampleChips = []
}: SearchBarProps): JSX.Element {
  const [query, setQuery] = useState<string>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const normalized = query.trim();
    if (!validateImdbId(normalized)) {
      setIsShaking(true);
      setError("IMDb ID must match format tt1234567 or tt12345678.");
      window.setTimeout(() => {
        setIsShaking(false);
      }, 300);
      return;
    }

    setError(null);
    try {
      await onSubmit(normalized);
    } catch (submitError: unknown) {
      console.error("[components/SearchBar.tsx][handleSubmit]", submitError);
      setError("Unable to submit IMDb ID right now. Please retry.");
    }
  }

  function handleChipClick(imdbId: string): void {
    setQuery(imdbId);
    setError(null);
    inputRef.current?.focus();
    void Promise.resolve(onSubmit(imdbId)).catch((submitError: unknown) => {
      console.error("[components/SearchBar.tsx][handleChipClick]", submitError);
      setError("Unable to submit IMDb ID right now. Please retry.");
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
    if (error) {
      setError(null);
    }
  }

  const wrapperClassName = [
    "relative rounded-[14px] border bg-[rgba(15,11,9,0.72)] backdrop-blur-md",
    "transition-[border-color,box-shadow,transform] duration-200 ease-out",
    "border-border hover:border-[rgba(255,228,205,0.22)]",
    "focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(236,78,2,0.2),0_0_22px_rgba(236,78,2,0.18)]",
    "shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
    isShaking ? "animate-[imdb-shake_0.3s_ease-in-out]" : "",
    error ? "border-[#f87171] focus-within:border-[#f87171]" : ""
  ].join(" ");

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="mx-auto w-full max-w-[520px]"
      noValidate
    >
      <div className="relative">
        <div className={wrapperClassName}>
          <input
            ref={inputRef}
            id="imdb-id"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            data-form-type="other"
            spellCheck={false}
            value={query}
            onChange={handleInputChange}
            placeholder="Enter IMDb ID (e.g. tt0133093)"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "imdb-id-error" : undefined}
            className={[
              "h-14 w-full rounded-[14px] border border-transparent bg-transparent pl-4 pr-14",
              "text-base text-[color:var(--text-primary)] outline-none sm:text-[0.9375rem]",
              "placeholder:text-[color:var(--text-tertiary)]/90",
              "transition-[color,border-color] duration-200"
            ].join(" ")}
          />

          <button
            type="submit"
            disabled={isLoading}
            aria-label={isLoading ? "Analyzing..." : "Analyze Movie"}
            className={[
              "absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[10px] text-primary-foreground",
              "bg-gradient-to-br from-[#f89a62] via-primary to-[#a63706]",
              "shadow-[0_6px_18px_rgba(236,78,2,0.32)] transition duration-200 ease-out",
              "hover:[transform:translateY(-50%)_scale(1.05)] hover:brightness-110 hover:shadow-[0_10px_26px_rgba(236,78,2,0.4)]",
              "active:[transform:translateY(-50%)_scale(0.98)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:[transform:translateY(-50%)_scale(1)]"
            ].join(" ")}
          >
            {isLoading ? (
              <>
                <span className="sr-only">Analyzing...</span>
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/35 border-t-primary-foreground"
                />
              </>
            ) : (
              <>
                <span className="sr-only">Analyze Movie</span>
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M5 12H19M19 12L13 6M19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {error ? (
            <motion.div
              id="imdb-id-error"
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-2 flex items-center gap-2 text-[0.8rem] text-[#f87171]"
            >
              <span
                aria-hidden
                className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#f87171]/50 text-[0.65rem] font-semibold"
              >
                !
              </span>
              <span>{error}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {exampleChips.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="eyebrow text-center">Quick Picks</p>
          <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
            {exampleChips.map((chip) => (
              <button
                key={chip.imdbId}
                type="button"
                onClick={() => handleChipClick(chip.imdbId)}
                className={[
                  "whitespace-nowrap rounded-full border px-3 py-1 text-[0.72rem]",
                  "border-border bg-transparent text-[color:var(--text-secondary)] transition duration-150 ease-out",
                  "hover:-translate-y-px hover:border-primary/70 hover:bg-[rgba(236,78,2,0.16)] hover:text-[color:var(--text-primary)]",
                  "active:scale-[0.96]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary"
                ].join(" ")}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
