"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOUR_KEY = 'ml_onboarded';

const steps = [
  {
    title: 'Search with  /  key',
    body: 'Press the forward slash key (/) from anywhere to instantly focus the search bar and find books by title or topic.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
    ),
  },
  {
    title: 'Browse by category',
    body: 'Use the sidebar to explore books by category — Tafsir, Politics, Theology, and more.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
  },
  {
    title: 'Chat with AI',
    body: 'Select any book and click "Chat with AI" to ask questions, get summaries, and explore the text interactively.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    title: 'Smart suggestions',
    body: 'The AI suggests follow-up questions and related books based on your topics of interest. Your chat history syncs across devices.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
];

const OnboardingTour: React.FC = () => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Esc to dismiss
  useEffect(() => {
    if (!active) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [active]);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, '1');
    setActive(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  // Focus first button when modal opens
  useEffect(() => {
    if (active) {
      modalRef.current?.focus();
    }
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={dismiss}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              ref={modalRef}
              key={step}
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -10 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto bg-white dark:bg-brand-card-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-6 max-w-sm w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tour-title"
              tabIndex={-1}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 mx-auto">
                {steps[step].icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                {steps[step].title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-6">
                {steps[step].body}
              </p>
              <div className="flex items-center justify-center gap-1.5 mb-5">
                {steps.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === step ? 'bg-brand-green w-4' : 'bg-gray-300 dark:bg-gray-600'}`} />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={dismiss}
                  className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 transition-all duration-200"
                >
                  Skip all
                </button>
                <button
                  onClick={next}
                  className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark transition-colors duration-200"
                >
                  {step < steps.length - 1 ? 'Next' : 'Get started'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
