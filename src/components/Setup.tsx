"use client";

import { useEffect, useRef, useState } from "react";
import { GOALS, LEVELS, MODES, type Goal, type Level, type Mode, type SessionConfig } from "@/lib/types";

export function Setup({
  config,
  onChange,
  onBegin,
  onBack,
}: {
  config: SessionConfig;
  onChange: (next: SessionConfig) => void;
  onBegin: () => void;
  onBack: () => void;
}) {
  const [left, setLeft] = useState(10);
  const beginRef = useRef(onBegin);
  beginRef.current = onBegin;

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          window.clearInterval(id);
          beginRef.current();
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="meta tap px-1 text-left">
          ← Back
        </button>
        <p className="meta">Optional setup · {left}s</p>
      </header>

      <h2 className="display mt-10 text-5xl sm:text-6xl">How should we begin?</h2>
      <p className="mt-4 max-w-lg text-mist/85">
        Defaults are already set for the demo: Intermediate, Daily English, Teach me. Change them, or just begin.
      </p>

      <Field label="Level">
        {LEVELS.map((item) => (
          <Chip
            key={item.id}
            on={config.level === item.id}
            onClick={() => onChange({ ...config, level: item.id as Level })}
            label={item.label}
            note={item.note}
          />
        ))}
      </Field>

      <Field label="Goal">
        {GOALS.map((item) => (
          <Chip
            key={item.id}
            on={config.goal === item.id}
            onClick={() => onChange({ ...config, goal: item.id as Goal })}
            label={item.label}
          />
        ))}
      </Field>

      <Field label="Mode">
        {MODES.map((item) => (
          <Chip
            key={item.id}
            on={config.mode === item.id}
            onClick={() => onChange({ ...config, mode: item.id as Mode })}
            label={item.label}
            note={item.note}
          />
        ))}
      </Field>

      <button
        type="button"
        onClick={onBegin}
        className="btn-brass tap mt-10 w-full rounded-full px-8 py-4 text-base font-semibold sm:w-auto"
      >
        Begin
      </button>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <p className="meta mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  on,
  onClick,
  label,
  note,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  note?: string;
}) {
  return (
    <button type="button" data-on={on} onClick={onClick} className="chip tap rounded-full px-4 py-3 text-left">
      <span className="block text-sm font-medium">{label}</span>
      {note ? <span className="block text-xs text-sage">{note}</span> : null}
    </button>
  );
}
