"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import CloseIcon from './icons/CloseIcon';

interface PdfReaderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

const PdfReaderPanel: React.FC<PdfReaderPanelProps> = ({ isOpen, onClose, pdfUrl, title }) => {
  const [loadError, setLoadError] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: prefersReducedMotion ? 1 : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={prefersReducedMotion ? { x: 0 } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? { x: 0 } : { x: '100%' }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[85vw] lg:w-[70vw] xl:w-[60vw] z-50 flex flex-col bg-white dark:bg-brand-bg-dark shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-white/10 flex-shrink-0 bg-white/90 dark:bg-brand-bg-dark/90 backdrop-blur-lg">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={onClose}
                  className="cursor-pointer p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                  aria-label="Close PDF reader"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-brand-green dark:text-brand-green-dark hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 transition-all duration-200"
                >
                  Open in new tab
                </a>
              </div>
            </div>

            {/* PDF content */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-900/50">
              {loadError ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">PDF cannot be displayed</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">The PDF could not be loaded inline. You can open it in a new tab instead.</p>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-brand text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Open PDF
                  </a>
                </div>
              ) : (
                <iframe
                  src={isOpen ? `${pdfUrl}#toolbar=0&navpanes=0` : undefined}
                  className="w-full h-full"
                  title={title}
                  onError={() => setLoadError(true)}
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
