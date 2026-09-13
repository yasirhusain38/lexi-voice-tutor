export type BrowserVoice = {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
};

type RecognitionCtor = new () => SpeechRecognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechSupported(): { listen: boolean; speak: boolean } {
  if (typeof window === "undefined") return { listen: false, speak: false };
  return {
    listen: Boolean(recognitionCtor()),
    speak: "speechSynthesis" in window,
  };
}

export function listVoices(): BrowserVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().map((v) => ({
    name: v.name,
    lang: v.lang,
    voiceURI: v.voiceURI,
    default: v.default,
  }));
}

export function waitForVoices(): Promise<BrowserVoice[]> {
  const existing = listVoices();
  if (existing.length > 0) return Promise.resolve(existing);
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    const done = () => resolve(listVoices());
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    window.setTimeout(done, 700);
  });
}

export function pickVoice(voices: SpeechSynthesisVoice[], preferredURI: string): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  if (preferredURI) {
    const match = voices.find((v) => v.voiceURI === preferredURI);
    if (match) return match;
  }
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = english.length > 0 ? english : voices;
  const rank = (v: SpeechSynthesisVoice) => {
    const n = `${v.name} ${v.lang}`.toLowerCase();
    if (/neural|natural|online/.test(n)) return 0;
    if (/aria|jenny|samantha|moira|google uk english female/.test(n)) return 1;
    if (/raveena|heera|google हिन्दी|google english/.test(n)) return 2;
    if (/google us english|microsoft/.test(n)) return 3;
    if (v.lang.toLowerCase().startsWith("en-in")) return 4;
    if (v.lang.toLowerCase().startsWith("en-gb")) return 5;
    if (v.lang.toLowerCase().startsWith("en-us")) return 6;
    return 8;
  };
  return [...pool].sort((a, b) => rank(a) - rank(b))[0] ?? null;
}

export function speakText(opts: {
  text: string;
  rate: number;
  voiceURI: string;
  onStart?: () => void;
  onEnd?: () => void;
}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      opts.onEnd?.();
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(opts.text);
    utter.rate = opts.rate;
    utter.pitch = 1;
    utter.lang = "en-US";
    const voice = pickVoice(window.speechSynthesis.getVoices(), opts.voiceURI);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    }
    utter.onstart = () => opts.onStart?.();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      opts.onEnd?.();
      resolve();
    };
    utter.onend = finish;
    utter.onerror = finish;
    try {
      window.speechSynthesis.speak(utter);
    } catch {
      finish();
    }
    window.setTimeout(finish, Math.min(20000, 1200 + opts.text.length * 80));
  });
}

export function cancelSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export type ListenResult = {
  transcript: string;
  alternatives: string[];
  error: string | null;
  blocked: boolean;
};

export function listenOnce(opts: {
  lang: string;
  onInterim?: (text: string) => void;
}): { stop: () => void; done: Promise<ListenResult> } {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    return {
      stop: () => undefined,
      done: Promise.resolve({
        transcript: "",
        alternatives: [],
        error: "unsupported",
        blocked: false,
      }),
    };
  }

  const rec = new Ctor();
  rec.lang = opts.lang;
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 4;

  let settled = false;
  let stopFn = () => undefined as void;

  const done = new Promise<ListenResult>((resolve) => {
    const alternatives = new Set<string>();
    let finalText = "";
    let lastInterim = "";

    const finish = (result: ListenResult) => {
      if (settled) return;
      settled = true;
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
      resolve(result);
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const top = res[0]?.transcript ?? "";
        if (res.isFinal) {
          finalText = `${finalText} ${top}`.trim();
          for (let a = 0; a < res.length; a++) {
            if (res[a]?.transcript) alternatives.add(res[a].transcript);
          }
        } else {
          interim += top;
        }
      }
      lastInterim = interim;
      opts.onInterim?.(finalText || interim);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      const err = event.error;
      const blocked = err === "not-allowed" || err === "service-not-allowed";
      finish({
        transcript: finalText || lastInterim,
        alternatives: Array.from(alternatives),
        error: err,
        blocked,
      });
    };

    rec.onend = () => {
      const transcript = (finalText || lastInterim).trim();
      finish({
        transcript,
        alternatives: Array.from(new Set([transcript, ...alternatives].filter(Boolean))),
        error: transcript ? null : "no-speech",
        blocked: false,
      });
    };

    try {
      rec.start();
    } catch {
      finish({
        transcript: "",
        alternatives: [],
        error: "start-failed",
        blocked: false,
      });
    }

    stopFn = () => {
      try {
        rec.stop();
      } catch {
        finish({
          transcript: finalText || lastInterim,
          alternatives: Array.from(alternatives),
          error: null,
          blocked: false,
        });
      }
    };
  });

  return { stop: () => stopFn(), done };
}
