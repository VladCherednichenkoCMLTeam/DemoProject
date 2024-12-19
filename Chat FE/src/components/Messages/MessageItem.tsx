import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { ChatMessage } from "@/types";
import { motion } from "motion/react";
import { BookCopy } from "lucide-react";

type Props = {
  message: ChatMessage;
};

const MessagesItem = (props: Props) => {
  const { message } = props;
  const variant = message.role == "user" ? "sent" : "received";
  const content = message.generating ? message.content + ' ⚫' : message.content;
  return (
    <ChatBubble variant={variant}>
      <motion.div
        layout
        initial={{ opacity: 0, y: message.role == "user" ? 50 : -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } }}
      >
        <ChatBubbleMessage variant={variant}>
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
          {!message.generating && message.sources && message.sources.length > 0 && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="w-max"><BookCopy /></TooltipTrigger>
                  <TooltipContent className="whitespace-pre-wrap">
                    {message.sources.join('\n\n')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </ChatBubbleMessage>
      </motion.div>
    </ChatBubble>
  );
};

export default MessagesItem;
