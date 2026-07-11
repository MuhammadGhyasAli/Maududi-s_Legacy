'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import SendIcon from '../icons/SendIcon';
import Spinner from '../icons/Spinner';
import PaperclipIcon from '../icons/PaperclipIcon';
import CloseIcon from '../icons/CloseIcon';
import VoiceButton from '../VoiceButton';
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
  imagePreview,
  onImageChange,
  onRemoveImage,
  fileInputRef,
  placeholder = "Ask about this book...",
  footerText = "Responses are AI-generated and may contain errors.",
  restrictedLanguages,
  onRestrictedLanguageClick,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef(input);
  useEffect(() => { inputRef.current = input; });

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input]);

  const { dir: inputDir, className: inputClassName } = getLangProps(input, selectedLanguage);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    if (langOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen]);

  return (
    <div className="flex-none px-3 sm:px-4 pb-3 sm:pb-5 pt-2">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-2 sm:mb-3 px-3 sm:px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg text-sm flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {imagePreview && (
          <div className="relative inline-block mb-2 ml-2">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-white/10">
              <Image src={imagePreview} alt="Preview" fill sizes="64px" className="object-cover"/>
            </div>
            <button 
              onClick={onRemoveImage}
              className="cursor-pointer absolute -top-1.5 -right-1.5 bg-white dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded-full p-0.5 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors z-10"
              aria-label="Remove image"
            >
              <CloseIcon className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-1 bg-white dark:bg-brand-card-dark rounded-full shadow-sm border border-gray-200 dark:border-white/10 px-3 py-1.5 focus-within:border-brand-green/50 focus-within:shadow-md transition-all">
          {onImageChange && fileInputRef && (
            <>
              <input type="file" ref={fileInputRef} onChange={onImageChange} accept="image/*" className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer p-1.5 rounded-full text-gray-400 hover:text-brand-green hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
                aria-label="Attach image"
              >
                <PaperclipIcon className="w-4 h-4" />
              </button>
            </>
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
            className={`flex-1 bg-transparent py-1.5 max-h-[120px] sm:max-h-[160px] min-h-[24px]
                       text-[14px] sm:text-[15px]
                       text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 
                       focus:outline-none resize-none overflow-y-auto scrollbar-thin leading-relaxed ${inputClassName}`}
            rows={1}
            dir={inputDir}
            disabled={isLoading}
          />
          <VoiceButton
            language={selectedLanguage}
            disabled={isLoading}
            onTranscript={(text) => setInput(inputRef.current + text + ' ')}
          />
          <button 
            onClick={onSendMessage} 
            disabled={isLoading || !input.trim()}
            className={`cursor-pointer p-2 rounded-full transition-all duration-200 flex items-center justify-center shrink-0
                       ${input.trim() && !isLoading 
                          ? 'bg-brand-green text-white hover:bg-brand-green-light shadow-sm' 
                         : 'bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
            aria-label="Send message"
          >
            {isLoading ? <Spinner className="w-4 h-4"/> : <SendIcon className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1">
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green-dark transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.78.147 2.653.255" />
              </svg>
              {selectedLanguage}
            </button>
            {langOpen && (
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
                      className={`cursor-pointer w-full text-left px-3 py-1.5 text-[11px] transition-colors flex items-center gap-2 ${selectedLanguage === lang ? 'bg-brand-green text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
            )}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">{footerText}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInputArea;
