import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendMessageToGemini } from '../services/geminiService';
import { pushContentToAstro } from '../services/db';

interface EditorViewProps {
  onBack: () => void;
}

const EditorView = ({ onBack }: EditorViewProps) => {
  const [title, setTitle] = useState('La Casa Exterior');
  const [inputText, setInputText] = useState('Mi interés especial es más bien la obediencia instantánea y síncrona de cada cuerpo veloz a la nueva voluntad. ¿Por qué medios, por qué métodos de comunicación, esta voluntad impregna tan profundamente a la constelación viviente que su docena o más de pequeños cerebros la conocen y la obedecen en tal instante de tiempo?');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // Agent Options State
  const [agentTone, setAgentTone] = useState('Profesional');
  const [agentMode, setAgentMode] = useState('Estándar');
  const [agentIntensity, setAgentIntensity] = useState(50);

  // Floating Toolbar State
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const floatingToolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Logic: Close toolbar if click is NOT in textarea AND NOT in the floating toolbar itself
      if (
        showFloatingToolbar && 
        textareaRef.current && 
        !textareaRef.current.contains(e.target as Node) &&
        floatingToolbarRef.current &&
        !floatingToolbarRef.current.contains(e.target as Node)
      ) {
        setShowFloatingToolbar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFloatingToolbar]);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current && viewMode === 'edit') {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 600)}px`;
    }
  }, [inputText, viewMode]);

  const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (viewMode === 'preview') return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Only show if there is an actual selection
    if (start !== end) {
      let top = 0;
      let left = 0;

      // Check if it is a mouse event using nativeEvent check
      const nativeEvent = e.nativeEvent;
      if (nativeEvent instanceof MouseEvent) {
          top = nativeEvent.clientY - 50;
          left = nativeEvent.clientX - 100;
      } else {
          // Fallback for keyboard event (approximate position)
          const rect = textarea.getBoundingClientRect();
          top = rect.top + (rect.height / 3); 
          left = rect.left + (rect.width / 2) - 100;
      }

      setToolbarPosition({ top, left });
      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
    }
  };

  const applyFormat = (format: string) => {
    if (viewMode === 'preview') return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = inputText.substring(start, end);
    let formattedText = selection;
    let offset = 0;

    switch (format) {
      case 'bold': formattedText = `**${selection}**`; offset = 2; break;
      case 'italic': formattedText = `_${selection}_`; offset = 1; break;
      case 'underline': formattedText = `<u>${selection}</u>`; offset = 3; break;
      case 'strike': formattedText = `~~${selection}~~`; offset = 2; break;
      case 'code': formattedText = `\`${selection}\``; offset = 1; break;
    }

    const newText = inputText.substring(0, start) + formattedText + inputText.substring(end);
    setInputText(newText);
    setShowFloatingToolbar(false);
    
    setTimeout(() => {
        if (textarea) {
            textarea.focus();
            if (selection.length > 0) {
                 textarea.setSelectionRange(start, start + formattedText.length);
            } else {
                 textarea.setSelectionRange(start + offset, start + offset);
            }
        }
    }, 0);
  };

  const handleAction = async (action: string, promptTemplate: string) => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setActiveAction(action);
    setOutputText('');
    
    const fullPrompt = `${promptTemplate}. Configuración: Tono: ${agentTone}, Modo: ${agentMode}, Intensidad: ${agentIntensity}. Texto: "${inputText}"`;
    const result = await sendMessageToGemini(fullPrompt, []);
    
    setOutputText(result);
    setIsLoading(false);
    setActiveAction(null);
  };

  const handleSaveToDB = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        await pushContentToAstro({
            title,
            slug,
            body: inputText,
            status: 'published',
            author: 'Henry Beston', // Mock author
            tags: ['General', 'Ensayo']
        });
        
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
        console.error("Failed to save to DB", error);
        setSaveStatus('error');
    } finally {
        setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  // Improved ToolbarButton
  const ToolbarButton = ({ icon, label, onClick, active }: any) => (
      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        title={label}
        disabled={viewMode === 'preview'}
        className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
            active 
            ? 'bg-black text-white shadow-md transform scale-105 dark:bg-white dark:text-black' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
        } ${viewMode === 'preview' ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        {icon}
        {label && <span className="text-xs font-semibold hidden xl:inline-block">{label}</span>}
      </button>
  );

  const Divider = () => <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1.5" />;

  return (
    <div className="flex flex-row h-full bg-[#f8f9fa] dark:bg-gray-950 overflow-hidden font-sans">
      
      {/* Floating Selection Toolbar */}
      {showFloatingToolbar && viewMode === 'edit' && (
        <div 
          ref={floatingToolbarRef}
          className="fixed z-50 bg-[#1a1a1a] text-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-800 p-1 flex items-center gap-0.5 animate-in fade-in zoom-in-95 duration-100 origin-bottom transform -translate-y-full mt-[-8px]"
          style={{ top: Math.max(10, toolbarPosition.top), left: Math.max(10, toolbarPosition.left) }}
        >
             <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-300 hover:text-white" title="Negrita">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
             </button>
             <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-300 hover:text-white" title="Cursiva">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
             </button>
             <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('underline')} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-300 hover:text-white" title="Subrayado">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
             </button>
             <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('strike')} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-300 hover:text-white" title="Tachado">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7.1-5.3 1.4-5.8 4.2-.5 2.6 1.4 5.1 4 5.9 3.5 1.1 2.9 4-1.2 4.1-2.4 0-4.9-.7-6.8-2.2"></path><line x1="4" y1="12" x2="20" y2="12"></line></svg>
             </button>
             
             <div className="w-px h-4 bg-white/20 mx-1"></div>
             
             <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAction('rewrite', 'Reescribe esta selección para que sea más concisa y clara')} 
                className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/10 rounded-md text-xs font-semibold text-white transition-colors group"
             >
                <svg className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                Preguntar a IA
             </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-20">
             <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
                <div className="flex items-center gap-2">
                   <span className="font-semibold text-gray-900 dark:text-white">Henry Beston</span>
                   <span className="text-gray-300 dark:text-gray-600">/</span>
                   <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{title}</span>
                </div>
             </div>
             <div className="flex items-center gap-3">
                 <span className="text-xs text-gray-400 font-medium flex items-center">
                    {saveStatus === 'success' ? (
                        <span className="flex items-center text-green-600 dark:text-green-400">
                             <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             Guardado en DB
                        </span>
                    ) : (
                        <>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${saveStatus === 'error' ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]'}`}></span>
                        {saveStatus === 'error' ? 'Error DB' : 'Listo'}
                        </>
                    )}
                 </span>
                 <button 
                    onClick={handleSaveToDB}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:bg-black dark:hover:bg-gray-200 shadow-lg shadow-gray-200 dark:shadow-none transition-all hover:translate-y-px disabled:opacity-70 flex items-center gap-2"
                 >
                    {isSaving ? <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></span> : null}
                    {isSaving ? 'Guardando...' : 'Publicar'}
                 </button>
             </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="max-w-3xl mx-auto px-8 py-12 pb-32">
                
                {/* Title Input */}
                <div className="mb-10 group">
                    <input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-5xl font-extrabold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 placeholder-gray-300 leading-tight tracking-tight transition-all"
                        placeholder="Sin Título"
                    />
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-400 font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                         <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                            <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                            libsql://posts/{title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                        </span>
                    </div>
                </div>

                {/* Sticky Toolbar */}
                <div className="sticky top-4 z-30 mb-10 mx-[-12px]">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-gray-100/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-1.5 flex items-center justify-between gap-1 mx-3">
                        {/* View Switcher */}
                        <div className="flex bg-gray-100/80 dark:bg-gray-800 p-1 rounded-xl mr-2">
                            <button 
                                onClick={() => setViewMode('edit')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                Escribir
                            </button>
                            <button 
                                onClick={() => setViewMode('preview')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                Vista Previa
                            </button>
                        </div>

                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                            <ToolbarButton onClick={() => applyFormat('bold')} icon={<span className="font-bold font-serif text-lg leading-none">B</span>} />
                            <ToolbarButton onClick={() => applyFormat('italic')} icon={<span className="italic font-serif text-lg leading-none">I</span>} />
                            <ToolbarButton onClick={() => applyFormat('underline')} icon={<span className="underline font-serif text-lg leading-none">U</span>} />
                            <ToolbarButton onClick={() => applyFormat('strike')} icon={<span className="line-through font-serif text-lg leading-none">S</span>} />
                            
                            <Divider />
                            
                            {/* AI Actions */}
                            <ToolbarButton 
                                icon={<svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                label="Gramática"
                                active={activeAction === 'grammar'}
                                onClick={() => handleAction('grammar', 'Corrige la gramática y ortografía')}
                            />
                            <ToolbarButton 
                                icon={<svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                label="Simplificar"
                                active={activeAction === 'fluency'}
                                onClick={() => handleAction('fluency', 'Simplifica el texto y mejora la claridad')}
                            />
                            <ToolbarButton 
                                icon={<svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                                label="Tono"
                                active={activeAction === 'tone'}
                                onClick={() => handleAction('tone', 'Haz el tono más profesional y atractivo')}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Editor Surface */}
                <div className="min-h-[600px] relative">
                    {viewMode === 'edit' ? (
                        <textarea 
                            ref={textareaRef}
                            className="w-full h-full min-h-[600px] bg-transparent resize-none focus:outline-none text-xl leading-relaxed text-gray-800 dark:text-gray-200 font-normal placeholder-gray-300 font-sans" 
                            style={{ lineHeight: '1.8' }}
                            placeholder="Comienza a escribir tu obra maestra..." 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onMouseUp={handleTextSelect}
                            onKeyUp={handleTextSelect}
                        />
                    ) : (
                        <div className="w-full h-full min-h-[600px] prose prose-xl dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
                             <ReactMarkdown>{inputText}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Right Sidebar (Context/Output) */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col flex-shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.05)] z-20">
          
          {/* Profile Card */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop" alt="Profile" className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-white dark:border-gray-700" />
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 p-0.5 rounded-full">
                         <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Henry Beston</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Autor &middot; Miembro Pro</p>
                </div>
             </div>
             
             <div className="grid grid-cols-3 gap-2 mb-6">
                 <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                     <p className="text-lg font-bold text-gray-900 dark:text-white">18</p>
                     <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Obras</p>
                 </div>
                 <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                     <p className="text-lg font-bold text-gray-900 dark:text-white">806</p>
                     <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Reseñas</p>
                 </div>
                 <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                     <p className="text-lg font-bold text-gray-900 dark:text-white">4.9</p>
                     <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Rating</p>
                 </div>
             </div>
             
             <div className="flex gap-2">
                 <button className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 transition-all">
                    Ver Perfil
                 </button>
             </div>
          </div>

          {/* Configuration Panel */}
          <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-black dark:bg-white rounded-full"></span>
                    Asistente IA
                </h4>
                
                <div className="space-y-5">
                    {/* Editing Mode */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Modo</label>
                        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
                            {['Estándar', 'Creativo', 'Estricto'].map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => setAgentMode(m)}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${agentMode === m ? 'bg-black text-white shadow-sm dark:bg-white dark:text-black' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tone Selector */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Tono</label>
                        <select 
                            value={agentTone}
                            onChange={(e) => setAgentTone(e.target.value)}
                            className="w-full text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white py-2.5 px-3 bg-white dark:bg-gray-800"
                        >
                            <option>Profesional</option>
                            <option>Académico</option>
                            <option>Casual y Amigable</option>
                            <option>Periodístico</option>
                            <option>Persuasivo</option>
                        </select>
                    </div>

                     {/* Intensity Slider */}
                    <div>
                        <div className="flex justify-between mb-2">
                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Intensidad</label>
                             <span className="text-[10px] font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-1.5 rounded">{agentIntensity}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={agentIntensity} 
                            onChange={(e) => setAgentIntensity(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white" 
                        />
                    </div>
                </div>
            </div>

          {/* Results Area */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden bg-white dark:bg-gray-900">
             <div className="flex items-center justify-between mb-3">
                 <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Sugerencias</h4>
                 {isLoading && <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                 </span>}
             </div>
             
             <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-1 overflow-y-auto custom-scrollbar">
                {outputText ? (
                    <div className="h-full flex flex-col p-3">
                        <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-3 overflow-y-auto">
                             <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50 dark:border-gray-700">
                                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-200">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Sugerencia IA</span>
                             </div>
                             <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                                <ReactMarkdown>
                                {outputText}
                                </ReactMarkdown>
                             </div>
                        </div>
                        <button 
                            onClick={copyToClipboard}
                            className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
                        >
                            Aceptar Cambio
                        </button>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </div>
                        <p className="text-xs font-medium leading-relaxed">Selecciona texto y usa la barra de herramientas o las acciones laterales para generar mejoras con IA.</p>
                    </div>
                )}
             </div>
          </div>
      </div>
      
    </div>
  );
};

export default EditorView;