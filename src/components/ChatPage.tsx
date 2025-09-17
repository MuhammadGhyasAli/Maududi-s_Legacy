import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, ChatMessage, MessageSender } from '../types';
import { BOOKS } from '../constants';
import { createChat } from '../services/geminiService';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import SendIcon from './icons/SendIcon';
import Spinner from './icons/Spinner';
import TrashIcon from './icons/TrashIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import LanguageSelector from './LanguageSelector';
import PaperclipIcon from './icons/PaperclipIcon';
import CloseIcon from './icons/CloseIcon';
import type { Chat } from '@google/genai';

interface ChatPageProps {
  book: Book;
  onBack: () => void;
  onNavigateToBook: (book: Book) => void;
}

const LANGUAGES = ['English', 'Turkish', 'Urdu', 'Arabic', 'Persian', 'Bengali'];

const getLangProps = (text: string, selectedLang: string): { dir: 'ltr' | 'rtl', className: string } => {
    const rtlLangs = ['Urdu', 'Arabic', 'Persian'];
    
    if (rtlLangs.includes(selectedLang)) {
        let className = 'font-arabic'; // Default RTL font
        if (selectedLang === 'Urdu') {
            className = 'font-nastaaliq';
        }
        return { dir: 'rtl', className };
    }

    // Fallback for user input detection
    const hasRtlChars = /[\u0600-\u06FF\u0750-\u077F\u0590-\u05FF]/.test(text);
    if (hasRtlChars) {
        return { dir: 'rtl', className: 'font-nastaaliq' };
    }
    
    return { dir: 'ltr', className: '' };
};

const renderFormattedMessage = (text: string, onNavigateToBook: (book: Book) => void): React.ReactNode[] => {
    const titles = BOOKS.map(book => book.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
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

const ChatPage: React.FC<ChatPageProps> = ({ book, onBack, onNavigateToBook }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const systemInstruction = `${book.aiContext}\n\n**Mandatory Two-Step Process for Image Queries:**\nIf the user's message includes an image, you MUST follow this two-step process without exception:\n1.  **Step 1: Identification & Confirmation.** Your FIRST response must ONLY identify the content of the image in the context of the book and ask for confirmation to proceed with a detailed analysis. Your response should be brief and direct, like this: "This image appears to show [subject matter from image]. Would you like a detailed analysis based on the book's content?"\n2.  **Step 2: Detailed Analysis (On User Confirmation).** Only after the user confirms (e.g., they say "yes"), you will then provide a full, detailed explanation.`;
    chatRef.current = createChat(systemInstruction);
    setMessages([
      { sender: MessageSender.AI, text: `Hello! I am an AI assistant trained on "${book.title}". How can I help you? You can also upload an image for discussion.` }
    ]);
  }, [book]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

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
    if ((!input.trim() && !imageFile) || isLoading || !chatRef.current) return;
    
    const userMessage: ChatMessage = { sender: MessageSender.USER, text: input.trim() };
    if (imagePreview) userMessage.image = imagePreview;
    setMessages(prev => [...prev, userMessage]);

    const textToSend = input;
    const imageToSend = imageFile;
    const currentImagePreview = imagePreview;

    setInput('');
    handleRemoveImage();
    setIsLoading(true);
    setError(null);

    try {
        const messageParts: ( {text: string} | { inlineData: { data: string; mimeType: string; } })[] = [];
        let prompt = `Please provide a comprehensive answer in the ${selectedLanguage} language based on the book's content. Your entire response must be in ${selectedLanguage}. If you mention any book titles from the provided context, please state their full exact titles clearly.`;
        
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
        const aiMessage: ChatMessage = { sender: MessageSender.AI, text: response.text };
        setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      console.error("Gemini API Error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Sorry, I couldn't get a response. ${errorMessage}`);
      setMessages(prev => prev.slice(0, prev.length -1));
      setInput(textToSend);
      if (imageToSend && currentImagePreview) {
          setImageFile(imageToSend);
          setImagePreview(currentImagePreview);
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedLanguage, imageFile, imagePreview]);

  const handleCopyChat = async () => {
    const transcript = messages.map(msg => {
        let content = `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)}: ${msg.text}`;
        if (msg.image) {
            content = `[Image Attached]\n` + content;
        }
        return content;
    }).join('\n\n');
    try {
      await navigator.clipboard.writeText(transcript);
      alert('Chat copied to clipboard!');
    } catch (error) {
      console.error('Copying failed', error);
      alert('Could not copy chat.');
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
        const systemInstruction = `${book.aiContext}\n\n**Mandatory Two-Step Process for Image Queries:**\nIf the user's message includes an image, you MUST follow this two-step process without exception:\n1.  **Step 1: Identification & Confirmation.** Your FIRST response must ONLY identify the content of the image in the context of the book and ask for confirmation to proceed with a detailed analysis. Your response should be brief and direct, like this: "This image appears to show [subject matter from image]. Would you like a detailed analysis based on the book's content?"\n2.  **Step 2: Detailed Analysis (On User Confirmation).** Only after the user confirms (e.g., they say "yes"), you will then provide a full, detailed explanation.`;
        chatRef.current = createChat(systemInstruction);
        setMessages([
            { sender: MessageSender.AI, text: `Hello! I am an AI assistant trained on "${book.title}". How can I help you? You can also upload an image for discussion.` }
        ]);
        setError(null);
    }
  };

  const { dir: inputDir, className: inputClassName } = getLangProps(input, selectedLanguage);

  return (
    <div className="bg-brand-bg-light dark:bg-brand-bg-dark w-full min-h-screen flex flex-col transition-colors duration-300">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-brand-bg-light/80 dark:bg-brand-bg-dark/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-brand-green dark:text-brand-green-dark">Chat about "{book.title}"</h2>
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
        {messages.map((msg, index) => {
          const { dir, className } = getLangProps(msg.text, selectedLanguage);
          
          return (
            <div key={index} className={`flex ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg p-3 rounded-lg flex flex-col gap-2 ${msg.sender === MessageSender.USER ? 'bg-brand-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200'}`}>
                 {msg.image && <img src={msg.image} alt="User upload" className="max-w-xs rounded-md" />}
                 {msg.text && (
                    <div 
                      className={`whitespace-pre-wrap ${className}`}
                      dir={dir}
                    >
                      {msg.sender === MessageSender.AI 
                        ? renderFormattedMessage(msg.text, onNavigateToBook)
                        : msg.text}
                    </div>
                 )}
              </div>
            </div>
          )
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 inline-flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bubble"></span>
              <span className="h-2.5 w-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bubble [animation-delay:0.2s]"></span>
              <span className="h-2.5 w-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bubble [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              placeholder="Ask a question..."
              className={`flex-1 bg-transparent p-3 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none ${inputClassName}`}
              rows={1}
              dir={inputDir}
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isLoading || (!input.trim() && !imageFile)}
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

export default ChatPage;