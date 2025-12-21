import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface GlossaryTerm {
  id: string;
  source: string;
  target: string;
}

interface Segment {
    id: number;
    source: string;
    target: string;
    status: 'draft' | 'ai-translated' | 'approved' | 'edited';
    previewMode?: boolean;
}

interface HistoryItem {
    id: string;
    source: string;
    target: string;
    date: Date;
    lang: string;
}

interface AiSuggestion {
    type: 'Literal' | 'Fluida' | 'Creativa';
    text: string;
}

const TranslationView = () => {
  // View Mode State
  const [viewMode, setViewMode] = useState<'simple' | 'studio'>('simple');

  // State for Translation
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [targetLang, setTargetLang] = useState('Inglés'); 
  const [sourceLang, setSourceLang] = useState('Detectar Idioma');
  const [tone, setTone] = useState('Académico y Teológico');
  
  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const stopProcessRef = useRef(false);

  // State for Studio Mode (Segments)
  const [segments, setSegments] = useState<Segment[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null);
  
  // AI Assistance State
  const [assistingSegmentId, setAssistingSegmentId] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Record<number, AiSuggestion[]>>({});

  // State for CAT Tools & History
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'glossary' | 'memory'>('glossary');
  const [detectedTerms, setDetectedTerms] = useState<GlossaryTerm[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Glossary Data
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([
    { id: '1', source: 'worldview', target: 'cosmovisión' },
    { id: '2', source: 'presuppositionalism', target: 'presuposicionalismo' },
    { id: '3', source: 'theonomy', target: 'teonomía' },
    { id: '4', source: 'covenant', target: 'pacto' },
    { id: '5', source: 'van til', target: 'Van Til' },
  ]);

  const [newTermSource, setNewTermSource] = useState('');
  const [newTermTarget, setNewTermTarget] = useState('');

  // --- Logic for Detection ---
  useEffect(() => {
    // If in studio mode, detect terms for the ACTIVE segment only
    const textToScan = viewMode === 'studio' && activeSegmentId !== null 
        ? segments.find(s => s.id === activeSegmentId)?.source || '' 
        : sourceText;

    if (!textToScan) {
      setDetectedTerms([]);
      return;
    }
    const lowerSource = textToScan.toLowerCase();
    const found = glossary.filter(term => lowerSource.includes(term.source.toLowerCase()));
    setDetectedTerms(found);
  }, [sourceText, glossary, activeSegmentId, viewMode, segments]);

  // --- Improved Segmentation Logic ---
  useEffect(() => {
      if (viewMode === 'studio' && sourceText && segments.length === 0) {
          let sentences: string[] = [];

          // Use Intl.Segmenter if available (Modern Browsers) for better acronym handling
          if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
              const segmenter = new (Intl as any).Segmenter(sourceLang === 'Inglés' ? 'en' : 'es', { granularity: 'sentence' });
              const iterator = segmenter.segment(sourceText);
              sentences = Array.from(iterator).map((i: any) => i.segment);
          } else {
             // Fallback to robust regex that handles some common abbreviations
             sentences = sourceText.match(/[^.!?]+[.!?]+(\s|$)/g) || [sourceText];
          }

          const newSegments: Segment[] = sentences
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map((s, idx) => ({
              id: idx,
              source: s,
              target: '', 
              status: 'draft',
              previewMode: false
          }));
          setSegments(newSegments);
      }
  }, [viewMode, sourceText, sourceLang]);

  // Update main text when segments change (for export)
  useEffect(() => {
      if (viewMode === 'studio') {
          setTargetText(segments.map(s => s.target).join(' '));
      }
  }, [segments]);

  const addToHistory = (src: string, tgt: string) => {
      if (!src || !tgt) return;
      setHistory(prev => [
          { id: Date.now().toString(), source: src, target: tgt, date: new Date(), lang: targetLang },
          ...prev
      ].slice(0, 10)); // Keep last 10
  };

  const restoreFromHistory = (item: HistoryItem) => {
      setSourceText(item.source);
      setTargetText(item.target);
      setShowHistory(false);
  };

  // --- Translation Core Functions ---

  const translateString = async (text: string): Promise<string> => {
      // Build Context with Glossary
      let glossaryInstruction = "";
      if (detectedTerms.length > 0) {
          glossaryInstruction = `
          GLOSARIO OBLIGATORIO:
          ${detectedTerms.map(t => `- "${t.source}" -> "${t.target}"`).join('\n')}
          `;
      }

      const prompt = `
      Traduce al ${targetLang}. Tono: ${tone}.
      IMPORTANTE:
      - Mantén todo el formato Markdown (negritas, cursivas, enlaces).
      - NO traduzcas notas al pie como [^1] o [1]. Mantenlas intactas.
      - NO traduzcas código entre backticks.
      ${glossaryInstruction}
      Texto: "${text}"
      `;
      return await sendMessageToGemini(prompt);
  }

  const handleTranslateAll = async () => {
    if (!sourceText) return;
    
    if (viewMode === 'simple') {
        setIsLoading(true);
        const result = await translateString(sourceText);
        setTargetText(result);
        addToHistory(sourceText, result);
        setIsLoading(false);
    } else {
        // Studio Mode - Batch Process
        setIsLoading(true);
        setIsPaused(false);
        stopProcessRef.current = false;

        const updatedSegments = [...segments];
        
        for (let i = 0; i < updatedSegments.length; i++) {
            // Check stop signal
            if (stopProcessRef.current) {
                setIsPaused(true);
                break;
            }

            // Only translate if empty
            if (updatedSegments[i].target === '') {
                setActiveSegmentId(i); // UI Feedback
                // Scroll to active segment (optional visual enhancement)
                const element = document.getElementById(`seg-${i}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                try {
                    const translation = await translateString(updatedSegments[i].source);
                    updatedSegments[i].target = translation;
                    updatedSegments[i].status = 'ai-translated';
                    
                    // Update state segment by segment to show progress
                    setSegments([...updatedSegments]); 
                } catch (e) {
                    console.error(e);
                }
            }
        }
        setIsLoading(false);
        setActiveSegmentId(null);
    }
  };

  const handlePauseTranslation = () => {
      stopProcessRef.current = true;
      setIsPaused(true);
      setIsLoading(false);
  };

  const handleTranslateNext = async () => {
      // Find first untranslated segment
      const nextIndex = segments.findIndex(s => s.target === '');
      if (nextIndex === -1) return;

      setIsLoading(true);
      setActiveSegmentId(nextIndex);
      
      const element = document.getElementById(`seg-${nextIndex}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      try {
          const translation = await translateString(segments[nextIndex].source);
          const newSegments = [...segments];
          newSegments[nextIndex].target = translation;
          newSegments[nextIndex].status = 'ai-translated';
          setSegments(newSegments);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleExport = () => {
      const fullText = segments.map(s => s.target).join(' ');
      navigator.clipboard.writeText(fullText);
      alert("Traducción copiada al portapapeles.");
      // Here you could also trigger a file download logic
  };

  // --- Human-in-the-loop AI Assistance ---
  
  const handleAiAssist = async (segmentId: number, source: string) => {
      setAssistingSegmentId(segmentId);
      setSuggestions(prev => {
          const newState = { ...prev };
          delete newState[segmentId]; // Clear previous suggestions
          return newState;
      });

      try {
          const prompt = `
          Actúa como un traductor experto. Necesito 3 variantes de traducción para el siguiente texto (del ${sourceLang} al ${targetLang}).
          
          Texto: "${source}"
          
          Devuelve SOLAMENTE un objeto JSON válido con este formato exacto, sin markdown ni explicaciones adicionales:
          [
            { "type": "Literal", "text": "..." },
            { "type": "Fluida", "text": "..." },
            { "type": "Creativa", "text": "..." }
          ]
          `;
          
          const result = await sendMessageToGemini(prompt);
          // Simple cleanup in case the model wraps in code blocks
          const jsonString = result.replace(/```json/g, '').replace(/```/g, '').trim();
          
          const parsedSuggestions = JSON.parse(jsonString) as AiSuggestion[];
          setSuggestions(prev => ({ ...prev, [segmentId]: parsedSuggestions }));

      } catch (error) {
          console.error("Error generating suggestions", error);
      } finally {
          setAssistingSegmentId(null);
      }
  };

  const applySuggestion = (id: number, text: string) => {
      handleSegmentChange(id, text);
      // Clear suggestions after apply
      setSuggestions(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
      });
  };

  const handleSegmentChange = (id: number, newText: string) => {
      setSegments(segments.map(s => 
          s.id === id ? { ...s, target: newText, status: 'edited' } : s
      ));
  };

  const toggleSegmentPreview = (id: number) => {
      setSegments(segments.map(s => 
        s.id === id ? { ...s, previewMode: !s.previewMode } : s
    ));
  }

  const approveSegment = (id: number) => {
      setSegments(segments.map(s => 
          s.id === id ? { ...s, status: 'approved' } : s
      ));
      // Move to next segment
      if (id < segments.length - 1) setActiveSegmentId(id + 1);
  }

  const addTerm = () => {
    if (newTermSource && newTermTarget) {
      setGlossary([...glossary, { id: Date.now().toString(), source: newTermSource, target: newTermTarget }]);
      setNewTermSource('');
      setNewTermTarget('');
    }
  };

  const removeTerm = (id: string) => {
    setGlossary(glossary.filter(t => t.id !== id));
  };

  const swapLanguages = () => {
      const temp = sourceLang === 'Detectar Idioma' ? 'Español' : sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      setSourceText(targetText);
      setTargetText(sourceText);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
            setSourceText(text);
            // Reset segments if uploading new file
            setSegments([]); 
        }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const triggerFileUpload = () => fileInputRef.current?.click();

  // Helper to highlight markdown/special tokens in source segment
  const renderSourceWithHighlights = (text: string) => {
      // Very basic tokenizer for visual aid
      const parts = text.split(/(\[.*?\]|`.*?`|\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
          if (part.startsWith('[') && part.endsWith(']')) {
              return <span key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5 font-mono text-[10px] border border-yellow-200">{part}</span>;
          }
          if (part.startsWith('`') && part.endsWith('`')) {
              return <span key={i} className="bg-gray-200 text-gray-800 rounded px-1 font-mono text-[10px]">{part}</span>;
          }
          if (part.startsWith('**') && part.endsWith('**')) {
             return <span key={i} className="font-bold text-blue-700">{part}</span>;
          }
          return <span key={i}>{part}</span>;
      });
  };

  return (
    <div className="flex-1 h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
        {/* Hidden File Input */}
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.md,.json,.csv,.srt" className="hidden" />

        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white z-20 shadow-sm">
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="bg-black text-white p-1.5 rounded-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-none">Traductor</h1>
                        <p className="text-[10px] text-gray-500 font-medium">Neural Engine v2.5</p>
                    </div>
                 </div>

                 {/* Mode Switcher */}
                 <div className="bg-gray-100 p-0.5 rounded-lg flex items-center ml-4">
                     <button 
                        onClick={() => setViewMode('simple')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'simple' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                     >
                         Rápido
                     </button>
                     <button 
                        onClick={() => { setViewMode('studio'); setShowAdvanced(true); setShowHistory(false); }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'studio' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                     >
                         Studio (CAT)
                     </button>
                 </div>
             </div>
             
             <div className="flex items-center gap-3">
                 {/* History Toggle (Only Simple Mode) */}
                 {viewMode === 'simple' && (
                     <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
                        title="Historial de Traducciones"
                     >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </button>
                 )}

                 <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                    <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none">
                        <option>Detectar Idioma</option>
                        <option>Español</option>
                        <option>Inglés</option>
                    </select>
                    <span className="text-gray-300">→</span>
                    <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="bg-transparent text-xs font-bold text-gray-900 focus:outline-none">
                        <option>Inglés</option>
                        <option>Español</option>
                        <option>Portugués</option>
                    </select>
                 </div>

                 <select value={tone} onChange={(e) => setTone(e.target.value)} className="bg-gray-50 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                    <option>Académico y Teológico</option>
                    <option>Pastoral</option>
                    <option>Literal</option>
                 </select>

                 <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`p-2 rounded-lg transition-colors ${showAdvanced ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-100 text-gray-500'}`}
                 >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </button>
             </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
            
            {/* --- SIMPLE MODE UI --- */}
            {viewMode === 'simple' && (
                <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white relative">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-stretch justify-center h-full max-h-[600px]">
                        {/* Source Card */}
                        <div className="flex-1 bg-gray-50 rounded-3xl p-6 flex flex-col border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Texto Origen</span>
                                    <button onClick={triggerFileUpload} className="text-gray-400 hover:text-black transition-colors" title="Subir Archivo">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    </button>
                                </div>
                                <textarea 
                                    value={sourceText}
                                    onChange={(e) => setSourceText(e.target.value)}
                                    placeholder="Escribe o pega texto aquí..."
                                    className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-lg text-gray-800 placeholder-gray-300 leading-relaxed font-mono"
                                />
                                <div className="mt-4 flex justify-between items-center text-xs text-gray-400 font-medium">
                                    <span>{sourceText.length} caracteres</span>
                                </div>
                        </div>

                        {/* Middle Action */}
                        <div className="flex flex-col items-center justify-center gap-4">
                            <button onClick={swapLanguages} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 shadow-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </button>
                            <button 
                                onClick={handleTranslateAll}
                                disabled={isLoading || !sourceText}
                                className="bg-black text-white p-4 rounded-full shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {isLoading ? (
                                    <span className="block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                )}
                            </button>
                        </div>

                        {/* Target Card */}
                        <div className="flex-1 bg-gray-100 rounded-3xl p-6 flex flex-col border border-transparent shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Traducción</span>
                                    <button onClick={() => navigator.clipboard.writeText(targetText)} className="text-gray-400 hover:text-black transition-colors" title="Copiar">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                    </button>
                                </div>
                                {isLoading ? (
                                    <div className="flex-1 flex items-center justify-center text-gray-400 gap-2 animate-pulse">
                                        <span>Procesando contexto...</span>
                                    </div>
                                ) : (
                                    <textarea 
                                        readOnly
                                        value={targetText}
                                        placeholder="El resultado aparecerá aquí"
                                        className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-lg text-gray-800 placeholder-gray-400 leading-relaxed font-mono"
                                    />
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- STUDIO MODE UI (CAT Tool) --- */}
            {viewMode === 'studio' && (
                <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                    {/* Toolbar Studio */}
                    <div className="px-6 py-2 bg-white border-b border-gray-200 flex gap-2 shadow-sm z-10 items-center">
                        {/* Translate All Button */}
                        {!isLoading ? (
                             <button 
                                onClick={handleTranslateAll}
                                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors"
                            >
                                Traducir Todo
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                        ) : (
                            <button 
                                onClick={handlePauseTranslation}
                                className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded hover:bg-amber-600 transition-colors animate-pulse"
                            >
                                Pausar
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                        )}

                        {/* Step By Step Button */}
                        <button 
                            onClick={handleTranslateNext}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Traducir Siguiente
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>

                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                        {/* Export Button */}
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded hover:bg-green-100 transition-colors ml-auto"
                        >
                            Exportar / Finalizar
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        </button>

                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <span className="text-xs text-gray-500 font-medium flex items-center">{segments.length} segmentos</span>
                    </div>

                    {/* Table Header */}
                    <div className="flex border-b border-gray-300 bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                        <div className="w-12 p-3 text-center border-r border-gray-200">#</div>
                        <div className="w-10 p-3 text-center border-r border-gray-200">St</div>
                        <div className="flex-1 p-3 border-r border-gray-200">Origen ({sourceLang})</div>
                        <div className="flex-1 p-3">Destino ({targetLang})</div>
                    </div>

                    {/* Segment Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 pb-20">
                        {segments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <p className="mb-2">No hay segmentos cargados.</p>
                                <button onClick={triggerFileUpload} className="text-blue-600 underline text-sm hover:text-blue-800">Sube un archivo</button>
                                <span className="text-xs mx-2">o</span>
                                <button onClick={() => { setSourceText('Escribe algo...'); setViewMode('simple'); }} className="text-blue-600 underline text-sm hover:text-blue-800">escribe en modo rápido</button>
                            </div>
                        ) : (
                            segments.map((seg) => (
                                <div 
                                    id={`seg-${seg.id}`}
                                    key={seg.id} 
                                    onClick={() => setActiveSegmentId(seg.id)}
                                    className={`flex border-b border-gray-200 group transition-colors ${activeSegmentId === seg.id ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    {/* ID */}
                                    <div className="w-12 p-3 text-xs text-gray-400 font-mono text-center border-r border-gray-200 select-none">
                                        {seg.id + 1}
                                    </div>

                                    {/* Status Icon */}
                                    <div className="w-10 p-3 flex items-start justify-center border-r border-gray-200 cursor-help" title={seg.status}>
                                        {seg.status === 'draft' && <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5" />}
                                        {seg.status === 'ai-translated' && <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shadow-[0_0_5px_rgba(96,165,250,0.5)]" />}
                                        {seg.status === 'edited' && <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5" />}
                                        {seg.status === 'approved' && <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />}
                                    </div>

                                    {/* Source (with highlighting) */}
                                    <div className="flex-1 p-3 text-sm text-gray-800 leading-relaxed border-r border-gray-200 font-medium select-text">
                                        {renderSourceWithHighlights(seg.source)}
                                        {detectedTerms.length > 0 && activeSegmentId === seg.id && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                 {detectedTerms.map(t => (
                                                     <span key={t.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                                                         {t.source}
                                                     </span>
                                                 ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Target Input */}
                                    <div className="flex-1 p-0 relative group/edit">
                                        {/* AI Suggestions Panel for this segment */}
                                        {suggestions[seg.id] && (
                                            <div className="absolute top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 p-2 shadow-sm animate-in fade-in slide-in-from-top-2">
                                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <span className="text-purple-500">✨</span> Sugerencias de IA
                                                </h5>
                                                <div className="flex flex-col gap-2">
                                                    {suggestions[seg.id].map((sug, idx) => (
                                                        <button 
                                                            key={idx}
                                                            onClick={(e) => { e.stopPropagation(); applySuggestion(seg.id, sug.text); }}
                                                            className="text-left text-xs p-2 rounded hover:bg-purple-50 border border-transparent hover:border-purple-100 group/sug transition-all"
                                                        >
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 rounded">{sug.type}</span>
                                                            </div>
                                                            <span className="text-gray-700 group-hover/sug:text-purple-700">{sug.text}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <button onClick={() => setSuggestions(prev => { const n = {...prev}; delete n[seg.id]; return n; })} className="text-[9px] text-gray-400 hover:text-gray-600 mt-2 w-full text-center">Descartar</button>
                                            </div>
                                        )}

                                        {seg.previewMode ? (
                                            <div className="w-full h-full min-h-[60px] p-3 text-sm prose prose-sm max-w-none" onClick={() => toggleSegmentPreview(seg.id)}>
                                                <ReactMarkdown>{seg.target || '...'}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <textarea 
                                                value={seg.target}
                                                onChange={(e) => handleSegmentChange(seg.id, e.target.value)}
                                                className={`w-full h-full min-h-[60px] p-3 text-sm resize-none border-none focus:ring-2 focus:ring-inset font-mono leading-relaxed ${activeSegmentId === seg.id ? 'focus:ring-blue-500 bg-white' : 'focus:ring-transparent bg-transparent'}`}
                                                placeholder="..."
                                                spellCheck="false"
                                            />
                                        )}
                                        
                                        {/* Row Actions */}
                                        <div className={`absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover/edit:opacity-100 transition-opacity ${activeSegmentId === seg.id ? 'opacity-100' : ''} bg-white/80 backdrop-blur-sm p-1 rounded-lg z-10`}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAiAssist(seg.id, seg.source); }}
                                                className={`p-1.5 rounded transition-colors ${assistingSegmentId === seg.id ? 'bg-purple-100 text-purple-600 animate-pulse' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                                                title="Asistencia IA (Variantes)"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleSegmentPreview(seg.id); }}
                                                className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors" title="Vista Previa Markdown"
                                            >
                                                {seg.previewMode ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                )}
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); approveSegment(seg.id); }}
                                                className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors" title="Aprobar (Ctrl+Enter)"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* History Sidebar (Left - Simple Mode only) */}
            {viewMode === 'simple' && showHistory && (
                 <div className="w-72 bg-white border-r border-gray-200 flex flex-col animate-in slide-in-from-left duration-300 absolute left-0 top-0 bottom-0 z-30 shadow-2xl">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-900 text-sm">Historial Reciente</h3>
                        <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="text-center p-6 text-gray-400 text-xs">
                                No hay traducciones recientes.
                            </div>
                        ) : (
                            history.map(item => (
                                <div key={item.id} onClick={() => restoreFromHistory(item)} className="p-3 mb-2 rounded-lg bg-gray-50 hover:bg-blue-50 cursor-pointer border border-gray-100 hover:border-blue-200 transition-all group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] text-gray-400 font-mono">{new Date(item.date).toLocaleTimeString()}</span>
                                        <span className="text-[10px] font-bold bg-gray-200 px-1.5 rounded text-gray-600">{item.lang}</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{item.source}</p>
                                    <p className="text-xs text-gray-500 line-clamp-2 italic">{item.target}</p>
                                </div>
                            ))
                        )}
                    </div>
                 </div>
            )}

            {/* Advanced Sidebar (Right) */}
            {showAdvanced && (
                <div className="w-80 bg-white border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300 absolute right-0 top-0 bottom-0 z-30 shadow-2xl">
                    <div className="flex border-b border-gray-200">
                        <button 
                            onClick={() => setActiveTab('glossary')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'glossary' ? 'bg-white border-b-2 border-amber-500 text-amber-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            Glosario
                        </button>
                        <button 
                            onClick={() => setActiveTab('memory')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'memory' ? 'bg-white border-b-2 border-amber-500 text-amber-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            Memoria (TM)
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
                        {activeTab === 'glossary' ? (
                             <div className="space-y-4">
                                {viewMode === 'studio' && activeSegmentId !== null && detectedTerms.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
                                        <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Contexto del Segmento #{activeSegmentId + 1}</h4>
                                        <div className="space-y-2">
                                            {detectedTerms.map(term => (
                                                <div key={term.id} className="flex justify-between items-center text-sm border-b border-amber-100 pb-1 last:border-0">
                                                    <span className="font-medium text-gray-900">{term.source}</span>
                                                    <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                    <span className="font-bold text-amber-800">{term.target}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-bold text-gray-900 mb-2">Añadir Término</h4>
                                    <div className="space-y-2">
                                        <input 
                                            value={newTermSource}
                                            onChange={(e) => setNewTermSource(e.target.value)}
                                            placeholder="Término original" 
                                            className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500"
                                        />
                                        <input 
                                            value={newTermTarget}
                                            onChange={(e) => setNewTermTarget(e.target.value)}
                                            placeholder="Traducción oficial" 
                                            className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500"
                                        />
                                        <button 
                                            onClick={addTerm}
                                            disabled={!newTermSource || !newTermTarget}
                                            className="w-full bg-amber-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Todos los Términos</h4>
                                    {glossary.map((term) => (
                                        <div key={term.id} className="p-2 rounded-lg border bg-white border-gray-100 flex justify-between items-center group hover:border-gray-300 transition-all">
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{term.source}</p>
                                                <p className="text-[10px] text-gray-500 italic">{term.target}</p>
                                            </div>
                                            <button 
                                                onClick={() => removeTerm(term.id)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <h4 className="text-sm font-bold text-gray-900">Memoria de Traducción</h4>
                                <p className="text-xs text-gray-500 mt-1 mb-4">No hay coincidencias en la base de datos para este segmento.</p>
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-left">
                                    <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Simulación TM</p>
                                    <p className="text-xs text-blue-900 italic">"Covenant theology is distinct..."</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="bg-green-200 text-green-800 text-[9px] font-bold px-1.5 py-0.5 rounded">98% Match</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default TranslationView;