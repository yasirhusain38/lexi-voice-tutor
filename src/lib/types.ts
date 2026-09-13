export type Level = "beginner" | "intermediate" | "advanced";
export type Goal = "daily" | "interview" | "ielts" | "business";
export type Mode = "teach" | "quiz" | "sentence" | "pronounce";
export type Screen = "landing" | "setup" | "session" | "recap";
export type OrbState = "idle" | "listening" | "thinking" | "speaking";

export type WordCard = {
  id: string;
  word: string;
  level: Level;
  definition: string;
  example: string;
  variants: string[];
  hint: string;
};

export type TurnResult = {
  word: string;
  level: Level;
  correct: boolean;
  usedInSentence: boolean;
  revealed: boolean;
  transcript: string;
};

export type SessionConfig = {
  level: Level;
  goal: Goal;
  mode: Mode;
};

export type Settings = {
  voiceURI: string;
  rate: number;
  lang: string;
  apiBase: string;
  apiKey: string;
  model: string;
};

export const LEVELS: { id: Level; label: string; note: string }[] = [
  { id: "beginner", label: "Beginner", note: "Everyday words" },
  { id: "intermediate", label: "Intermediate", note: "Work & study" },
  { id: "advanced", label: "Advanced", note: "Precise English" },
];

export const GOALS: { id: Goal; label: string }[] = [
  { id: "daily", label: "Daily English" },
  { id: "interview", label: "Interview" },
  { id: "ielts", label: "IELTS" },
  { id: "business", label: "Business" },
];

export const MODES: { id: Mode; label: string; note: string }[] = [
  { id: "teach", label: "Teach me", note: "Hear it, then use it" },
  { id: "quiz", label: "Quiz me", note: "Guess from the meaning" },
  { id: "sentence", label: "Use it in a sentence", note: "Make it yours" },
  { id: "pronounce", label: "Pronunciation drill", note: "Say the word" },
];

export const DEFAULT_CONFIG: SessionConfig = {
  level: "intermediate",
  goal: "daily",
  mode: "teach",
};

export const DEFAULT_SETTINGS: Settings = {
  voiceURI: "",
  rate: 0.95,
  lang: "en-IN",
  apiBase: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
};

export const SESSION_SECONDS = 180;
export const WORDS_MIN = 6;
export const WORDS_MAX = 8;
