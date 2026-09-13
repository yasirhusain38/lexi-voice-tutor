# Lexi — learn vocabulary by speaking

A production-quality, mobile-first voice vocabulary tutor. One English word at a time, out loud, with immediate spoken feedback. No login. No paid API keys.

Open it in **Chrome or Edge over HTTPS**, tap **Start 3-minute session**, allow the microphone, and complete a real voice loop.

## Demo script (8 words)

After Lexi says *resilient*:

> I stayed resilient after a tough job interview.

That is enough. You should hear one line of feedback, then the next word.

## Requirements

- **Chrome or Edge** (Web Speech: `webkitSpeechRecognition` + `speechSynthesis`)
- **HTTPS** (or `localhost`) — the microphone is blocked on insecure origins
- A microphone, or the typed fallback if the mic is blocked
- Works at **390px** wide. Best on a phone in Chrome.

Safari / iOS will fall back to typing. Firefox has limited speech recognition.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Localhost counts as a secure origin, so the mic works.

```bash
npm run build
npx serve out
```

## Deploy (public URL)

No server required at runtime, no env vars, no API keys.

```bash
npm run build
npx serve out
```

To emit a static `out/` folder for Netlify Drop or GitHub Pages, build with:

```bash
$env:EXPORT="1"; npx next build
```

Or keep using Vercel, which builds this Next.js app directly.

### Netlify Drop

1. `npm run build`
2. Drag the `out` folder onto [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Copy the `*.netlify.app` URL

Or from the CLI:

```bash
npm run build
npx netlify deploy --prod --dir=out
```

### Vercel

```bash
npm i -g vercel
npx vercel --prod
```

Or import the GitHub repo in the Vercel dashboard. Output directory is `out`.

### GitHub Pages

1. `npm run build`
2. Publish the `out` folder (Actions or the `gh-pages` branch)

If the site is served from `https://USER.github.io/REPO/` (not a custom domain), set `basePath: "/REPO"` in `next.config.ts` before building.

## What v1 uses

| Piece | Now | Production |
| --- | --- | --- |
| Speech in | Web Speech API | Deepgram |
| Tutor copy | Local word bank + rules | LLM coach |
| Speech out | `speechSynthesis` | ElevenLabs |
| Memory | `localStorage` | Spaced repetition |

Optional: open **Voice** in the corner, paste an OpenAI-compatible key, and Lexi will ask that model for the one-sentence feedback. The default path never needs a key.

## Session

1. Landing — **Start 3-minute session** (defaults: Intermediate, Daily English, Teach me)
2. Optional setup — level, goal, mode (10-second auto-begin)
3. Six words. First intermediate word is **resilient**
4. Recap — score, words learned, one review word, restart

Modes: Teach me · Quiz me · Use it in a sentence · Pronunciation drill.

Scoring is humble on purpose: lowercase transcript, accept the word or a close form (`resilience` counts for `resilient`). One retry, then reveal. Accents are not policed.

## Word bank

24 words, three levels (beginner / intermediate / advanced). Each card has a short definition, a city/work/study example, allowed variants, and a hint.
