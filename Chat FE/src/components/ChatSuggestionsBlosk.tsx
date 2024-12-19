import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { forwardRef, useCallback, useRef } from "react";

type Props = {
  onSubmit: (value: string) => Promise<void>;
  isGenerating: boolean;
  suggestions: string[];
  suggestionsLoading: boolean;
};

const ChatSuggestionsBlock = forwardRef<HTMLDivElement, Props>(
  ({ isGenerating, onSubmit, suggestions, suggestionsLoading }, ref) => {
    const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedHandleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
      // Prevent the default action if needed (optional)
      // event.preventDefault();

      const { currentTarget, deltaY } = event;

      // Clear any existing timeout
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }

      // Set a new timeout to run the scroll logic after 200ms
      wheelTimeoutRef.current = setTimeout(() => {
        const container = currentTarget;
        if (deltaY > 0) {
          container.scrollLeft += 200;
        } else {
          container.scrollLeft -= 200;
        }
      }, 50);
    }, []);

    return (
      <div className="relative">
        <div className="absolute flex w-[calc(100%-75px)] flex-row my-1 py-1 mx-4 overflow-x-auto overflow-y-hidden top-[-60px] scroll-smooth" ref={ref} onWheel={debouncedHandleWheel}>
          {!isGenerating && !suggestionsLoading && suggestions.map((suggestion) => (
            <motion.div
              key={suggestion}
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
            >
              <Button
                variant="outline"
                onClick={() => onSubmit(suggestion)}
                className="rounded-full mx-2 bg-yellow-100 "
              >
                {suggestion}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
);

export default ChatSuggestionsBlock;
