"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from './icons/CloseIcon';

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

interface PdfReaderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

const PdfReaderPanel: React.FC<PdfReaderPanelProps> = ({ isOpen, onClose, pdfUrl, title }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageInput, setPageInput] = useState('');
  const errorHandledRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setPageNumber(1);
      setScale(1);
      setLoading(true);
      setPageInput('');
      errorHandledRef.current = false;
    }
  }, [isOpen, pdfUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setPageNumber(p => Math.min(numPages || 1, p + 1));
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setPageNumber(p => Math.max(1, p - 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, numPages]);

  const onDocumentLoadError = () => {
    if (errorHandledRef.current) return;
    errorHandledRef.current = true;
    setLoading(false);
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const goToPrevPage = () => setPageNumber(p => Math.max(1, p - 1));
  const goToNextPage = () => setPageNumber(p => Math.min(numPages, p + 1));

  const handlePageJump = () => {
    if (pageInput) {
      const p = parseInt(pageInput, 10);
      if (p >= 1 && p <= numPages) setPageNumber(p);
      setPageInput('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex flex-col bg-neutral-950"
        >
          {/* Top toolbar */}
          <div className="flex items-center justify-between px-3 sm:px-4 h-12 sm:h-14 bg-white/[0.04] backdrop-blur-xl border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button onClick={onClose} className="cursor-pointer p-1.5 sm:p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all" aria-label="Close reader">
                <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h2 className="text-xs sm:text-sm font-medium text-white/70 truncate max-w-[160px] sm:max-w-xs md:max-w-md">{title}</h2>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {numPages > 0 && (
                <div className="flex items-center gap-1 sm:gap-1.5 mr-1 sm:mr-2">
                  <button onClick={goToPrevPage} disabled={pageNumber <= 1}
                    className="cursor-pointer p-1 sm:p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={pageInput}
                      onChange={e => setPageInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handlePageJump(); }}
                      onBlur={handlePageJump}
                      className="w-8 sm:w-10 bg-transparent text-center text-xs sm:text-sm text-white/70 tabular-nums outline-none border-b border-white/20 focus:border-white/60 transition-colors"
                      placeholder="Go to page"
                    />
                    <span className="text-xs text-white/40 tabular-nums">/ {numPages}</span>
                  </div>
                  <button onClick={goToNextPage} disabled={pageNumber >= numPages}
                    className="cursor-pointer p-1 sm:p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
              {numPages > 0 && (
                <div className="hidden sm:flex items-center gap-1 mr-2">
                  <button onClick={() => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)))} disabled={scale <= 0.5}
                    className="cursor-pointer p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                  </button>
                  <span className="text-xs text-white/50 tabular-nums w-9 text-center">{Math.round(scale * 100)}%</span>
                  <button onClick={() => setScale(s => Math.min(2, +(s + 0.25).toFixed(2)))} disabled={scale >= 2}
                    className="cursor-pointer p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              )}
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                className="hidden sm:inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/10 border border-white/10 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Open
              </a>
            </div>
          </div>

          {/* PDF content */}
          <div className="flex-1 overflow-auto bg-neutral-900/50">
            {loading && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
                  <p className="text-sm text-white/40">Loading document...</p>
                </div>
              </div>
            )}

            <div className={`flex flex-col items-center py-8 sm:py-12 px-4 ${loading ? 'hidden' : ''}`}>
              <div className="w-full max-w-4xl">
                <PdfViewer
                  pdfUrl={pdfUrl}
                  pageNumber={pageNumber}
                  scale={scale}
                  onLoadSuccess={(pages) => { setNumPages(pages); setLoading(false); }}
                  onLoadError={onDocumentLoadError}
                />
              </div>
            </div>
          </div>

          {/* Mobile bottom bar */}
          {numPages > 0 && (
            <div className="sm:hidden flex items-center justify-between px-4 h-12 bg-white/[0.04] border-t border-white/[0.06]">
              <button onClick={goToPrevPage} disabled={pageNumber <= 1}
                className="cursor-pointer flex items-center gap-1.5 text-xs text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Prev
              </button>
              <span className="text-xs text-white/50 tabular-nums">{pageNumber} / {numPages}</span>
              <button onClick={goToNextPage} disabled={pageNumber >= numPages}
                className="cursor-pointer flex items-center gap-1.5 text-xs text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PdfReaderPanel;
