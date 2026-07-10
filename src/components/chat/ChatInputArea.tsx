'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import SendIcon from '../icons/SendIcon';
import Spinner from '../icons/Spinner';
import PaperclipIcon from '../icons/PaperclipIcon';
import CloseIcon from '../icons/CloseIcon';
import { getLangProps } from '../../utils/language';

interface ChatInputAreaProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  selectedLanguage: string;
  languages: string[];
  onSelectLanguage: (lang: string) => void;
  onSendMessage: () => void;
  imageFile?: File | null;
  imagePreview?: string | null;
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  footerText?: string;
  restrictedLanguages?: string[];
  onRestrictedLanguageClick?: (lang: string) => void;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  input,
  setInput,
  isLoading,
  error,
  selectedLanguage,
  languages,
  onSelectLanguage,
  onSendMessage,
  imageFile,
  imagePreview,
  onImageChange,
  onRemoveImage,
  fileInputRef,
  placeholder = "Message AI...",
  footerText = "AI can make mistakes. Verify important information.",
  restrictedLanguages,
  onRestrictedLanguageClick,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  // Reset textarea height when input clears (e.g. after send)
  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input]);

  const { dir: inputDir, className: inputClassName } = getLangProps(input, selectedLanguage);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <>
      <div className="flex-none px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-5 pt-2 sm:pt-4 lg:pt-5 bg-gradient-to-t from-brand-bg-light via-brand-bg-light to-transparent dark:from-brand-bg-dark dark:via-brand-bg-dark dark:to-transparent">
        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="mb-2 sm:mb-3 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative inline-block mb-2 sm:mb-3 ml-2 sm:ml-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-white/10">
                <Image src={imagePreview!} alt="Preview" fill sizes="80px" className="object-cover"/>
              </div>
              <button 
                onClick={onRemoveImage}
                className="cursor-pointer absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded-full p-1 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors z-10"
                aria-label="Remove image"
              >
                <CloseIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
            </div>
          )}

          <div className="relative flex items-end bg-white dark:bg-brand-card-dark rounded-2xl sm:rounded-3xl shadow-card border border-gray-100 dark:border-white/5">
            {onImageChange && fileInputRef && (
              <div className="p-1.5 sm:p-2.5 flex-none pb-2 sm:pb-3">
                <input type="file" ref={fileInputRef} onChange={onImageChange} accept="image/*" className="hidden" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer p-2 sm:p-2.5 rounded-full text-gray-400 hover:text-brand-green hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Attach image"
                >
                  <PaperclipIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder={placeholder}
              className={`flex-1 bg-transparent px-3 sm:px-6 py-3 sm:py-4 max-h-[120px] sm:max-h-[200px] min-h-[48px] sm:min-h-[56px] text-[15px] sm:text-[15px]
                         text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 
                         focus:outline-none resize-none overflow-y-auto scrollbar-thin leading-relaxed ${inputClassName}
                         ${onImageChange ? 'px-2' : ''}`}
              rows={1}
              dir={inputDir}
              disabled={isLoading}
            />
            <div className={`p-1.5 sm:p-2.5 flex-none ${onImageChange ? 'pb-2 sm:pb-3' : ''}`}>
              <button 
                onClick={onSendMessage} 
                disabled={isLoading || (!input.trim() && !imageFile)}
                className={`cursor-pointer p-2.5 sm:p-3 rounded-full transition-all duration-200 flex items-center justify-center min-w-[44px] min-h-[44px]
                           ${(input.trim() || imageFile) && !isLoading 
                             ? 'bg-brand-green text-white hover:bg-brand-green-light shadow-md active:scale-95' 
                             : 'bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
                aria-label="Send message"
              >
                {isLoading ? <Spinner className="w-4 h-4 sm:w-5 sm:h-5"/> : <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 sm:mt-3 px-1 sm:px-0">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 transition-all duration-200"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.78.147 2.653.255" />
                </svg>
                {selectedLanguage}
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute bottom-full left-0 mb-1.5 w-28 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                    {languages.map(lang => {
                      const isRestricted = restrictedLanguages?.includes(lang);
                      return (
                        <button
                          key={lang}
                          onClick={() => {
                            if (isRestricted) {
                              onRestrictedLanguageClick?.(lang);
                            } else {
                              onSelectLanguage(lang);
                            }
                            setLangOpen(false);
                          }}
                          className={`cursor-pointer w-full text-left px-3 py-1.5 text-[11px] sm:text-xs transition-colors flex items-center gap-2 ${selectedLanguage === lang ? 'bg-brand-green text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                          <span className="flex-1">{lang}</span>
                          {isRestricted && (
                            <svg className="w-3 h-3 opacity-60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <p className="hidden sm:block text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500">
              {footerText}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInputArea;
