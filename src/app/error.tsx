"use client";

export default function ErrorView({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#07110c] px-6 text-center text-[#f3eee4]">
      <p className="text-xs tracking-[0.2em] uppercase text-[#8ea58a]">Something snagged</p>
      <h1 className="mt-4 font-serif text-4xl">Lexi hit a quiet error.</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-[#c4a35a] px-8 py-3 font-semibold text-[#1a1408]"
      >
        Try again
      </button>
    </main>
  );
}
