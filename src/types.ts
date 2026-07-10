export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  pdfUrl: string;
  aiContext: string;
  publicationYear: number;
  category: string;
  slug?: string;
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  sender: MessageSender;
  text: string;
  image?: string;
  timestamp?: Date;
}

export interface SavedConversation {
  id: number;
  bookId: number;
  bookTitle: string;
  bookSlug: string;
  topics: string[];
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends SavedConversation {
  messages: { id: number; role: string; content: string }[];
}

export interface BookSuggestion {
  id: number;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  reason: string;
}

export interface ChatResponse {
  response: string;
  followUpQuestions?: string[];
  conversationId?: number;
}
