import { getSuggestions } from "@/api/services/askService";
import { uploadFiles } from "@/api/services/fileService";
import { AskResponse, ChatMessage } from "@/types";
import { questionToMessage, responseToMessage } from "@/utils/common";
import { useCallback, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState<boolean>(false);

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!files || !files.length) return;

    try {
      setIsLoading(true);
      const result = await uploadFiles(files);
      // Handle server response

    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    const question = messages[messages.length - 2].content;
    const AIresponse = messages[messages.length - 1].content;
    const suggestions = await getSuggestions(question, AIresponse);
    setSuggestions(suggestions);
    setSuggestionsLoading(false);
  }, [setSuggestions, setSuggestionsLoading, messages]);

  const handlePartMessage = useCallback(async (result: AskResponse) => {
    const assistantMessage = responseToMessage(result);
    setIsLoading(false);
    setThreadId(result.threadId);
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage.role !== assistantMessage.role) {
        return [...prev, assistantMessage];
      } else {
        const index = prev.length - 1;
        const newMessages = [...prev];
        newMessages[index] = { ...newMessages[index], content: newMessages[index].content + assistantMessage.content };
        return newMessages;
      }
    });
  }, []);

  const handleEndMessage = useCallback(() => {
    setIsLoading(false);
    setMessages((prev) => {
      const index = prev.length - 1;
      const newMessages = [...prev];
      newMessages[index] = { ...newMessages[index], generating: false };
      return newMessages;
    })
    handleSuggestions();
  }, [handleSuggestions]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL + '/chat', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    setSocket(socket);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('partMessage', handlePartMessage);
    socket.on('endMessage', handleEndMessage);

    return () => {
      socket.off('partMessage', handlePartMessage);
      socket.off('endMessage', handleEndMessage);
    };
  }, [socket, handlePartMessage, handleEndMessage]);

  const handleQuestion = useCallback(async (question: string) => {
    try {
      setIsLoading(true);
      const userMessage = questionToMessage(question);
      setMessages((prev) => [...prev, userMessage]);

      socket?.emit('askQuestion', { question, threadId });
    } catch (error) {
      console.error("Error asking question:", error);
      setIsLoading(false);
    }
  }, [threadId, socket, setIsLoading, setMessages]);

  return {
    isLoading,
    suggestions,
    suggestionsLoading,
    handleQuestion,
    handleFileUpload,
    messages,
    socket,
    io
  }
}