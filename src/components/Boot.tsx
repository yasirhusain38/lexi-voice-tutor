"use client";

import { useEffect } from "react";

function isBenignRejection(reason: unknown): boolean {
  if (!reason) return true;
  if (typeof Event !== "undefined" && reason instanceof Event) return true;
  if (typeof reason === "object" && reason !== null && "type" in reason && "target" in reason) return true;
  return false;
}

export function Boot() {
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      if (isBenignRejection(event.reason)) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, []);
  return null;
}
