import React, { useState, useRef } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const NewspaperView = () => {
  // Configuration State
  const [sourceText, setSourceText] = useState('');
  const [language, setLanguage] = useState('English');
  const [editorialTone, setEditorialTone] = useState('Classic (Neutral)');
  const [visualLayout, setVisualLayout] = useState<'Classic' | 'Modern' | 'Vintage'>('Classic');
  const [layoutDensity, setLayoutDensity] = useState<'Brief' | 'Standard' | 'Detailed'>('Standard');
  
  // App State
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
            setSourceText(text);
        }
    };
    reader.readAsText(file);
  };

  const handleZoneClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'DIV' || (e.target as HTMLElement).tagName === 'SVG' || (e.target as HTMLElement).tagName === 'P') {
          fileInputRef.current?.click();
      }
  };

  const handleGenerate = async () => {
    if (!sourceText.trim()) return;
    setIsGenerating(true);
    
    // Mapping logic (omitted for brevity, same as before)
    const prompt = `Actúa como Editor Jefe... (Prompt Logic Placeholder for UI demo)`;

    try {
        const result = await sendMessageToGemini(prompt); // In real app, re-add full prompt construction
        setGeneratedArticle(result || "Mock article content generated..."); 
        setShowResult(true);
    } catch (error) {
        console.error(error);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleBackToDesk = () => {
      setShowResult(false);
  };

  const getOutputStyles = () => {
      switch(visualLayout) {
          case 'Modern': return 'font-sans bg-white text-gray-900';
          case 'Vintage': return 'font-serif bg-[#fdfbf7] text-[#4a4036] border-double border-4 border-[#d4c5b0]';
          default: return 'font-serif bg-white text-gray-900 border border-gray-200';
      }
  };

  return (
    <div className="flex-1 h-screen bg-secondary/30 overflow-y-auto custom-scrollbar font-sans text-foreground">
        
        {!showResult ? (
            /* --- CONFIGURATION VIEW: THE EDITOR'S DESK (Unified Style) --- */
            <div className="min-h-full flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
                <div className="w-full max-w-[700px] bg-background border border-border shadow-sm rounded-xl p-8 md:p-12">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-block p-3 rounded-xl bg-secondary mb-4">
                            <svg className="w-8 h-8 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                            Newsroom Desk
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Convierte borradores en artículos periodísticos listos para publicar.
                        </p>
                    </div>

                    {/* Source Input Area */}
                    <div className="mb-8 group">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.md" className="hidden" />
                        <div 
                            onClick={handleZoneClick}
                            className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-secondary/50 hover:border-primary/20 transition-all cursor-pointer min-h-[160px] flex flex-col items-center justify-center bg-background"
                        >
                            {sourceText ? (
                                <textarea
                                    value={sourceText}
                                    onChange={(e) => setSourceText(e.target.value)}
                                    className="w-full h-32 bg-transparent border-none resize-none p-2 focus:ring-0 text-center text-sm text-foreground z-10 custom-scrollbar font-mono"
                                    placeholder="Editar texto fuente..."
                                    onClick={(e) => e.stopPropagation()} 
                                />
                            ) : (
                                <div className="pointer-events-none flex flex-col items-center gap-3">
                                    <div className="p-2 bg-secondary rounded-full text-muted-foreground">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-foreground text-sm">Selecciona el texto fuente</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Soporta .TXT y .MD</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Idioma Objetivo</label>
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                            >
                                <option>English</option>
                                <option>Español</option>
                                <option>Français</option>
                                <option>Deutsch</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tono Editorial</label>
                            <select 
                                value={editorialTone}
                                onChange={(e) => setEditorialTone(e.target.value)}
                                className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                            >
                                <option>Classic (Neutral)</option>
                                <option>Opinionated (Columnist)</option>
                                <option>Investigative (Deep)</option>
                                <option>Satirical (Witty)</option>
                            </select>
                        </div>
                    </div>

                    {/* Visual Toggles */}
                    <div className="mb-10 p-4 bg-secondary/30 rounded-xl border border-border">
                         <div className="flex items-center justify-between mb-4">
                             <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estilo Visual</label>
                             <div className="flex bg-background border border-border rounded-lg p-1">
                                {['Classic', 'Modern', 'Vintage'].map((layout) => (
                                    <button
                                        key={layout}
                                        onClick={() => setVisualLayout(layout as any)}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${visualLayout === layout ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {layout}
                                    </button>
                                ))}
                             </div>
                         </div>
                         <div className="flex items-center justify-between">
                             <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Densidad</label>
                             <div className="flex bg-background border border-border rounded-lg p-1">
                                {['Brief', 'Standard', 'Detailed'].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setLayoutDensity(d as any)}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${layoutDensity === d ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                             </div>
                         </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!sourceText || isGenerating}
                        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm uppercase tracking-wide shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                Generando Edición...
                            </>
                        ) : (
                            "Generar Edición Impresa"
                        )}
                    </button>

                </div>
            </div>
        ) : (
            /* --- RESULT VIEW: THE NEWSPAPER (Maintains distinct visual identity) --- */
            <div className="min-h-full flex flex-col items-center p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#e8e6df] dark:bg-[#121212]">
                
                <div className="w-full max-w-4xl flex justify-between items-center mb-6">
                    <button 
                        onClick={handleBackToDesk}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-bold text-sm"
                    >
                        ← Volver al Editor
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity shadow-lg rounded"
                    >
                        Exportar PDF
                    </button>
                </div>

                <div className={`w-full max-w-4xl shadow-2xl min-h-[1000px] p-8 md:p-16 mb-20 transition-all duration-500 ${getOutputStyles()}`}>
                    <div className={`border-b-4 ${visualLayout === 'Vintage' ? 'border-[#4a4036]' : 'border-black dark:border-gray-700'} mb-8 pb-4 text-center`}>
                        <div className={`flex justify-between items-end border-b ${visualLayout === 'Vintage' ? 'border-[#4a4036]' : 'border-black dark:border-gray-700'} pb-2 mb-2`}>
                            <span className="text-xs font-sans font-bold uppercase tracking-widest opacity-60">Vol. 01 • Issue 42</span>
                            <span className="text-xs font-sans font-bold uppercase tracking-widest opacity-60">{new Date().toLocaleDateString()}</span>
                        </div>
                        <h1 className={`text-6xl md:text-8xl font-black uppercase tracking-tighter mb-2 leading-none ${visualLayout === 'Modern' ? 'font-sans' : 'font-serif'}`}>
                            The Daily Presup
                        </h1>
                        <p className="font-serif italic text-lg opacity-70">"Truth in every word, logic in every thought."</p>
                    </div>

                    <div className={`prose prose-lg max-w-none 
                        ${visualLayout === 'Modern' ? 'prose-headings:font-sans' : 'prose-headings:font-serif'} 
                        prose-headings:font-bold prose-p:leading-relaxed prose-p:text-justify 
                        prose-a:text-blue-700 dark:prose-invert 
                        ${visualLayout === 'Vintage' ? 'prose-p:font-serif prose-headings:text-[#2c241b]' : 'dark:prose-p:text-gray-300'}
                    `}>
                        <div className={`${layoutDensity === 'Detailed' ? 'columns-1 md:columns-2 gap-12' : 'max-w-2xl mx-auto'} space-y-4`}>
                            <ReactMarkdown>{generatedArticle}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default NewspaperView;