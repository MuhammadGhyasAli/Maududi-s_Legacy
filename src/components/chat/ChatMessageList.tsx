import React, { useRef, useEffect } from 'react';
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
  messages: (ChatMessage & { image?: string })[];
  isLoading: boolean;
  selectedLanguage: string;
  onNavigateToBook?: (book: Book) => void;
  parseStructuredResponse?: (text: string) => StructuredResponse | null;
  books?: Book[];
  userDisplayName?: string;
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

const ChatMessageList: React.FC<ChatMessageListProps> = ({ 
  messages, 
  isLoading, 
  selectedLanguage, 
  onNavigateToBook,
  parseStructuredResponse,
  books = [],
  userDisplayName,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 mt-12">
        {messages.map((msg, index) => {
          const { dir, className } = getLangProps(msg.text, selectedLanguage);
          const isUser = msg.sender === MessageSender.USER;

          return (
            <div key={index} className="flex gap-4 w-full">
              <div className="flex-none mt-0.5">
                {isUser ? (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm">
                     {userDisplayName ? userDisplayName[0].toUpperCase() : 'U'}
                  </div>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
                     <span className="text-sm">✨</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {isUser ? 'You' : 'AI Assistant'}
                </div>
                
                {isUser ? (
                  <div className={`whitespace-pre-wrap leading-relaxed text-[16px] text-gray-800 dark:text-gray-200 ${className}`} dir={dir}>
                    {msg.image && <Image src={msg.image} alt="User upload" width={320} height={240} className="max-w-xs rounded-xl mb-3 shadow-sm border border-white/20" />}
                    {msg.text}
                  </div>
                ) : (() => {
                  const structuredDetails = parseStructuredResponse ? parseStructuredResponse(msg.text) : null;
                  return (
                    <div className="w-full">
                      {structuredDetails ? (
                        <div className="space-y-4" dir={dir}>
                          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                            <p className="text-xs font-bold uppercase tracking-wider text-brand-green dark:text-brand-green-dark mb-3 flex items-center gap-2">
                              <span className="text-xs" aria-hidden="true">📚</span> Context Found
                            </p>
                            <div className="space-y-2 text-[14px]">
                              {structuredDetails.bookTitle && (
                                <div>
                                  <strong className="text-gray-900 dark:text-gray-100">Book:</strong>{' '}
                                  <span className={className}>{renderFormattedMessage(structuredDetails.bookTitle, onNavigateToBook, books)}</span>
                                </div>
                              )}
                              {structuredDetails.chapter && (
                                <div>
                                  <strong className="text-gray-900 dark:text-gray-100">Chapter:</strong>{' '}
                                  <span className={className}>{renderFormattedMessage(structuredDetails.chapter, onNavigateToBook, books)}</span>
                                </div>
                              )}
                              {structuredDetails.page && (
                                <div>
                                  <strong className="text-gray-900 dark:text-gray-100">Page:</strong>{' '}
                                  <span className={className}>{renderFormattedMessage(structuredDetails.page, onNavigateToBook, books)}</span>
                                </div>
                              )}
                            </div>
                            {structuredDetails.context && (
                              <blockquote className={`mt-4 pl-4 border-l-2 border-brand-green/40 dark:border-brand-green-dark/40 text-gray-700 dark:text-gray-300 italic ${className}`}>
                                {renderFormattedMessage(structuredDetails.context, onNavigateToBook, books)}
                              </blockquote>
                            )}
                          </div>
                          {structuredDetails.remainingText && (
                            <div className={`whitespace-pre-wrap leading-relaxed text-[16px] text-gray-800 dark:text-gray-200 ${className}`}>
                              {renderFormattedMessage(structuredDetails.remainingText, onNavigateToBook, books)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`whitespace-pre-wrap leading-relaxed text-[16px] text-gray-800 dark:text-gray-200 ${className}`} dir={dir}>
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
                   <span className="text-sm">✨</span>
                </div>
              </div>
              <div className="flex-1 pt-1">
                 <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2 opacity-50">
                  AI Assistant
                </div>
                 <div className="flex space-x-1.5 ml-1 mt-1">
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse-soft"></span>
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse-soft" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse-soft" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-8" />
      </div>
    </div>
  );
};

export default ChatMessageList;
