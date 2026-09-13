import type { Metadata, Viewport } from "next";
import { Boot } from "@/components/Boot";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lexi — learn vocabulary by speaking",
  description:
    "A three-minute voice vocabulary tutor. One English word, out loud, then you speak it back.",
  applicationName: "Lexi",
  authors: [{ name: "Lexi" }],
  keywords: ["vocabulary", "English", "voice tutor", "speaking", "IELTS", "pronunciation"],
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#07110c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const critical = `
html,body{background:#07110c;color:#f3eee4;margin:0;min-height:100%;}
body{font-family:"Outfit","Avenir Next","Segoe UI",sans-serif;}
.lexi-shell{min-height:100dvh;background:#07110c;color:#f3eee4;}
.display{font-family:"Cormorant Garamond",Georgia,serif;letter-spacing:-0.03em;line-height:0.92;}
.btn-brass{background:linear-gradient(180deg,#d4b56a 0%,#c4a35a 45%,#9a7a38 100%);color:#1a1408;border:0;border-radius:999px;font-weight:600;}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: critical }} />
        <link rel="stylesheet" href="/lexi.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Boot />
        {children}
      </body>
    </html>
  );
}
