
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendMessageToGemini } from '../services/geminiService';

// Icons for the overlay
const Icons = {
    Sound: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>,
    Translate: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
    Sparkles: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L13 3z" /></svg>,
    Close: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

interface PluginResult {
    type: 'translation' | 'explanation' | 'summary' | 'tts';
    content?: string;
    loading: boolean;
    visible: boolean;
}

const PluginActionOverlay = () => {
    const [result, setResult] = useState<PluginResult>({ type: 'translation', loading: false, visible: false });
    
    // Listen for global events
    useEffect(() => {
        const handlePluginAction = async (e: CustomEvent) => {
            const { action } = e.detail;
            
            // 1. Get Context (Selected Text)
            const selection = window.getSelection()?.toString().trim();
            
            if (!selection && action !== 'stop_tts') {
                alert("Por favor selecciona un texto primero para usar este plugin.");
                return;
            }

            // 2. Handle Actions
            switch (action) {
                case 'global_tts':
                    handleTTS(selection!);
                    break;
                case 'global_stop_tts':
                    window.speechSynthesis.cancel();
                    break;
                case 'global_translate':
                    await handleAIProcess(selection!, 'translation', "Traduce este texto al español manteniendo el formato. Si ya está en español, tradúcelo al inglés.");
                    break;
                case 'global_explain':
                    await handleAIProcess(selection!, 'explanation', "Explica este concepto o texto de forma concisa y didáctica (máximo 2 párrafos).");
                    break;
                case 'global_summarize':
                    await handleAIProcess(selection!, 'summary', "Resume este texto en 3 puntos clave (Bullet points).");
                    break;
            }
        };

        window.addEventListener('presup:plugin-action', handlePluginAction as EventListener);
        return () => window.removeEventListener('presup:plugin-action', handlePluginAction as EventListener);
    }, []);

    // --- Logic Implementation ---

    const handleTTS = (text: string) => {
        window.speechSynthesis.cancel(); // Stop previous
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES'; // Default, could be dynamic
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
        
        // Show minimal feedback toast instead of full modal
        const toast = document.createElement('div');
        toast.className = "fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2";
        toast.innerHTML = `<div class="flex items-center gap-2"><svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg> Leyendo selección...</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const handleAIProcess = async (text: string, type: PluginResult['type'], prompt: string) => {
        setResult({ type, loading: true, visible: true, content: '' });
        
        try {
            const aiResponse = await sendMessageToGemini(`${prompt}\n\nTexto: "${text}"`);
            setResult({ type, loading: false, visible: true, content: aiResponse });
        } catch (error) {
            setResult({ type, loading: false, visible: true, content: "Error al procesar la solicitud." });
        }
    };

    const closeOverlay = () => {
        setResult({ ...result, visible: false });
    };

    if (!result.visible) return null;

    // --- Render Overlay ---
    
    return (
        <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
            {/* The actual card allows pointer events */}
            <div className="pointer-events-auto bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 m-4">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${result.type === 'translation' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {result.type === 'translation' ? <Icons.Translate /> : <Icons.Sparkles />}
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {result.type === 'translation' ? 'Traducción Rápida' : result.type === 'explanation' ? 'Explicación IA' : 'Resumen'}
                        </span>
                    </div>
                    <button onClick={closeOverlay} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Icons.Close />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {result.loading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <span className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></span>
                            <span className="text-sm font-medium text-gray-400 animate-pulse">Procesando contexto...</span>
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-200">
                            <ReactMarkdown>{result.content}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {!result.loading && (
                    <div className="bg-gray-50 dark:bg-black/20 px-4 py-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
                        <button 
                            onClick={() => { navigator.clipboard.writeText(result.content || ''); closeOverlay(); }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        >
                            Copiar
                        </button>
                        <button 
                            onClick={() => handleTTS(result.content || '')}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-colors flex items-center gap-2"
                        >
                            <Icons.Sound /> Leer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PluginActionOverlay;
