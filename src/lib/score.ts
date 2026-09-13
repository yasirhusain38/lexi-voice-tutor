import type { Mode, WordCard } from "@/lib/types";

export type ScoreResult = {
  correct: boolean;
  usedInSentence: boolean;
  close: boolean;
  matched: string | null;
  offTopic: boolean;
  empty: boolean;
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[^a-z'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

function isClose(token: string, target: string): boolean {
  if (token === target) return true;
  if (token.length < 3 || target.length < 3) return token === target;
  const dist = levenshtein(token, target);
  const ratio = similarity(token, target);
  if (target.length <= 5) return dist <= 1 || ratio >= 0.78;
  return dist <= 2 || ratio >= 0.72;
}

function matchAgainst(transcript: string, card: WordCard): { matched: string | null; close: boolean } {
  const t = normalize(transcript);
  const words = tokens(transcript);
  const targets = card.variants.map(normalize);

  for (const target of targets) {
    if (!target) continue;
    if (t === target || t.includes(` ${target} `) || t.startsWith(`${target} `) || t.endsWith(` ${target}`) || t === target) {
      return { matched: target, close: false };
    }
    if (t.includes(target)) return { matched: target, close: false };
  }

  for (const word of words) {
    for (const target of targets) {
      if (isClose(word, target)) return { matched: target, close: true };
    }
  }

  return { matched: null, close: false };
}

export function scoreTranscript(transcript: string, card: WordCard, mode: Mode): ScoreResult {
  const words = tokens(transcript);
  const empty = words.length === 0;

  if (empty) {
    return {
      correct: false,
      usedInSentence: false,
      close: false,
      matched: null,
      offTopic: false,
      empty: true,
    };
  }

  const { matched, close } = matchAgainst(transcript, card);
  const usedInSentence = Boolean(matched) && words.length >= 4;
  const saidOnlyWord = Boolean(matched) && words.length <= 2;

  if (mode === "pronounce") {
    return {
      correct: Boolean(matched) || close,
      usedInSentence: false,
      close,
      matched,
      offTopic: false,
      empty: false,
    };
  }

  if (mode === "quiz") {
    return {
      correct: Boolean(matched),
      usedInSentence: false,
      close,
      matched,
      offTopic: !matched && words.length >= 4,
      empty: false,
    };
  }

  if (mode === "sentence") {
    if (saidOnlyWord) {
      return {
        correct: false,
        usedInSentence: false,
        close,
        matched,
        offTopic: false,
        empty: false,
      };
    }
    return {
      correct: usedInSentence,
      usedInSentence,
      close,
      matched,
      offTopic: !matched && words.length >= 4,
      empty: false,
    };
  }

  // teach: word or variant in the transcript is enough
  return {
    correct: Boolean(matched),
    usedInSentence,
    close,
    matched,
    offTopic: !matched && words.length >= 4,
    empty: false,
  };
}

export function bestScore(transcripts: string[], card: WordCard, mode: Mode): ScoreResult {
  const scored = transcripts.map((t) => scoreTranscript(t, card, mode));
  const hit = scored.find((s) => s.correct && s.usedInSentence) ?? scored.find((s) => s.correct) ?? scored[0];
  return hit;
}
