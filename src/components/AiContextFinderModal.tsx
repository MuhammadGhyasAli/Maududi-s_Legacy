"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Book, MessageSender } from '../types';
import { apiService, ApiChatMessage } from '../services/apiService';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import TrashIcon from './icons/TrashIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import { useToast } from './Toast';
import ChatMessageList, { StructuredResponse } from './chat/ChatMessageList';
import ChatInputArea from './chat/ChatInputArea';
import { useAuth } from '../contexts/AuthContext';

interface AiContextFinderPageProps {
  onNavigateToBook: (book: Book) => void;
}

interface ConversationPart {
  sender: MessageSender;
  text: string;
  image?: string;
}

const LANGUAGES = ['English', 'Turkish', 'Urdu', 'Arabic', 'Persian', 'Bengali'];

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

const AiContextFinderPage: React.FC<AiContextFinderPageProps> = ({ onNavigateToBook }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationPart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [fetchedBooks, setFetchedBooks] = useState<Book[]>([]);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [followUps, setFollowUps] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const systemInstruction = useRef('');

  useEffect(() => {
    apiService.getBooks().then(fetchedBooks => {
      setFetchedBooks(fetchedBooks as any);
      const bookListForPrompt = fetchedBooks.map(b => `- "${b.title}"`).join('\n');
    systemInstruction.current = `You are an AI-powered search engine and expert archivist for the literary works of Sayyid Abul A'la Maududi. Your knowledge base consists of the following books:\n---\n${bookListForPrompt}\n---\nYour function is two-fold:
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
      
      systemInstruction.current = systemInstruction.current.replace('---\n---', '---');
      setConversation([{
          sender: MessageSender.AI,
          text: `I am an AI-powered search engine and expert archivist for the literary works of Sayyid Abul A'la Maududi. My function is to retrieve information, quotes, and context from the specific books listed in my knowledge base.`,
      }]);
    }).catch(() => {
      setConversation([{
          sender: MessageSender.AI,
          text: `I am an AI-powered search engine and expert archivist for the literary works of Sayyid Abul A'la Maududi. My function is to retrieve information, quotes, and context from the specific books listed in my knowledge base.`,
      }]);
    });
  }, []);
  
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
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleSendMessage = useCallback(async () => {
    if ((!inputText.trim() && !imageFile) || isLoading) return;

    const userMessage: ConversationPart = { sender: MessageSender.USER, text: inputText.trim() };
    if (imagePreview) userMessage.image = imagePreview;
    setConversation(prev => [...prev, userMessage]);
    setFollowUps([]);

    const textToSend = inputText;
    const imageToSend = imageFile;
    const currentImagePreview = imagePreview;
    setInputText('');
    handleRemoveImage();
    setIsLoading(true);
    setError(null);

    try {
        let prompt = `Please provide a comprehensive answer in the ${selectedLanguage} language. Your entire response must be in ${selectedLanguage}. If you mention any book titles from the provided context, please state their full exact titles clearly.`;
        
        if(textToSend.trim()) {
            prompt += `\n\nMy question is: "${textToSend}"`;
        } else if (imageToSend) {
            prompt += `\n\nMy question is based on the attached image.`;
        }

        const messagesToBackend: ApiChatMessage[] = conversation.map(msg => ({
          role: msg.sender === MessageSender.USER ? 'user' : 'assistant',
          content: msg.image ? [
            { type: 'image_url', image_url: { url: msg.image } },
            { type: 'text', text: msg.text || ' ' }
          ] : msg.text
        }));

        let currentMessageContent: string | any[] = prompt;
        if (imageToSend && currentImagePreview) {
            currentMessageContent = [
                { type: 'image_url', image_url: { url: currentImagePreview } },
                { type: 'text', text: prompt }
            ];
        }

        messagesToBackend.push({ role: 'user', content: currentMessageContent });

        const response = await apiService.globalChat(systemInstruction.current, messagesToBackend, undefined, conversationId, selectedLanguage);
        setConversation(prev => [...prev, { sender: MessageSender.AI, text: response.response }]);

        if (response.conversationId) {
          setConversationId(response.conversationId);
        }
        if (response.followUpQuestions && response.followUpQuestions.length > 0) {
          setFollowUps(response.followUpQuestions);
        }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Sorry, something went wrong. ${errorMessage}`);
      setConversation(prev => prev.slice(0, -1));
      setInputText(textToSend);
      if(imageToSend && currentImagePreview) {
        setImageFile(imageToSend);
        setImagePreview(currentImagePreview);
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputText, imageFile, isLoading, imagePreview, selectedLanguage, conversation, conversationId]);

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
        text: "Hello! I am an AI-powered search engine and expert archivist for the literary works of Sayyid Abul A'la Maududi. My function is to retrieve information, quotes, and context from the specific books listed in my knowledge base.",
    }]);
    setError(null);
    setShowClearConfirm(false);
    setConversationId(undefined);
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
            <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Sign in Required</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            The AI Context Finder is available to signed-in users only. Please log in or create an account to access the full collection of Maududi's works.
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
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">AI Context Finder</span>
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
        messages={conversation} 
        isLoading={isLoading} 
        selectedLanguage={selectedLanguage}
        onNavigateToBook={onNavigateToBook}
        parseStructuredResponse={parseStructuredResponse}
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
        languages={LANGUAGES}
        onSelectLanguage={setSelectedLanguage}
        onSendMessage={handleSendMessage}
        imageFile={imageFile}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
        fileInputRef={fileInputRef}
        placeholder="Message AI Context Finder..."
        footerText="AI Context Finder explores the complete works of Sayyid Abul A'la Maududi."
      />
    </div>
  );
};

export default AiContextFinderPage;