"use client";

import { useEffect, useRef } from "react";

const DEFAULT_FAVICON = "/logo.png";

function emojiFavicon(emoji: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export { emojiFavicon };

export function useDocumentMeta(title: string, favicon?: string) {
  const prevTitle = useRef("");

  useEffect(() => {
    prevTitle.current = document.title;
    const full = `${title} | Maududi's Legacy`;
    document.title = full;
    return () => {
      document.title = prevTitle.current;
    };
  }, [title]);

  useEffect(() => {
    const href = favicon || DEFAULT_FAVICON;
    const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']") ||
      document.querySelector<HTMLLinkElement>("link[rel~='shortcut icon']");
    if (link) {
      link.href = href;
    } else {
      const el = document.createElement("link");
      el.rel = "icon";
      el.href = href;
      document.head.appendChild(el);
    }
  }, [favicon]);
}
