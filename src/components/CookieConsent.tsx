"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CloseIcon from "./icons/CloseIcon";
import CheckIcon from "./icons/CheckIcon";
import ChevronDownIcon from "./icons/ChevronDownIcon";

const CONSENT_KEY = "cookie_consent";

type ConsentStatus = "accepted" | "declined" | null;

const storageItems = [
  { key: "auth_token (cookie)", desc: "JWT token for login session (httpOnly cookie)", expires: "7 days", category: "Essential" },
  { key: "theme", desc: "UI theme preference (light/dark/system)", expires: "Persistent", category: "Essential" },
  { key: "maududi_cache_*", desc: "Cached API responses for performance", expires: "30 minutes", category: "Performance" },
  { key: "cookie_consent", desc: "Your consent preference", expires: "1 year", category: "Essential" },
];

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentStatus;
    if (!stored) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-20 right-4 left-4 lg:bottom-4 lg:right-4 lg:left-auto lg:w-[420px] z-50 animate-slide-up"
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-desc"
    >
      <div className="bg-white dark:bg-brand-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p id="cookie-consent-desc" className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              We use an <strong>httpOnly cookie</strong> for login sessions and <strong>localStorage</strong> for preferences. No tracking, advertising, or analytics cookies are used.
            </p>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline mb-3"
              aria-expanded={expanded}
            >
              <span>Show details</span>
              <ChevronDownIcon className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {expanded && (
              <div className="mb-3 text-xs space-y-1.5 border-t border-gray-200 dark:border-gray-700 pt-3">
                {storageItems.map((item) => (
                  <div key={item.key} className="flex gap-2 items-center">
                    <code className="font-mono text-emerald-600 dark:text-emerald-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded min-w-[110px] text-[10px]">
                      {item.key}
                    </code>
                    <span className="text-gray-600 dark:text-gray-400 flex-1">{item.desc}</span>
                    <span className="text-gray-400 dark:text-gray-500 whitespace-nowrap">{item.expires}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      {item.category}
                    </span>
                  </div>
                ))}
                <p className="text-gray-500 dark:text-gray-400 pt-2">
                  No third-party cookies — no Google Analytics, Meta Pixel, or advertising trackers.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Decline
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              <Link href="/privacy" className="underline hover:text-emerald-600">Privacy Policy</Link>
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}