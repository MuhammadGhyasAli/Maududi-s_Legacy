import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Book, ChatMessage, MessageSender } from '../types';
import { apiService, ChatMessage as ApiChatMessage } from '../services/apiService';
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
      console.error("API Error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Sorry, I couldn't get a response. ${errorMessage}`);
      setMessages(prev => prev.slice(0, prev.length -1));
      setInput(textToSend);
    } finally {
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
      } catch (error) {
        console.error('Copying failed', error);
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
    } catch (err) {
      console.error('Fallback copy failed', err);
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
      
      {/* Floating Action Buttons */}
      <div className="fixed top-4 left-4 z-50">
        <button onClick={onBack} className="cursor-pointer p-2.5 bg-white/80 dark:bg-brand-card-dark/80 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-full shadow-sm hover:bg-white dark:hover:bg-brand-card-dark text-gray-600 dark:text-gray-300 transition-colors" title="Back to library">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={handleCopyChat} className="cursor-pointer p-2.5 bg-white/80 dark:bg-brand-card-dark/80 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-full shadow-sm hover:bg-white dark:hover:bg-brand-card-dark text-gray-600 dark:text-gray-300 transition-colors" title="Copy Chat">
          <ClipboardIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={handleClearChat} 
          className={`cursor-pointer p-2.5 backdrop-blur-md border rounded-full shadow-sm transition-colors flex items-center justify-center gap-2
            ${showClearConfirm 
              ? 'bg-red-500 hover:bg-red-600 text-white border-red-600' 
              : 'bg-white/80 dark:bg-brand-card-dark/80 border-gray-200/50 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300'
            }`} 
          title={showClearConfirm ? "Click again to confirm" : "Clear Chat"}
        >
          <TrashIcon className="w-5 h-5" />
          {showClearConfirm && <span className="text-sm pr-1 font-medium text-white">Confirm</span>}
        </button>
      </div>

      <ChatMessageList 
        messages={messages} 
        isLoading={isLoading} 
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
