
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Note, INITIAL_NOTES, PROJECT_LIST, INITIAL_TASKS } from '../services/mockData';

// --- Icons ---
const Icons = {
    Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Link: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    X: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    Project: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
    Task: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    Search: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    ChevronDown: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
};

const SearchableDropdown = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    label,
    icon: Icon 
}: { 
    options: { id: string, label: string }[], 
    value: string | undefined, 
    onChange: (id: string) => void, 
    placeholder: string,
    label: string,
    icon?: any
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);
    const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="relative flex-1" ref={wrapperRef}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
            <div 
                onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-all hover:border-gray-300 ${isOpen ? 'ring-2 ring-black/5 border-black shadow-sm' : 'border-gray-200'}`}
            >
                <div className="flex items-center gap-2 text-gray-700 truncate">
                    {Icon && <div className={`${selectedOption ? 'text-black' : 'text-gray-400'}`}><Icon /></div>}
                    {selectedOption ? (
                        <span className="font-bold text-gray-900">{selectedOption.label}</span>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>
                <div className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <Icons.ChevronDown />
                </div>
            </div>

            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-56 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-bottom">
                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                        <div className="relative">
                            <input 
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar..."
                                className="w-full text-xs bg-white border border-gray-200 rounded-lg pl-8 pr-2 py-2 focus:ring-1 focus:ring-black focus:border-black outline-none placeholder-gray-400"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="absolute left-2.5 top-2.5 text-gray-400">
                                <Icons.Search />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1 p-1.5">
                        <div 
                            onClick={() => { onChange(''); setIsOpen(false); }}
                            className="px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-lg cursor-pointer transition-colors mb-1 font-medium"
                        >
                            -- Ninguno --
                        </div>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt.id}
                                    onClick={() => { onChange(opt.id); setIsOpen(false); }}
                                    className={`px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors flex items-center justify-between mb-0.5 ${value === opt.id ? 'bg-black text-white font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    {opt.label}
                                    {value === opt.id && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-6 text-center text-xs text-gray-400 italic">No se encontraron resultados</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const NoteCard: React.FC<{ note: Note, onClick: () => void, onDelete: (id: string) => void }> = ({ note, onClick, onDelete }) => {
    const bgColors = {
        yellow: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200',
        blue: 'bg-blue-100 hover:bg-blue-200 border-blue-200',
        pink: 'bg-pink-100 hover:bg-pink-200 border-pink-200',
        green: 'bg-green-100 hover:bg-green-200 border-green-200',
        white: 'bg-white hover:bg-gray-50 border-gray-200'
    };

    return (
        <div 
            onClick={onClick}
            className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 relative group h-64 flex flex-col ${bgColors[note.color] || bgColors.yellow}`}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{note.title}</h3>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity"
                >
                    <Icons.Trash />
                </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
                <div className="prose prose-sm text-gray-700 leading-relaxed line-clamp-6 text-sm">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
            </div>

            <div className="pt-4 mt-2 flex justify-between items-end border-t border-black/5">
                <span className="text-[10px] text-gray-500 font-medium">{note.updatedAt.toLocaleDateString()}</span>
                {note.relatedTo && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-white/50 px-2 py-1 rounded-full text-gray-600 border border-black/5">
                        <Icons.Link />
                        {note.relatedTo.type === 'project' ? 'P: ' : 'T: '}
                        {note.relatedTo.name.substring(0, 15)}{note.relatedTo.name.length > 15 && '...'}
                    </span>
                )}
            </div>
        </div>
    );
};

const NoteEditor = ({ note, onSave, onClose }: { note: Partial<Note>, onSave: (n: Partial<Note>) => void, onClose: () => void }) => {
    const [editedNote, setEditedNote] = useState(note);

    const handleChange = (field: keyof Note, value: any) => {
        setEditedNote(prev => ({ ...prev, [field]: value }));
    };

    const handleRelationChange = (type: 'project' | 'task', id: string) => {
        if (!id) {
            // Only clear if we are clearing the type that is currently set
            if (editedNote.relatedTo?.type === type) {
                setEditedNote(prev => ({ ...prev, relatedTo: undefined }));
            }
            return;
        }
        
        let name = '';
        if (type === 'project') {
            name = PROJECT_LIST.find(p => p.id === id)?.title || '';
        } else {
            name = INITIAL_TASKS.find(t => t.id === id)?.title || '';
        }

        setEditedNote(prev => ({ 
            ...prev, 
            relatedTo: { type, id, name } 
        }));
    };

    const colors = ['yellow', 'blue', 'pink', 'green', 'white'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <input 
                        value={editedNote.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Título de la nota..."
                        className="text-2xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 w-full bg-transparent"
                        autoFocus
                    />
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
                        <Icons.X />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                    <textarea 
                        value={editedNote.content}
                        onChange={(e) => handleChange('content', e.target.value)}
                        placeholder="Escribe algo brillante..."
                        className="flex-1 w-full resize-none border-none focus:ring-0 text-lg text-gray-700 placeholder-gray-300 leading-relaxed font-sans"
                    />
                </div>

                {/* Footer Controls */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex flex-col gap-4">
                    
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Colors */}
                        <div className="flex gap-2">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => handleChange('color', c)}
                                    className={`w-6 h-6 rounded-full border border-gray-300 shadow-sm transition-transform hover:scale-110 ${c === editedNote.color ? 'ring-2 ring-gray-400 scale-110' : ''}`}
                                    style={{ backgroundColor: c === 'white' ? '#fff' : `var(--color-${c}-100)` }} 
                                >
                                    <div className={`w-full h-full rounded-full ${c === 'yellow' ? 'bg-yellow-200' : c === 'blue' ? 'bg-blue-200' : c === 'pink' ? 'bg-pink-200' : c === 'green' ? 'bg-green-200' : 'bg-white'}`}></div>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900">
                                Cancelar
                            </button>
                            <button 
                                onClick={() => { onSave(editedNote); onClose(); }}
                                className="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold shadow-lg hover:opacity-90"
                            >
                                Guardar Nota
                            </button>
                        </div>
                    </div>

                    {/* Associations (Updated UI) */}
                    <div className="flex gap-4 pt-2 border-t border-gray-200">
                        <SearchableDropdown 
                            label="Asociar a Proyecto"
                            placeholder="Seleccionar Proyecto..."
                            icon={Icons.Project}
                            options={PROJECT_LIST.map(p => ({ id: p.id, label: p.title }))}
                            value={editedNote.relatedTo?.type === 'project' ? editedNote.relatedTo.id : undefined}
                            onChange={(id) => handleRelationChange('project', id)}
                        />
                        <SearchableDropdown 
                            label="Asociar a Tarea"
                            placeholder="Seleccionar Tarea..."
                            icon={Icons.Task}
                            options={INITIAL_TASKS.map(t => ({ id: t.id, label: t.title }))}
                            value={editedNote.relatedTo?.type === 'task' ? editedNote.relatedTo.id : undefined}
                            onChange={(id) => handleRelationChange('task', id)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotesView = () => {
    const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
    const [activeNote, setActiveNote] = useState<Partial<Note> | null>(null);
    const [filter, setFilter] = useState<'All' | 'Project' | 'Task'>('All');

    const handleCreate = () => {
        setActiveNote({
            id: Date.now().toString(),
            title: '',
            content: '',
            color: 'yellow',
            updatedAt: new Date()
        });
    };

    const handleSave = (updatedNote: Partial<Note>) => {
        if (!updatedNote.title && !updatedNote.content) return;
        
        const finalNote = {
            ...updatedNote,
            updatedAt: new Date()
        } as Note;

        if (notes.some(n => n.id === finalNote.id)) {
            setNotes(notes.map(n => n.id === finalNote.id ? finalNote : n));
        } else {
            setNotes([finalNote, ...notes]);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta nota?')) {
            setNotes(notes.filter(n => n.id !== id));
        }
    };

    const filteredNotes = notes.filter(n => {
        if (filter === 'All') return true;
        if (filter === 'Project') return n.relatedTo?.type === 'project';
        if (filter === 'Task') return n.relatedTo?.type === 'task';
        return true;
    });

    return (
        <div className="flex-1 h-screen bg-[#fafafa] flex flex-col overflow-hidden font-sans">
            
            {activeNote && (
                <NoteEditor 
                    note={activeNote} 
                    onSave={handleSave} 
                    onClose={() => setActiveNote(null)} 
                />
            )}

            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-gray-200 flex justify-between items-center z-10 sticky top-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notas Rápidas</h1>
                    <p className="text-sm text-gray-500">Captura ideas y asócialas a tu trabajo.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-bold">
                        <button onClick={() => setFilter('All')} className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'All' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Todas</button>
                        <button onClick={() => setFilter('Project')} className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'Project' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>De Proyectos</button>
                        <button onClick={() => setFilter('Task')} className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'Task' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>De Tareas</button>
                    </div>

                    <button 
                        onClick={handleCreate}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                        <Icons.Plus /> Nueva Nota
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {filteredNotes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <p>No hay notas en esta categoría.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredNotes.map(note => (
                            <NoteCard 
                                key={note.id} 
                                note={note} 
                                onClick={() => setActiveNote(note)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesView;
