export enum Role {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  isLoading?: boolean;
  isImage?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}
