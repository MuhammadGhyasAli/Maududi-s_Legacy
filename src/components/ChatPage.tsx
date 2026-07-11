'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Book, type ChatMessage, MessageSender, type BookSuggestion } from '../types';
import { apiService, ApiChatMessage } from '../services/apiService';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import TrashIcon from './icons/TrashIcon';
import { useToast } from './Toast';
import ChatMessageList from './chat/ChatMessageList';
import ChatInputArea from './chat/ChatInputArea';
import { useAuth } from '../contexts/AuthContext';
import { useChatHistory } from '../hooks/useChatHistory';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { slugify } from '../utils/slugify';
import { CATEGORIES } from '../constants';

const MAX_FREE_MESSAGES = 10;

function getGuestCountFromCookie(): number {
  if (typeof document === 'undefined') return 0;
  const match = document.cookie.match(/(?:^|;\s*)guest_msg_count=(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

const ALL_LANGUAGES = ['English', 'Turkish', 'Urdu', 'Arabic', 'Persian', 'Bengali'];
const GUEST_LANGUAGES = ['English', 'Urdu'];

const TOPIC_CATEGORIES = CATEGORIES.filter(c => c !== 'All');

const TOPIC_EMOJI: Record<string, string> = {
  Tafsir: '📖', Politics: '🏛️', Theology: '☪️', Economics: '💰',
  Jurisprudence: '⚖️', 'Social Issues': '🤝', History: '📜', Guidance: '💡',
};

interface ChatPageProps {
  book: Book;
  books?: Book[];
  onBack: () => void;
  onNavigateToBook: (book: Book) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ book, books = [], onBack, onNavigateToBook }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showHistory, setShowHistory] = useState(false);
  const [guestMessageCount, setGuestMessageCountState] = useState(getGuestCountFromCookie);
  const [limitReached, setLimitReached] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [currentTopics, setCurrentTopics] = useState<string[]>([]);
  const [bookSuggestions, setBookSuggestions] = useState<BookSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [voiceAssistant, setVoiceAssistant] = useState(false);
  const { speak: autoSpeak, stop: stopAutoSpeak, isSpeaking: isAutoSpeaking } = useSpeechSynthesis();
  const prevAiCountRef = useRef(0);

  useEffect(() => {
    if (!voiceAssistant || isLoading) return;
    const aiMsgs = messages.filter(m => m.sender === MessageSender.AI);
    if (aiMsgs.length > 0 && aiMsgs.length > prevAiCountRef.current) {
      const latest = aiMsgs[aiMsgs.length - 1];
      autoSpeak(latest.text).catch(() => {});
    }
    prevAiCountRef.current = aiMsgs.length;
  }, [messages, voiceAssistant, isLoading, autoSpeak]);

  const restrictedLanguages = !user ? ALL_LANGUAGES.filter(l => !GUEST_LANGUAGES.includes(l)) : [];
  const displayLanguages = user ? ALL_LANGUAGES : GUEST_LANGUAGES;
  const apiMessagesRef = useRef<ApiChatMessage[]>([]);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const bookSlug = slugify(book.title);

  const {
    conversations,
    activeConvId,
    setActiveConvId,
    saveConversation,
    deleteConversation,
    getConversation,
  } = useChatHistory(book.id, book.title, bookSlug, !!user);

  useEffect(() => {
    if (!user && !GUEST_LANGUAGES.includes(selectedLanguage)) {
      setSelectedLanguage('English');
    }
  }, [user, selectedLanguage]);

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
    setConversationId(undefined);
    setCurrentTopics([]);
    setBookSuggestions([]);
    setFollowUps([]);
  }, [book, activeConvId, getConversation]);

  const updateTopicsAndSuggestions = useCallback(async (newTopics: string[]) => {
    if (newTopics.length === 0) return;
    setCurrentTopics(prev => {
      const merged = [...new Set([...prev, ...newTopics])];
      return merged;
    });
    const suggestions = await apiService.getBookSuggestions(newTopics);
    if (suggestions.length > 0) {
      setBookSuggestions(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newOnes = suggestions.filter(s => !existingIds.has(s.id));
        return [...prev, ...newOnes].slice(0, 5);
      });
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { sender: MessageSender.USER, text: input.trim(), timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setFollowUps([]);

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
        
        const response = await apiService.chat(book.id, book.aiContext, newApiMessages, undefined, conversationId, selectedLanguage);
        const aiMessage: ChatMessage = { sender: MessageSender.AI, text: response.response, timestamp: new Date() };
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        
        apiMessagesRef.current = [
            ...newApiMessages,
            { role: 'assistant', content: response.response }
        ];

        if (response.conversationId) {
          setConversationId(response.conversationId);
        }

        if (response.followUpQuestions && response.followUpQuestions.length > 0) {
          setFollowUps(response.followUpQuestions);
        }

        saveConversation(finalMessages);

        if (textToSend) {
          const topicsFromMsg = TOPIC_CATEGORIES.filter(t =>
            textToSend.toLowerCase().includes(t.toLowerCase()) ||
            textToSend.toLowerCase().includes(t.toLowerCase().slice(0, 4))
          );
          if (topicsFromMsg.length > 0) {
            updateTopicsAndSuggestions(topicsFromMsg);
          }
        }

        if (!user && typeof (response as any).guestMessageCount === 'number') {
          setGuestMessageCountState((response as any).guestMessageCount);
        }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      const isLimitReached = errorMessage.toLowerCase().includes('free limit reached') || errorMessage.toLowerCase().includes('limit reached');
      if (isLimitReached) {
        setLimitReached(true);
      }
      setError(`Sorry, I couldn't get a response. ${errorMessage}`);
      setMessages(prev => prev.slice(0, prev.length -1));
      setInput(textToSend);
    } finally {
      clearTimeout(statusTimer);
      setLoadingStatus('');
      setIsLoading(false);
    }
  }, [input, isLoading, selectedLanguage, book.id, book.aiContext, messages, saveConversation, user, conversationId, updateTopicsAndSuggestions]);

  const handleFollowUpClick = useCallback((question: string) => {
    setInput(question);
  }, []);

  const handleSuggestionClick = useCallback((question: string) => {
    setInput(question);
  }, []);

  const handleBranchFromMessage = useCallback((messageIndex: number) => {
    const branchMsgs = messagesRef.current.slice(0, messageIndex + 1);
    const apiBranchMsgs = branchMsgs
      .filter(m => m.sender === MessageSender.USER || m.sender === MessageSender.AI)
      .map(m => ({ role: m.sender === MessageSender.USER ? 'user' as const : 'assistant' as const, content: m.text }));
    
    setMessages(branchMsgs);
    apiMessagesRef.current = apiBranchMsgs;
    setConversationId(undefined);
    setFollowUps([]);
    toast('Conversation branched from this message');
  }, [toast]);

  const handleShareChat = async () => {
    if (!user) {
      toast('Please log in to share chats', 'error');
      return;
    }
    if (!messages.length) return;

    if (conversationId) {
      try {
        const { url } = await apiService.shareConversation(conversationId);
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
          toast('Share link copied to clipboard!');
          return;
        }
        toast(`Share link: ${url}`);
        return;
      } catch {
        // fallback to text copy
      }
    }

    const transcript = messages.map(msg => {
        const sender = msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1);
        return `${sender}: ${msg.text}`;
    }).join('\n\n');
    const shareText = `Chat about "${book.title}"\n\n${transcript}\n\n— Maududi's Legacy`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Chat about ${book.title}`, text: shareText });
        toast('Chat shared!');
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
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
  const clearConfirmTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const deleteConfirmTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleDeleteConversation = (id: string) => {
    if (deleteConfirmId === id) {
      deleteConversation(id);
      setDeleteConfirmId(null);
      if (deleteConfirmTimerRef.current) clearTimeout(deleteConfirmTimerRef.current);
    } else {
      setDeleteConfirmId(id);
      if (deleteConfirmTimerRef.current) clearTimeout(deleteConfirmTimerRef.current);
      deleteConfirmTimerRef.current = setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleClearChat = () => {
    if (!showClearConfirm) {
        setShowClearConfirm(true);
        if (clearConfirmTimerRef.current) clearTimeout(clearConfirmTimerRef.current);
        clearConfirmTimerRef.current = setTimeout(() => setShowClearConfirm(false), 3000);
        return;
    }
    if (clearConfirmTimerRef.current) clearTimeout(clearConfirmTimerRef.current);
    apiMessagesRef.current = [];
    setActiveConvId(null);
    setConversationId(undefined);
    setMessages([
        { sender: MessageSender.AI, text: `Hello! I am an AI assistant trained on "${book.title}". How can I help you?`, timestamp: new Date() }
    ]);
    setError(null);
    setShowClearConfirm(false);
    setCurrentTopics([]);
    setBookSuggestions([]);
    setFollowUps([]);
  };

  if (!user && (limitReached || guestMessageCount >= MAX_FREE_MESSAGES)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-gray-800 dark:text-gray-200 transition-colors duration-300 px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Free Limit Reached</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            You&apos;ve used all {MAX_FREE_MESSAGES} free messages. Sign in to continue chatting with unlimited access.
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

      {/* Book suggestions drawer */}
      {showSuggestions && bookSuggestions.length > 0 && (
        <>
          <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setShowSuggestions(false)} />
          <aside className="fixed right-0 top-0 z-40 w-72 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl lg:shadow-none lg:relative lg:z-auto flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">Related Books</h2>
              <button
                onClick={() => setShowSuggestions(false)}
                className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {currentTopics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {currentTopics.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-green/10 text-brand-green border border-brand-green/20">
                      {TOPIC_EMOJI[t] || ''} {t}
                    </span>
                  ))}
                </div>
              )}
              {bookSuggestions.map(s => (
                <button
                  key={s.id}
                  onClick={() => onNavigateToBook(s as unknown as Book)}
                  className="cursor-pointer w-full text-left p-3 rounded-xl text-xs hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                >
                  <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">{s.title}</div>
                  <div className="text-[10px] text-gray-400 mb-1">{s.category}</div>
                  <div className="text-[10px] text-brand-green/70">{s.reason}</div>
                </button>
              ))}
            </div>
          </aside>
        </>
      )}

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Minimal top bar */}
        <div className="flex-none h-12 flex items-center justify-between px-4 max-w-5xl mx-auto w-full border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onBack} className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all" title="Back to library">
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px] sm:max-w-[400px]">
              {book.title}
            </span>
            {currentTopics.length > 0 && (
              <div className="hidden md:flex items-center gap-1 ml-2">
                {currentTopics.slice(0, 2).map(t => (
                  <span key={t} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-brand-green/8 text-brand-green/60 border border-brand-green/15">
                    {t}
                  </span>
                ))}
                {currentTopics.length > 2 && (
                  <span className="text-[9px] text-gray-400">+{currentTopics.length - 2}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {user && bookSuggestions.length > 0 && (
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`cursor-pointer p-1.5 rounded-lg transition-all duration-200 ${
                  showSuggestions
                    ? 'bg-brand-green/10 text-brand-green'
                    : 'text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
                title="Related books"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </button>
            )}
            <button
              onClick={() => {
                if (voiceAssistant && isAutoSpeaking) stopAutoSpeak();
                setVoiceAssistant(!voiceAssistant);
              }}
              className={`cursor-pointer p-1.5 rounded-lg transition-all duration-200 ${
                voiceAssistant
                  ? 'bg-brand-green/10 text-brand-green'
                  : 'text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
              title={voiceAssistant ? 'Voice assistant on' : 'Voice assistant off'}
            >
              {isAutoSpeaking ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            {user && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`cursor-pointer p-1.5 rounded-lg transition-all duration-200 ${
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
            )}
            {user && (
              <button onClick={handleShareChat} className="cursor-pointer p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200" title="Share Chat">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              </button>
            )}
            <button 
              onClick={handleClearChat} 
              className={`cursor-pointer p-1.5 rounded-lg transition-all duration-200 ${
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

        <ChatMessageList 
          messages={messages} 
          isLoading={isLoading} 
          loadingStatus={loadingStatus}
          selectedLanguage={selectedLanguage}
          onNavigateToBook={onNavigateToBook}
          books={books}
          followUpQuestions={followUps}
          onFollowUpClick={handleFollowUpClick}
          onBranchFromMessage={handleBranchFromMessage}
          showSuggestions={messages.length <= 1 && !isLoading}
          onSuggestionClick={handleSuggestionClick}
        />

        {!user && !limitReached && (
          <div className="flex-none px-4 pb-1 text-center">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              Free messages: {MAX_FREE_MESSAGES - guestMessageCount}/{MAX_FREE_MESSAGES}
            </span>
          </div>
        )}
        <ChatInputArea 
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          error={error}
          selectedLanguage={selectedLanguage}
          languages={displayLanguages}
          restrictedLanguages={restrictedLanguages}
          onRestrictedLanguageClick={(lang) => {
            toast(`Sign in to use ${lang}`, 'error');
          }}
          onSelectLanguage={setSelectedLanguage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatPage;
