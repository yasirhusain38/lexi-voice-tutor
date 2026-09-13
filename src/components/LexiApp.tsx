"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Landing } from "@/components/Landing";
import { Recap } from "@/components/Recap";
import { SessionView } from "@/components/SessionView";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { Setup } from "@/components/Setup";
import { WORDS } from "@/data/words";
import {
  feedbackLine,
  hintLine,
  openingLine,
  recapSpeech,
  revealLine,
  silenceLine,
} from "@/lib/coach";
import { maybeLlmFeedback } from "@/lib/llm";
import { bestScore, type ScoreResult } from "@/lib/score";
import { pickNextCard } from "@/lib/session";
import {
  cancelSpeech,
  listenOnce,
  listVoices,
  speakText,
  speechSupported,
  waitForVoices,
  type BrowserVoice,
} from "@/lib/speech";
import {
  bumpStats,
  loadSavedWords,
  loadSettings,
  saveSettings,
  saveWord,
} from "@/lib/storage";
import {
  DEFAULT_CONFIG,
  SESSION_SECONDS,
  WORDS_MAX,
  WORDS_MIN,
  type OrbState,
  type Screen,
  type SessionConfig,
  type Settings,
  type TurnResult,
  type WordCard,
} from "@/lib/types";

const fade = {
  initial: false as const,
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export function LexiApp() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [config, setConfig] = useState<SessionConfig>(DEFAULT_CONFIG);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voices, setVoices] = useState<BrowserVoice[]>([]);
  const [orb, setOrb] = useState<OrbState>("idle");
  const [caption, setCaption] = useState("");
  const [card, setCard] = useState<WordCard>(WORDS.find((w) => w.word === "resilient")!);
  const [index, setIndex] = useState(0);
  const [total] = useState(WORDS_MIN);
  const [results, setResults] = useState<TurnResult[]>([]);
  const [retryUsed, setRetryUsed] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [saved, setSaved] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [showTyped, setShowTyped] = useState(false);
  const [interim, setInterim] = useState("");
  const [sessionHeard, setSessionHeard] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const turnGen = useRef(0);
  const cardRef = useRef(card);
  const configRef = useRef(config);
  const settingsRef = useRef(settings);
  const retryRef = useRef(false);
  const revealedRef = useRef(false);
  const resolvedRef = useRef(false);
  const usedIds = useRef(new Set<string>());
  const misses = useRef(0);
  const sentenceHits = useRef(0);
  const resultsRef = useRef<TurnResult[]>([]);
  const stopListen = useRef<(() => void) | null>(null);
  const timerExpired = useRef(false);
  const speakingRef = useRef(false);

  cardRef.current = card;
  configRef.current = config;
  settingsRef.current = settings;

  useEffect(() => {
    setSaved(loadSavedWords());
    const support = speechSupported();
    if (!support.listen) setShowTyped(true);
    void waitForVoices()
      .then(setVoices)
      .catch(() => undefined);
    const onVoices = () => setVoices(listVoices());
    window.speechSynthesis?.addEventListener("voiceschanged", onVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", onVoices);
  }, []);

  useEffect(() => {
    if (screen !== "session") return;
    timerExpired.current = false;
    setSecondsLeft(SESSION_SECONDS);
    const id = window.setInterval(() => {
      setSecondsLeft((n) => {
        if (n <= 1) {
          timerExpired.current = true;
          window.clearInterval(id);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [screen]);

  const updateSettings = (next: Settings) => {
    setSettings(next);
    saveSettings(next);
  };

  const say = useCallback(async (text: string, gen: number, rate = settingsRef.current.rate) => {
    if (turnGen.current !== gen) return false;
    speakingRef.current = true;
    setOrb("speaking");
    setCaption(text);
    await speakText({
      text,
      rate,
      voiceURI: settingsRef.current.voiceURI,
    });
    speakingRef.current = false;
    if (turnGen.current !== gen) return false;
    setOrb("idle");
    return true;
  }, []);

  const finishSession = useCallback(
    async (gen: number, finalResults: TurnResult[]) => {
      const correct = finalResults.filter((r) => r.correct).length;
      const review = finalResults.find((r) => !r.correct)?.word ?? finalResults[finalResults.length - 1]?.word ?? "resilient";
      const line = recapSpeech(
        correct,
        finalResults.length,
        review,
        `Tomorrow, use ${review} in a new sentence about your day.`,
      );
      await say(line, gen);
      setScreen("recap");
      setOrb("idle");
    },
    [say],
  );

  const commitTurn = useCallback(
    (score: ScoreResult, transcript: string) => {
      if (resolvedRef.current) return resultsRef.current;
      resolvedRef.current = true;
      const current = cardRef.current;
      const entry: TurnResult = {
        word: current.word,
        level: current.level,
        correct: score.correct,
        usedInSentence: score.usedInSentence,
        revealed: revealedRef.current && !score.correct,
        transcript,
      };
      const nextResults = [...resultsRef.current, entry];
      resultsRef.current = nextResults;
      setResults(nextResults);
      if (score.correct) {
        misses.current = 0;
        if (score.usedInSentence) sentenceHits.current += 1;
        else sentenceHits.current = 0;
        setSessionCorrect((n) => n + 1);
        bumpStats({ correct: 1 });
      } else {
        misses.current += 1;
        sentenceHits.current = 0;
      }
      return nextResults;
    },
    [],
  );

  const shouldEnd = (res: TurnResult[]) => {
    if (res.length >= WORDS_MAX) return true;
    if (res.length >= WORDS_MIN) return true;
    if (timerExpired.current && res.length >= 1) return true;
    return false;
  };

  const beginWord = useCallback(
    async (nextCard: WordCard, isFirst: boolean, gen: number) => {
      resolvedRef.current = false;
      retryRef.current = false;
      revealedRef.current = false;
      setRetryUsed(false);
      setHintVisible(false);
      setRevealed(false);
      setInterim("");
      setTyped("");
      setCard(nextCard);
      cardRef.current = nextCard;
      const line = openingLine(nextCard, configRef.current.mode, configRef.current.goal, isFirst);
      const ok = await say(line, gen);
      if (!ok) return;
      await listenCycle(gen);
    },
    [say],
  );

  const goNextWord = useCallback(
    async (gen: number, res: TurnResult[]) => {
      if (shouldEnd(res)) {
        await finishSession(gen, res);
        return;
      }
      const next = pickNextCard({
        startLevel: configRef.current.level,
        usedIds: usedIds.current,
        consecutiveMisses: misses.current,
        consecutiveSentenceHits: sentenceHits.current,
      });
      usedIds.current.add(next.id);
      setIndex(res.length);
      await beginWord(next, false, gen);
    },
    [beginWord, finishSession],
  );

  const handleScore = useCallback(
    async (transcripts: string[], gen: number) => {
      if (turnGen.current !== gen || resolvedRef.current) return;
      const current = cardRef.current;
      const mode = configRef.current.mode;
      const score = bestScore(transcripts.length ? transcripts : [""], current, mode);
      const heardSomething = transcripts.some((t) => t.trim());
      if (heardSomething) {
        setSessionHeard((n) => n + 1);
        bumpStats({ heard: 1 });
      }
      setOrb("thinking");
      const local = feedbackLine(current, mode, score, retryRef.current);
      const spoken = await maybeLlmFeedback({
        settings: settingsRef.current,
        card: current,
        mode,
        transcript: transcripts[0] ?? "",
        score,
        fallback: local.speak,
      });
      if (turnGen.current !== gen) return;

      if (local.reveal) {
        revealedRef.current = true;
        setRevealed(true);
      }

      if (local.advance || score.correct) {
        const res = commitTurn(score, transcripts[0] ?? "");
        const still = await say(spoken, gen);
        if (!still) return;
        await pause(420);
        await goNextWord(gen, res);
        return;
      }

      if (local.consumeRetry) {
        retryRef.current = true;
        setRetryUsed(true);
      }
      const still = await say(spoken, gen);
      if (!still) return;
      await listenCycle(gen);
    },
    [commitTurn, goNextWord, say],
  );

  const listenCycle = useCallback(
    async (gen: number) => {
      if (turnGen.current !== gen || resolvedRef.current) return;
      const support = speechSupported();
      if (!support.listen) {
        setShowTyped(true);
        setOrb("idle");
        setCaption(silenceLine(cardRef.current, configRef.current.mode));
        return;
      }
      setInterim("");
      setOrb("listening");
      const handle = listenOnce({
        lang: settingsRef.current.lang,
        onInterim: (text) => {
          if (turnGen.current === gen) setInterim(text);
        },
      });
      stopListen.current = handle.stop;
      const result = await handle.done;
      stopListen.current = null;
      if (turnGen.current !== gen) return;
      if (result.blocked) {
        setShowTyped(true);
        setOrb("idle");
        setCaption("Microphone is blocked. Type your sentence below.");
        return;
      }
      const alts = result.alternatives.length > 0 ? result.alternatives : [result.transcript];
      await handleScore(alts, gen);
    },
    [handleScore],
  );

  const bootSession = (cfg: SessionConfig) => {
    cancelSpeech();
    stopListen.current?.();
    const gen = ++turnGen.current;
    const first = pickNextCard({
      startLevel: cfg.level,
      usedIds: new Set(),
      consecutiveMisses: 0,
      consecutiveSentenceHits: 0,
    });
    usedIds.current = new Set([first.id]);
    misses.current = 0;
    sentenceHits.current = 0;
    resultsRef.current = [];
    retryRef.current = false;
    revealedRef.current = false;
    resolvedRef.current = false;
    timerExpired.current = false;
    setConfig(cfg);
    configRef.current = cfg;
    setCard(first);
    setIndex(0);
    setResults([]);
    setSessionHeard(0);
    setSessionCorrect(0);
    setCaption("");
    setInterim("");
    setHintVisible(false);
    setRevealed(false);
    setRetryUsed(false);
    setTyped("");
    setScreen("session");
    bumpStats({ sessions: 1 });
    void beginWord(first, true, gen);
  };

  const hardStopListen = () => {
    stopListen.current?.();
    stopListen.current = null;
  };

  const onOrb = () => {
    if (screen !== "session") return;
    if (orb === "speaking" || orb === "thinking") return;
    if (orb === "listening") {
      hardStopListen();
      return;
    }
    void listenCycle(turnGen.current);
  };

  const onRepeat = async () => {
    if (screen !== "session") return;
    hardStopListen();
    cancelSpeech();
    const gen = ++turnGen.current;
    const line = openingLine(cardRef.current, configRef.current.mode, configRef.current.goal, index === 0);
    const ok = await say(line, gen);
    if (ok) await listenCycle(gen);
  };

  const onHint = async () => {
    setHintVisible(true);
    hardStopListen();
    const gen = turnGen.current;
    const ok = await say(hintLine(cardRef.current), gen);
    if (ok) await listenCycle(gen);
  };

  const onReveal = async () => {
    revealedRef.current = true;
    setRevealed(true);
    hardStopListen();
    const gen = turnGen.current;
    await say(revealLine(cardRef.current), gen);
  };

  const onSave = () => {
    setSaved(saveWord(cardRef.current.word));
  };

  const onNext = async () => {
    if (screen !== "session") return;
    if (resolvedRef.current) return;
    hardStopListen();
    cancelSpeech();
    const gen = ++turnGen.current;
    const res = commitTurn(
      { correct: false, usedInSentence: false, close: false, matched: null, offTopic: false, empty: true },
      "",
    );
    await goNextWord(gen, res);
  };

  const onSubmitTyped = async () => {
    const text = typed.trim();
    if (!text) return;
    setTyped("");
    setInterim(text);
    await handleScore([text], turnGen.current);
  };

  const restart = () => bootSession(config);

  const showWord = config.mode !== "quiz" || revealed;

  return (
    <div className="lexi-shell">
      <div className="lexi-frame" />
      <div className="grain" />
      <div className="vignette" />

      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className="meta tap fixed right-[22px] top-[22px] z-[55] rounded-full border border-brass/30 bg-pine/80 px-3 py-2 text-[10px]"
      >
        Voice
      </button>

      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div key="landing" {...fade}>
            <Landing onStart={() => bootSession(DEFAULT_CONFIG)} onSetup={() => setScreen("setup")} />
          </motion.div>
        )}
        {screen === "setup" && (
          <motion.div key="setup" {...fade}>
            <Setup
              config={config}
              onChange={setConfig}
              onBegin={() => bootSession(config)}
              onBack={() => setScreen("landing")}
            />
          </motion.div>
        )}
        {screen === "session" && (
          <motion.div key="session" {...fade}>
            <SessionView
              card={card}
              index={index}
              total={total}
              mode={config.mode}
              orb={orb}
              caption={caption}
              heard={sessionHeard}
              correct={sessionCorrect}
              savedCount={saved.length}
              secondsLeft={secondsLeft}
              showWord={showWord}
              hintVisible={hintVisible}
              revealed={revealed}
              saved={saved.includes(card.word.toLowerCase())}
              typed={typed}
              showTyped={showTyped}
              interim={interim}
              onOrb={onOrb}
              onRepeat={() => void onRepeat()}
              onHint={() => void onHint()}
              onReveal={() => void onReveal()}
              onSave={onSave}
              onNext={() => void onNext()}
              onTyped={setTyped}
              onSubmitTyped={() => void onSubmitTyped()}
            />
          </motion.div>
        )}
        {screen === "recap" && (
          <motion.div key="recap" {...fade}>
            <Recap results={results} saved={saved} onRestart={restart} onSetup={() => setScreen("setup")} />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 px-6 pb-7 pt-2 text-center text-[11px] leading-relaxed text-sage/75">
        Demo uses free Web Speech + local word bank. Production would use Deepgram + LLM + ElevenLabs + spaced
        repetition.
      </footer>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={updateSettings}
        voices={voices}
      />
    </div>
  );
}

function pause(ms: number) {
  return new Promise((r) => window.setTimeout(r, ms));
}
