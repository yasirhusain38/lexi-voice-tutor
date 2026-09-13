"use client";

import { motion } from "framer-motion";
import { WORDS } from "@/data/words";

const LINE = ["Learn", "vocabulary", "by speaking."];

export function Landing({
  onStart,
  onSetup,
}: {
  onStart: () => void;
  onSetup: () => void;
}) {
  const ribbon = [...WORDS.map((w) => w.word), ...WORDS.map((w) => w.word)];

  return (
    <section className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-8 pl-6 pr-24 pt-8 sm:pl-10 sm:pr-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="meta">Lexi</p>
          <p className="mt-2 font-display text-lg italic text-sage">A voice atelier</p>
        </div>
        <p className="meta text-right">
          01 — Voice tutor
          <br />
          Est. 2026
        </p>
      </header>

      <div className="mt-10 grid flex-1 items-center gap-10 lg:mt-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="meta mb-6">English · out loud · three minutes</p>
          <h1 className="display text-[18vw] text-vellum sm:text-[12vw] lg:text-[7.4rem]">
            {LINE.map((word, i) => (
              <motion.span
                key={word}
                className="block"
                initial={false}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="mt-8 max-w-md text-base leading-relaxed text-mist/90 sm:text-lg"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            One word. A short meaning. A real example. Then you speak —
            and Lexi answers in a single breath.
          </motion.p>
          <div className="mx-auto my-8 lg:hidden">
            <LandingOrb />
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.button
              type="button"
              onClick={onStart}
              className="btn-brass tap rounded-full px-8 py-4 text-center text-base font-semibold tracking-wide"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start 3-minute session
            </motion.button>
            <button
              type="button"
              onClick={onSetup}
              className="tap rounded-full px-5 text-sm text-sage underline-offset-4 hover:text-vellum hover:underline"
            >
              Set level, goal, mode
            </button>
          </div>
          <p className="mt-5 text-sm text-sage/80">Chrome or Edge. Allow the microphone. First word: resilient.</p>
        </div>

        <motion.div
          className="relative mx-auto hidden w-full max-w-sm lg:block"
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <LandingOrb />
          <p className="mt-16 text-center font-display text-3xl italic text-brass-bright">resilient</p>
          <p className="mt-2 text-center text-sm text-sage">You bounce back after something hard.</p>
        </motion.div>
      </div>

      <div className="mt-12 overflow-hidden border-y border-brass/20 py-4 lg:mt-4">
        <div className="marquee meta text-brass/80">
          {ribbon.map((word, i) => (
            <span key={`${word}-${i}`}>{word}</span>
          ))}
        </div>
      </div>

      <ol className="mt-8 hidden gap-8 text-sm text-mist/80 sm:grid sm:grid-cols-3">
        {[
          ["01", "Hear the word", "Spoken slowly, then a meaning a teenager would keep."],
          ["02", "Speak it back", "A sentence of your own. Indian, British, or American English."],
          ["03", "Get one line", "No lecture. No accent police. Then the next word."],
        ].map(([n, t, d]) => (
          <li key={n}>
            <p className="meta text-brass">{n}</p>
            <p className="mt-2 font-display text-2xl">{t}</p>
            <p className="mt-2 leading-relaxed">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function LandingOrb() {
  return (
    <div className="orb-wrap orb-idle mx-auto">
      <span className="orb-glow" />
      <span className="orb-ring" />
      <span className="orb-core" />
    </div>
  );
}
