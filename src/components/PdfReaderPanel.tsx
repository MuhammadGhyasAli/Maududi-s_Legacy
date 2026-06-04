"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from './icons/CloseIcon';

interface PdfReaderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

const PdfReaderPanel: React.FC<PdfReaderPanelProps> = ({ isOpen, onClose, pdfUrl, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(false);
      timeoutRef.current = setTimeout(() => {
        setError(true);
        setLoading(false);
      }, 10000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen, pdfUrl]);

  const handleLoad = () => {
    setLoading(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-4 sm:inset-6 md:inset-8 z-50 flex flex-col bg-white dark:bg-brand-bg-dark rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg-dark flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={onClose}
                  className="cursor-pointer p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                  aria-label="Close PDF reader"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[200px] sm:max-w-md">{title}</h2>
              </div>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-green dark:text-brand-green-dark hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Open
              </a>
            </div>

            {/* PDF content */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-900/50 relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900/50 z-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-emerald-500 animate-spin" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">Loading PDF...</p>
                  </div>
                </div>
              )}

              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">PDF cannot be previewed</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">This PDF cannot be displayed inline due to browser restrictions. Open it in a new tab to read.</p>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-brand text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Open PDF
                  </a>
                </div>
              ) : (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title={title}
                  onLoad={handleLoad}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PdfReaderPanel;
