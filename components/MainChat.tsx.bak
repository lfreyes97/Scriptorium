
import React, { useState, useRef, useEffect } from 'react';
import { Message, AgentConfig, AgentType } from '../types';
import FeaturedAgents from './FeaturedAgents';
import ChatInput from './ChatInput';
import EditorView from './EditorView';
import { sendMessageToGemini } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const MainChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgentType, setActiveAgentType] = useState<AgentType>('chat');
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeAgentType]);

  const handleAgentSelect = async (config: AgentConfig) => {
    setActiveAgentType(config.type);
    if (config.type === 'chat' && config.initialPrompt) {
        handleSendMessage(config.initialPrompt);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const responseText = await sendMessageToGemini(text, history);
    const modelMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const handleBackToHome = () => {
    setActiveAgentType('chat');
    setMessages([]);
  };

  const triggerCommandMenu = () => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: true,
          bubbles: true
      }));
  };

  if (activeAgentType === 'editor') {
      return (
          <div className="flex-1 h-screen relative bg-background">
              <EditorView onBack={handleBackToHome} />
          </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col h-screen relative bg-white dark:bg-gray-950">
      
      {/* GLOBAL HEADER */}
      <div className="sticky top-0 z-40 w-full flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        
        <div className="flex items-center gap-4">
          <button onClick={handleBackToHome} className="flex items-center gap-3 group transition-all">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground shadow-lg font-serif font-bold">
                S
            </div>
            <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-900 dark:text-white">Scriptorium</span>
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">Presuposicionalismo</span>
                </div>
            </div>
          </button>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden sm:block">
            <button onClick={triggerCommandMenu} className="w-full h-9 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full px-4 flex items-center justify-between text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 transition-all group">
                <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <span className="text-xs font-medium">Buscar en el Scriptorium...</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="text-[10px] font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded shadow-sm">⌘K</kbd>
                </div>
            </button>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-3 pr-4 border-r border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Status</span>
                    <span className="text-[10px] font-mono text-green-500 font-bold mt-1">ACTIVE</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>

            <div className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded border border-transparent">
                <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Internal Protocol</span>
            </div>

            <button className="flex items-center gap-2 p-1 pl-1 pr-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full hover:shadow-md transition-all">
                <img src="https://picsum.photos/id/64/40/40" className="w-7 h-7 rounded-full grayscale" alt="User" />
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 hidden sm:block">Amanuense</span>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-40 scroll-smooth custom-scrollbar">
        <div className="max-w-5xl mx-auto px-6 pt-16">
            {messages.length === 0 ? (
                <div className="flex flex-col animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center mb-16">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-4">Scholarly Intelligence Workspace</h2>
                        <h1 className="text-6xl font-black text-gray-900 dark:text-white tracking-tight font-serif">
                            Scriptorium
                        </h1>
                        <p className="mt-4 text-gray-500 max-w-lg mx-auto text-sm leading-relaxed font-medium">
                            Bienvenido al entorno de preservación y síntesis intelectual. Aquí orquestamos la verdad con rigor, lógica y presuposición.
                        </p>
                    </div>
                    
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-6 pl-1">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estaciones de Trabajo</h3>
                            <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1 ml-4"></div>
                        </div>
                        <FeaturedAgents onAgentSelect={handleAgentSelect} />
                    </div>
                </div>
            ) : (
                <div className="space-y-8 pb-10">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-sm ${msg.role === 'user' ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800' : 'bg-primary text-primary-foreground border-transparent'}`}>
                                {msg.role === 'user' ? (
                                    <img src="https://picsum.photos/id/64/40/40" alt="User" className="w-full h-full rounded-lg grayscale" />
                                ) : (
                                    <span className="text-[10px] font-black font-serif">S</span>
                                )}
                            </div>
                            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-6 py-4 text-[15px] leading-7 shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-3xl rounded-tr-sm' 
                                    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-3xl rounded-tl-sm font-serif'
                                }`}>
                                    {msg.role === 'model' ? (
                                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-gray-950 dark:via-gray-950/90 z-20">
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        <p className="text-center text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-[0.2em]">
            Scriptorium v2.5.0 &middot; Documentatio et Logica
        </p>
      </div>
    </div>
  );
};

export default MainChat;
