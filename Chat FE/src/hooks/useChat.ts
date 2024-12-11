import { askQuestion } from "@/api/services/askService";
import { uploadFiles } from "@/api/services/fileService";
import { ChatMessage } from "@/types";
import { questionToMessage, responseToMessage } from "@/utils/common";
import { useCallback, useState } from "react";

export const useChat = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!files || !files.length) return;

    try {
      setIsGenerating(true);
      const result = await uploadFiles(files);
      console.log("Upload Result:", result);
      // Handle server response

    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleQuestion = useCallback(async (question: string) => {
    try {
      setIsGenerating(true);
      const userMessage = questionToMessage(question);
      setMessages((prev) => [...prev, userMessage]);

      const result = await askQuestion(question, threadId);
      setThreadId(result.threadId);

      const assistantMessage = responseToMessage(result);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [threadId]);

  return {
    isGenerating,
    handleQuestion,
    handleFileUpload,
    messages,
  }
}