"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from './icons/CloseIcon';

const shortcuts = [
  { key: '/', description: 'Focus search bar' },
  { key: '⌘K', description: 'Quick search all books' },
  { key: 'n', description: 'Next page' },
  { key: 'p', description: 'Previous page' },
  { key: 't', description: 'Toggle theme' },
  { key: '?', description: 'Open shortcuts' },
  { key: 'Esc', description: 'Close sidebar / modal' },
];

const ShortcutsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === '?' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(o => !o);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto bg-white dark:bg-brand-card-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                  aria-label="Close"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {shortcuts.map(s => (
                  <div key={s.key} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{s.description}</span>
                    <kbd className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 min-w-[28px] justify-center">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-5">
                Press <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">?</kbd> to toggle this modal
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShortcutsModal;
