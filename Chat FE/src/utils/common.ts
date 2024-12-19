import { AskResponse, ChatMessage, Roles } from "@/types"
import { v4 as uuidv4 } from 'uuid';

export const responseToMessage = (res: AskResponse): ChatMessage => {
  return {
    id: uuidv4(),
    content: res.answer,
    sources: res.sources,
    role: Roles.assistant,
    generating: true,
  }
}

export const questionToMessage = (question: string): ChatMessage => {
  return {
    id: uuidv4(),
    content: question,
    role: Roles.user,
    generating: false,
  }
}  