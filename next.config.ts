import type { NextConfig } from "next";

const staticExport = process.env.EXPORT === "1";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(staticExport
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
