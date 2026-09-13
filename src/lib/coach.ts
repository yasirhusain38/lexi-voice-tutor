import type { Goal, Mode, WordCard } from "@/lib/types";
import type { ScoreResult } from "@/lib/score";

const GOAL_FLAVOR: Record<Goal, string> = {
  daily: "everyday English",
  interview: "interview English",
  ielts: "exam English",
  business: "work English",
};

export function openingLine(card: WordCard, mode: Mode, goal: Goal, isFirst: boolean): string {
  if (
    isFirst &&
    card.word === "resilient" &&
    (mode === "teach" || mode === "sentence")
  ) {
    return "Hi, I'm Lexi. We'll learn useful English by speaking. First word: resilient. It means you bounce back after something hard. Example: She stayed resilient after the rejected interview. Your turn — use resilient in a sentence.";
  }

  const flavor = GOAL_FLAVOR[goal];
  const hello = isFirst
    ? `Hi, I'm Lexi. We'll learn useful ${flavor} by speaking. `
    : "";

  if (mode === "quiz") {
    return `${hello}Listen to the meaning, then say the word. It means ${uncap(card.definition)} What's the word?`;
  }

  if (mode === "pronounce") {
    return `${hello}${isFirst ? "First word: " : "Next word: "}${card.word}. Listen, then say ${card.word}.`;
  }

  if (mode === "sentence") {
    return `${hello}${isFirst ? "First word: " : "Next word: "}${card.word}. It means ${uncap(card.definition)} Example: ${card.example} Your turn — use ${card.word} in a sentence.`;
  }

  return `${hello}${isFirst ? "First word: " : "Next word: "}${card.word}. It means ${uncap(card.definition)} Example: ${card.example} Repeat it, then use ${card.word} in a sentence.`;
}

export function slowWordLine(card: WordCard): string {
  return card.word;
}

export function silenceLine(card: WordCard, mode: Mode): string {
  if (mode === "quiz") return "I'm listening. Say the word when you are ready.";
  if (mode === "pronounce") return `I'm listening. Say ${card.word}.`;
  return "I'm listening. Use the word in any sentence.";
}

export function offTopicLine(card: WordCard): string {
  return `Heard you. Back to ${card.word}.`;
}

export function hintLine(card: WordCard): string {
  return card.hint;
}

export function revealLine(card: WordCard): string {
  return `It's ${card.word}. ${card.definition}`;
}

export function repeatAsk(card: WordCard, mode: Mode): string {
  if (mode === "quiz") return `Try again. It means ${uncap(card.definition)}`;
  if (mode === "pronounce") return `Once more. Say ${card.word}.`;
  if (mode === "sentence") return `Try one more sentence with ${card.word}.`;
  return `Once more. Repeat ${card.word}, or use it in a sentence.`;
}

export function feedbackLine(
  card: WordCard,
  mode: Mode,
  score: ScoreResult,
  retryUsed: boolean,
): { speak: string; consumeRetry: boolean; reveal: boolean; advance: boolean } {
  if (score.empty) {
    return {
      speak: silenceLine(card, mode),
      consumeRetry: false,
      reveal: false,
      advance: false,
    };
  }

  if (score.correct) {
    if (mode === "sentence" || score.usedInSentence) {
      return {
        speak: `Yes. You used ${card.word} clearly. Let's keep going.`,
        consumeRetry: false,
        reveal: false,
        advance: true,
      };
    }
    if (mode === "quiz") {
      return {
        speak: `That's it. ${capitalize(card.word)}. Let's keep going.`,
        consumeRetry: false,
        reveal: false,
        advance: true,
      };
    }
    if (mode === "pronounce") {
      return {
        speak: `Good. I heard ${card.word}. Next word.`,
        consumeRetry: false,
        reveal: false,
        advance: true,
      };
    }
    return {
      speak: `Good. That's ${card.word}. Let's keep going.`,
      consumeRetry: false,
      reveal: false,
      advance: true,
    };
  }

  if (mode === "sentence" && score.matched && !score.usedInSentence) {
    if (!retryUsed) {
      return {
        speak: `Close. Put ${card.word} in a full sentence.`,
        consumeRetry: true,
        reveal: false,
        advance: false,
      };
    }
    return {
      speak: `It's ${card.word}. You'll hear it again tomorrow. Next word.`,
      consumeRetry: true,
      reveal: true,
      advance: true,
    };
  }

  if (score.offTopic) {
    if (!retryUsed) {
      return {
        speak: `${offTopicLine(card)} ${repeatAsk(card, mode)}`,
        consumeRetry: true,
        reveal: false,
        advance: false,
      };
    }
    return {
      speak: `It's ${card.word}. Next word.`,
      consumeRetry: true,
      reveal: true,
      advance: true,
    };
  }

  if (score.close && mode === "pronounce" && !retryUsed) {
    return {
      speak: `Almost. Listen once more. ${card.word}.`,
      consumeRetry: true,
      reveal: false,
      advance: false,
    };
  }

  if (!retryUsed) {
    return {
      speak: `Not yet. ${card.word} means ${uncap(card.definition)} Try once more.`,
      consumeRetry: true,
      reveal: false,
      advance: false,
    };
  }

  return {
    speak: `It's ${card.word}. You'll hear it again tomorrow. Next word.`,
    consumeRetry: true,
    reveal: true,
    advance: true,
  };
}

export function recapSpeech(
  correct: number,
  total: number,
  reviewWord: string,
  challenge: string,
): string {
  return `That's the session. You used ${correct} of ${total} words well. Review ${reviewWord} tomorrow. Challenge: ${challenge}`;
}

export function challengeSentence(card: WordCard): string {
  return `Tomorrow, use ${card.word} in a new sentence about your day.`;
}

export const LEXI_SYSTEM = `You are Lexi, a voice vocabulary tutor for adults.

Teach ONE word at a time. Loop: say the word slowly → 8–14 word meaning → one natural example → ask them to repeat it or use it in a sentence → listen → one-sentence feedback → retry once or move on.

Keep turns short enough for speech. No markdown, no lists, no lectures.
If they go silent: "I'm listening. Use the word in any sentence."
If they go off-topic: four-word acknowledge, then return to the current word.
Accept Indian, British, and American English. Do not police accent unless they ask for pronunciation help.
Never pretend you can perfectly score pronunciation. You only check whether the word or a close form appeared.
Warm, brief coach. Usually 1–2 spoken sentences. No shaming.
Reply with a single spoken sentence of feedback. No markdown.`;

function uncap(s: string): string {
  const trimmed = s.trim();
  if (!trimmed) return trimmed;
  const body = trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
  return body.charAt(0).toLowerCase() + body.slice(1);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
