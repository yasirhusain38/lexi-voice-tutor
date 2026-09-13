"use client";

import type { Settings } from "@/lib/types";
import type { BrowserVoice } from "@/lib/speech";

export function SettingsDrawer({
  open,
  onClose,
  settings,
  onChange,
  voices,
}: {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (next: Settings) => void;
  voices: BrowserVoice[];
}) {
  if (!open) return null;

  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const list = englishVoices.length > 0 ? englishVoices : voices;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-ink/70" aria-label="Close settings" onClick={onClose} />
      <div className="relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-brass/30 bg-pine p-6 sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <p className="meta">Settings</p>
          <button type="button" onClick={onClose} className="tap px-2 text-sage">
            Close
          </button>
        </div>
        <h3 className="display mt-4 text-4xl">Voice & later APIs</h3>
        <p className="mt-3 text-sm leading-relaxed text-mist/80">
          v1 runs on free Web Speech in this browser. An OpenAI-compatible key is optional and unused unless you add one.
        </p>

        <label className="mt-6 block text-sm">
          <span className="meta">Voice</span>
          <select
            className="mt-2 w-full rounded-xl border border-brass/25 bg-ink px-3 py-3 text-vellum"
            value={settings.voiceURI}
            onChange={(e) => onChange({ ...settings, voiceURI: e.target.value })}
          >
            <option value="">Browser default (best English)</option>
            {list.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} · {v.lang}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block text-sm">
          <span className="meta">Rate · {settings.rate.toFixed(2)}</span>
          <input
            type="range"
            min={0.75}
            max={1.1}
            step={0.01}
            value={settings.rate}
            onChange={(e) => onChange({ ...settings, rate: Number(e.target.value) })}
            className="mt-3 w-full accent-brass"
          />
        </label>

        <label className="mt-5 block text-sm">
          <span className="meta">Listen as</span>
          <select
            className="mt-2 w-full rounded-xl border border-brass/25 bg-ink px-3 py-3 text-vellum"
            value={settings.lang}
            onChange={(e) => onChange({ ...settings, lang: e.target.value })}
          >
            <option value="en-IN">English (India)</option>
            <option value="en-GB">English (UK)</option>
            <option value="en-US">English (US)</option>
          </select>
        </label>

        <div className="hairline my-7" />
        <p className="meta">Optional · production path</p>

        <label className="mt-4 block text-sm">
          <span className="meta">API base</span>
          <input
            className="mt-2 w-full rounded-xl border border-brass/25 bg-ink px-3 py-3 text-vellum"
            value={settings.apiBase}
            onChange={(e) => onChange({ ...settings, apiBase: e.target.value })}
            placeholder="https://api.openai.com/v1"
          />
        </label>
        <label className="mt-4 block text-sm">
          <span className="meta">API key</span>
          <input
            type="password"
            className="mt-2 w-full rounded-xl border border-brass/25 bg-ink px-3 py-3 text-vellum"
            value={settings.apiKey}
            onChange={(e) => onChange({ ...settings, apiKey: e.target.value })}
            placeholder="Stored only in this browser"
            autoComplete="off"
          />
        </label>
        <label className="mt-4 block text-sm">
          <span className="meta">Model</span>
          <input
            className="mt-2 w-full rounded-xl border border-brass/25 bg-ink px-3 py-3 text-vellum"
            value={settings.model}
            onChange={(e) => onChange({ ...settings, model: e.target.value })}
            placeholder="gpt-4o-mini"
          />
        </label>
      </div>
    </div>
  );
}
