export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export type Message = {
  id: string;
  sender: 'user' | 'contact';
  author: string;
  text: string;
  timestamp: string;
  attachments?: Attachment[];
};

export type ConversationStatus = 'online' | 'offline';

export type RespondidaPor = 'robo' | 'humano';

export type Conversation = {
  id: string;
  name: string;
  title: string;
  status: ConversationStatus;
  unread: number;
  initials: string;
  respondidaPor: RespondidaPor;
  messages: Message[];
  quickReplies: string[];
  autoReplies: string[];
};
