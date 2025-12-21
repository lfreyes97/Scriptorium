
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import WorkflowManagerModal, { WorkflowNode } from './WorkflowManagerModal';
import { transcribeAudio, executeWorkflowAction } from '../services/geminiService';

// --- Icons ---
const Icons = {
    FileAudio: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
    Sparkles: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L13 3z" /></svg>,
    Wand: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Play: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Pause: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Upload: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    Microphone: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
    Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Folder: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
    Trash: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    Pencil: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
};

// --- Data Models ---

interface Asset {
    id: string;
    type: 'transcript' | 'summary' | 'translation' | 'notes' | 'workflow';
    title: string;
    content: string; // The text content
    createdAt: Date;
    icon?: React.ReactNode;
}

interface SessionPart {
    id: string;
    title: string;
    audioUrl?: string; // Could be a blob URL
    durationSeconds: number;
    durationLabel: string;
    assets: Asset[];
    activeAssetId: string;
}

interface AudioSession {
    id: string;
    title: string;
    date: Date;
    parts: SessionPart[];
    activePartId: string;
}

// --- Component ---

const AudioStudioView = () => {
    const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [currentWorkflowName, setCurrentWorkflowName] = useState('');
    const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
    
    // Upload & Player State
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'ready'>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // Player Logic
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0); // In seconds
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Waveform Data (Static for demo, but visualized dynamically)
    const [waveform] = useState(() => Array.from({ length: 80 }, () => Math.random() * 100));

    // --- Session State Management ---
    // Start with empty session
    const [session, setSession] = useState<AudioSession>({
        id: `sess-${Date.now()}`,
        title: 'Nueva Sesión',
        date: new Date(),
        parts: [],
        activePartId: ''
    });

    const activePart = session.parts.find(p => p.id === session.activePartId);
    const activeAsset = activePart?.assets.find(a => a.id === activePart.activeAssetId);

    // --- Playback Timer Logic ---
    useEffect(() => {
        let interval: any;
        if (isPlaying && activePart) {
            interval = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev >= activePart.durationSeconds) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000); // Update every second (simulated speed)
        }
        return () => clearInterval(interval);
    }, [isPlaying, activePart]);

    // Format Time Helper
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Actions ---

    const handleNewSession = () => {
        if (session.parts.length > 0) {
            if (!confirm("¿Estás seguro de crear una nueva sesión? Se perderá el progreso actual no guardado.")) return;
        }
        setSession({
            id: `sess-${Date.now()}`,
            title: 'Nueva Sesión',
            date: new Date(),
            parts: [],
            activePartId: ''
        });
        setUploadStatus('idle');
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handlePartSelect = (partId: string) => {
        setSession(prev => ({ ...prev, activePartId: partId }));
        setUploadStatus('ready'); 
        setCurrentTime(0);
        setIsPlaying(false);
    };

    const handleAssetSelect = (assetId: string) => {
        setSession(prev => ({
            ...prev,
            parts: prev.parts.map(p => p.id === prev.activePartId ? { ...p, activeAssetId: assetId } : p)
        }));
    };

    const handleContentEdit = (newContent: string) => {
        setSession(prev => ({
            ...prev,
            parts: prev.parts.map(p => p.id === prev.activePartId ? {
                ...p,
                assets: p.assets.map(a => a.id === p.activeAssetId ? { ...a, content: newContent } : a)
            } : p)
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const newPartId = `part-${Date.now()}`;
        setUploadStatus('uploading');
        setUploadProgress(0);

        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) return 90;
                return prev + 10;
            });
        }, 200);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1];
                
                setUploadStatus('processing');
                
                try {
                    const transcription = await transcribeAudio(base64Data, file.type);
                    
                    clearInterval(progressInterval);
                    setUploadProgress(100);
                    
                    const newAssetId = `asset-${Date.now()}`;
                    const newPart: SessionPart = {
                        id: newPartId,
                        title: file.name.replace(/\.[^/.]+$/, ""),
                        durationLabel: '05:30', // Mock estimate
                        durationSeconds: 330, // Mock short duration
                        audioUrl: '', 
                        activeAssetId: newAssetId,
                        assets: [{
                            id: newAssetId,
                            type: 'transcript',
                            title: 'Transcripción Original',
                            content: transcription,
                            createdAt: new Date(),
                            icon: <Icons.FileAudio />
                        }]
                    };

                    setSession(prev => ({
                        ...prev,
                        parts: [...prev.parts, newPart],
                        activePartId: newPartId
                    }));
                    
                    setUploadStatus('ready');

                } catch (error) {
                    console.error("Transcription Failed:", error);
                    clearInterval(progressInterval);
                    setUploadStatus('idle');
                    alert("Error en la transcripción.");
                }
            };
        } catch (e) {
            clearInterval(progressInterval);
            setUploadStatus('idle');
        }
    };

    const handleRunWorkflow = async (workflowData: { name: string; tree: WorkflowNode[] }) => {
        if (!activeAsset?.content) {
            alert("No hay contenido base para procesar.");
            return;
        }

        setIsRunningWorkflow(true);
        setCurrentWorkflowName(workflowData.name);
        setShowWorkflowModal(false);
        
        let reportContent = `### ${workflowData.name}\n\n`;
        
        try {
            let resultText = activeAsset.content;
            
            const executeNode = async (node: WorkflowNode) => {
                const res = await executeWorkflowAction(resultText, node.action.id);
                resultText = res;
                reportContent += `**[${node.action.label}]:**\n${res}\n\n---\n\n`;
                
                if (node.children.length > 0) {
                    await executeNode(node.children[0]);
                }
            };

            if (workflowData.tree.length > 0) {
                await executeNode(workflowData.tree[0]);
            }

            const newAssetId = `asset-${Date.now()}`;
            setSession(prev => ({
                ...prev,
                parts: prev.parts.map(p => p.id === prev.activePartId ? {
                    ...p,
                    assets: [...p.assets, {
                        id: newAssetId,
                        type: 'workflow',
                        title: workflowData.name,
                        content: resultText,
                        createdAt: new Date(),
                        icon: <Icons.Wand />
                    }],
                    activeAssetId: newAssetId
                } : p)
            }));

        } catch (e) {
            console.error(e);
            alert("Error ejecutando flujo.");
        } finally {
            setIsRunningWorkflow(false);
            setCurrentWorkflowName('');
        }
    };

    return (
        <div className="flex-1 h-screen bg-gray-50 flex flex-col font-sans overflow-hidden text-gray-900">
            
            {/* Header */}
            <div className="px-8 py-5 bg-white border-b border-gray-200 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200">
                        <Icons.Microphone />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Audio Studio</h1>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">AI Processing Suite</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    {(uploadStatus === 'processing' || isRunningWorkflow) && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full text-xs font-bold text-amber-600 animate-pulse">
                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                            {uploadStatus === 'processing' ? 'Transcribiendo Audio...' : 'Ejecutando Workflow...'}
                        </div>
                    )}
                    
                    <button 
                        onClick={() => setShowWorkflowModal(true)}
                        disabled={!activeAsset}
                        className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icons.Wand /> Nuevo Workflow
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden p-6 gap-6">
                
                {/* --- MAIN: Editor & Player (Left) --- */}
                <div className="flex-1 flex flex-col bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden relative">
                    
                    {activePart ? (
                        <>
                            {/* 1. Player Area (Refined Dark UI) */}
                            <div className="bg-[#09090b] p-6 text-white flex flex-col gap-4 rounded-t-[2rem] shrink-0 relative overflow-hidden">
                                {/* Subtle Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                                {/* Top Row: Play Button & Info */}
                                <div className="flex items-center gap-5 z-10">
                                    <button 
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                                    >
                                        {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                                    </button>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-sm font-bold text-white tracking-wide truncate pr-4">{activePart.title}</span>
                                            <span className="text-xs font-mono text-gray-400 font-medium tabular-nums tracking-wide">
                                                {formatTime(currentTime)} <span className="opacity-50">/</span> {activePart.durationLabel}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Audio Source • Original</div>
                                    </div>
                                </div>

                                {/* Bottom Row: Dynamic Waveform */}
                                <div className="h-16 flex items-end gap-[3px] opacity-90 z-10 w-full overflow-hidden mask-linear-fade">
                                    {waveform.map((height, i) => {
                                        // Calculate if this bar is "past" based on progress
                                        const progressPercent = (currentTime / activePart.durationSeconds) * 100;
                                        const barPercent = (i / waveform.length) * 100;
                                        const isActive = barPercent <= progressPercent;

                                        return (
                                            <div 
                                                key={i} 
                                                className={`w-1.5 rounded-full transition-all duration-300 ease-in-out ${isActive ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-gray-700/40'}`}
                                                style={{ 
                                                    height: `${Math.max(15, isPlaying ? height * (0.8 + Math.random() * 0.4) : height)}%`,
                                                    opacity: isActive ? 1 : 0.6
                                                }}
                                            ></div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Content Tabs (Asset Switcher inside Editor) */}
                            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                                    {activePart.assets.map(asset => (
                                        <button 
                                            key={asset.id}
                                            onClick={() => handleAssetSelect(asset.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                activePart.activeAssetId === asset.id 
                                                ? 'bg-gray-100 text-gray-900 border-gray-200' 
                                                : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-sm">{asset.icon}</span>
                                            {asset.title}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* View Toggle */}
                                <div className="flex bg-gray-100 p-0.5 rounded-lg shrink-0">
                                    <button 
                                        onClick={() => setEditorMode('edit')}
                                        className={`p-1.5 rounded text-gray-500 hover:text-gray-900 transition-all ${editorMode === 'edit' ? 'bg-white shadow-sm text-black' : ''}`}
                                        title="Editor de Texto"
                                    >
                                        <Icons.Pencil />
                                    </button>
                                    <button 
                                        onClick={() => setEditorMode('preview')}
                                        className={`p-1.5 rounded text-gray-500 hover:text-gray-900 transition-all ${editorMode === 'preview' ? 'bg-white shadow-sm text-black' : ''}`}
                                        title="Vista Previa Markdown"
                                    >
                                        <Icons.Eye />
                                    </button>
                                </div>
                            </div>

                            {/* 3. Main Content Area */}
                            <div className="flex-1 relative bg-gray-50/30">
                                {activeAsset ? (
                                    editorMode === 'edit' ? (
                                        <textarea 
                                            value={activeAsset.content}
                                            onChange={(e) => handleContentEdit(e.target.value)}
                                            className="w-full h-full p-8 resize-none border-none focus:ring-0 bg-transparent text-gray-800 font-mono text-sm leading-relaxed outline-none custom-scrollbar"
                                            placeholder="El contenido aparecerá aquí..."
                                            spellCheck={false}
                                        />
                                    ) : (
                                        <div className="w-full h-full p-8 overflow-y-auto custom-scrollbar prose prose-sm max-w-none text-gray-700">
                                            <ReactMarkdown>{activeAsset.content}</ReactMarkdown>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Icons.Folder />
                                        </div>
                                        <p className="text-sm font-bold">Selecciona una versión para editar</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-3 border-dashed border-gray-200 rounded-[2rem] p-12 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
                            >
                                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Icons.Upload />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Añadir Primera Parte</h3>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto">Sube un archivo de audio para transcribirlo y editarlo con IA.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- SIDEBAR: Session Manager (Right) --- */}
                <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                    
                    {/* New Session Button */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Gestión</h3>
                        <button 
                            onClick={handleNewSession}
                            className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-black transition-colors shadow-sm flex items-center gap-1"
                        >
                            <span className="text-sm">+</span> Nueva Sesión
                        </button>
                    </div>

                    {/* Upload / New Part Button */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                <Icons.Plus />
                            </div>
                            <div className="text-left">
                                <h4 className="text-xs font-bold text-gray-900">Añadir Parte</h4>
                                <p className="text-[10px] text-gray-500">Audio, M4A, MP3</p>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
                    </div>

                    {/* Parts List */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-[2rem] p-6 overflow-y-auto custom-scrollbar shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Sesión Actual</h3>
                        
                        {session.parts.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <p className="text-xs font-medium text-gray-400">Sin archivos en la sesión.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {session.parts.map((part, index) => (
                                    <div key={part.id} className="group">
                                        {/* Part Header */}
                                        <div 
                                            onClick={() => handlePartSelect(part.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-2 ${activePart?.id === part.id ? 'bg-black text-white shadow-lg' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${activePart?.id === part.id ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 shadow-sm'}`}>
                                                    {index + 1}
                                                </div>
                                                <span className="text-xs font-bold truncate">{part.title}</span>
                                            </div>
                                            {activePart?.id === part.id && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>}
                                        </div>

                                        {/* Asset List (Tree) */}
                                        <div className="pl-4 space-y-1 relative">
                                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100"></div>
                                            {part.assets.map(asset => (
                                                <div 
                                                    key={asset.id}
                                                    onClick={() => { handlePartSelect(part.id); handleAssetSelect(asset.id); }}
                                                    className={`relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ml-4 border ${
                                                        activePart?.id === part.id && activePart.activeAssetId === asset.id 
                                                        ? 'bg-blue-50 border-blue-100 text-blue-800' 
                                                        : 'bg-white border-transparent hover:border-gray-200 text-gray-600'
                                                    }`}
                                                >
                                                    {/* Tree connector */}
                                                    <div className="absolute -left-4 top-1/2 w-4 h-px bg-gray-200"></div>
                                                    
                                                    <span className="text-lg opacity-70">{asset.icon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold truncate">{asset.title}</p>
                                                        <p className="text-[9px] opacity-60 truncate">{asset.content.substring(0, 20)}...</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Workflow Manager Modal */}
            <WorkflowManagerModal 
                isOpen={showWorkflowModal}
                onClose={() => setShowWorkflowModal(false)}
                onSave={handleRunWorkflow}
            />

        </div>
    );
};

export default AudioStudioView;
