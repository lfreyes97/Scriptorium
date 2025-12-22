
import React, { useState, useRef, useEffect } from 'react';
import { Message, AgentConfig, AgentType } from '../types';
import FeaturedAgents from './FeaturedAgents';
import ChatInput from './ChatInput';
import EditorView from './EditorView';
import { sendMessageToGemini } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { User, Search, Command, Sidebar as SidebarIcon, Plus, Maximize, PanelRightClose } from 'lucide-react'; // Assuming we installed lucide-react

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
        <div className="flex-1 flex flex-col h-screen relative bg-background">

            {/* GLOBAL HEADER */}
            <div className="sticky top-0 z-40 w-full flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-border">

                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="flex items-center gap-3 h-auto p-1 hover:bg-transparent pl-0" onClick={handleBackToHome}>
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground shadow-lg font-serif font-bold">
                            S
                        </div>
                        <div className="hidden lg:flex flex-col items-start leading-none">
                            <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-foreground">Scriptorium</span>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">Presuposicionalismo</span>
                            </div>
                        </div>
                    </Button>
                </div>

                <div className="flex-1 max-w-md mx-8 hidden sm:block">
                    <Button variant="outline" className="w-full h-9 rounded-full px-4 justify-between text-muted-foreground hover:text-foreground bg-muted/50 border-input" onClick={triggerCommandMenu}>
                        <div className="flex items-center gap-3">
                            <Search className="w-4 h-4" />
                            <span className="text-xs font-medium">Buscar en el Scriptorium...</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden xl:flex items-center gap-3 pr-4 border-r border-border">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Status</span>
                            <span className="text-[10px] font-mono text-green-500 font-bold mt-1">ACTIVE</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>

                    <div className="flex items-center px-3 py-1.5 bg-muted rounded border border-transparent">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Internal Protocol</span>
                    </div>

                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 border border-border bg-muted/50">
                        <User className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 pb-40">
                <div className="max-w-5xl mx-auto px-6 pt-16">
                    {messages.length === 0 ? (
                        <div className="flex flex-col animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center mb-16">
                                <h2 className="text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase mb-4">Scholarly Intelligence Workspace</h2>
                                <h1 className="text-6xl font-black text-foreground tracking-tight font-serif">
                                    Scriptorium
                                </h1>
                                <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed font-medium">
                                    Bienvenido al entorno de preservación y síntesis intelectual. Aquí orquestamos la verdad con rigor, lógica y presuposición.
                                </p>
                            </div>

                            <div className="w-full">
                                <div className="flex items-center justify-between mb-6 pl-1">
                                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estaciones de Trabajo</h3>
                                    <div className="h-px bg-border flex-1 ml-4"></div>
                                </div>
                                <FeaturedAgents onAgentSelect={handleAgentSelect} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-10">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-sm ${msg.role === 'user' ? 'bg-muted border-border' : 'bg-primary text-primary-foreground border-transparent'}`}>
                                        {msg.role === 'user' ? (
                                            <User className="w-5 h-5" />
                                        ) : (
                                            <span className="text-[10px] font-black font-serif">S</span>
                                        )}
                                    </div>
                                    <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-6 py-4 text-[15px] leading-7 shadow-sm ${msg.role === 'user'
                                                ? 'bg-muted text-foreground rounded-3xl rounded-tr-sm'
                                                : 'bg-background border border-border text-foreground rounded-3xl rounded-tl-sm font-serif'
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
            </ScrollArea>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent z-20">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                <p className="text-center text-[10px] text-muted-foreground mt-4 font-bold uppercase tracking-[0.2em]">
                    Scriptorium v2.5.0 &middot; Documentatio et Logica
                </p>
            </div>
        </div>
    );
};

export default MainChat;
