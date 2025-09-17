
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
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  sender: MessageSender;
  text: string;
  image?: string;
}