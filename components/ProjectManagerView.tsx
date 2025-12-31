import React, { useState, useMemo, useEffect } from 'react';
import { ProjectSummary, TimelineItem, PROJECT_LIST, MOCK_DB } from '../services/mockData';
import { listProjects, createProject } from '../services/fileSystem';

// --- Icons Library ---

const Icons = {
    Cloud: () => <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
    Layout: () => <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
    Phone: () => <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
    Image: () => <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Shield: () => <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Clock: () => <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Filter: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    More: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>,
    ChevronLeft: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
    Check: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
    Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Trash: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
};

// --- Helper Functions ---

const getTypeConfig = (type: string) => {
    switch (type) {
        case 'project': return { icon: <Icons.Cloud />, bg: 'bg-blue-50 text-blue-600' };
        case 'task': return { icon: <Icons.Layout />, bg: 'bg-orange-50 text-orange-600' };
        case 'meeting': return { icon: <Icons.Clock />, bg: 'bg-purple-50 text-purple-600' };
        case 'milestone': return { icon: <Icons.Shield />, bg: 'bg-green-50 text-green-600' };
        default: return { icon: <Icons.Layout />, bg: 'bg-gray-50 text-gray-600' };
    }
};

// Updated Layout Calculation for 2026
const START_DATE = new Date('2026-01-01');
const PIXELS_PER_DAY = 32; // Reduced slightly to fit more time
const DAYS_IN_VIEW = 60;   // Increased to see bimonthly progress

const getPositionStyles = (start: string, end: string, row: number) => {
    const s = new Date(start);
    const e = new Date(end);

    // Safety check for invalid dates
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return { left: '0px', width: '0px', top: '0px' };

    const diffStart = Math.ceil((s.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + (s.getTime() === e.getTime() ? 0 : 1));
    const top = 120 + (row * 96);

    // Don't render if completely out of view (negative start + duration < 0)
    // But for this simple implementation we let CSS handle overflow
    return {
        left: `${diffStart * PIXELS_PER_DAY}px`,
        width: `${duration * PIXELS_PER_DAY}px`,
        top: `${top}px`
    };
};

// --- Sub-Components ---

const StatsWidget = ({ items }: { items: TimelineItem[] }) => {
    const total = items.length;
    const completed = items.filter(i => i.status === 'done').length;
    const active = items.filter(i => i.status === 'active').length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    const circumference = 2 * Math.PI * 48; // r=48

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex items-center justify-between">
            <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                    <circle
                        cx="56" cy="56" r="48"
                        stroke="#3b82f6" strokeWidth="8" fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (circumference * percentage / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-900 tracking-tight">{percentage}%</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-1">Progreso</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 ml-4">
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                    Hecho ({completed})
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>
                    Pendiente ({total - completed})
                </div>
            </div>
        </div>
    );
};

// --- Project Modal ---

const ProjectModal = ({
    isOpen,
    onClose,
    onSave,
    initialData
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<ProjectSummary>) => void;
    initialData?: ProjectSummary | null;
}) => {
    const [formData, setFormData] = useState<Partial<ProjectSummary>>({
        title: '',
        category: '',
        dueDate: '',
        status: 'Not Started',
        description: '',
        progress: 0,
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Reset for new project
            setFormData({
                title: '',
                category: '',
                dueDate: '',
                status: 'Not Started',
                description: '',
                progress: 0
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.title) return;
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{initialData ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                        <input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black outline-none"
                            placeholder="Nombre del proyecto..."
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                            <input
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                                placeholder="Ej: Ciencia Q1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Límite</label>
                            <input
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                                placeholder="Ej: Feb 2026"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                            >
                                <option value="Not Started">No Iniciado</option>
                                <option value="On Track">En Curso</option>
                                <option value="Delayed">Retrasado</option>
                                <option value="At Risk">En Riesgo</option>
                                <option value="Completed">Completado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Progreso (%)</label>
                            <input
                                type="number" min="0" max="100"
                                value={formData.progress}
                                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm h-20 resize-none"
                            placeholder="Breve descripción..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        {initialData ? 'Guardar Cambios' : 'Crear Proyecto'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProjectList = ({
    projects,
    onSelect,
    onNewProject,
    onEditProject
}: {
    projects: ProjectSummary[],
    onSelect: (p: ProjectSummary) => void,
    onNewProject: () => void,
    onEditProject: (p: ProjectSummary) => void
}) => (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-300">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Estrategia 2026</h1>
                    <p className="text-gray-500 text-sm mt-1">Roadmap anual: De lo Concreto a lo Abstracto.</p>
                </div>
                <button
                    onClick={onNewProject}
                    className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                    <Icons.Plus /> Nuevo Proyecto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div
                        key={project.id}
                        onClick={() => onSelect(project)}
                        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-gray-100 
                                ${project.category.includes('Q1') ? 'bg-green-50 text-green-700' :
                                    project.category.includes('Q2') ? 'bg-yellow-50 text-yellow-700' :
                                        project.category.includes('Q3') ? 'bg-orange-50 text-orange-700' :
                                            'bg-blue-50 text-blue-700'}`}>
                                {project.category}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditProject(project); }}
                                    className="text-gray-300 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded"
                                    title="Editar Proyecto"
                                >
                                    <Icons.Edit />
                                </button>
                                <button className="text-gray-300 hover:text-gray-600 transition-colors p-1">
                                    <Icons.More />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2">
                            {project.description}
                        </p>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-gray-400">Progreso</span>
                                <span className="text-gray-900">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${project.status === 'At Risk' ? 'bg-red-500' : project.status === 'Delayed' ? 'bg-orange-500' : project.status === 'Not Started' ? 'bg-gray-300' : 'bg-blue-500'}`}
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex -space-x-2">
                                {project.members.map((src, i) => (
                                    <img key={i} src={src} className="w-8 h-8 rounded-full border-2 border-white" alt="Member" />
                                ))}
                            </div>
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold 
                                ${project.status === 'On Track' ? 'bg-green-50 text-green-700' :
                                    project.status === 'At Risk' ? 'bg-red-50 text-red-700' :
                                        project.status === 'Delayed' ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'On Track' ? 'bg-green-500' :
                                    project.status === 'At Risk' ? 'bg-red-500' :
                                        project.status === 'Delayed' ? 'bg-orange-500' : 'bg-gray-500'
                                    }`}></span>
                                {project.status.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Placeholder */}
                <button
                    onClick={onNewProject}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all h-full min-h-[250px]"
                >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Icons.Plus />
                    </div>
                    <span className="font-bold text-sm">Crear Nuevo Proyecto</span>
                </button>
            </div>
        </div>
    </div>
);

const ProjectDetail = ({ project, onBack }: { project: ProjectSummary, onBack: () => void }) => {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [activeTab, setActiveTab] = useState('Cronograma');
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        startDate: '2026-02-01',
        endDate: '2026-02-05',
        type: 'task' as const,
        row: 0
    });

    useEffect(() => {
        // Simular carga de datos
        const data = MOCK_DB[project.id] || [];
        setItems(data);
    }, [project.id]);

    const handleToggleStatus = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, status: item.status === 'done' ? 'active' : 'done' }
                : item
        ));
    };

    const handleDeleteItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const handleAddItem = () => {
        if (!newItem.title) return;
        const id = Date.now().toString();
        const sDate = new Date(newItem.startDate);
        const eDate = new Date(newItem.endDate);
        const subtitle = `${sDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${eDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`;

        const item: TimelineItem = {
            id,
            title: newItem.title,
            subtitle,
            startDate: newItem.startDate,
            endDate: newItem.endDate,
            type: newItem.type,
            row: newItem.row,
            status: 'active',
            avatars: []
        };

        setItems([...items, item]);

        // --- SYNC WITH CALENDAR ---
        window.dispatchEvent(new CustomEvent('presup:sync-event', {
            detail: {
                id: item.id,
                title: item.title,
                date: item.endDate, // Map end date to calendar
                type: item.type === 'task' ? 'task' : 'project'
            }
        }));

        setIsModalOpen(false);
        setNewItem({ ...newItem, title: '' }); // Reset title only
    };

    // --- Helpers for Timeline ---
    const getDaysArray = () => {
        const days = [];
        for (let i = 0; i < DAYS_IN_VIEW; i++) {
            const d = new Date(START_DATE);
            d.setDate(START_DATE.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const days = getDaysArray();
    const months = useMemo(() => {
        const groups: { month: string; count: number }[] = [];
        let currentMonth = '';
        let count = 0;
        days.forEach((d) => {
            const m = d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            if (m !== currentMonth) {
                if (currentMonth) groups.push({ month: currentMonth, count });
                currentMonth = m;
                count = 1;
            } else { count++; }
        });
        if (currentMonth) groups.push({ month: currentMonth, count });
        return groups;
    }, []);

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full font-sans text-gray-900 bg-white relative">

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Fase / Tarea</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                                <input
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black outline-none"
                                    placeholder="Ej: Revisión Final..."
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Inicio</label>
                                    <input
                                        type="date"
                                        value={newItem.startDate}
                                        onChange={(e) => setNewItem({ ...newItem, startDate: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fin</label>
                                    <input
                                        type="date"
                                        value={newItem.endDate}
                                        onChange={(e) => setNewItem({ ...newItem, endDate: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                                    <select
                                        value={newItem.type}
                                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                                    >
                                        <option value="task">Tarea</option>
                                        <option value="project">Proyecto</option>
                                        <option value="meeting">Reunión</option>
                                        <option value="milestone">Hito</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Carril (Row)</label>
                                    <input
                                        type="number" min="0" max="10"
                                        value={newItem.row}
                                        onChange={(e) => setNewItem({ ...newItem, row: parseInt(e.target.value) })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddItem}
                                className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="px-8 pt-6 pb-2 border-b border-gray-100 z-30 bg-white/95 backdrop-blur-sm sticky top-0">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors px-2 py-1 -ml-2 rounded hover:bg-gray-50">
                        <Icons.ChevronLeft /> Volver a Proyectos
                    </button>
                </div>
                <div className="flex justify-between items-end mb-5">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{project.title}</h1>
                        <p className="text-xs text-gray-500 font-medium mt-1">{project.category} &middot; {project.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-3 py-2 border rounded-lg flex items-center gap-2 text-xs font-bold transition-all border-gray-200 hover:bg-gray-50 text-gray-600">
                            <Icons.Filter /> Todos
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="pl-4 pr-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 text-xs font-bold flex items-center gap-2 shadow-lg"
                        >
                            Nueva Fase <Icons.Plus />
                        </button>
                    </div>
                </div>
                <div className="flex gap-8 border-b border-transparent translate-y-[1px]">
                    {['General', 'Cronograma', 'Tabla', 'Archivos'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-bold border-b-[3px] transition-all px-1 ${activeTab === tab ? 'border-blue-600 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* Timeline Canvas */}
                <div className="flex-1 overflow-x-auto overflow-y-auto bg-white custom-scrollbar relative">
                    <div style={{ width: `${DAYS_IN_VIEW * PIXELS_PER_DAY}px`, minWidth: '100%' }}>
                        {/* Timeline Header */}
                        <div className="sticky top-0 bg-white z-20 border-b border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <div className="flex border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {months.map((m, idx) => (
                                    <div key={idx} className="py-2 px-4 border-r border-gray-50 capitalize" style={{ width: `${m.count * PIXELS_PER_DAY}px` }}>{m.month}</div>
                                ))}
                            </div>
                            <div className="flex">
                                {days.map((d, idx) => (
                                    <div key={idx} className="flex-shrink-0 flex flex-col items-center justify-center py-3 border-r border-gray-50 text-xs font-medium text-gray-400" style={{ width: `${PIXELS_PER_DAY}px` }}>
                                        {d.getDate()}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="relative" style={{ height: '600px' }}>
                            {/* Grid Lines */}
                            <div className="absolute inset-0 z-0 flex pointer-events-none">
                                {days.map((_, idx) => <div key={idx} className="border-r border-gray-50 h-full flex-shrink-0" style={{ width: `${PIXELS_PER_DAY}px` }} />)}
                            </div>

                            {/* Cards */}
                            {items.map(item => {
                                const { icon, bg } = getTypeConfig(item.type);
                                return (
                                    <div
                                        key={item.id}
                                        className="absolute p-1 group hover:z-30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                        style={{
                                            ...getPositionStyles(item.startDate, item.endDate, item.row),
                                            minWidth: '200px'
                                        }}
                                        onClick={() => handleToggleStatus(item.id)}
                                    >
                                        <div className={`
                                            flex items-center gap-3 p-3.5 rounded-xl transition-all relative overflow-hidden
                                            ${item.status === 'draft' ? 'bg-white border-2 border-dashed border-gray-200 opacity-90' :
                                                item.status === 'done' ? 'bg-gray-50 border border-gray-200 opacity-70 grayscale-[0.5]' :
                                                    'bg-white shadow-sm hover:shadow-lg border border-gray-100 hover:border-gray-200'}
                                        `}>
                                            {item.status === 'done' && <div className="absolute top-0 right-0 p-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div></div>}
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-xs font-bold truncate ${item.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.title}</h4>
                                                <p className="text-[10px] text-gray-400 truncate font-medium">{item.subtitle}</p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-sm">
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-96 bg-white border-l border-gray-100 flex flex-col h-full overflow-hidden shadow-[-10px_0_40px_rgba(0,0,0,0.02)] z-30">
                    <div className="p-8 border-b border-gray-50">
                        <StatsWidget items={items} />
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="font-bold text-gray-900 text-sm">Entregables Activos</h3>
                            <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">{items.filter(i => i.status === 'active').length}</span>
                        </div>
                        <div className="space-y-3">
                            {items.filter(i => i.status === 'active').map(item => {
                                const { icon, bg } = getTypeConfig(item.type);
                                const isExpanded = expandedProjectId === item.id;
                                return (
                                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                                        <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedProjectId(isExpanded ? null : item.id)}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>{icon}</div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{item.title}</h4>
                                                    <p className="text-[10px] text-gray-400 font-medium truncate">{item.subtitle}</p>
                                                </div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(item.id); }} className="text-gray-300 hover:text-green-500 transition-colors">
                                                <Icons.Check />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Container ---

const ProjectManagerView = () => {
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [activeProject, setActiveProject] = useState<ProjectSummary | null>(null);
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const loaded = await listProjects();
            if (loaded.length > 0) {
                setProjects(loaded);
            } else {
                setProjects(PROJECT_LIST); // Fallback or empty
            }
        } catch (error) {
            console.error("Failed to load projects", error);
        }
    };

    const handleSelectProject = (project: ProjectSummary) => {
        setActiveProject(project);
        setViewMode('detail');
    };

    const handleBack = () => {
        setActiveProject(null);
        setViewMode('list');
    };

    const handleCreateProject = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleEditProject = (project: ProjectSummary) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };



    const saveProjectToDisk = async (project: ProjectSummary) => {
        try {
            await createProject(project.id, project);
            await loadProjects(); // Refresh list
        } catch (e) {
            console.error("Failed to save project", e);
        }
    };

    const handleSaveProject = async (data: Partial<ProjectSummary>) => {
        let finalProject: ProjectSummary;

        if (editingProject) {
            finalProject = { ...editingProject, ...data };
        } else {
            finalProject = {
                id: Date.now().toString(),
                title: data.title || 'Nuevo Proyecto',
                category: data.category || 'General',
                progress: data.progress || 0,
                status: data.status || 'Not Started',
                dueDate: data.dueDate || '',
                members: ['https://picsum.photos/id/101/40/40'],
                description: data.description || ''
            };
        }

        await saveProjectToDisk(finalProject);
        setIsModalOpen(false);
    };

    return (
        <div className="flex-1 h-screen bg-white flex flex-col overflow-hidden font-sans text-gray-900 relative">
            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
                initialData={editingProject}
            />

            {viewMode === 'list' ? (
                <ProjectList
                    projects={projects}
                    onSelect={handleSelectProject}
                    onNewProject={handleCreateProject}
                    onEditProject={handleEditProject}
                />
            ) : (
                activeProject && <ProjectDetail project={activeProject} onBack={handleBack} />
            )}
        </div>
    );
};

export default ProjectManagerView;