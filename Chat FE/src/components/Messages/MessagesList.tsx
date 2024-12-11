import { ChatBubble } from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";

import { forwardRef } from "react";
import MessagesItem from "./MessageItem";
import MessagesItemInitial from "./MessageItemInitial";
import { ChatMessage } from "@/types";
import Loader from "../ui/Loader/Loader";

type Props = {
  messages: ChatMessage[];
  isGenerating: boolean;
};

const MessagesList = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { isGenerating, messages } = props;

  return (
    <ChatMessageList ref={ref} className="scroll-smooth">
      {messages.length === 0 && <MessagesItemInitial />}

      {messages &&
        messages.map((message) => (
          <MessagesItem key={message.id} message={message} />
        ))}

      {isGenerating && (
        <ChatBubble variant="received">
          <Loader />
        </ChatBubble>
      )}
    </ChatMessageList>
  );
});

export default MessagesList;
