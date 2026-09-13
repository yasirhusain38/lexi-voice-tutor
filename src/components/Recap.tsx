"use client";

import { WORDS } from "@/data/words";
import { challengeSentence } from "@/lib/coach";
import { reviewWord } from "@/lib/session";
import type { TurnResult } from "@/lib/types";

export function Recap({
  results,
  saved,
  onRestart,
  onSetup,
}: {
  results: TurnResult[];
  saved: string[];
  onRestart: () => void;
  onSetup: () => void;
}) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const review = reviewWord(results);
  const reviewCard = WORDS.find((w) => w.word === review?.word) ?? WORDS.find((w) => w.word === "resilient")!;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <section className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-6 py-8 sm:px-10">
      <p className="meta">Session recap</p>
      <h2 className="display mt-4 text-5xl sm:text-7xl">You showed up.</h2>
      <p className="mt-4 text-mist/85">
        {correct} of {total} words landed. That is enough for tomorrow to feel easier.
      </p>

      <div className="mt-10 grid grid-cols-3 gap-3">
        <Stat label="Score" value={`${score}%`} />
        <Stat label="Correct" value={`${correct}/${total}`} />
        <Stat label="Saved" value={`${saved.length}`} />
      </div>

      <div className="mt-10">
        <p className="meta">Words learned</p>
        <ul className="mt-3 divide-y divide-brass/15">
          {results.map((r) => (
            <li key={r.word} className="flex items-center justify-between py-3">
              <span className="font-display text-2xl italic">{r.word}</span>
              <span className={`meta ${r.correct ? "text-ok" : "text-ember"}`}>
                {r.correct ? (r.usedInSentence ? "Used" : "Heard") : r.revealed ? "Revealed" : "Miss"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 rounded-3xl border border-brass/25 bg-moss/40 p-5">
        <p className="meta">Review tomorrow</p>
        <p className="word-hero mt-2 text-brass-bright">{reviewCard.word}</p>
        <p className="mt-3 text-mist/90">{reviewCard.definition}</p>
        <p className="mt-4 font-display text-xl italic text-vellum">{challengeSentence(reviewCard)}</p>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onRestart} className="btn-brass tap rounded-full px-8 py-4 font-semibold">
          Restart
        </button>
        <button type="button" onClick={onSetup} className="btn-ghost tap rounded-full px-8 py-4">
          Change mode
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brass/20 bg-pine/80 px-3 py-4 text-center">
      <p className="font-display text-3xl text-brass-bright">{value}</p>
      <p className="meta mt-2">{label}</p>
    </div>
  );
}
