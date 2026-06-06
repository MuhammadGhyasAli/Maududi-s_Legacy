'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { ChatMessage, MessageSender, Book } from '../../types';
import { getLangProps } from '../../utils/language';

export interface StructuredResponse {
    bookTitle?: string;
    chapter?: string;
    page?: string;
    context?: string;
    remainingText: string;
}

interface ChatMessageListProps {
  messages: (ChatMessage & { image?: string; timestamp?: Date })[];
  isLoading: boolean;
  selectedLanguage: string;
  onNavigateToBook?: (book: Book) => void;
  parseStructuredResponse?: (text: string) => StructuredResponse | null;
  books?: Book[];
  userDisplayName?: string;
  loadingStatus?: string;
}

const renderFormattedMessage = (text: string, onNavigateToBook?: (book: Book) => void, books: Book[] = []): React.ReactNode[] => {
  if (!text) return [];

  if (books.length === 0) {
    const simpleParts: React.ReactNode[] = [];
    let lastIdx = 0;
    let kIdx = 0;
    const simpleRegex = /(\*\*([\s\S]+?)\*\*)|(\*([\s\S]+?)\*)/g;
    let m;
    while ((m = simpleRegex.exec(text)) !== null) {
      if (m.index > lastIdx) {
        simpleParts.push(<React.Fragment key={`t-${kIdx++}`}>{text.substring(lastIdx, m.index)}</React.Fragment>);
      }
      if (m[2]) {
        simpleParts.push(<strong key={`b-${kIdx++}`} className="font-semibold">{m[2]}</strong>);
      } else if (m[4]) {
        simpleParts.push(<em key={`i-${kIdx++}`}>{m[4]}</em>);
      }
      lastIdx = simpleRegex.lastIndex;
    }
    if (lastIdx < text.length) {
      simpleParts.push(<React.Fragment key={`t-${kIdx++}`}>{text.substring(lastIdx)}</React.Fragment>);
    }
    return simpleParts;
  }

  const titles = books.map(book => book.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${titles})|(\\*\\*([\\s\\S]+?)\\*\\*)|(\\*([\\s\\S]+?)\\*)`, 'g');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let keyIndex = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
          parts.push(<React.Fragment key={`text-${keyIndex++}`}>{text.substring(lastIndex, match.index)}</React.Fragment>);
      }

      const bookTitle = match[1];
      const boldContent = match[3];
      const italicContent = match[5];

      if (bookTitle) {
          const book = books.find(b => b.title === bookTitle);
          if (book && onNavigateToBook) {
              parts.push(
                  <button key={`book-${keyIndex++}`} className="cursor-pointer font-semibold underline text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => onNavigateToBook(book)}>
                      {book.title}
                  </button>
              );
          } else {
              parts.push(<React.Fragment key={`text-${keyIndex++}`}>{bookTitle}</React.Fragment>);
          }
      } else if (boldContent) {
          parts.push(<strong key={`bold-${keyIndex++}`} className="font-semibold">{renderFormattedMessage(boldContent, onNavigateToBook, books)}</strong>);
      } else if (italicContent) {
          parts.push(<em key={`italic-${keyIndex++}`}>{renderFormattedMessage(italicContent, onNavigateToBook, books)}</em>);
      }

      lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
      parts.push(<React.Fragment key={`text-${keyIndex++}`}>{text.substring(lastIndex)}</React.Fragment>);
  }

  return parts;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessageList: React.FC<ChatMessageListProps> = ({ 
  messages, 
  isLoading, 
  loadingStatus,
  selectedLanguage, 
  onNavigateToBook,
  parseStructuredResponse,
  books = [],
  userDisplayName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isAtBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);

  const checkIfAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    const threshold = 200;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowScrollBtn(false);
    setUnreadCount(0);
    isAtBottomRef.current = true;
  }, []);

  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom();
    isAtBottomRef.current = atBottom;
    setShowScrollBtn(!atBottom);
    if (atBottom) {
      setUnreadCount(0);
    } else {
      const prevLen = prevMessagesLengthRef.current;
      const currentLen = messages.length;
      if (currentLen > prevLen) {
        setUnreadCount(prev => prev + (currentLen - prevLen));
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [checkIfAtBottom, messages.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom('auto');
    }
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto relative" role="log" aria-live="polite" aria-label="Chat messages">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8 lg:py-10 space-y-4 sm:space-y-8 lg:space-y-10 mt-2 sm:mt-0">
        {messages.map((msg, index) => {
          const { dir, className } = getLangProps(msg.text, selectedLanguage);
          const isUser = msg.sender === MessageSender.USER;
          const timestamp = msg.timestamp || new Date();

          return (
            <div key={index} className="flex gap-2 sm:gap-4 w-full">
              <div className="flex-none mt-0.5">
                {isUser ? (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-xs sm:text-sm">
                     {userDisplayName ? userDisplayName[0].toUpperCase() : 'U'}
                  </div>
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                    {isUser ? 'You' : 'AI Assistant'}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                    {formatTime(timestamp)}
                  </span>
                </div>
                
                {isUser ? (
                  <div className={`whitespace-pre-wrap leading-relaxed text-[14px] sm:text-[15px] text-gray-850 dark:text-gray-250 p-3 sm:p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 shadow-sm ${className}`} dir={dir}>
                    {msg.image && <Image src={msg.image} alt="User upload" width={320} height={240} className="max-w-[200px] sm:max-w-xs rounded-xl mb-3 shadow-sm border border-white/20" />}
                    {msg.text}
                  </div>
                ) : (() => {
                  const structuredDetails = parseStructuredResponse ? parseStructuredResponse(msg.text) : null;
                  return (
                    <div className="w-full bg-white/60 dark:bg-brand-card-dark/40 border border-gray-100 dark:border-white/[0.06] p-3 sm:p-5 rounded-2xl shadow-sm">
                      {structuredDetails ? (
                        <div className="space-y-3 sm:space-y-4" dir={dir}>
                          <div className="bg-emerald-500/5 p-3 sm:p-4 rounded-xl border border-emerald-500/10">
                            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-green dark:text-brand-green-dark mb-2 sm:mb-2.5 flex items-center gap-1.5 sm:gap-2">
                              <span className="text-xs" aria-hidden="true">📚</span> Context Reference
                            </p>
                            <div className="space-y-1.5 text-[12px] sm:text-[13px] font-medium">
                              {structuredDetails.bookTitle && (
                                <div className="text-gray-650 dark:text-gray-350">
                                  <strong className="text-gray-900 dark:text-gray-100">Book:</strong>{' '}
                                  <span className={className}>{renderFormattedMessage(structuredDetails.bookTitle, onNavigateToBook, books)}</span>
                                </div>
                              )}
                              {structuredDetails.chapter && (
                                <div className="text-gray-650 dark:text-gray-350">
                                  <strong className="text-gray-900 dark:text-gray-100">Chapter:</strong>{' '}
                                  <span className={className}>{renderFormattedMessage(structuredDetails.chapter, onNavigateToBook, books)}</span>
                                </div>
                              )}
                              {structuredDetails.page && (
                                <div className="text-gray-650 dark:text-gray-350">
                                  <strong className="text-gray-900 dark:text-gray-100">Page:</strong>{' '}
                                  <span className={className}>{renderFormattedMessage(structuredDetails.page, onNavigateToBook, books)}</span>
                                </div>
                              )}
                            </div>
                            {structuredDetails.context && (
                              <blockquote className={`mt-2.5 sm:mt-3 pl-2.5 sm:pl-3.5 border-l-2 border-brand-green/35 dark:border-brand-green-dark/35 text-gray-600 dark:text-gray-400 text-[11px] sm:text-xs italic ${className}`}>
                                {renderFormattedMessage(structuredDetails.context, onNavigateToBook, books)}
                              </blockquote>
                            )}
                          </div>
                          {structuredDetails.remainingText && (
                            <div className={`whitespace-pre-wrap leading-relaxed text-[14px] sm:text-[15px] text-gray-800 dark:text-gray-200 ${className}`}>
                              {renderFormattedMessage(structuredDetails.remainingText, onNavigateToBook, books)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`whitespace-pre-wrap leading-relaxed text-[14px] sm:text-[15px] text-gray-800 dark:text-gray-200 ${className}`} dir={dir}>
                          {renderFormattedMessage(msg.text, onNavigateToBook, books)}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4 w-full">
              <div className="flex-none mt-0.5">
                <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm opacity-50">
                  <svg className="w-4 h-4 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 pt-1">
                 <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 opacity-50">AI Assistant</span>
                </div>
                 <div className="flex items-center gap-2 ml-1 mt-1">
                  <div className="flex space-x-1.5">
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse-soft"></span>
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse-soft" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse-soft" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                  {loadingStatus && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 animate-pulse">{loadingStatus}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-8" />
      </div>

      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="cursor-pointer fixed bottom-28 right-8 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark hover:shadow-xl transition-all duration-200"
          aria-label="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-brand-green text-white text-[10px] font-bold shadow-md">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default ChatMessageList;
