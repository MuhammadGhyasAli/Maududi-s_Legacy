'use client';

import React, { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="
        fixed bottom-6 left-6 z-50
        w-10 h-10 rounded-full
        bg-white dark:bg-brand-card-dark
        border border-gray-200 dark:border-white/10
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        text-gray-500 dark:text-gray-400
        hover:text-brand-green dark:hover:text-brand-green-dark
        hover:border-emerald-200 dark:hover:border-emerald-800
        transition-all duration-200 motion-reduce:transition-none
        animate-fade-in-up motion-reduce:animate-none
      "
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
