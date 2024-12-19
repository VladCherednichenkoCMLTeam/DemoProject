import { useCallback, useEffect, useMemo, useRef } from "react";
import MessagesList from "@/components/Messages/MessagesList";
import ChatInputBlock from "@/components/ChatInputBlock";
import { useChat } from "@/hooks/useChat";

export default function HomePage() {
  const { handleQuestion, handleFileUpload, isLoading, messages, suggestions,
    suggestionsLoading } = useChat();

  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = useCallback(async (value: string) => {
    handleQuestion(value);
  }, [handleQuestion]);


  return (
    <main className="flex h-screen w-full max-w-3xl flex-col items-center mx-auto py-6">
      <MessagesList
        ref={messagesRef}
        messages={messages}
        isLoading={isLoading}
      />

      <ChatInputBlock
        ref={formRef}
        onSubmit={onSubmit}
        suggestions={suggestions}
        suggestionsLoading={suggestionsLoading}
        onAttach={handleFileUpload}
        isLoading={isLoading || messages[messages.length - 1]?.generating}
      />

    </main>
  );
}
