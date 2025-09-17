import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, ChatMessage, MessageSender } from '../types';
import { createChat } from '../services/geminiService';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import SendIcon from './icons/SendIcon';
import Spinner from './icons/Spinner';
import type { Chat } from '@google/genai';

interface ChatPageProps {
  book: Book;
  onBack: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ book, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat when component mounts
    chatRef.current = createChat(book.aiContext);
    setMessages([
      { sender: MessageSender.AI, text: `Hello! I am an AI assistant trained on "${book.title}". How can I help you understand this book?` }
    ]);
  }, [book]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !chatRef.current) return;
    
    const userMessage: ChatMessage = { sender: MessageSender.USER, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const aiMessage: ChatMessage = { sender: MessageSender.AI, text: response.text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      console.error("Gemini API Error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Sorry, I couldn't get a response. ${errorMessage}`);
      // Restore user message to input
      setMessages(prev => prev.slice(0, -1));
      setInput(userMessage.text)
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="bg-gray-900 w-full min-h-screen flex flex-col">
      <header className="flex items-center space-x-4 p-4 border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-green-300">Chat about "{book.title}"</h2>
          <p className="text-sm text-gray-400">AI Powered by Gemini</p>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 container mx-auto max-w-3xl w-full">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${msg.sender === MessageSender.USER ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-200 p-3 rounded-lg flex items-center space-x-2">
              <Spinner />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="sticky bottom-0 bg-gray-900/50 backdrop-blur-sm p-4 border-t border-gray-700">
        <div className="container mx-auto max-w-3xl w-full">
          {error && <p className="pb-2 text-red-400 text-sm">{error}</p>}
          <div className="flex items-center bg-gray-700 rounded-lg">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              placeholder="Ask a question..."
              className="flex-1 bg-transparent p-3 text-gray-200 placeholder-gray-400 focus:outline-none resize-none"
              rows={1}
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isLoading || !input.trim()}
              className="p-3 text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Spinner /> : <SendIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;