import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import SendIcon from '../icons/SendIcon';
import Spinner from '../icons/Spinner';
import LanguageSelector from '../LanguageSelector';
import PaperclipIcon from '../icons/PaperclipIcon';
import CloseIcon from '../icons/CloseIcon';

interface ChatInputAreaProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  selectedLanguage: string;
  languages: string[];
  onSelectLanguage: (lang: string) => void;
  onSendMessage: () => void;
  // Optional image attachment props
  imageFile?: File | null;
  imagePreview?: string | null;
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  footerText?: string;
}

const getLangProps = (text: string, selectedLang: string): { dir: 'auto', className: string } => {
  const rtlLangs = ['Urdu', 'Arabic', 'Persian'];
  if (rtlLangs.includes(selectedLang)) {
      let className = 'font-arabic';
      if (selectedLang === 'Urdu') className = 'font-nastaaliq';
      return { dir: 'auto', className };
  }
  const hasRtlChars = /[\u0600-\u06FF\u0750-\u077F\u0590-\u05FF]/.test(text);
  if (hasRtlChars) return { dir: 'auto', className: 'font-nastaaliq' };
  return { dir: 'auto', className: '' };
};

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
  footerText = "AI can make mistakes. Verify important information."
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

  return (
    <>
      <div className="flex-none px-4 pb-8 pt-4 bg-gradient-to-t from-brand-bg-light via-brand-bg-light to-transparent dark:from-brand-bg-dark dark:via-brand-bg-dark dark:to-transparent">
        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="mb-3 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative inline-block mb-3 ml-3">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-white/10">
                <Image src={imagePreview!} alt="Preview" fill sizes="80px" className="object-cover"/>
              </div>
              <button 
                onClick={onRemoveImage}
                className="cursor-pointer absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded-full p-1 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors z-10"
                aria-label="Remove image"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="relative flex items-end bg-white dark:bg-brand-card-dark rounded-3xl shadow-card border border-gray-100 dark:border-white/5">
            {onImageChange && fileInputRef && (
              <div className="p-2.5 flex-none pb-3">
                <input type="file" ref={fileInputRef} onChange={onImageChange} accept="image/*" className="hidden" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer p-2 rounded-full text-gray-400 hover:text-brand-blue hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  aria-label="Attach image"
                >
                  <PaperclipIcon className="w-5 h-5" />
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
              className={`flex-1 bg-transparent px-6 py-4 max-h-[200px] min-h-[56px] text-[15px]
                         text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 
                         focus:outline-none resize-none overflow-y-auto scrollbar-thin ${inputClassName}
                         ${onImageChange ? 'px-2' : ''}`}
              rows={1}
              dir={inputDir}
              disabled={isLoading}
            />
            <div className={`p-2.5 flex-none ${onImageChange ? 'pb-3' : ''}`}>
              <button 
                onClick={onSendMessage} 
                disabled={isLoading || (!input.trim() && !imageFile)}
                className={`cursor-pointer p-2.5 rounded-full transition-all duration-200 flex items-center justify-center
                           ${(input.trim() || imageFile) && !isLoading 
                             ? 'bg-brand-green text-white hover:bg-brand-green-light shadow-md' 
                             : 'bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
                aria-label="Send message"
              >
                {isLoading ? <Spinner className="w-5 h-5"/> : <SendIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {footerText}
            </p>
          </div>
        </div>
      </div>

      <LanguageSelector 
        languages={languages}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={onSelectLanguage}
      />
    </>
  );
};

export default ChatInputArea;
