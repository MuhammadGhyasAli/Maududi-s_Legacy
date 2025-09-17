import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { Book, MessageSender } from '../types';
import { BOOKS } from '../constants';
import { createChat } from '../services/geminiService';
import Spinner from './icons/Spinner';
import PaperclipIcon from './icons/PaperclipIcon';
import SendIcon from './icons/SendIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import TrashIcon from './icons/TrashIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import LanguageSelector from './LanguageSelector';
import CloseIcon from './icons/CloseIcon';

interface AiContextFinderPageProps {
  onBack: () => void;
  onNavigateToBook: (book: Book) => void;
}

interface ConversationPart {
  sender: MessageSender;
  text: string;
  image?: string;
}

interface StructuredResponse {
    bookTitle?: string;
    chapter?: string;
    page?: string;
    context?: string;
    remainingText: string;
}

const LANGUAGES = ['English', 'Turkish', 'Urdu', 'Arabic', 'Persian', 'Bengali'];

const getLangProps = (text: string, selectedLang: string): { dir: 'ltr' | 'rtl', className: string } => {
    const rtlLangs = ['Urdu', 'Arabic', 'Persian'];
    if (rtlLangs.includes(selectedLang)) {
        let className = 'font-arabic';
        if (selectedLang === 'Urdu') className = 'font-nastaaliq';
        return { dir: 'rtl', className };
    }
    const hasRtlChars = /[\u0600-\u06FF\u0750-\u077F\u0590-\u05FF]/.test(text);
    if (hasRtlChars) return { dir: 'rtl', className: 'font-nastaaliq' };
    return { dir: 'ltr', className: '' };
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const renderFormattedMessage = (text: string, onNavigateToBook: (book: Book) => void): React.ReactNode[] => {
    const titles = BOOKS.map(book => book.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    // Regex explanation:
    // 1. (${titles}): Captures a book title exactly as it appears in the list.
    // 2. (\\*\\*([\\s\\S]+?)\\*\\*): Captures bold text. Must come before italic.
    // 3. (\\*([\\s\\S]+?)\\*): Captures italic text.
    const regex = new RegExp(`(${titles})|(\\*\\*([\\s\\S]+?)\\*\\*)|(\\*([\\s\\S]+?)\\*)`, 'g');
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let keyIndex = 0;

    if (!text) return parts;

    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(<React.Fragment key={`text-${keyIndex++}`}>{text.substring(lastIndex, match.index)}</React.Fragment>);
        }

        const bookTitle = match[1];
        const boldContent = match[3];
        const italicContent = match[5];

        if (bookTitle) {
            const book = BOOKS.find(b => b.title === bookTitle);
            if (book) {
                parts.push(
                    <button key={`book-${keyIndex++}`} className="text-brand-blue dark:text-brand-blue font-bold underline hover:opacity-80 transition-opacity" onClick={() => onNavigateToBook(book)}>
                        {book.title}
                    </button>
                );
            } else {
                parts.push(<React.Fragment key={`text-${keyIndex++}`}>{bookTitle}</React.Fragment>);
            }
        } else if (boldContent) {
            parts.push(<strong key={`bold-${keyIndex++}`}>{renderFormattedMessage(boldContent, onNavigateToBook)}</strong>);
        } else if (italicContent) {
            parts.push(<em key={`italic-${keyIndex++}`}>{renderFormattedMessage(italicContent, onNavigateToBook)}</em>);
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(<React.Fragment key={`text-${keyIndex++}`}>{text.substring(lastIndex)}</React.Fragment>);
    }

    return parts;
};

const parseStructuredResponse = (text: string): StructuredResponse | null => {
    // More flexible regex to find key-value pairs.
    const bookTitleRegex = /^(?:\*\*|)?(?:Book(?: Title)?|Source)(?:\*\*|)?\s*:\s*(.*)/im;
    const chapterRegex = /^(?:\*\*|)?(?:Chapter(?:\/Section)?|Section)(?:\*\*|)?\s*:\s*(.*)/im;
    const pageRegex = /^(?:\*\*|)?(?:Page(?: Number| No\.)?)(?:\*\*|)?\s*:\s*(.*)/im;
    // Refined context regex: captures content non-greedily until a blank line or the end of the string.
    const contextRegex = /^(?:\*\*|)?(?:Context|Quote|Paragraph|Excerpt)(?:\*\*|)?\s*:([\s\S]+?)(?=\n\s*\n|$)/im;

    const bookTitleMatch = text.match(bookTitleRegex);
    // Book title is mandatory for this to be a structured response.
    if (!bookTitleMatch) {
        return null;
    }

    const chapterMatch = text.match(chapterRegex);
    const pageMatch = text.match(pageRegex);
    const contextMatch = text.match(contextRegex);

    // To get the remaining conversational text, we start with the full text
    // and remove all the structured parts we've identified.
    let remainingText = text;
    // Use match[0] to replace the entire matched line (e.g., "Book Title: ...")
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


const AiContextFinderPage: React.FC<AiContextFinderPageProps> = ({ onBack, onNavigateToBook }) => {
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationPart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  
  const chatRef = useRef<Chat | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const systemInstruction = useRef('');

  useEffect(() => {
    const bookListForPrompt = BOOKS.map(b => `- "${b.title}"`).join('\n');
    systemInstruction.current = `You are an AI-powered search engine and expert archivist for the literary works of Sayyid Abul A'la Maududi. Your knowledge base consists of the following books:\n---\n${bookListForPrompt}\n---\nYour function is two-fold:
1.  **Locate & Cite:** First, when a user provides a quote or topic, your primary goal is to locate the most relevant source within these books. If you find a direct match or a highly relevant passage, you MUST present this information clearly at the beginning of your response, formatted like this:
    **Book Title:** [Full Book Title]
    **Chapter/Section:** [Chapter or Section Name]
    **Page Number:** [Page Number]
    **Context:** [The relevant verbatim paragraph or quote]
2.  **Explain & Elaborate:** After providing the citation (if found), your second goal is to provide a comprehensive, detailed, and insightful explanation of the topic, drawing from the principles and context found in Maududi's works. Your explanation should be thorough and well-reasoned, similar to how an expert on his literature would respond.

**Crucial Rules:**
- **Accuracy is paramount.** Do not invent page numbers. If you are not certain, state that the page number is approximate (e.g., "Approx. page 277"). A correct chapter is more valuable than an incorrect page number.
- **Always use the exact book titles** from the list provided. For example, use "Tafheem ul Quran (Vol. 1)", not "Tafheem ul Quran, Volume 1".
- **If no specific citation is found,** proceed directly to the detailed explanation based on the collective knowledge from the books.

**Mandatory Two-Step Process for Image Queries:**
If the user's message includes an image, you MUST follow this two-step process without exception:
1.  **Step 1: Identification & Confirmation.** Your FIRST response must ONLY identify the book the image is from and ask for confirmation to proceed. DO NOT provide any other details, context, or explanation. Your response should be brief and direct, like this: "This image appears to be from [Book Title]. Would you like a detailed analysis and context?"
2.  **Step 2: Detailed Analysis (On User Confirmation).** Only after the user confirms (e.g., they say "yes"), you will then provide the full, two-part response (citation + explanation) as described in the rules above. This is the only time you should provide a deep analysis for an image query.`;
      
    chatRef.current = createChat(systemInstruction.current);
    setConversation([{
        sender: MessageSender.AI,
        text: `I am an AI-powered search engine and expert archivist for the literary works of Sayyid Abul A'la Maududi. My function is to retrieve information, quotes, and context from the specific books listed in my knowledge base.`,
    }]);
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
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
    if ((!inputText.trim() && !imageFile) || isLoading || !chatRef.current) return;

    const userMessage: ConversationPart = { sender: MessageSender.USER, text: inputText.trim() };
    if (imagePreview) userMessage.image = imagePreview;
    setConversation(prev => [...prev, userMessage]);

    const textToSend = inputText;
    const imageToSend = imageFile;
    const currentImagePreview = imagePreview;
    setInputText('');
    handleRemoveImage();
    setIsLoading(true);
    setError(null);

    try {
        const messageParts: ( {text: string} | { inlineData: { data: string; mimeType: string; } })[] = [];
        let prompt = `Please provide a comprehensive answer in the ${selectedLanguage} language. Your entire response must be in ${selectedLanguage}. If you mention any book titles from the provided context, please state their full exact titles clearly.`;
        
        if(textToSend.trim()) {
            prompt += `\n\nMy question is: "${textToSend}"`;
        } else if (imageToSend) {
            prompt += `\n\nMy question is based on the attached image.`;
        }

        if (imageToSend) {
            const imagePart = await fileToGenerativePart(imageToSend);
            messageParts.push(imagePart);
        }
        
        messageParts.push({ text: prompt });
        
        const response = await chatRef.current.sendMessage({ message: messageParts });
        setConversation(prev => [...prev, { sender: MessageSender.AI, text: response.text }]);
    } catch (e) {
      console.error("Gemini API Error:", e);
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
  }, [inputText, imageFile, isLoading, imagePreview, selectedLanguage]);

  const handleCopyChat = async () => {
    const transcript = conversation.map(msg => `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)}: ${msg.text}`).join('\n\n');
    await navigator.clipboard.writeText(transcript);
    alert('Chat copied!');
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
        chatRef.current = createChat(systemInstruction.current); 
        setConversation([{
            sender: MessageSender.AI,
            text: "Hello! I am an AI-powered search engine and expert archivist for the literary works of Sayyid Abul A'la Maududi. My function is to retrieve information, quotes, and context from the specific books listed in my knowledge base.",
        }]);
        setError(null);
    }
  };

  const { dir: inputDir, className: inputClassName } = getLangProps(inputText, selectedLanguage);

  return (
    <div className="bg-brand-bg-light dark:bg-brand-bg-dark w-full min-h-screen flex flex-col transition-colors duration-300">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-brand-bg-light/80 dark:bg-brand-bg-dark/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center space-x-4">
                <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-brand-green dark:text-brand-green-dark">AI Context Finder</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">AI Powered by Gemini</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={handleCopyChat} className="text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Copy Chat">
                    <ClipboardIcon className="w-6 h-6" />
                </button>
                <button onClick={handleClearChat} className="text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Clear Chat">
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4 container mx-auto max-w-3xl w-full">
            {conversation.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-lg p-3 rounded-lg flex flex-col gap-2 ${msg.sender === MessageSender.USER ? 'bg-brand-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200'}`}>
                    {msg.sender === MessageSender.USER ? (() => {
                        const { dir, className } = getLangProps(msg.text, selectedLanguage);
                        return (
                            <>
                                {msg.image && <img src={msg.image} alt="User upload" className="max-w-xs rounded-md" />}
                                {msg.text && <p className={`whitespace-pre-wrap ${className}`} dir={dir}>{msg.text}</p>}
                            </>
                        );
                    })() : (() => {
                        const structuredDetails = parseStructuredResponse(msg.text);
                        const { dir, className } = getLangProps(msg.text, selectedLanguage);
                        
                        if (structuredDetails) {
                            return (
                                <div className="space-y-3" dir={dir}>
                                    <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded-md border-l-4 border-brand-green dark:border-brand-green-dark">
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Context Found</p>
                                        {structuredDetails.bookTitle && (
                                            <div className="mt-1">
                                                <strong className="text-gray-800 dark:text-gray-200 text-sm">Book:</strong>{' '}
                                                <span className={className}>
                                                    {renderFormattedMessage(structuredDetails.bookTitle, onNavigateToBook)}
                                                </span>
                                            </div>
                                        )}
                                        {structuredDetails.chapter && (
                                            <div className="mt-1">
                                                <strong className="text-gray-800 dark:text-gray-200 text-sm">Chapter/Section:</strong>{' '}
                                                <span className={className}>{renderFormattedMessage(structuredDetails.chapter, onNavigateToBook)}</span>
                                            </div>
                                        )}
                                        {structuredDetails.page && (
                                            <div className="mt-1">
                                                <strong className="text-gray-800 dark:text-gray-200 text-sm">Page:</strong>{' '}
                                                <span className={className}>{renderFormattedMessage(structuredDetails.page, onNavigateToBook)}</span>
                                            </div>
                                        )}
                                        {structuredDetails.context && (
                                            <blockquote className={`mt-2 pl-3 border-l-2 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 italic ${className}`}>
                                                {renderFormattedMessage(structuredDetails.context, onNavigateToBook)}
                                            </blockquote>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                          Note: Page numbers are AI-generated estimates and may vary based on the PDF edition. Please verify with the source.
                                        </p>
                                    </div>
                                    {structuredDetails.remainingText && (
                                        <div className={`whitespace-pre-wrap ${className}`}>
                                            {renderFormattedMessage(structuredDetails.remainingText, onNavigateToBook)}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        
                        return (
                            <div className={`whitespace-pre-wrap ${className}`} dir={dir}>
                                {renderFormattedMessage(msg.text, onNavigateToBook)}
                            </div>
                        );
                    })()}
                </div>
            </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 inline-flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bubble"></span>
                <span className="h-2.5 w-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bubble [animation-delay:0.2s]"></span>
                <span className="h-2.5 w-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bubble [animation-delay:0.4s]"></span>
              </div>
            </div>
        )}
        <div ref={conversationEndRef} />
        </main>

        <footer className="sticky bottom-0 bg-brand-bg-light/80 dark:bg-brand-bg-dark/80 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto max-w-3xl w-full">
                {error && <p className="pb-2 text-red-500 dark:text-red-400 text-sm">{error}</p>}
                
                {imagePreview && (
                    <div className="relative w-24 h-24 mb-2 p-1 border border-gray-300 dark:border-gray-600 rounded-md">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded"/>
                        <button 
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                            aria-label="Remove image"
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                        aria-label="Attach image"
                    >
                        <PaperclipIcon className="w-6 h-6" />
                    </button>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        placeholder="Ask a question or paste text..."
                        className={`flex-1 bg-transparent p-3 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none ${inputClassName}`}
                        rows={1}
                        dir={inputDir}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSendMessage} 
                        disabled={isLoading || (!inputText.trim() && !imageFile)}
                        className="p-3 text-brand-blue hover:opacity-80 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        {isLoading ? <Spinner className="text-brand-blue"/> : <SendIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </footer>

        <LanguageSelector 
            languages={LANGUAGES}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
        />
    </div>
  );
};

export default AiContextFinderPage;