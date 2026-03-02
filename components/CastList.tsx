"use client";

import { motion } from "framer-motion";

import { getInitials, splitCsvValues } from "@/lib/utils";

interface CastListProps {
  actors: string;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #2a2a44 0%, #4c2b6b 100%)",
  "linear-gradient(135deg, #17304a 0%, #23597d 100%)",
  "linear-gradient(135deg, #2d2f52 0%, #6544a3 100%)",
  "linear-gradient(135deg, #2c233f 0%, #8a3d56 100%)",
  "linear-gradient(135deg, #1f3b3a 0%, #2c7d68 100%)",
  "linear-gradient(135deg, #3a2f22 0%, #8f5f2f 100%)"
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
      className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] md:flex-wrap md:overflow-visible"
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
              "group rounded-card min-w-[90px] flex-shrink-0 px-1.5 py-1 text-center",
              "transition duration-200 ease-out hover:-translate-y-[1px]"
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
