import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Format = 'latex' | 'typst' | 'html' | 'pandoc';

const OCRView = () => {
  const [step, setStep] = useState<'config' | 'workspace'>('config');
  
  // Configuration State
  const [projectName, setProjectName] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<Format>('latex');
  const [languages, setLanguages] = useState({
    latin: true,
    greek: false,
    hebrew: false
  });
  const [extractMarginalia, setExtractMarginalia] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleStartSession = () => {
    // Transition to workspace or processing state
    console.log("Starting session with:", { projectName, selectedFormat, languages, extractMarginalia });
    // For demo purposes, we stay here or you could toggle setStep('workspace')
    alert("Sesión de Scriptorium iniciada. (Lógica de backend simulada)");
  };

  const toggleLanguage = (lang: keyof typeof languages) => {
    setLanguages(prev => ({ ...prev, [lang]: !prev[lang] }));
  };

  return (
    <div className="flex-1 h-screen bg-[#fcfbf9] text-[#2c241b] flex flex-col font-sans overflow-y-auto custom-scrollbar relative">
      
      {/* Background Texture/Gradient Overlay for paper feel */}
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(#e5e0d8_1px,transparent_1px)] [background-size:20px_20px]"></div>

      {/* --- HEADER --- */}
      <header className="px-8 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#5e4b35] text-[#fbf7f0] flex items-center justify-center font-serif font-bold text-xl rounded-sm shadow-sm">
            L
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-wide text-[#5e4b35] uppercase">Lingua Sacra</h1>
            <p className="text-xs font-serif italic text-[#8c735a]">PDF ad LaTeX</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[#5e4b35]">
          <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:opacity-70 transition-opacity">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            Guía
          </button>
          <button className="text-[#5e4b35] hover:opacity-70">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          </button>
          <div className="bg-[#ede8e1] px-4 py-1.5 rounded-full text-xs font-bold text-[#5e4b35] border border-[#dcd6ce]">
            Gemini 2.5
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT (Scriptorium Config) --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        <div className="w-full max-w-2xl bg-[#fbf7f0] rounded-xl shadow-[0_8px_30px_rgb(94,75,53,0.08)] border border-[#eaddd7] overflow-hidden">
          
          {/* Card Header */}
          <div className="bg-[#f4f0e9] border-b border-[#eaddd7] p-8 pb-6">
             <div className="flex gap-4 mb-2">
               <div className="w-8 h-8 bg-[#8c735a] text-white font-serif font-bold flex items-center justify-center rounded text-sm shrink-0">I</div>
               <div>
                 <h2 className="text-2xl font-serif font-bold text-[#4a3b2a]">CONFIGURACIÓN DEL SCRIPTORIUM</h2>
                 <p className="text-sm font-serif text-[#8c735a] italic mt-1">Define los parámetros de la sesión de transcripción.</p>
               </div>
             </div>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-8">
            
            {/* Project Name */}
            <div>
              <label className="block text-xs font-bold text-[#8c735a] uppercase tracking-wider mb-3">Nombre del Proyecto / Tratado</label>
              <input 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ej: Summa Theologica - Pars Prima"
                className="w-full bg-[#fcfbf9] border border-[#dcd6ce] rounded-lg p-4 text-[#4a3b2a] placeholder-[#bcaea3] font-serif focus:ring-1 focus:ring-[#8c735a] focus:border-[#8c735a] outline-none transition-all shadow-sm"
              />
            </div>

            {/* Grid Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Output Format */}
              <div>
                <label className="block text-xs font-bold text-[#8c735a] uppercase tracking-wider mb-3">Formato de Salida</label>
                <div className="space-y-3">
                  {[
                    { id: 'latex', label: 'LaTeX (.tex)', desc: 'Estándar académico. Mejor para PDF final.' },
                    { id: 'typst', label: 'Typst (.typ)', desc: 'Moderno, rápido y limpio.' },
                    { id: 'html', label: 'HTML5 (.html)', desc: 'Semántico, para web y EPUB.' },
                    { id: 'pandoc', label: 'Pandoc (.md)', desc: 'Markdown con metadatos para conversión universal.' },
                  ].map((fmt) => (
                    <div 
                      key={fmt.id}
                      onClick={() => setSelectedFormat(fmt.id as Format)}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3
                        ${selectedFormat === fmt.id 
                          ? 'bg-[#f4f0e9] border-[#8c735a] shadow-sm' 
                          : 'bg-white border-[#eaddd7] hover:border-[#cfc4bc]'
                        }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 
                        ${selectedFormat === fmt.id ? 'border-[#007aff] bg-white' : 'border-[#dcd6ce]'}`}>
                        {selectedFormat === fmt.id && <div className="w-2 h-2 rounded-full bg-[#007aff]"></div>}
                      </div>
                      <div>
                        <span className={`block text-sm font-bold ${selectedFormat === fmt.id ? 'text-[#4a3b2a]' : 'text-[#6b5d4e]'}`}>
                          {fmt.label}
                        </span>
                        <span className="block text-[10px] text-[#9c8e80] leading-tight mt-0.5">
                          {fmt.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Languages */}
              <div>
                <label className="block text-xs font-bold text-[#8c735a] uppercase tracking-wider mb-3">Idiomas Detectados</label>
                <div className="bg-[#fcfbf9] border border-[#eaddd7] rounded-lg p-4 space-y-3">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${languages.latin ? 'bg-[#dcd6ce] border-[#8c735a]' : 'border-[#dcd6ce] bg-white'}`}>
                         {languages.latin && <svg className="w-3.5 h-3.5 text-[#5e4b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-sm font-medium text-[#5e4b35] group-hover:text-[#4a3b2a]">Latín (Principal)</span>
                   </label>
                   
                   <label className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleLanguage('greek')}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${languages.greek ? 'bg-[#dcd6ce] border-[#8c735a]' : 'border-[#dcd6ce] bg-white'}`}>
                         {languages.greek && <svg className="w-3.5 h-3.5 text-[#5e4b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-sm font-medium text-[#5e4b35] group-hover:text-[#4a3b2a]">Griego Koiné / Clásico</span>
                   </label>

                   <label className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleLanguage('hebrew')}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${languages.hebrew ? 'bg-[#dcd6ce] border-[#8c735a]' : 'border-[#dcd6ce] bg-white'}`}>
                         {languages.hebrew && <svg className="w-3.5 h-3.5 text-[#5e4b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-sm font-medium text-[#5e4b35] group-hover:text-[#4a3b2a]">Hebreo Bíblico</span>
                   </label>
                </div>
              </div>

            </div>

            {/* Structure */}
            <div>
               <label className="block text-xs font-bold text-[#8c735a] uppercase tracking-wider mb-3">Estructura</label>
               <div 
                  onClick={() => setExtractMarginalia(!extractMarginalia)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3
                    ${extractMarginalia ? 'bg-[#fdfbf7] border-[#8c735a]' : 'bg-white border-[#eaddd7]'}
                  `}
               >
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${extractMarginalia ? 'bg-[#007aff] border-[#007aff]' : 'border-[#dcd6ce] bg-white'}`}>
                      {extractMarginalia && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#4a3b2a]">Extraer Marginalia</span>
                    <span className="block text-xs text-[#8c735a] mt-1">Capturar notas y comentarios en los márgenes laterales.</span>
                  </div>
               </div>
            </div>

            {/* Advanced (Collapsible) */}
            <div className="border border-[#eaddd7] rounded-lg overflow-hidden">
               <button 
                 onClick={() => setShowAdvanced(!showAdvanced)}
                 className="w-full flex items-center justify-between p-4 bg-[#fcfbf9] hover:bg-[#f4f0e9] transition-colors text-xs font-bold text-[#5e4b35] uppercase tracking-wider"
               >
                 <span className="flex items-center gap-2">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                   Configuración Avanzada de OCR (Amanuense)
                 </span>
                 <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </button>
               {showAdvanced && (
                 <div className="p-4 bg-white border-t border-[#eaddd7] space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-[#8c735a] mb-2">Confianza mínima de glifos</label>
                        <input type="range" className="w-full accent-[#8c735a]" />
                    </div>
                 </div>
               )}
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-[#eaddd7] flex justify-end">
               <button 
                 onClick={handleStartSession}
                 className="bg-[#7d6c5d] hover:bg-[#5f5043] text-[#fbf7f0] px-8 py-3 rounded-lg font-serif font-bold text-sm uppercase tracking-widest shadow-md transition-all flex items-center gap-2"
               >
                 Iniciar Sesión de Trabajo
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default OCRView;