'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Book, type ChatMessage, MessageSender } from '../types';
import { apiService, ApiChatMessage } from '../services/apiService';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import TrashIcon from './icons/TrashIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import { useToast } from './Toast';
import ChatMessageList from './chat/ChatMessageList';
import ChatInputArea from './chat/ChatInputArea';
import { useAuth } from '../contexts/AuthContext';

const LANGUAGES = ['English', 'Turkish', 'Urdu', 'Arabic', 'Persian', 'Bengali'];

interface ChatPageProps {
  book: Book;
  books?: Book[];
  onBack: () => void;
  onNavigateToBook: (book: Book) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ book, books = [], onBack, onNavigateToBook }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const apiMessagesRef = useRef<ApiChatMessage[]>([]);

  useEffect(() => {
    setMessages([
      { sender: MessageSender.AI, text: `Hello! I am an AI assistant trained on "${book.title}". How can I help you?` }
    ]);
    apiMessagesRef.current = [];
  }, [book]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { sender: MessageSender.USER, text: input.trim() };
    setMessages(prev => [...prev, userMessage]);

    const textToSend = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);
    setLoadingStatus('Researching...');
    const statusTimer = setTimeout(() => setLoadingStatus('Generating response...'), 3000);

    try {
        const currentApiMessages = apiMessagesRef.current;
        const newApiMessages: ApiChatMessage[] = [
            ...currentApiMessages,
            { role: 'user', content: `Provide a precise, well-researched answer based strictly on the book's content. Accuracy is critical — only state what you are certain of. If you are unsure about any detail, explicitly say so rather than speculating. Your entire response must be in ${selectedLanguage}. When citing, provide full exact book titles and specific context references.\n\nMy question: "${textToSend}"` }
        ];
        
        const response = await apiService.chat(book.id, book.aiContext, newApiMessages);
        const aiMessage: ChatMessage = { sender: MessageSender.AI, text: response.response };
        setMessages(prev => [...prev, aiMessage]);
        
        apiMessagesRef.current = [
            ...newApiMessages,
            { role: 'assistant', content: response.response }
        ];
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Sorry, I couldn't get a response. ${errorMessage}`);
      setMessages(prev => prev.slice(0, prev.length -1));
      setInput(textToSend);
    } finally {
      clearTimeout(statusTimer);
      setLoadingStatus('');
      setIsLoading(false);
    }
  }, [input, isLoading, selectedLanguage, book.id, book.aiContext]);

  const handleCopyChat = async () => {
    const transcript = messages.map(msg => {
        const content = `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)}: ${msg.text}`;
        return content;
    }).join('\n\n');
    
    // Robust copy implementation that works even without HTTPS/Secure Context
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(transcript);
        toast('Chat copied to clipboard!');
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
      toast('Chat copied to clipboard!');
    } catch (_err) {
      toast('Could not copy chat. Your browser may not support this feature.', 'error');
    }
    textArea.remove();
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearChat = () => {
    if (!showClearConfirm) {
        setShowClearConfirm(true);
        setTimeout(() => setShowClearConfirm(false), 3000);
        return;
    }
    setMessages([
        { sender: MessageSender.AI, text: `Hello! I am an AI assistant trained on "${book.title}". How can I help you?` }
    ]);
    apiMessagesRef.current = [];
    setError(null);
    setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-gray-800 dark:text-gray-200 transition-colors duration-300">
      
      {/* Slim top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 dark:bg-brand-bg-dark/90 backdrop-blur-lg border-b border-emerald-100/40 dark:border-emerald-900/20">
        <div className="flex items-center justify-between h-full px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onBack} className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 whitespace-nowrap" title="Back to library">
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[200px] sm:max-w-[400px]">
              {book.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
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
        messages={messages} 
        isLoading={isLoading} 
        loadingStatus={loadingStatus}
        selectedLanguage={selectedLanguage}
        onNavigateToBook={onNavigateToBook}
        books={books}
        userDisplayName={user?.display_name || user?.email}
      />

      <ChatInputArea 
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        error={error}
        selectedLanguage={selectedLanguage}
        languages={LANGUAGES}
        onSelectLanguage={setSelectedLanguage}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatPage;
