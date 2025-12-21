import React, { useState, useRef, useEffect } from 'react';
import { listFiles, createFolder, uploadFile, FileEntry } from '../services/fileSystem';

// --- Icons ---
const Icons = {
    Folder: () => <svg className="w-10 h-10 text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>,
    PDF: () => <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    Image: () => <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Doc: () => <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Archive: () => <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
    Figma: () => <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    
    // UI Icons
    Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Upload: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    Home: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 12v9a1 1 0 001 1h3m10-9a1 1 0 00-1-1v9a1 1 0 001 1h3m-9-9a1 1 0 00-1-1v9a1 1 0 001 1h3" /></svg>,
    ChevronRight: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
    More: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 11-2 0 1 1 0 012 0zm0 7a1 1 0 11-2 0 1 1 0 012 0zm0 7a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
    Back: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
};

const KnowledgeBaseView = () => {
    // Current directory path (e.g., "/" or "/Projects/2024")
    const [currentPath, setCurrentPath] = useState<string>('/');
    const [items, setItems] = useState<FileEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch files when path changes
    const loadDirectory = async (path: string) => {
        setIsLoading(true);
        try {
            const files = await listFiles(path);
            setItems(files);
        } catch (error) {
            console.error("Failed to load directory", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDirectory(currentPath);
    }, [currentPath]);

    // --- Derived State for Breadcrumbs ---
    const breadcrumbs = currentPath === '/' 
        ? [] 
        : currentPath.split('/').filter(Boolean);

    // --- Handlers ---

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
    };

    const handleBreadcrumbClick = (index: number) => {
        // Reconstruct path up to index
        const newPath = '/' + breadcrumbs.slice(0, index + 1).join('/');
        setCurrentPath(newPath);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        await uploadFile(currentPath, file);
        await loadDirectory(currentPath);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCreateFolder = async () => {
        const name = prompt("Nombre de la carpeta:");
        if (!name) return;
        
        setIsLoading(true);
        await createFolder(currentPath, name);
        await loadDirectory(currentPath);
    };

    const getIconForType = (item: FileEntry) => {
        if (item.type === 'folder') return <Icons.Folder />;
        
        const ext = item.name.split('.').pop()?.toLowerCase();
        switch(ext) {
            case 'pdf': return <Icons.PDF />;
            case 'zip': 
            case 'rar': return <Icons.Archive />;
            case 'jpg':
            case 'png': return <Icons.Image />;
            case 'fig': return <Icons.Figma />;
            default: return <Icons.Doc />;
        }
    };

    return (
        <div className="flex-1 h-screen bg-white flex flex-col font-sans text-gray-900">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Base de Conocimiento</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <p className="text-xs text-gray-500 font-mono">Conectado a: localhost (~/Documentos)</p>
                    </div>
                </div>
                <div className="flex gap-3">
                     <div className="relative">
                        <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-blue-500 w-64" />
                        <span className="absolute left-3 top-2.5 text-gray-400"><Icons.Search /></span>
                     </div>
                     <button onClick={() => loadDirectory(currentPath)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <Icons.Refresh />
                     </button>
                     <button onClick={handleCreateFolder} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
                        <Icons.Plus /> Carpeta
                     </button>
                     <button onClick={() => fileInputRef.current?.click()} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-gray-800 transition-all flex items-center gap-2">
                        <Icons.Upload /> Subir
                     </button>
                </div>
            </div>

            {/* Breadcrumbs & Navigation Bar */}
            <div className="px-8 py-4 border-b border-gray-50 flex items-center gap-2 text-sm overflow-x-auto">
                <button 
                    onClick={() => handleNavigate('/')} 
                    className={`p-1.5 rounded hover:bg-gray-100 ${currentPath === '/' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
                >
                    <Icons.Home />
                </button>
                
                {breadcrumbs.map((folderName, index) => (
                    <React.Fragment key={index}>
                        <span className="text-gray-300 flex-shrink-0"><Icons.ChevronRight /></span>
                        <button 
                            onClick={() => handleBreadcrumbClick(index)}
                            className={`px-2 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${index === breadcrumbs.length - 1 ? 'font-bold text-gray-900 bg-gray-50' : 'text-gray-500'}`}
                        >
                            {folderName}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {/* File List Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#fcfcfc]">
                
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <span className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <span className="opacity-20"><Icons.Folder /></span>
                        </div>
                        <p className="text-sm font-medium">Esta carpeta está vacía</p>
                        <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-blue-600 text-xs font-bold hover:underline">Subir un archivo</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {items.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => item.type === 'folder' ? handleNavigate(item.id) : null}
                                className={`group p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-blue-100 transition-all cursor-pointer flex flex-col relative ${item.type === 'folder' ? 'hover:bg-blue-50/30' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${item.type === 'folder' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                        {getIconForType(item)}
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1">
                                        <Icons.More />
                                    </button>
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-900 truncate mb-1" title={item.name}>{item.name}</h3>
                                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                                        <span>{item.date}</span>
                                        {item.type === 'folder' ? (
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{item.itemsCount || 0} items</span>
                                        ) : (
                                            <span>{item.size || '-'}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KnowledgeBaseView;