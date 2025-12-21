import React, { useState, useRef, useEffect } from 'react';
import { generateImage } from '../services/geminiService';

// --- Types ---

type MockupType = 'book' | 'mobile' | 'laptop' | 'poster' | 'apparel';
type ViewMode = 'studio' | 'txt2img' | 'brainstorm';
type ImageStyle = 'none' | 'minimalist' | 'cinematic' | 'cyberpunk' | 'vintage' | 'studio' | 'nature';

interface StylePreset {
    id: ImageStyle;
    label: string;
    promptModifier: string;
    color: string;
}

const STYLE_PRESETS: StylePreset[] = [
    { id: 'none', label: 'Natural', promptModifier: '', color: 'bg-gray-100 text-gray-600' },
    { id: 'minimalist', label: 'Minimalista', promptModifier: 'Clean minimalist aesthetic, soft lighting, plenty of negative space, neutral colors, high key photography.', color: 'bg-blue-50 text-blue-600' },
    { id: 'studio', label: 'Estudio Pro', promptModifier: 'Professional product photography, studio lighting, 4k resolution, sharp focus, matte background.', color: 'bg-purple-50 text-purple-600' },
    { id: 'cinematic', label: 'Cinemático', promptModifier: 'Cinematic lighting, dramatic shadows, shallow depth of field, color graded, moody atmosphere.', color: 'bg-orange-50 text-orange-600' },
    { id: 'cyberpunk', label: 'Neon/Tech', promptModifier: 'Cyberpunk aesthetic, neon lights, futuristic interface elements, dark background with glowing accents.', color: 'bg-pink-50 text-pink-600' },
    { id: 'vintage', label: 'Retro', promptModifier: 'Vintage film grain, warm tones, 70s advertising style, soft focus, nostalgic vibe.', color: 'bg-yellow-50 text-yellow-700' },
];

// --- Assets / Icons ---

const Icons = {
  Upload: () => <svg className="w-8 h-8 text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Magic: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Image: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Type: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
  Plugin: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
  Pencil: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  Settings: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
};

const MockupGeneratorView = () => {
  const [activeMode, setActiveMode] = useState<ViewMode>('studio');
  
  // --- Studio State ---
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<MockupType>('book');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Advanced Txt2Img State ---
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('none');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');

  // --- Annotation (Painting) State ---
  const [isAnnotating, setIsAnnotating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(5);

  // --- Brainstorm Plugin State ---
  const [pluginLogs, setPluginLogs] = useState<string[]>([]);
  const [isPluginRunning, setIsPluginRunning] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);

  // --- Handlers: Studio ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    }
  };

  const generateMockup = async () => {
      // Validation based on mode
      if (activeMode === 'studio' && !uploadedImage) {
          setErrorMsg("Por favor sube una imagen de referencia para el modo Img 2 Img.");
          return;
      }
      if (activeMode === 'txt2img' && !prompt.trim()) {
          setErrorMsg("Por favor describe el mockup que deseas generar.");
          return;
      }

      setIsProcessing(true);
      setResultImage(null);
      setErrorMsg(null);
      setIsAnnotating(false);

      try {
        let basePrompt = "";

        if (activeMode === 'studio') {
            // Img2Img Prompt Strategy
            basePrompt = `Create a high-quality, photorealistic 3D mockup of a ${selectedType}. 
            The provided image is the texture/design that MUST appear clearly on the ${selectedType}. 
            Apply the design naturally, respecting perspective, lighting, and shadows.
            Background: professional studio minimalist style.
            ${prompt ? `Additional details: ${prompt}` : ''}`;
            
            // Call with image
            const result = await generateImage(basePrompt, uploadedImage!);
            if (result) setResultImage(result);
            else throw new Error("No se pudo generar la imagen.");

        } else {
            // Txt2Img Prompt Strategy with Advanced Options
            const styleConfig = STYLE_PRESETS.find(s => s.id === selectedStyle);
            
            basePrompt = `Generate a high-quality, photorealistic 3D mockup of a ${selectedType}.
            Design Description: "${prompt}".
            
            PARAMETERS:
            - Style: ${styleConfig?.promptModifier || 'Clean, commercial product photography'}
            - Object Alignment: Centered, professional framing.
            - Lighting: Professional studio lighting.
            - Aspect Ratio Preference: ${aspectRatio}
            
            ${negativePrompt ? `AVOID / NEGATIVE CONSTRAINTS: ${negativePrompt}. Do not include these elements.` : ''}
            
            Ensure the design described matches the ${selectedType} context perfectly.`;

            // Call without image (pass undefined)
            const result = await generateImage(basePrompt, undefined);
            if (result) setResultImage(result);
            else throw new Error("No se pudo generar la imagen.");
        }

      } catch (error: any) {
          console.error(error);
          setErrorMsg(error.message || "Error al generar el mockup. Verifica tu API Key.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleUseAsSource = () => {
    let sourceToUse = resultImage;

    if (isAnnotating && canvasRef.current) {
        // If drawing mode is active, take the canvas content
        sourceToUse = canvasRef.current.toDataURL('image/png');
    } 
    
    if (sourceToUse) {
        setUploadedImage(sourceToUse);
        setResultImage(null);
        setIsAnnotating(false);
        // Automatically switch to studio mode so the user sees the input
        setActiveMode('studio');
    }
  };

  // --- Handlers: Canvas Painting ---

  useEffect(() => {
    if (isAnnotating && resultImage && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = resultImage;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
        };
    }
  }, [isAnnotating, resultImage]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      draw(e);
  };

  const stopDrawing = () => {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      ctx?.beginPath(); // Reset path
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Coordinate mapping
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.strokeStyle = brushColor;

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
  };


  // --- Handlers: Brainstorm Plugin ---

  const runCreativePlugin = () => {
      setIsPluginRunning(true);
      setPluginLogs([]);
      setGeneratedIdeas([]);

      const steps = [
          "Inicializando 'Creative Director Agent v1.4'...",
          "Conectando con base de datos de tendencias...",
          "Analizando contenido reciente del blog...",
          "Generando conceptos visuales abstractos...",
          "Sintetizando prompts de difusión...",
          "Finalizando reporte de ideas."
      ];

      let delay = 0;
      steps.forEach((step, index) => {
          delay += 800 + Math.random() * 500;
          setTimeout(() => {
              setPluginLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
              if (index === steps.length - 1) {
                  setGeneratedIdeas([
                      { title: "Metáfora Arquitectónica", desc: "Un puente minimalista conectando dos acantilados (Fe vs Razón).", color: "bg-blue-100 text-blue-800" },
                      { title: "Tipografía Abstracta", desc: "Letras 3D flotando sobre arena, iluminadas por luz de atardecer.", color: "bg-orange-100 text-orange-800" },
                      { title: "Naturaleza Muerta", desc: "Una pluma antigua, una taza de café y un libro abierto en un escritorio de madera oscura.", color: "bg-amber-100 text-amber-800" }
                  ]);
                  setIsPluginRunning(false);
              }
          }, delay);
      });
  };

  return (
    <div className="flex-1 h-screen bg-secondary/30 flex flex-col font-sans">
        
        {/* Header with Tabs */}
        <div className="px-8 py-4 bg-background border-b border-border flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-6">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Mockup Studio</h1>
                    <p className="text-xs text-muted-foreground">Generación visual & Prototipado IA</p>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="flex bg-secondary p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveMode('studio')}
                        className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeMode === 'studio' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Icons.Image />
                        Img 2 Img
                    </button>
                    <button 
                        onClick={() => setActiveMode('txt2img')}
                        className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeMode === 'txt2img' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Icons.Type />
                        Texto 2 Img
                    </button>
                    <button 
                        onClick={() => setActiveMode('brainstorm')}
                        className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeMode === 'brainstorm' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Icons.Magic />
                        Plugin Creativo
                    </button>
                </div>
            </div>
        </div>

        {/* --- VIEW: STUDIO & TXT2IMG (Shared Canvas Structure) --- */}
        {(activeMode === 'studio' || activeMode === 'txt2img') && (
            <div className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
                {/* Controls Sidebar */}
                <div className="w-80 bg-background border-r border-border p-6 flex flex-col gap-6 overflow-y-auto">
                    
                    {/* 1. Upload (Only in Studio Mode) */}
                    {activeMode === 'studio' && (
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">1. Imagen Fuente</label>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-40 ${uploadedImage ? 'border-primary/50 bg-secondary/50' : 'border-border hover:border-primary/50 hover:bg-secondary'}`}
                            >
                                {uploadedImage ? (
                                    <img src={uploadedImage} alt="Source" className="h-full object-contain rounded-md shadow-sm" />
                                ) : (
                                    <>
                                        <Icons.Upload />
                                        <span className="text-xs font-bold text-foreground">Subir Portada / Diseño</span>
                                        <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG (Max 5MB)</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 2. Configuration */}
                    <div className="flex-1 flex flex-col">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                            {activeMode === 'studio' ? '2. Configuración' : '1. Configuración'}
                        </label>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {['book', 'mobile', 'laptop', 'poster'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type as MockupType)}
                                    className={`py-3 text-xs font-bold rounded-lg border transition-all capitalize ${selectedType === type ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:bg-secondary'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        
                        {/* Text Prompt */}
                        <label className="block text-[10px] font-bold text-muted-foreground mb-2">
                            {activeMode === 'studio' ? 'Prompt de Apoyo (Opcional)' : 'Descripción Visual (Prompt)'}
                        </label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={activeMode === 'studio' 
                                ? "Ej: Iluminación cinemática, sobre mesa de madera..." 
                                : "Describe lo que quieres ver. Ej: 'Un libro con portada azul y título dorado flotando en el espacio'..."}
                            className={`w-full bg-background border border-input rounded-lg p-3 text-xs focus:ring-2 focus:ring-ring focus:border-transparent resize-none outline-none ${activeMode === 'txt2img' ? 'h-32' : 'h-20'}`}
                        />

                        {/* TXT2IMG ONLY: Style Selector */}
                        {activeMode === 'txt2img' && (
                            <div className="mt-6">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Estilo Visual</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {STYLE_PRESETS.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setSelectedStyle(style.id)}
                                            className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${selectedStyle === style.id ? `border-transparent ${style.color} shadow-sm ring-1 ring-black/5` : 'bg-background border-border text-muted-foreground hover:bg-secondary'}`}
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TXT2IMG ONLY: Advanced Collapsible */}
                        {activeMode === 'txt2img' && (
                            <div className="mt-6 border-t border-border pt-4">
                                <button 
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center justify-between w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <span className="flex items-center gap-2"><Icons.Settings /> Opciones Avanzadas</span>
                                    <div className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
                                        <Icons.ChevronDown />
                                    </div>
                                </button>
                                
                                {showAdvanced && (
                                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                                        {/* Aspect Ratio */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-muted-foreground mb-2">Relación de Aspecto</label>
                                            <div className="flex bg-secondary p-1 rounded-lg">
                                                {['1:1', '16:9', '9:16'].map(ratio => (
                                                    <button
                                                        key={ratio}
                                                        onClick={() => setAspectRatio(ratio as any)}
                                                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${aspectRatio === ratio ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                                                    >
                                                        {ratio}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Negative Prompt */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-muted-foreground mb-2 text-red-400">Prompt Negativo (Lo que NO quieres)</label>
                                            <textarea 
                                                value={negativePrompt}
                                                onChange={(e) => setNegativePrompt(e.target.value)}
                                                placeholder="Ej: borroso, mala calidad, texto deformado, dedos extra..."
                                                className="w-full bg-background border border-input rounded-lg p-3 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 resize-none outline-none h-20"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action */}
                    <button 
                        onClick={generateMockup}
                        disabled={isProcessing}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 mt-auto flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                             <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Generando (Real AI)...
                             </>
                        ) : (
                            'Generar Mockup 3D'
                        )}
                    </button>
                    {errorMsg && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-xs text-red-600 dark:text-red-400 font-bold text-center">{errorMsg}</p>
                        </div>
                    )}
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-[#1c1c1c] flex items-center justify-center p-8 relative overflow-hidden flex-col">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    
                    {resultImage ? (
                        <div className="relative z-10 max-w-full max-h-full flex flex-col items-center animate-in zoom-in-95 duration-500">
                            
                            <div className="relative shadow-2xl rounded-lg overflow-hidden ring-1 ring-white/10 bg-black">
                                {isAnnotating ? (
                                    <canvas 
                                        ref={canvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        className="max-w-full max-h-[70vh] cursor-crosshair touch-none block"
                                    />
                                ) : (
                                    <img src={resultImage} alt="Result" className="max-w-full max-h-[70vh] object-contain block" />
                                )}

                                {/* Annotate Toolbar overlay (only when annotating) */}
                                {isAnnotating && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/20 rounded-full px-4 py-2 flex items-center gap-3">
                                        <button onClick={() => setBrushColor('#ff0000')} className={`w-6 h-6 rounded-full border-2 ${brushColor === '#ff0000' ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: '#ff0000' }}></button>
                                        <button onClick={() => setBrushColor('#000000')} className={`w-6 h-6 rounded-full border-2 ${brushColor === '#000000' ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: '#000000' }}></button>
                                        <button onClick={() => setBrushColor('#ffffff')} className={`w-6 h-6 rounded-full border-2 ${brushColor === '#ffffff' ? 'border-black scale-110' : 'border-transparent'}`} style={{ backgroundColor: '#ffffff' }}></button>
                                        <div className="w-px h-4 bg-white/20"></div>
                                        <input 
                                            type="range" min="1" max="20" 
                                            value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                            className="w-20 accent-white h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-6">
                                {/* Annotate Toggle */}
                                <button 
                                    onClick={() => setIsAnnotating(!isAnnotating)}
                                    className={`text-xs font-bold px-4 py-2 rounded-full backdrop-blur border transition-colors flex items-center gap-2 ${isAnnotating ? 'bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'}`}
                                >
                                    <Icons.Pencil />
                                    {isAnnotating ? 'Terminar Rayado' : 'Rayar / Anotar'}
                                </button>

                                <button 
                                    onClick={handleUseAsSource}
                                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur border border-white/20 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    {isAnnotating ? 'Enviar Rayado como Fuente' : 'Usar como Fuente Img2Img'}
                                </button>
                                
                                {!isAnnotating && (
                                    <a 
                                        href={resultImage} 
                                        download={`mockup-${Date.now()}.png`}
                                        className="bg-black/70 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur hover:bg-black transition-colors"
                                    >
                                        Descargar HD
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 z-10 max-w-sm">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                <Icons.Image />
                            </div>
                            <h3 className="text-gray-300 font-bold mb-1">Área de Visualización</h3>
                            <p className="text-xs">
                                {activeMode === 'studio' 
                                    ? 'Sube tu diseño para generar un mockup 3D.' 
                                    : 'Describe tu idea y la IA generará el mockup desde cero.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- VIEW: BRAINSTORM PLUGIN --- */}
        {activeMode === 'brainstorm' && (
             <div className="flex-1 flex flex-col items-center justify-center p-8 bg-secondary/30 animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-y-auto">
                 
                 <div className="w-full max-w-4xl">
                     {/* Plugin Header / Card */}
                     <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden mb-8">
                         <div className="p-6 border-b border-border flex items-start justify-between bg-gradient-to-r from-background to-secondary/30">
                             <div className="flex items-center gap-4">
                                 <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                                     <Icons.Plugin />
                                 </div>
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                         <h2 className="text-xl font-bold text-foreground">Creative Director Agent</h2>
                                         <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                                             INSTALLED
                                         </span>
                                     </div>
                                     <p className="text-sm text-muted-foreground">Analiza tus últimos posts y genera conceptos visuales atractivos para RRSS.</p>
                                 </div>
                             </div>
                             <button 
                                onClick={runCreativePlugin}
                                disabled={isPluginRunning}
                                className="px-6 py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
                             >
                                {isPluginRunning ? <span className="animate-spin">⚙️</span> : 'Ejecutar Plugin'}
                             </button>
                         </div>
                         
                         {/* Console Output Area */}
                         <div className="p-0 bg-black text-green-400 font-mono text-xs h-48 overflow-y-auto custom-scrollbar flex flex-col-reverse border-t border-border">
                             {pluginLogs.length === 0 ? (
                                 <div className="p-4 text-gray-500 italic">Esperando ejecución del agente...</div>
                             ) : (
                                 <div className="p-4 space-y-1">
                                     {pluginLogs.map((log, i) => (
                                         <div key={i}>{log}</div>
                                     ))}
                                 </div>
                             )}
                         </div>
                     </div>

                     {/* Results Grid (Generated Ideas) */}
                     {generatedIdeas.length > 0 && (
                         <div className="animate-in slide-in-from-bottom-8 duration-500">
                             <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Conceptos Generados</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {generatedIdeas.map((idea, idx) => (
                                     <div key={idx} className="bg-background border border-border rounded-xl p-6 hover:shadow-md transition-shadow group cursor-pointer">
                                         <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${idea.color}`}>
                                             <Icons.Magic />
                                         </div>
                                         <h4 className="font-bold text-foreground mb-2">{idea.title}</h4>
                                         <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{idea.desc}</p>
                                         <button className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                                             Generar Imagen <span aria-hidden="true">→</span>
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}
                 </div>
             </div>
        )}

    </div>
  );
};

export default MockupGeneratorView;