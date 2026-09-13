import { DEFAULT_SETTINGS, type Settings } from "@/lib/types";

const SAVED_KEY = "lexi-saved-words";
const STATS_KEY = "lexi-stats";
const SETTINGS_KEY = "lexi-settings";

export type Stats = {
  heard: number;
  correct: number;
  sessions: number;
};

const EMPTY_STATS: Stats = { heard: 0, correct: 0, sessions: 0 };

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function loadSavedWords(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((w) => typeof w === "string") : [];
  } catch {
    return [];
  }
}

export function saveWord(word: string): string[] {
  const next = Array.from(new Set([...loadSavedWords(), word.toLowerCase()]));
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next;
}

export function unsaveWord(word: string): string[] {
  const next = loadSavedWords().filter((w) => w !== word.toLowerCase());
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next;
}

export function loadStats(): Stats {
  if (!canUseStorage()) return { ...EMPTY_STATS };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Stats>) : {};
    return {
      heard: Number(parsed.heard) || 0,
      correct: Number(parsed.correct) || 0,
      sessions: Number(parsed.sessions) || 0,
    };
  } catch {
    return { ...EMPTY_STATS };
  }
}

export function bumpStats(partial: Partial<Stats>): Stats {
  const current = loadStats();
  const next = {
    heard: current.heard + (partial.heard ?? 0),
    correct: current.correct + (partial.correct ?? 0),
    sessions: current.sessions + (partial.sessions ?? 0),
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(next));
  return next;
}

export function loadSettings(): Settings {
  if (!canUseStorage()) return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Settings>) : {};
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
