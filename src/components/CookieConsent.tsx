"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CloseIcon from "./icons/CloseIcon";
import CheckIcon from "./icons/CheckIcon";

const CONSENT_KEY = "cookie_consent";

type ConsentStatus = "accepted" | "declined" | null;

export default function CookieConsent() {
  const [show, setShow] = useState(false);

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
      className="fixed bottom-4 right-4 left-4 md:right-4 md:left-auto md:w-[400px] z-50 animate-slide-up"
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
              We use essential localStorage to store your authentication token, theme preference, and cached data for performance.
              No tracking or advertising cookies are used.
            </p>
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