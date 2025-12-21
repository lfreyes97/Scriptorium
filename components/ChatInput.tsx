import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

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
      <div className={`relative flex items-center bg-white dark:bg-gray-900 shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-none border border-gray-100 dark:border-gray-800 p-2 transition-all rounded-[2rem]`}>
        
        {/* Left Actions */}
        <div className="flex gap-2 pl-3 mr-2 text-gray-400">
             <button className="hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            </button>
             <button className="hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L13 3z" />
               </svg>
            </button>
        </div>

        {/* Input Area */}
        <div className="flex-1 py-3">
            {isPreview ? (
                 <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 p-1 max-h-[200px] overflow-y-auto">
                    <ReactMarkdown>{input}</ReactMarkdown>
                </div>
            ) : (
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pregúntame lo que quieras..."
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-100 placeholder-gray-300 text-[15px] resize-none max-h-[200px] py-0 leading-relaxed"
                    rows={1}
                    disabled={isLoading}
                />
            )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 pr-2 pl-2">
            <button 
                onClick={() => setIsPreview(!isPreview)}
                className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                title="Vista Previa"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </button>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

            <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${input.trim() ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
            >
                {isLoading ? (
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
                ) : (
                    <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Enviar</span>
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;