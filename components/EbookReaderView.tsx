
import React, { useState, useEffect, useRef } from 'react';

// --- Icons ---
const Icons = {
    BookOpen: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Library: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
    Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Back: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Plus: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    List: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>,
    Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
};

// --- Types ---
interface Book {
    id: string;
    title: string;
    author: string;
    coverColor: string;
    progress: number; // 0 to 100
    format: 'EPUB' | 'PDF';
    content?: string; // Mock content
}

interface ReaderSettings {
    fontSize: number;
    theme: 'light' | 'sepia' | 'dark';
    fontFamily: 'Serif' | 'Sans';
    lineHeight: number;
}

// --- Mock Library ---
const INITIAL_LIBRARY: Book[] = [
    { id: '1', title: 'Van Til: The Defense of the Faith', author: 'Cornelius Van Til', coverColor: 'bg-amber-800', progress: 45, format: 'EPUB' },
    { id: '2', title: 'Always Ready', author: 'Greg Bahnsen', coverColor: 'bg-blue-900', progress: 12, format: 'EPUB' },
    { id: '3', title: 'Theonomy in Christian Ethics', author: 'Greg Bahnsen', coverColor: 'bg-red-900', progress: 0, format: 'PDF' },
    { id: '4', title: 'Christian Theory of Knowledge', author: 'Cornelius Van Til', coverColor: 'bg-emerald-800', progress: 88, format: 'EPUB' },
    { id: '5', title: 'Institutes of the Christian Religion', author: 'John Calvin', coverColor: 'bg-slate-800', progress: 5, format: 'EPUB' },
];

const MOCK_TEXT_CONTENT = `
# Capítulo 1: El Punto de Partida

El asunto fundamental en la apologética no es la cantidad de evidencia, sino la naturaleza de la evidencia y los presupuestos que traemos para interpretarla. 

El hombre natural, en su rebelión contra Dios, busca interpretar el universo sin referencia a su Creador. Asume su propia autonomía como el punto final de referencia para la predicación de la verdad.

## La Autonomía Humana

Cuando decimos que el hombre natural es autónomo, queremos decir que él cree que es la autoridad final en materia de verdad y moralidad. No reconoce ninguna autoridad superior a su propia razón.

Sin embargo, el cristiano sabe que el temor del Señor es el principio de la sabiduría (Prov. 1:7). Sin este fundamento, todo razonamiento humano es fútil y circular en un sentido vicioso.

## El Mito de la Neutralidad

A menudo se nos dice que debemos acercarnos a los incrédulos en un terreno neutral. Pero, ¿existe tal terreno? Jesús dijo: "El que no está conmigo, contra mí está" (Mat. 12:30).

No hay neutralidad. O servimos a Dios o servimos a ídolos. En el ámbito intelectual, esto significa que pensamos los pensamientos de Dios después de Él, o tratamos de ser dioses nosotros mismos, determinando el bien y el mal.

### Implicaciones Prácticas

1. **No abandones tus presuposiciones**: Al debatir, no dejes tu Biblia en la puerta. Es tu arma y tu luz.
2. **Expón las presuposiciones del incrédulo**: Muestra cómo su cosmovisión no puede dar cuenta de la lógica, la ciencia o la moralidad que él mismo usa.
3. **Predica el Evangelio**: La apologética no es solo ganar argumentos, es ganar almas.

(Fin del fragmento de muestra)
`.repeat(5); // Repeat to allow scrolling

const EbookReaderView = () => {
    const [view, setView] = useState<'library' | 'reader'>('library');
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Reader State
    const [settings, setSettings] = useState<ReaderSettings>({
        fontSize: 18,
        theme: 'sepia',
        fontFamily: 'Serif',
        lineHeight: 1.6
    });
    const [showSettings, setShowSettings] = useState(false);
    const [showTOC, setShowTOC] = useState(false);

    // --- Actions ---

    const handleOpenBook = (book: Book) => {
        setCurrentBook(book);
        setView('reader');
    };

    const handleCloseBook = () => {
        setView('library');
        setCurrentBook(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Mock upload
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            alert(`Simulación: Libro "${file.name}" añadido a la biblioteca.`);
        }
    };

    // --- Renderers ---

    const renderLibrary = () => {
        const filteredBooks = INITIAL_LIBRARY.filter(b => 
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            b.author.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden font-sans">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mi Biblioteca</h1>
                        <p className="text-sm text-gray-500">Colección digital de recursos teológicos.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar libro..."
                                className="bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black w-64"
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400"><Icons.Search /></div>
                        </div>
                        <label className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all cursor-pointer flex items-center gap-2 shadow-lg">
                            <input type="file" className="hidden" accept=".epub,.pdf" onChange={handleFileUpload} />
                            <Icons.Plus /> Importar EPUB
                        </label>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {filteredBooks.map(book => (
                            <div 
                                key={book.id} 
                                onClick={() => handleOpenBook(book)}
                                className="group cursor-pointer flex flex-col items-center"
                            >
                                {/* Book Cover Simulation */}
                                <div className={`w-36 h-52 md:w-44 md:h-64 ${book.coverColor} rounded-r-lg rounded-l-sm shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 relative flex flex-col justify-between p-4 border-l-4 border-white/10`}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none rounded-l-sm"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-white font-serif font-bold text-lg leading-tight line-clamp-3 opacity-90">{book.title}</h3>
                                        <p className="text-white/70 text-xs mt-2 font-medium">{book.author}</p>
                                    </div>
                                    <div className="relative z-10 flex justify-between items-end">
                                        <span className="text-[10px] text-white/60 font-bold bg-black/20 px-1.5 py-0.5 rounded">{book.format}</span>
                                        {book.progress > 0 && (
                                            <span className="text-[10px] text-white font-bold">{book.progress}%</span>
                                        )}
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                                        <div className="h-full bg-yellow-500" style={{ width: `${book.progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderReader = () => {
        if (!currentBook) return null;

        const themeStyles = {
            light: 'bg-white text-gray-900',
            sepia: 'bg-[#f4ecd8] text-[#5b4636]',
            dark: 'bg-[#1a1a1a] text-[#cccccc]'
        };

        const fontStyles = {
            'Serif': 'font-serif',
            'Sans': 'font-sans'
        };

        return (
            <div className={`flex-1 h-screen flex flex-col transition-colors duration-300 ${themeStyles[settings.theme]}`}>
                
                {/* Reader Toolbar */}
                <div className={`px-6 py-3 flex justify-between items-center z-20 border-b transition-colors ${settings.theme === 'dark' ? 'border-gray-800 bg-[#1a1a1a]/95' : settings.theme === 'sepia' ? 'border-[#e3dccb] bg-[#f4ecd8]/95' : 'border-gray-100 bg-white/95'} backdrop-blur`}>
                    <button onClick={handleCloseBook} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                        <Icons.Back />
                    </button>
                    
                    <div className="flex flex-col items-center">
                        <h2 className="text-sm font-bold truncate max-w-md">{currentBook.title}</h2>
                        <span className="text-[10px] opacity-60">{currentBook.author}</span>
                    </div>

                    <div className="flex gap-2 relative">
                        <button onClick={() => setShowTOC(!showTOC)} className={`p-2 rounded-full transition-colors ${showTOC ? 'bg-black/10' : 'hover:bg-black/5'}`}>
                            <Icons.List />
                        </button>
                        <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-black/10' : 'hover:bg-black/5'}`}>
                            <Icons.Settings />
                        </button>

                        {/* Settings Dropdown */}
                        {showSettings && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in zoom-in-95 text-gray-900 dark:text-white">
                                <div className="space-y-4">
                                    {/* Themes */}
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Tema</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSettings({...settings, theme: 'light'})} className={`flex-1 h-8 rounded border ${settings.theme === 'light' ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-300'} bg-white`}></button>
                                            <button onClick={() => setSettings({...settings, theme: 'sepia'})} className={`flex-1 h-8 rounded border ${settings.theme === 'sepia' ? 'ring-2 ring-blue-500 border-transparent' : 'border-[#e3dccb]'} bg-[#f4ecd8]`}></button>
                                            <button onClick={() => setSettings({...settings, theme: 'dark'})} className={`flex-1 h-8 rounded border ${settings.theme === 'dark' ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-700'} bg-[#1a1a1a]`}></button>
                                        </div>
                                    </div>
                                    {/* Fonts */}
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Tipografía</label>
                                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                            <button onClick={() => setSettings({...settings, fontFamily: 'Sans'})} className={`flex-1 py-1 text-xs font-bold rounded ${settings.fontFamily === 'Sans' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}>Sans</button>
                                            <button onClick={() => setSettings({...settings, fontFamily: 'Serif'})} className={`flex-1 py-1 text-xs font-bold rounded ${settings.fontFamily === 'Serif' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}>Serif</button>
                                        </div>
                                    </div>
                                    {/* Font Size */}
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Tamaño: {settings.fontSize}px</label>
                                        <input 
                                            type="range" min="12" max="32" 
                                            value={settings.fontSize} 
                                            onChange={(e) => setSettings({...settings, fontSize: Number(e.target.value)})}
                                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* TOC Sidebar */}
                    {showTOC && (
                        <div className={`w-64 border-r overflow-y-auto p-4 transition-colors z-10 ${settings.theme === 'dark' ? 'border-gray-800 bg-[#111]' : settings.theme === 'sepia' ? 'border-[#e3dccb] bg-[#efdfbf]' : 'border-gray-100 bg-gray-50'}`}>
                            <h3 className="font-bold text-xs uppercase tracking-wider opacity-50 mb-4">Tabla de Contenidos</h3>
                            <ul className="space-y-2 text-sm font-medium opacity-80">
                                <li className="cursor-pointer hover:underline">Portada</li>
                                <li className="cursor-pointer hover:underline">Prefacio</li>
                                <li className="cursor-pointer hover:underline font-bold">Capítulo 1: El Punto de Partida</li>
                                <li className="cursor-pointer hover:underline pl-4 text-xs opacity-70">La Autonomía Humana</li>
                                <li className="cursor-pointer hover:underline pl-4 text-xs opacity-70">El Mito de la Neutralidad</li>
                                <li className="cursor-pointer hover:underline">Capítulo 2: La Antítesis</li>
                                <li className="cursor-pointer hover:underline">Bibliografía</li>
                            </ul>
                        </div>
                    )}

                    {/* Book Text */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center">
                        <div 
                            className={`max-w-2xl w-full py-12 px-8 md:px-12 selection:bg-yellow-200 selection:text-black ${fontStyles[settings.fontFamily]}`}
                            style={{ 
                                fontSize: `${settings.fontSize}px`, 
                                lineHeight: settings.lineHeight 
                            }}
                        >
                            {/* ReactMarkdown is good, but for full HTML/EPUB we'd use a parser. Mocking with text. */}
                            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight">
                                <React.Fragment>
                                    <h1 className="text-center mb-12 text-4xl">{currentBook.title}</h1>
                                    <div className="whitespace-pre-wrap">
                                        {MOCK_TEXT_CONTENT}
                                    </div>
                                </React.Fragment>
                            </div>
                            
                            <div className="mt-20 pt-10 border-t border-current opacity-20 text-center text-xs">
                                Fin del capítulo
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Progress */}
                <div className={`px-6 py-2 text-[10px] font-bold uppercase tracking-wider flex justify-between items-center opacity-60 ${settings.theme === 'dark' ? 'bg-[#111]' : settings.theme === 'sepia' ? 'bg-[#efdfbf]' : 'bg-gray-50'}`}>
                    <span>Capítulo 1 de 12</span>
                    <span>{currentBook.progress}% Leído</span>
                </div>
            </div>
        );
    };

    return view === 'library' ? renderLibrary() : renderReader();
};

export default EbookReaderView;
