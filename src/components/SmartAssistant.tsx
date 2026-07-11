"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Book, MessageSender } from '../types';
import { apiService, ApiChatMessage } from '../services/apiService';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import TrashIcon from './icons/TrashIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import ChatIcon from './icons/ChatIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import CheckIcon from './icons/CheckIcon';
import { useToast } from './Toast';
import ChatMessageList from './chat/ChatMessageList';
import ChatInputArea from './chat/ChatInputArea';
import { useAuth } from '../contexts/AuthContext';
import { detectLanguage } from '../utils/language';

interface SmartAssistantProps {
  onNavigateToBook: (book: Book) => void;
}

interface ConversationPart {
  sender: MessageSender;
  text: string;
  image?: string;
}

const LANGUAGE_OPTIONS = ['Auto', 'English', 'Turkish', 'Urdu', 'Arabic', 'Persian', 'bengali'];

const SmartAssistant: React.FC<SmartAssistantProps> = ({ onNavigateToBook }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationPart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [languageMode, setLanguageMode] = useState('Auto');
  const [detectedLanguage, setDetectedLanguage] = useState('English');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [fetchedBooks, setFetchedBooks] = useState<Book[]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [langOpen, setLangOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const selectedLanguage = languageMode === 'Auto' ? detectedLanguage : languageMode;

  useEffect(() => {
    apiService.getBooks().then(setFetchedBooks).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    setConversation([{
      sender: MessageSender.AI,
      text: "Hello! I'm your Maududi AI Assistant. Ask me anything about Sayyid Abul A'la Maududi's life, books, or ideas — I'll reply in the same language you use.",
    }]);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    if (langOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = useCallback(async () => {
    if ((!inputText.trim() && !imageFile) || isLoading) return;

    const userText = inputText.trim();
    const userMessage: ConversationPart = { sender: MessageSender.USER, text: userText };
    if (imagePreview) userMessage.image = imagePreview;
    if (userText) setDetectedLanguage(detectLanguage(userText));

    setConversation(prev => [...prev, userMessage]);
    setFollowUps([]);

    const textToSend = inputText;
    const imageToSend = imageFile;
    const currentImagePreview = imagePreview;
    setInputText('');
    handleRemoveImage();
    setIsLoading(true);
    setLoadingStatus('Thinking…');
    setError(null);

    try {
      const messagesToBackend: ApiChatMessage[] = conversation.map(msg => ({
        role: msg.sender === MessageSender.USER ? 'user' : 'assistant',
        content: msg.image ? [
          { type: 'image_url', image_url: { url: msg.image } },
          { type: 'text', text: msg.text || ' ' },
        ] : msg.text,
      }));

      let currentMessageContent: string | any[] = textToSend || ' ';
      if (imageToSend && currentImagePreview) {
        currentMessageContent = [
          { type: 'image_url', image_url: { url: currentImagePreview } },
          { type: 'text', text: textToSend || ' ' },
        ];
      }
      messagesToBackend.push({ role: 'user', content: currentMessageContent });

      const response = await apiService.smartChat(messagesToBackend, languageMode);
      const aiText = response.response;
      setDetectedLanguage(detectLanguage(aiText));
      setConversation(prev => [...prev, { sender: MessageSender.AI, text: aiText }]);

      if (response.followUpQuestions && response.followUpQuestions.length > 0) {
        setFollowUps(response.followUpQuestions);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Sorry, something went wrong. ${errorMessage}`);
      setConversation(prev => prev.slice(0, -1));
      setInputText(textToSend);
      if (imageToSend && currentImagePreview) {
        setImageFile(imageToSend);
        setImagePreview(currentImagePreview);
      }
    } finally {
      setIsLoading(false);
      setLoadingStatus(undefined);
    }
  }, [inputText, imageFile, isLoading, imagePreview, languageMode, conversation]);

  const handleCopyChat = async () => {
    const transcript = conversation.map(msg => `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)}: ${msg.text}`).join('\n\n');
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(transcript);
        toast('Chat copied!');
      } catch (_error) {
        fallbackCopyTextToClipboard(transcript);
      }
    } else {
      fallbackCopyTextToClipboard(transcript);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      toast('Chat copied!');
    } catch (_err) {
      toast('Could not copy chat. Your browser may not support this feature.', 'error');
    }
    textArea.remove();
  };

  const handleClearChat = () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
      return;
    }
    setConversation([{
      sender: MessageSender.AI,
      text: "Hello! I'm your Maududi AI Assistant. Ask me anything about Sayyid Abul A'la Maududi's life, books, or ideas — I'll reply in the same language you use.",
    }]);
    setError(null);
    setShowClearConfirm(false);
    setFollowUps([]);
  };

  const handleFollowUpClick = (question: string) => {
    setInputText(question);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-brand-bg-light dark:bg-brand-bg-dark text-gray-800 dark:text-gray-200 transition-colors duration-300 px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-green/10 flex items-center justify-center">
            <ChatIcon className="w-8 h-8 text-brand-green" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Sign in Required</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            The Smart Assistant is available to signed-in users only. Please log in or create an account to chat with the AI in any language.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-dark transition-colors duration-200"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-brand-bg-light dark:bg-brand-bg-dark text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="flex-none h-14 bg-white/90 dark:bg-brand-bg-dark/90 backdrop-blur-lg border-b border-emerald-100/40 dark:border-emerald-900/20">
        <div className="flex items-center justify-between h-full px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.back()} className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 whitespace-nowrap" title="Back to library">
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Smart Assistant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 whitespace-nowrap"
                title="Response language"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.78.147 2.653.255" />
                </svg>
                {languageMode === 'Auto' ? `Auto${detectedLanguage !== 'English' ? ` · ${detectedLanguage}` : ''}` : languageMode}
                <ChevronDownIcon className="w-3 h-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setLanguageMode(lang); setLangOpen(false); }}
                      className={`cursor-pointer w-full text-left px-3 py-1.5 text-[12px] transition-colors flex items-center gap-2 ${languageMode === lang ? 'bg-brand-green text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <span className="flex-1">{lang === 'Auto' ? 'Auto-detect' : lang}</span>
                      {languageMode === lang && <CheckIcon className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleCopyChat} className="cursor-pointer p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200" title="Copy Chat">
              <ClipboardIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearChat}
              className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ${
                showClearConfirm
                  ? 'bg-red-500 text-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
              }`}
              title={showClearConfirm ? "Click again to confirm" : "Clear Chat"}
            >
              <TrashIcon className="w-4 h-4" />
              {showClearConfirm && <span className="text-xs font-medium ml-1">Confirm</span>}
            </button>
          </div>
        </div>
      </div>

      <ChatMessageList
        messages={conversation}
        isLoading={isLoading}
        loadingStatus={loadingStatus}
        selectedLanguage={selectedLanguage}
        onNavigateToBook={onNavigateToBook}
        books={fetchedBooks}
        followUpQuestions={followUps}
        onFollowUpClick={handleFollowUpClick}
      />

      <ChatInputArea
        input={inputText}
        setInput={setInputText}
        isLoading={isLoading}
        error={error}
        selectedLanguage={selectedLanguage}
        onSendMessage={handleSendMessage}
        imageFile={imageFile}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
        fileInputRef={fileInputRef}
        placeholder="Message the Smart Assistant..."
        footerText="Auto-detects your language and replies in kind."
        hideLanguageSelector
      />
    </div>
  );
};

export default SmartAssistant;
