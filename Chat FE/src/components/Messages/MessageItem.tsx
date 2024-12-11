import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { ChatMessage } from "@/types";
import { motion } from "motion/react";

type Props = {
  message: ChatMessage;
};

const MessagesItem = (props: Props) => {
  const { message } = props;
  const variant = message.role == "user" ? "sent" : "received";

  return (
    <ChatBubble variant={variant}>
      <motion.div
        layout
        initial={{ opacity: 0, y: message.role == "user" ? 50 : -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } }}
      >
        <ChatBubbleMessage variant={variant}>
          <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
        </ChatBubbleMessage>
      </motion.div>
    </ChatBubble>
  );
};

export default MessagesItem;
