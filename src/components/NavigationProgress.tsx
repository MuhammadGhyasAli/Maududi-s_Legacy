"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPath = useRef(pathname);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const prev = prevPath.current;
    prevPath.current = pathname;

    if (prev && prev !== pathname) {
      setLoading(true);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setLoading(false), 400);
    }

    return () => window.clearTimeout(timerRef.current);
  }, [pathname]);

  return (
    <div
      className="fixed top-0 left-0 z-[99999] h-[3px] pointer-events-none"
      style={{ width: loading ? "100%" : "0%", transition: loading ? "width 0.3s ease" : "width 0.15s ease 0.1s" }}
    >
      <div className="h-full w-full bg-gradient-to-r from-brand-green via-brand-blue to-brand-green bg-[length:200%_100%] animate-shimmer" />
    </div>
  );
}
