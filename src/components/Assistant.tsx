"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Book, MessageSender, AgentStatusEvent } from '../types';
import { apiService, ApiChatMessage } from '../services/apiService';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import TrashIcon from './icons/TrashIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import { useToast } from './Toast';
import ChatMessageList, { StructuredResponse } from './chat/ChatMessageList';
import ChatInputArea from './chat/ChatInputArea';
import { useAuth } from '../contexts/AuthContext';
import { detectLanguage } from '../utils/language';
import ChevronDownIcon from './icons/ChevronDownIcon';
import CheckIcon from './icons/CheckIcon';

type AssistantMode = 'search' | 'chat';

interface AssistantProps {
  onNavigateToBook: (book: Book) => void;
}

interface ConversationPart {
  sender: MessageSender;
  text: string;
  image?: string;
}

const SEARCH_LANGUAGES = ['English', 'Turkish', 'Urdu', 'Arabic', 'Persian', 'Bengali'];
const CHAT_LANGUAGE_OPTIONS = ['Auto', 'English', 'Turkish', 'Urdu', 'Arabic', 'Persian', 'Bengali'];

const SEARCH_WELCOME = `I am an AI-powered search engine and expert archivist for the literary works of Sayyid Abul A'la Maududi. My function is to retrieve information, quotes, and context from the specific books listed in my knowledge base.`;
const CHAT_WELCOME = `Hello! I'm your Maududi AI Assistant. Ask me anything about Sayyid Abul A'la Maududi's life, books, or ideas — I'll reply in the same language you use.`;

const parseStructuredResponse = (text: string): StructuredResponse | null => {
    const bookTitleRegex = /^(?:\*\*|)?(?:Book(?: Title)?|Source)(?:\*\*|)?\s*:\s*(.*)/im;
    const chapterRegex = /^(?:\*\*|)?(?:Chapter(?:\/Section)?|Section)(?:\*\*|)?\s*:\s*(.*)/im;
    const pageRegex = /^(?:\*\*|)?(?:Page(?: Number| No\.)?)(?:\*\*|)?\s*:\s*(.*)/im;
    const contextRegex = /^(?:\*\*|)?(?:Context|Quote|Paragraph|Excerpt)(?:\*\*|)?\s*:([\s\S]+?)(?=\n\s*\n|$)/im;

    const bookTitleMatch = text.match(bookTitleRegex);
    if (!bookTitleMatch) return null;

    const chapterMatch = text.match(chapterRegex);
    const pageMatch = text.match(pageRegex);
    const contextMatch = text.match(contextRegex);

    let remainingText = text;
    if (bookTitleMatch) remainingText = remainingText.replace(bookTitleMatch[0], '');
    if (chapterMatch) remainingText = remainingText.replace(chapterMatch[0], '');
    if (pageMatch) remainingText = remainingText.replace(pageMatch[0], '');
    if (contextMatch) remainingText = remainingText.replace(contextMatch[0], '');

    return {
        bookTitle: bookTitleMatch[1].trim(),
        chapter: chapterMatch ? chapterMatch[1].trim() : undefined,
        page: pageMatch ? pageMatch[1].trim() : undefined,
        context: contextMatch ? contextMatch[1].trim() : undefined,
        remainingText: remainingText.trim(),
    };
};

const Assistant: React.FC<AssistantProps> = ({ onNavigateToBook }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [mode, setMode] = useState<AssistantMode>('search');
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationPart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [chatLanguageMode, setChatLanguageMode] = useState('Auto');
  const [detectedLanguage, setDetectedLanguage] = useState('English');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [fetchedBooks, setFetchedBooks] = useState<Book[]>([]);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<AgentStatusEvent[]>([]);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [thinkingStartTime, setThinkingStartTime] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchSystemInstruction = useRef('');
  const chatSystemInstruction = useRef('');

  const resolvedLanguage = mode === 'chat'
    ? (chatLanguageMode === 'Auto' ? detectedLanguage : chatLanguageMode)
    : selectedLanguage;

  useEffect(() => {
    apiService.getBooks().then(fetchedBooks => {
      setFetchedBooks(fetchedBooks as any);
      const bookListForPrompt = fetchedBooks.map(b => `- "${b.title}" [${b.category}]: ${b.description}`).join('\n');
      searchSystemInstruction.current = `You are an AI-powered search engine and expert archivist for the literary works of Sayyid Abul A'la Maududi. Your knowledge base consists of the following books with their subjects and descriptions:\n---\n${bookListForPrompt}\n---\nYour function is two-fold:
1.  **Locate & Cite:** First, when a user provides a quote or topic, your primary goal is to locate the most relevant source within these books. If you find a direct match or a highly relevant passage, you MUST present this information clearly at the beginning of your response, formatted like this:
    **Book Title:** [Full Book Title]
    **Chapter/Section:** [Chapter or Section Name]
    **Page Number:** [Page Number]
    **Context:** [The relevant verbatim paragraph or quote]
2.  **Explain & Elaborate:** After providing the citation (if found), your second goal is to provide a comprehensive, detailed, and insightful explanation of the topic, drawing from the principles and context found in Maududi's works. Your explanation should be thorough and well-reasoned, similar to how an expert on his literature would respond.

**Crucial Rules:**
- **Accuracy is paramount.** Never invent or fabricate facts, page numbers, chapters, or quotes. Only provide information you are highly confident about. If uncertain, explicitly state your uncertainty.
- **Admit when you don't know.** It is far better to say "I cannot find a specific reference for that" than to guess or hallucinate a source.
- **Always use the exact book titles** from the list provided. For example, use "Tafheem ul Quran (Vol. 1)", not "Tafheem ul Quran, Volume 1".
- **A correct chapter is more valuable than an incorrect page number.** Provide approximate page numbers only when prefixed with "Approx."
- **Quality over quantity.** A concise, correct answer is superior to a lengthy, speculative one.
- **If no specific citation is found,** proceed directly to the detailed explanation based on the collective knowledge from the books, and note that no direct citation was found.

**Mandatory Two-Step Process for Image Queries:**
If the user's message includes an image, you MUST follow this two-step process without exception:
1.  **Step 1: Identification & Confirmation.** Your FIRST response must ONLY identify the book the image is from and ask for confirmation to proceed. DO NOT provide any other details, context, or explanation. Your response should be brief and direct, like this: "This image appears to be from [Book Title]. Would you like a detailed analysis and context?"
2.  **Step 2: Detailed Analysis (On User Confirmation).** Only after the user confirms (e.g., they say "yes"), you will then provide the full, two-part response (citation + explanation) as described in the rules above. This is the only time you should provide a deep analysis for an image query.`;

      searchSystemInstruction.current = searchSystemInstruction.current.replace('---\n---', '---');

      chatSystemInstruction.current = `You are "Maududi AI Assistant", a friendly, conversational AI assistant specializing in the life, thought, and literary works of Sayyid Abul A'la Maududi.

Your knowledge base covers the following books and their subjects:
${bookListForPrompt}

Your role:
- Help users understand Maududi's books, philosophy, biography, and teachings in a clear, ChatGPT-like manner.
- Be accurate. Base answers on Maududi's established works and well-documented biography. Never fabricate quotes, page numbers, book titles, or historical claims. If you are unsure, say so honestly.
- When relevant, reference specific books by their exact titles from the list above.
- Structure longer answers with headings, lists, or bold emphasis for readability. Use markdown.

Language policy:
- Detect the language of the user's latest message and reply in that SAME language, matching its script and tone.
- Supported languages include English, Urdu, Arabic, Persian, Turkish, and Bengali.
- If the user writes in a mix, reply in the dominant language.`;

      setConversation([{
          sender: MessageSender.AI,
          text: SEARCH_WELCOME,
      }]);
    }).catch(() => {
      setConversation([{
          sender: MessageSender.AI,
          text: SEARCH_WELCOME,
      }]);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setConversation([{
      sender: MessageSender.AI,
      text: mode === 'search' ? SEARCH_WELCOME : CHAT_WELCOME,
    }]);
    setConversationId(undefined);
    setFollowUps([]);
    setError(null);
  }, [user, mode]);

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

    if (mode === 'chat' && userText) {
      setDetectedLanguage(detectLanguage(userText));
    }

    setConversation(prev => [...prev, userMessage]);
    setFollowUps([]);
    setThinkingSteps([]);
    setIsThinkingExpanded(false);

    const textToSend = inputText;
    const imageToSend = imageFile;
    const currentImagePreview = imagePreview;
    setInputText('');
    handleRemoveImage();
    setIsLoading(true);
    setLoadingStatus(undefined);
    setError(null);
    setThinkingStartTime(Date.now());

    try {
      const messagesToBackend: ApiChatMessage[] = conversation.map(msg => ({
        role: msg.sender === MessageSender.USER ? 'user' : 'assistant',
        content: msg.image ? [
          { type: 'image_url', image_url: { url: msg.image } },
          { type: 'text', text: msg.text || ' ' },
        ] : msg.text,
      }));

      if (mode === 'search') {
        let prompt = `Please provide a comprehensive answer in the ${resolvedLanguage} language. Your entire response must be in ${resolvedLanguage}. If you mention any book titles from the provided context, please state their full exact titles clearly.`;

        if (textToSend.trim()) {
          prompt += `\n\nMy question is: "${textToSend}"`;
        } else if (imageToSend) {
          prompt += `\n\nMy question is based on the attached image.`;
        }

        let currentMessageContent: string | any[] = prompt;
        if (imageToSend && currentImagePreview) {
          currentMessageContent = [
            { type: 'image_url', image_url: { url: currentImagePreview } },
            { type: 'text', text: prompt },
          ];
        }

        messagesToBackend.push({ role: 'user', content: currentMessageContent });

        let aiText = '';
        setConversation(prev => [...prev, { sender: MessageSender.AI, text: '' }]);

        await apiService.globalChatStream(
          searchSystemInstruction.current,
          messagesToBackend,
          {
            onStatus: (event) => {
              const typed: AgentStatusEvent = { ...event, agent: event.agent as AgentStatusEvent['agent'] };
              setThinkingSteps(prev => {
                const existing = prev.findIndex(s => s.agent === typed.agent);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = typed;
                  return updated;
                }
                return [...prev, typed];
              });
              setIsThinkingExpanded(true);
            },
            onToken: (token) => {
              aiText += token;
              setConversation(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.sender === MessageSender.AI) {
                  updated[updated.length - 1] = { ...last, text: aiText };
                }
                return updated;
              });
            },
            onDone: (data) => {
              if (data.conversationId) setConversationId(data.conversationId);
              if (data.followUpQuestions?.length) setFollowUps(data.followUpQuestions);
            },
            onError: (msg) => {
              setError(`Sorry, something went wrong. ${msg}`);
              setConversation(prev => prev.slice(0, -1));
              setInputText(textToSend);
              if (imageToSend && currentImagePreview) {
                setImageFile(imageToSend);
                setImagePreview(currentImagePreview);
              }
            },
          },
          undefined,
          conversationId,
          resolvedLanguage,
        );
      } else {
        let currentMessageContent: string | any[] = textToSend || ' ';
        if (imageToSend && currentImagePreview) {
          currentMessageContent = [
            { type: 'image_url', image_url: { url: currentImagePreview } },
            { type: 'text', text: textToSend || ' ' },
          ];
        }
        messagesToBackend.push({ role: 'user', content: currentMessageContent });

        let aiText = '';
        setConversation(prev => [...prev, { sender: MessageSender.AI, text: '' }]);

        await apiService.globalChatStream(
          chatSystemInstruction.current,
          messagesToBackend,
          {
            onStatus: (event) => {
              const typed: AgentStatusEvent = { ...event, agent: event.agent as AgentStatusEvent['agent'] };
              setThinkingSteps(prev => {
                const existing = prev.findIndex(s => s.agent === typed.agent);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = typed;
                  return updated;
                }
                return [...prev, typed];
              });
              setIsThinkingExpanded(true);
            },
            onToken: (token) => {
              aiText += token;
              setConversation(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.sender === MessageSender.AI) {
                  updated[updated.length - 1] = { ...last, text: aiText };
                }
                return updated;
              });
              setDetectedLanguage(detectLanguage(aiText));
            },
            onDone: (data) => {
              if (data.conversationId) setConversationId(data.conversationId);
              if (data.followUpQuestions?.length) setFollowUps(data.followUpQuestions);
            },
            onError: (msg) => {
              setError(`Sorry, something went wrong. ${msg}`);
              setConversation(prev => prev.slice(0, -1));
              setInputText(textToSend);
              if (imageToSend && currentImagePreview) {
                setImageFile(imageToSend);
                setImagePreview(currentImagePreview);
              }
            },
          },
          undefined,
          conversationId,
          resolvedLanguage,
        );
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
      setTimeout(() => {
        setThinkingSteps([]);
        setIsThinkingExpanded(false);
      }, 2000);
    }
  }, [inputText, imageFile, isLoading, imagePreview, mode, resolvedLanguage, conversation, conversationId]);

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
      text: mode === 'search' ? SEARCH_WELCOME : CHAT_WELCOME,
    }]);
    setError(null);
    setShowClearConfirm(false);
    setConversationId(undefined);
    setFollowUps([]);
    setThinkingSteps([]);
    setIsThinkingExpanded(false);
  };

  const handleFollowUpClick = (question: string) => {
    setInputText(question);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-brand-bg-light dark:bg-brand-bg-dark text-gray-800 dark:text-gray-200 transition-colors duration-300 px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-green/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Sign in Required</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            The AI Assistant is available to signed-in users only. Please log in or create an account to access the full collection of Maududi's works.
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

      {/* Top header bar */}
      <div className="flex-none h-14 bg-white/90 dark:bg-brand-bg-dark/90 backdrop-blur-lg border-b border-emerald-100/40 dark:border-emerald-900/20">
        <div className="flex items-center justify-between h-full px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.back()} className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 whitespace-nowrap" title="Back to library">
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Mode toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setMode('search')}
                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                  mode === 'search'
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                  mode === 'chat'
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Chat
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language selector (header) — only in chat mode */}
            {mode === 'chat' && (
              <ChatLanguageDropdown
                languageMode={chatLanguageMode}
                detectedLanguage={detectedLanguage}
                onChange={setChatLanguageMode}
              />
            )}

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

      {thinkingSteps.length > 0 && (
        <div className="flex-none px-4 max-w-5xl mx-auto w-full">
          <div className="mt-2 mb-1">
            <button
              onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
              className="cursor-pointer flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${isThinkingExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium">
                {isLoading ? 'Thinking...' : `${thinkingSteps.length} steps completed`}
                {!isLoading && thinkingStartTime > 0 && (
                  <span className="ml-1 text-gray-300 dark:text-gray-600">
                    in {((Date.now() - thinkingStartTime) / 1000).toFixed(1)}s
                  </span>
                )}
              </span>
            </button>
            {isThinkingExpanded && (
              <div className="mt-1.5 ml-1 space-y-1 border-l-2 border-emerald-200 dark:border-emerald-800 pl-3">
                {thinkingSteps.map((step, i) => (
                  <div key={`${step.agent}-${i}`} className="flex items-center gap-2 text-xs">
                    {step.done ? (
                      <svg className="w-3 h-3 text-emerald-500 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 flex-none">
                        <div className="w-3 h-3 rounded-full border-2 border-emerald-300 dark:border-emerald-700 border-t-emerald-600 dark:border-t-emerald-400 animate-spin" />
                      </div>
                    )}
                    <span className={step.done ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300 font-medium'}>
                      {step.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ChatMessageList
        messages={conversation}
        isLoading={isLoading}
        loadingStatus={loadingStatus}
        selectedLanguage={resolvedLanguage}
        onNavigateToBook={onNavigateToBook}
        parseStructuredResponse={mode === 'search' ? parseStructuredResponse : undefined}
        books={fetchedBooks}
        followUpQuestions={followUps}
        onFollowUpClick={handleFollowUpClick}
      />

      <ChatInputArea
        input={inputText}
        setInput={setInputText}
        isLoading={isLoading}
        error={error}
        selectedLanguage={resolvedLanguage}
        languages={mode === 'search' ? SEARCH_LANGUAGES : CHAT_LANGUAGE_OPTIONS}
        onSelectLanguage={mode === 'search' ? setSelectedLanguage : undefined}
        onSendMessage={handleSendMessage}
        imageFile={imageFile}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
        fileInputRef={fileInputRef}
        placeholder={mode === 'search' ? 'Message AI Context Finder...' : 'Message the Smart Assistant...'}
        footerText={mode === 'search' ? 'AI Context Finder explores the complete works of Sayyid Abul A\'la Maududi.' : 'Auto-detects your language and replies in kind.'}
        hideLanguageSelector={mode === 'chat'}
      />
    </div>
  );
};

function ChatLanguageDropdown({ languageMode, detectedLanguage, onChange }: { languageMode: string; detectedLanguage: string; onChange: (mode: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 whitespace-nowrap"
        title="Response language"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.78.147 2.653.255" />
        </svg>
        {languageMode === 'Auto' ? `Auto${detectedLanguage !== 'English' ? ` · ${detectedLanguage}` : ''}` : languageMode}
        <ChevronDownIcon className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
          {CHAT_LANGUAGE_OPTIONS.map(lang => (
            <button
              key={lang}
              onClick={() => { onChange(lang); setOpen(false); }}
              className={`cursor-pointer w-full text-left px-3 py-1.5 text-[12px] transition-colors flex items-center gap-2 ${languageMode === lang ? 'bg-brand-green text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <span className="flex-1">{lang === 'Auto' ? 'Auto-detect' : lang}</span>
              {languageMode === lang && <CheckIcon className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Assistant;
