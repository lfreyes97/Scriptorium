import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Paperclip, Plus, Eye } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current && !isPreview) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input, isPreview]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
      setIsPreview(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full relative">
      <div className="relative flex items-end bg-background shadow-lg border border-input p-2 transition-all rounded-[2rem]">

        {/* Left Actions */}
        <div className="flex gap-1 pl-2 mb-2">
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground h-9 w-9">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Input Area */}
        <div className="flex-1 py-2 px-2">
          {isPreview ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground p-3 max-h-[200px] overflow-y-auto border rounded-xl">
              <ReactMarkdown>{input}</ReactMarkdown>
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregúntame lo que quieras..."
              className="w-full min-h-[44px] border-0 focus-visible:ring-0 resize-none shadow-none py-2.5 px-3 max-h-[200px]"
              rows={1}
              disabled={isLoading}
            />
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 pr-2 mb-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPreview(!isPreview)}
            className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-full"
            title="Vista Previa"
          >
            <Eye className="w-5 h-5" />
          </Button>

          <div className="w-px h-6 bg-border mx-1 my-auto"></div>

          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className={`rounded-full h-9 w-9 transition-all ${input.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin"></span>
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;