import { firstWordForLevel, wordsForLevel } from "@/data/words";
import type { Level, TurnResult, WordCard } from "@/lib/types";

const ORDER: Level[] = ["beginner", "intermediate", "advanced"];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function neighbor(level: Level, delta: number): Level {
  const i = ORDER.indexOf(level);
  return ORDER[Math.min(ORDER.length - 1, Math.max(0, i + delta))];
}

export function pickNextCard(opts: {
  startLevel: Level;
  usedIds: Set<string>;
  consecutiveMisses: number;
  consecutiveSentenceHits: number;
}): WordCard {
  let level = opts.startLevel;
  if (opts.consecutiveMisses >= 2) level = neighbor(opts.startLevel, -1);
  if (opts.consecutiveSentenceHits >= 2) level = neighbor(opts.startLevel, 1);

  const unusedHere = wordsForLevel(level).filter((w) => !opts.usedIds.has(w.id));
  if (unusedHere.length > 0) {
    if (opts.usedIds.size === 0) return firstWordForLevel(level);
    return shuffle(unusedHere)[0];
  }

  for (const fallback of ORDER) {
    const unused = wordsForLevel(fallback).filter((w) => !opts.usedIds.has(w.id));
    if (unused.length > 0) return shuffle(unused)[0];
  }

  return firstWordForLevel(opts.startLevel);
}

export function reviewWord(results: TurnResult[]): TurnResult | null {
  const miss = results.find((r) => !r.correct);
  if (miss) return miss;
  return results[results.length - 1] ?? null;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
