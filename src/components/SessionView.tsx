"use client";

import { TalkOrb } from "@/components/TalkOrb";
import { formatClock } from "@/lib/session";
import type { Mode, OrbState, WordCard } from "@/lib/types";

const MODE_LABEL: Record<Mode, string> = {
  teach: "Teach me",
  quiz: "Quiz me",
  sentence: "Use it in a sentence",
  pronounce: "Pronunciation",
};

export function SessionView({
  card,
  index,
  total,
  mode,
  orb,
  caption,
  heard,
  correct,
  savedCount,
  secondsLeft,
  showWord,
  hintVisible,
  revealed,
  saved,
  typed,
  showTyped,
  interim,
  onOrb,
  onRepeat,
  onHint,
  onReveal,
  onSave,
  onNext,
  onTyped,
  onSubmitTyped,
}: {
  card: WordCard;
  index: number;
  total: number;
  mode: Mode;
  orb: OrbState;
  caption: string;
  heard: number;
  correct: number;
  savedCount: number;
  secondsLeft: number;
  showWord: boolean;
  hintVisible: boolean;
  revealed: boolean;
  saved: boolean;
  typed: string;
  showTyped: boolean;
  interim: string;
  onOrb: () => void;
  onRepeat: () => void;
  onHint: () => void;
  onReveal: () => void;
  onSave: () => void;
  onNext: () => void;
  onTyped: (value: string) => void;
  onSubmitTyped: () => void;
}) {
  return (
    <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-3xl flex-col px-5 pb-4 pt-6 sm:px-10">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="meta">
            Word {index + 1} / {total} · {MODE_LABEL[mode]}
          </p>
          <p className="mt-2 text-sm text-sage">
            Heard {heard} · Correct {correct} · Saved {savedCount}
          </p>
        </div>
        <p className="font-mono text-sm tabular-nums text-brass">{formatClock(secondsLeft)}</p>
      </header>

      <div className="mt-6 min-h-[4.5rem] text-center">
        <p className="caption mx-auto max-w-xl">{caption || " "}</p>
      </div>

      <div className="mt-4 flex flex-1 flex-col items-center justify-center">
        <TalkOrb state={orb} onPress={onOrb} disabled={orb === "speaking" || orb === "thinking"} />
        <div className="mt-16 text-center">
          {showWord ? (
            <p className="word-hero text-vellum">{card.word}</p>
          ) : (
            <p className="word-hero text-sage/50">••••••</p>
          )}
          {(showWord || revealed) && (
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mist/85">{card.definition}</p>
          )}
          {hintVisible ? <p className="mt-3 text-sm italic text-brass">{card.hint}</p> : null}
          {interim ? <p className="mt-4 text-sm text-sage">You: {interim}</p> : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Action onClick={onRepeat}>Repeat</Action>
        <Action onClick={onHint}>Hint</Action>
        <Action onClick={onReveal}>Reveal</Action>
        <Action onClick={onSave}>{saved ? "Saved" : "Save word"}</Action>
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitTyped();
        }}
      >
        <input
          value={typed}
          onChange={(e) => onTyped(e.target.value)}
          placeholder={showTyped ? "Mic blocked — type your sentence" : "Or type your sentence"}
          className="tap flex-1 rounded-full border border-brass/30 bg-ink px-4 text-sm text-vellum placeholder:text-sage/60"
        />
        <button type="submit" className="btn-brass tap rounded-full px-5 text-sm font-semibold">
          Send
        </button>
      </form>

      <button type="button" onClick={onNext} className="btn-ghost tap mt-3 w-full rounded-full py-3 text-sm">
        Next
      </button>
    </section>
  );
}

function Action({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="btn-ghost tap rounded-full px-3 text-sm">
      {children}
    </button>
  );
}
