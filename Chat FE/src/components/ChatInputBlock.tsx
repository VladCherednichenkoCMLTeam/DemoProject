import { ChatInput } from "@/components/ui/chat/chat-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Paperclip } from "lucide-react";
import { forwardRef, useRef, useState } from "react";
import { motion } from "motion/react";

type Props = {
  onSubmit: (value: string) => Promise<void>;
  onAttach: (files: File[]) => Promise<void>;
  isGenerating: boolean;
};

const ChatInputBlock = forwardRef<HTMLFormElement, Props>(
  ({ isGenerating, onSubmit, onAttach }, ref) => {
    const [inputValue, setInputValue] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleInputChange = (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      setInputValue(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setInputValue("");
      await onSubmit(inputValue);
    };

    const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.shiftKey || e.key !== "Enter") return;
      e.preventDefault();

      if (isGenerating || !inputValue) return;
      setInputValue("");
      await onSubmit(inputValue);
    };

    const handleAttachClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (!fileInputRef.current) return;
      fileInputRef.current.click();
    };

    const handleFileChange = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const files = event.target.files;
      if (!files || !files.length) return;

      await onAttach(Array.from(files));
    };

    const handleTextareaFocus = () => {
      inputRef.current?.focus();
    }

    return (
      <div className="w-full px-4">
        <form
          ref={ref}
          onSubmit={handleSubmit}
          className="relative border rounded-3xl bg-white bg-opacity-30  focus-within:ring-1 focus-within:ring-ring focus-within:!ring-gray-800/30"
        >
          <ChatInput
            ref={inputRef}
            value={inputValue}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="min-h-5 max-h-20 resize-none rounded-lg bg-transparent border-0 py-3 px-4 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0" onClick={handleTextareaFocus}>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={handleAttachClick} className="hidden">
                <Paperclip className="size-4" />
                <span className="sr-only">Attach file</span>
              </Button>
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf, .txt"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }} // Hide the input
            />
            <motion.div whileTap={{ scale: 0.9 }} className="ml-auto gap-1.5">
              <Button
                disabled={!inputValue || isGenerating}
                type="submit"
                size="sm"
                className="rounded-full w-10 h-10"
              >
                <ArrowUp strokeWidth={3} size="16" />
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    );
  }
);

export default ChatInputBlock;
