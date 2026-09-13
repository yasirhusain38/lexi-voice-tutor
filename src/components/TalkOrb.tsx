"use client";

import type { OrbState } from "@/lib/types";

const LABELS: Record<OrbState, string> = {
  idle: "Tap to speak",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

export function TalkOrb({
  state,
  onPress,
  disabled,
}: {
  state: OrbState;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      aria-label={LABELS[state]}
      className={`orb-wrap orb-${state} group mx-auto block cursor-pointer border-0 bg-transparent p-0 disabled:cursor-default`}
    >
      <span className="orb-glow" />
      {state === "listening" ? (
        <>
          <span className="sonar" />
          <span className="sonar" />
        </>
      ) : null}
      <span className="orb-ring" />
      <span className="orb-core">
        <span className="bars" aria-hidden>
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
        {state === "thinking" ? (
          <svg className="orb-tick absolute inset-0" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(196,163,90,0.15)" strokeWidth="1.2" />
            <path
              d="M50 12 A38 38 0 0 1 78 28"
              fill="none"
              stroke="#e8cc7a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : null}
      </span>
      <span className="meta absolute inset-x-0 -bottom-9 text-center tracking-[0.28em] text-brass">
        {LABELS[state]}
      </span>
    </button>
  );
}
