import Link from "next/link";

export default function NotFound() {
  return (
    <main className="lexi-shell flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="meta">404</p>
      <h1 className="display mt-4 text-5xl">This page is quiet.</h1>
      <Link href="/" className="btn-brass tap mt-8 rounded-full px-8 py-4 font-semibold">
        Back to Lexi
      </Link>
    </main>
  );
}
