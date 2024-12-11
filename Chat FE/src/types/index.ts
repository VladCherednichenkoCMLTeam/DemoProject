export interface FileResponse {
  acceptedFiles: string[];
  rejectedFiles: string[];
}

export interface AskResponse {
  answer: string;
  sources: string[];
  threadId: string;
}

export enum Roles {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

export type ChatMessage = {
  id: string;
  createdAt?: Date;
  content: string;
  sources?: string[];
  role: Roles,
}