'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Book, type ChatMessage, MessageSender } from '../types';
import { apiService, ApiChatMessage } from '../services/apiService';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import TrashIcon from './icons/TrashIcon';
import { useToast } from './Toast';
import ChatMessageList from './chat/ChatMessageList';
import ChatInputArea from './chat/ChatInputArea';
import { useAuth } from '../contexts/AuthContext';
import { useChatHistory } from '../hooks/useChatHistory';
import { slugify } from '../utils/slugify';

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
  const [showHistory, setShowHistory] = useState(false);
  const apiMessagesRef = useRef<ApiChatMessage[]>([]);
  const bookSlug = slugify(book.title);

  const {
    conversations,
    activeConvId,
    setActiveConvId,
    saveConversation,
    deleteConversation,
    getConversation,
  } = useChatHistory(book.id, book.title, bookSlug);

  useEffect(() => {
    if (activeConvId) {
      const conv = getConversation(activeConvId);
      if (conv && conv.messages.length > 0) {
        setMessages(conv.messages);
        const apiMsgs: ApiChatMessage[] = conv.messages
          .filter(m => m.sender === MessageSender.USER || m.sender === MessageSender.AI)
          .map(m => ({
            role: m.sender === MessageSender.USER ? 'user' : 'assistant',
            content: m.text,
          }));
        apiMessagesRef.current = apiMsgs;
        return;
      }
    }
    setMessages([
      { sender: MessageSender.AI, text: `Hello! I am an AI assistant trained on "${book.title}". How can I help you?`, timestamp: new Date() }
    ]);
    apiMessagesRef.current = [];
  }, [book, activeConvId, getConversation]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { sender: MessageSender.USER, text: input.trim(), timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

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
        const aiMessage: ChatMessage = { sender: MessageSender.AI, text: response.response, timestamp: new Date() };
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        
        apiMessagesRef.current = [
            ...newApiMessages,
            { role: 'assistant', content: response.response }
        ];

        saveConversation(finalMessages);
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
  }, [input, isLoading, selectedLanguage, book.id, book.aiContext, messages, saveConversation]);

  const handleShareChat = async () => {
    const transcript = messages.map(msg => {
        const sender = msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1);
        return `${sender}: ${msg.text}`;
    }).join('\n\n');
    const shareText = `Chat about "${book.title}"\n\n${transcript}\n\n— Maududi's Legacy`;

    if (navigator.share && window.innerWidth < 768) {
      try {
        await navigator.share({ title: `Chat about ${book.title}`, text: shareText });
        return;
      } catch {
        // user cancelled or fallback needed
      }
    }

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareText);
        toast('Chat copied to clipboard!');
      } catch {
        fallbackCopy(shareText);
      }
    } else {
      fallbackCopy(shareText);
    }
  };

  const fallbackCopy = (text: string) => {
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
    } catch {
      toast('Could not share chat. Your browser may not support this feature.', 'error');
    }
    textArea.remove();
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteConversation = (id: string) => {
    if (deleteConfirmId === id) {
      deleteConversation(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(prev => prev === id ? null : prev), 3000);
    }
  };

  const handleClearChat = () => {
    if (!showClearConfirm) {
        setShowClearConfirm(true);
        setTimeout(() => setShowClearConfirm(false), 3000);
        return;
    }
    setMessages([
        { sender: MessageSender.AI, text: `Hello! I am an AI assistant trained on "${book.title}". How can I help you?`, timestamp: new Date() }
    ]);
    apiMessagesRef.current = [];
    setError(null);
    setShowClearConfirm(false);
    setActiveConvId(null);
  };

  return (
    <div className="flex h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-gray-800 dark:text-gray-200 transition-colors duration-300">
      
      {/* Conversations sidebar */}
      {showHistory && (
        <>
          <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setShowHistory(false)} />
          <aside className="fixed left-0 top-0 z-40 w-72 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl lg:shadow-none lg:relative lg:z-auto flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close history"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {conversations.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No saved conversations yet</p>
              ) : (
                conversations.map(conv => {
                  const msgCount = conv.messages.filter(m => m.sender === MessageSender.USER).length;
                  const preview = conv.messages[conv.messages.length - 1]?.text?.slice(0, 80) || '';
                  return (
                    <div key={conv.id} className="group relative">
                      <button
                        onClick={() => { setActiveConvId(conv.id); setShowHistory(false); }}
                        className={`cursor-pointer w-full text-left p-3 rounded-xl text-xs transition-all duration-200 ${
                          activeConvId === conv.id
                            ? 'bg-brand-green/10 dark:bg-brand-green/10 border border-brand-green/30'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{msgCount} messages</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(conv.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 truncate">{preview || 'Empty'}</p>
                      </button>
                      <button
                        onClick={() => handleDeleteConversation(conv.id)}
                        className={`cursor-pointer absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ${
                          deleteConfirmId === conv.id
                            ? 'bg-red-500 text-white'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                        }`}
                        aria-label={deleteConfirmId === conv.id ? 'Click again to confirm delete' : 'Delete conversation'}
                      >
                        {deleteConfirmId === conv.id ? (
                          <span className="text-[10px] font-semibold px-1">Delete?</span>
                        ) : (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </>
      )}

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Slim top bar */}
        <div className="fixed top-0 left-0 right-0 z-20 h-14 bg-white/90 dark:bg-brand-bg-dark/90 backdrop-blur-lg border-b border-emerald-100/40 dark:border-emerald-900/20">
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
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ${
                  showHistory
                    ? 'bg-brand-green/10 text-brand-green'
                    : 'text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
                title="Chat history"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
              </button>
              <button onClick={handleShareChat} className="cursor-pointer p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200" title="Share Chat">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
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
    </div>
  );
};

export default ChatPage;
