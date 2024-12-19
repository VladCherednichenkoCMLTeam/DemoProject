import { AskResponse } from "@/types";
import axiosInstance from "../axiosInstance";

export const askQuestion = async (question: string, threadId?: string | null): Promise<AskResponse> => {
  const response = await axiosInstance.post<AskResponse>("/ask", { question, threadId });
  return response.data;
};

export const getSuggestions = async (question: string, answer: string): Promise<string[]> => {
  const response = await axiosInstance.post<string[]>("/ask/suggestions", { question, answer });
  return response.data;
};
