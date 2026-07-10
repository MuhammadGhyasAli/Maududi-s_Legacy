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

export interface SuggestedQuestion {
  question: string;
  category: string;
}

export const DEFAULT_SUGGESTIONS: SuggestedQuestion[] = [
  { question: "What are the key themes of this book?", category: "Overview" },
  { question: "Explain the main argument in the introduction", category: "Deep dive" },
  { question: "How does this relate to modern issues?", category: "Application" },
  { question: "Summarize the first chapter", category: "Summary" },
];

interface ChatMessageListProps {
  messages: (ChatMessage & { image?: string; timestamp?: Date })[];
  isLoading: boolean;
  selectedLanguage: string;
  onNavigateToBook?: (book: Book) => void;
  parseStructuredResponse?: (text: string) => StructuredResponse | null;
  books?: Book[];
  userDisplayName?: string;
  loadingStatus?: string;
  followUpQuestions?: string[];
  onFollowUpClick?: (question: string) => void;
  onBranchFromMessage?: (messageIndex: number) => void;
  showSuggestions?: boolean;
  onSuggestionClick?: (question: string) => void;
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

function renderStructuredView(
  sd: StructuredResponse,
  dir: string,
  className: string,
  onNavigateToBook?: (book: Book) => void,
  books: Book[] = [],
) {
  return (
    <div className="space-y-3 sm:space-y-4" dir={dir}>
      <div className="bg-emerald-500/5 p-3 sm:p-4 rounded-xl border border-emerald-500/10">
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-green dark:text-brand-green-dark mb-2 sm:mb-2.5 flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs" aria-hidden="true">📚</span> Context Reference
        </p>
        <div className="space-y-1.5 text-[12px] sm:text-[13px] font-medium">
          {sd.bookTitle && (
            <div className="text-gray-650 dark:text-gray-350">
              <strong className="text-gray-900 dark:text-gray-100">Book:</strong>{' '}
              <span className={className}>{renderFormattedMessage(sd.bookTitle, onNavigateToBook, books)}</span>
            </div>
          )}
          {sd.chapter && (
            <div className="text-gray-650 dark:text-gray-350">
              <strong className="text-gray-900 dark:text-gray-100">Chapter:</strong>{' '}
              <span className={className}>{renderFormattedMessage(sd.chapter, onNavigateToBook, books)}</span>
            </div>
          )}
          {sd.page && (
            <div className="text-gray-650 dark:text-gray-350">
              <strong className="text-gray-900 dark:text-gray-100">Page:</strong>{' '}
              <span className={className}>{renderFormattedMessage(sd.page, onNavigateToBook, books)}</span>
            </div>
          )}
        </div>
        {sd.context && (
          <blockquote className={`mt-2.5 sm:mt-3 pl-2.5 sm:pl-3.5 border-l-2 border-brand-green/35 dark:border-brand-green-dark/35 text-gray-600 dark:text-gray-400 text-[11px] sm:text-xs italic ${className}`}>
            {renderFormattedMessage(sd.context, onNavigateToBook, books)}
          </blockquote>
        )}
      </div>
      {sd.remainingText && (
        <div className={`whitespace-pre-wrap leading-relaxed text-[14px] sm:text-[15px] text-gray-800 dark:text-gray-200 ${className}`}>
          {renderFormattedMessage(sd.remainingText, onNavigateToBook, books)}
        </div>
      )}
    </div>
  );
}

function renderAIMessage(
  text: string,
  className: string,
  dir: string,
  onNavigateToBook?: (book: Book) => void,
  parseStructuredResponse?: (text: string) => StructuredResponse | null,
  books: Book[] = [],
) {
  const sd = parseStructuredResponse ? parseStructuredResponse(text) : null;
  if (sd) {
    return (
      <div className="w-full bg-white dark:bg-brand-card-dark border border-gray-200 dark:border-gray-700/50 p-3 sm:p-5 rounded-2xl shadow-sm">
        {renderStructuredView(sd, dir, className, onNavigateToBook, books)}
      </div>
    );
  }
  return (
    <div className="w-full bg-white dark:bg-brand-card-dark border border-gray-200 dark:border-gray-700/50 p-3 sm:p-5 rounded-2xl shadow-sm">
      <div className={`whitespace-pre-wrap leading-relaxed text-[14px] sm:text-[15px] text-gray-800 dark:text-gray-200 ${className}`} dir={dir}>
        {renderFormattedMessage(text, onNavigateToBook, books)}
      </div>
    </div>
  );
}

function renderBranchButton(onBranchFromMessage: ((index: number) => void) | undefined, index: number, isLastMessage: boolean) {
  if (!onBranchFromMessage || isLastMessage) return null;
  return (
    <button
      onClick={() => onBranchFromMessage(index)}
      className="opacity-0 group-hover:opacity-100 mt-1 ml-1 cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-gray-400 hover:text-brand-green hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
      title="Branch conversation from here"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
      Branch
    </button>
  );
}

function renderMessage(
  msg: ChatMessage & { image?: string; timestamp?: Date },
  isUser: boolean,
  selectedLanguage: string,
  onNavigateToBook?: (book: Book) => void,
  parseStructuredResponse?: (text: string) => StructuredResponse | null,
  books: Book[] = [],
  userDisplayName?: string,
  className?: string,
  dir?: string,
  timestamp?: Date,
  index?: number,
  totalMessages?: number,
  onBranchFromMessage?: (messageIndex: number) => void,
) {
  const { dir: msgDir, className: msgClassName } = getLangProps(msg.text, selectedLanguage);
  const c = className || msgClassName;
  const d = dir || msgDir;
  const ts = timestamp || msg.timestamp || new Date();
  const isLast = index !== undefined && totalMessages !== undefined && index === totalMessages - 1;

  return (
    <div className="flex gap-2 sm:gap-4 w-full group">
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
            {formatTime(ts)}
          </span>
        </div>

        {isUser ? (
          <div className={`whitespace-pre-wrap leading-relaxed text-[14px] sm:text-[15px] text-gray-900 dark:text-gray-100 p-3 sm:p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300/40 dark:border-emerald-700/40 shadow-sm ${c}`} dir={d}>
            {msg.image && <Image src={msg.image} alt="User upload" width={320} height={240} className="max-w-[200px] sm:max-w-xs rounded-xl mb-3 shadow-sm border border-white/20" />}
            {msg.text}
          </div>
        ) : (
          <>
            {renderAIMessage(msg.text, c, d, onNavigateToBook, parseStructuredResponse, books)}
            {renderBranchButton(onBranchFromMessage, index ?? 0, isLast)}
          </>
        )}
      </div>
    </div>
  );
}

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
  followUpQuestions,
  onFollowUpClick,
  onBranchFromMessage,
  showSuggestions,
  onSuggestionClick,
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
        {showSuggestions && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 text-center">Try asking:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick?.(s.question)}
                  className="cursor-pointer text-left p-3 sm:p-4 rounded-xl bg-white dark:bg-brand-card-dark border border-gray-200 dark:border-gray-700/50 hover:border-brand-green/40 dark:hover:border-brand-green-dark/40 hover:shadow-md transition-all duration-200 group"
                >
                  <span className="text-[10px] font-medium text-brand-green/60 dark:text-brand-green-dark/60 uppercase tracking-wider">{s.category}</span>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 mt-1 transition-colors">
                    {s.question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, index) => {
          const isUser = msg.sender === MessageSender.USER;
          const timestamp = msg.timestamp || new Date();
          return renderMessage(
            msg, isUser, selectedLanguage, onNavigateToBook, parseStructuredResponse,
            books, userDisplayName, undefined, undefined, timestamp, index, messages.length, onBranchFromMessage,
          );
        })}

        {followUpQuestions && followUpQuestions.length > 0 && !isLoading && (
          <div className="pl-10 sm:pl-12">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">Suggested follow-ups:</p>
            <div className="flex flex-wrap gap-2">
              {followUpQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUpClick?.(q)}
                  className="cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-brand-card-dark border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-brand-green/50 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-brand-green/5 transition-all duration-200 shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

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