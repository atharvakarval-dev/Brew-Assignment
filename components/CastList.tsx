"use client";

import { motion } from "framer-motion";

import { getInitials, splitCsvValues } from "@/lib/utils";

interface CastListProps {
  actors: string;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #3e2416 0%, #8a4515 100%)",
  "linear-gradient(135deg, #2f1f18 0%, #7b3823 100%)",
  "linear-gradient(135deg, #3c271b 0%, #8a5a2d 100%)",
  "linear-gradient(135deg, #40281f 0%, #9e4a2f 100%)",
  "linear-gradient(135deg, #2c1f17 0%, #77553a 100%)",
  "linear-gradient(135deg, #3d2315 0%, #a63d12 100%)"
];

function hashName(name: string): number {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function CastList({ actors }: CastListProps): JSX.Element {
  const castMembers = splitCsvValues(actors).slice(0, 6);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06
          }
        }
      }}
      className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0"
    >
      {castMembers.map((actor) => {
        const gradient = AVATAR_GRADIENTS[hashName(actor) % AVATAR_GRADIENTS.length];

        return (
          <motion.div
            key={actor}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 }
              }}
            className={[
              "group rounded-card min-w-[102px] flex-shrink-0 snap-start border border-border/70 bg-[rgba(15,11,9,0.5)] px-2 py-2 text-center",
              "transition duration-200 ease-out hover:-translate-y-[1px] hover:border-[color:var(--border-hover)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.32)]"
            ].join(" ")}
          >
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-[0.9rem] font-semibold text-[color:var(--text-primary)] transition duration-200 group-hover:scale-[1.08]"
              style={{ backgroundImage: gradient }}
            >
              {getInitials(actor)}
            </div>
            <p className="mt-2 max-w-[92px] truncate text-[0.78rem] text-[color:var(--text-secondary)] transition duration-150 group-hover:text-[color:var(--text-primary)]">
              {actor}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
