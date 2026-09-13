import { LEXI_SYSTEM } from "@/lib/coach";
import type { Mode, Settings, WordCard } from "@/lib/types";
import type { ScoreResult } from "@/lib/score";

export async function maybeLlmFeedback(opts: {
  settings: Settings;
  card: WordCard;
  mode: Mode;
  transcript: string;
  score: ScoreResult;
  fallback: string;
}): Promise<string> {
  const { settings } = opts;
  if (!settings.apiKey.trim()) return opts.fallback;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(`${settings.apiBase.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: settings.model || "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 80,
        messages: [
          { role: "system", content: LEXI_SYSTEM },
          {
            role: "user",
            content: `Word: ${opts.card.word}\nMode: ${opts.mode}\nLearner said: ${opts.transcript || "(silence)"}\nContains word or variant: ${opts.score.correct}\nUsed in a sentence: ${opts.score.usedInSentence}\nGive one spoken sentence of feedback.`,
          },
        ],
      }),
    });
    if (!res.ok) return opts.fallback;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return opts.fallback;
    return text.replace(/[*_`#]/g, "");
  } catch {
    return opts.fallback;
  } finally {
    window.clearTimeout(timer);
  }
}
