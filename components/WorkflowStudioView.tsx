
import React, { useState, useMemo } from 'react';
import { WorkflowAction, WorkflowNode } from './WorkflowManagerModal';

// --- Data Models Reused/Expanded ---

// Reuse the AVAILABLE_ACTIONS from the Modal but defined here for independence if needed, 
// or import if exported. For clarity in this new view, we define them.
const STUDIO_ACTIONS: WorkflowAction[] = [
  // Procesamiento
  { id: 'transcribe_pro', label: 'Transcripción Pro', category: 'PROCESAMIENTO', icon: '🎧', description: 'Alta fidelidad con corrección.' },
  { id: 'clean', label: 'Limpiar Texto', category: 'PROCESAMIENTO', icon: '🧹', description: 'Elimina muletillas.' },
  { id: 'diarization_fix', label: 'Formatear Diálogo', category: 'PROCESAMIENTO', icon: '🗣️', description: 'Speaker A / Speaker B.' },
  { id: 'trans_en', label: 'Traducir (EN)', category: 'PROCESAMIENTO', icon: '🇺🇸', description: 'Al Inglés.' },
  { id: 'trans_es', label: 'Traducir (ES)', category: 'PROCESAMIENTO', icon: '🇪🇸', description: 'Al Español.' },
  
  // Editorial
  { id: 'book_editor', label: 'Editor Libro Pro', category: 'EDITORIAL', icon: '📖', description: 'Estilo literario profesional.' },
  { id: 'rewrite_article', label: 'Formato Artículo', category: 'EDITORIAL', icon: '📰', description: 'Post de blog H2/H3.' },
  { id: 'extract_quotes', label: 'Extraer Citas', category: 'EDITORIAL', icon: '💬', description: 'Frases memorables.' },
  { id: 'tone_journalistic', label: 'Tono Periodístico', category: 'EDITORIAL', icon: '🗞️', description: 'Tercera persona objetiva.' },

  // Análisis
  { id: 'summary_exec', label: 'Resumen Ejecutivo', category: 'ANALISIS', icon: '📊', description: 'Síntesis directiva.' },
  { id: 'summary_bullets', label: 'Bullet Points', category: 'ANALISIS', icon: '•', description: 'Puntos clave.' },
  { id: 'detect_topics', label: 'Detectar Temas', category: 'ANALISIS', icon: '🏷️', description: 'Keywords.' },

  // Salida
  { id: 'out_email', label: 'Email Newsletter', category: 'SALIDA', icon: '📧', description: 'Formato correo.' },
  { id: 'out_json', label: 'Exportar JSON', category: 'SALIDA', icon: 'JSON', description: 'Estructura de datos.' },
];

interface WorkflowProject {
    id: string;
    name: string;
    description: string;
    nodes: WorkflowNode[];
    updatedAt: string;
}

const MOCK_PROJECTS: WorkflowProject[] = [
    {
        id: '1',
        name: 'Podcast a Blog Post',
        description: 'Convierte audio crudo en un artículo SEO listo para publicar.',
        updatedAt: 'Hace 2 horas',
        nodes: [
            {
                uuid: 'root-1',
                action: { id: 'transcribe_pro', label: 'Transcripción Pro', category: 'PROCESAMIENTO', icon: '🎧' },
                isOutput: false,
                children: [
                    {
                        uuid: 'node-2',
                        action: { id: 'clean', label: 'Limpiar Texto', category: 'PROCESAMIENTO', icon: '🧹' },
                        children: [
                            {
                                uuid: 'node-3',
                                action: { id: 'rewrite_article', label: 'Formato Artículo', category: 'EDITORIAL', icon: '📰' },
                                isOutput: true,
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: '2',
        name: 'Resumen Ejecutivo Semanal',
        description: 'Extrae puntos clave y los traduce para la directiva.',
        updatedAt: 'Ayer',
        nodes: [
            {
                uuid: 'root-2',
                action: { id: 'clean', label: 'Limpiar Texto', category: 'PROCESAMIENTO', icon: '🧹' },
                children: [
                    {
                        uuid: 'node-b',
                        action: { id: 'summary_exec', label: 'Resumen Ejecutivo', category: 'ANALISIS', icon: '📊' },
                        isOutput: true, // Multiple output example
                        children: [
                            {
                                uuid: 'node-c',
                                action: { id: 'trans_en', label: 'Traducir (EN)', category: 'PROCESAMIENTO', icon: '🇺🇸' },
                                isOutput: true,
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

// --- Helpers ---

const getCategoryColor = (category: string) => {
    switch(category) {
        case 'PROCESAMIENTO': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'EDITORIAL': return 'bg-pink-50 text-pink-700 border-pink-200';
        case 'ANALISIS': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'SALIDA': return 'bg-gray-800 text-white border-gray-600';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const findNode = (nodes: WorkflowNode[], uuid: string): WorkflowNode | null => {
    for (const node of nodes) {
        if (node.uuid === uuid) return node;
        const found = findNode(node.children, uuid);
        if (found) return found;
    }
    return null;
};

// --- Component: Node Renderer (Visual) ---

interface NodeRendererProps {
    node: WorkflowNode;
    selectedId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

const NodeCard: React.FC<NodeRendererProps> = ({ node, selectedId, onSelect, onDelete }) => {
    const isSelected = selectedId === node.uuid;
    const colorClass = getCategoryColor(node.action.category);

    return (
        <div className="flex flex-col items-center">
            {/* The Node Card */}
            <div 
                onClick={(e) => { e.stopPropagation(); onSelect(node.uuid); }}
                className={`relative w-64 p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm group
                    ${isSelected 
                        ? 'border-blue-500 ring-4 ring-blue-100 bg-white z-10 scale-105' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
            >
                {/* Input Connector */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                
                {/* Content */}
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg text-lg ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}>
                        {node.action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">{node.action.category}</span>
                        <h4 className="text-sm font-bold text-gray-900 truncate">{node.action.label}</h4>
                    </div>
                </div>

                {/* Output Badge */}
                {node.isOutput && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-md z-20 animate-in zoom-in" title="Este nodo genera un archivo de salida">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    </div>
                )}

                {/* Output Connector */}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white ${node.children.length > 0 ? 'bg-gray-300' : 'bg-blue-500 animate-pulse'}`}></div>
            </div>

            {/* Recursion for Children */}
            {node.children.length > 0 && (
                <div className="flex flex-col items-center">
                    <div className="w-0.5 h-12 bg-gray-300"></div>
                    <div className="flex gap-8">
                        {node.children.map(child => (
                            <NodeCard 
                                key={child.uuid} 
                                node={child} 
                                selectedId={selectedId} 
                                onSelect={onSelect}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main View ---

const WorkflowStudioView = () => {
    const [projects, setProjects] = useState<WorkflowProject[]>(MOCK_PROJECTS);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const activeProject = projects.find(p => p.id === activeProjectId);
    const selectedNode = activeProject && selectedNodeId ? findNode(activeProject.nodes, selectedNodeId) : null;

    // --- Logic Helpers ---

    const generateUuid = () => Math.random().toString(36).substr(2, 9);

    const handleCreateProject = () => {
        const newProject: WorkflowProject = {
            id: Date.now().toString(),
            name: 'Nuevo Flujo sin título',
            description: 'Borrador inicial',
            updatedAt: 'Justo ahora',
            nodes: []
        };
        setProjects([...projects, newProject]);
        setActiveProjectId(newProject.id);
    };

    const handleAddNode = (action: WorkflowAction) => {
        if (!activeProject) return;

        const updateTree = (nodes: WorkflowNode[], targetId: string | null): WorkflowNode[] => {
            // Case 1: Add to root if tree is empty or no selection
            if (nodes.length === 0 && !targetId) {
                return [{ uuid: generateUuid(), action, children: [], isOutput: true }];
            }
            
            // Case 2: Recursive find and append
            return nodes.map(node => {
                if (node.uuid === targetId) {
                    return { ...node, children: [...node.children, { uuid: generateUuid(), action, children: [], isOutput: true }] };
                }
                if (node.children.length > 0) {
                    return { ...node, children: updateTree(node.children, targetId) };
                }
                return node;
            });
        };

        const newNodes = updateTree(activeProject.nodes, selectedNodeId);
        
        // If no node selected and tree not empty, alert user
        if (activeProject.nodes.length > 0 && !selectedNodeId) {
            alert("Por favor selecciona un nodo al cual conectar la siguiente acción.");
            return;
        }

        const updatedProject = { ...activeProject, nodes: newNodes };
        setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
    };

    const handleDeleteNode = (uuid: string) => {
        if (!activeProject) return;
        
        const deleteFromTree = (nodes: WorkflowNode[]): WorkflowNode[] => {
            return nodes
                .filter(n => n.uuid !== uuid)
                .map(n => ({ ...n, children: deleteFromTree(n.children) }));
        };

        const updatedProject = { ...activeProject, nodes: deleteFromTree(activeProject.nodes) };
        setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
        if (selectedNodeId === uuid) setSelectedNodeId(null);
    };

    // New: Update properties of a specific node
    const updateNodeProperty = (uuid: string, key: keyof WorkflowNode, value: any) => {
        if (!activeProject) return;

        const updateTree = (nodes: WorkflowNode[]): WorkflowNode[] => {
            return nodes.map(node => {
                if (node.uuid === uuid) {
                    return { ...node, [key]: value };
                }
                if (node.children.length > 0) {
                    return { ...node, children: updateTree(node.children) };
                }
                return node;
            });
        };

        const updatedProject = { ...activeProject, nodes: updateTree(activeProject.nodes) };
        setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
    };

    // New: Swap action type for a node
    const updateNodeAction = (uuid: string, actionId: string) => {
        const action = STUDIO_ACTIONS.find(a => a.id === actionId);
        if (action) updateNodeProperty(uuid, 'action', action);
    };

    const handleSimulate = () => {
        setIsSimulating(true);
        setTimeout(() => setIsSimulating(false), 2000);
    };

    return (
        <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans text-gray-900">
            
            {/* 1. Sidebar: Project Library & Toolset */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-20">
                {/* Library Header */}
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Workflow Studio
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Orquestación de Procesos IA</p>
                </div>

                {/* Workflow List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    <div className="flex justify-between items-center px-2 mb-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mis Proyectos</h3>
                        <button onClick={handleCreateProject} className="text-blue-600 hover:text-blue-800 text-xs font-bold">+ Nuevo</button>
                    </div>
                    {projects.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => { setActiveProjectId(p.id); setSelectedNodeId(null); }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${activeProjectId === p.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-100 hover:shadow-sm'}`}
                        >
                            <h4 className={`text-sm font-bold ${activeProjectId === p.id ? 'text-blue-900' : 'text-gray-900'}`}>{p.name}</h4>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                            <span className="text-[9px] text-gray-400 mt-2 block">{p.updatedAt}</span>
                        </div>
                    ))}
                </div>

                {/* Toolbox (Bottom Half) */}
                <div className="border-t border-gray-200 flex-1 flex flex-col overflow-hidden bg-gray-50">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <h3 className="text-xs font-bold text-gray-900">Librería de Nodos</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 grid grid-cols-2 gap-2">
                        {STUDIO_ACTIONS.map(action => (
                            <button
                                key={action.id}
                                onClick={() => handleAddNode(action)}
                                disabled={!activeProjectId}
                                className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-center h-24"
                            >
                                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{action.icon}</span>
                                <span className="text-[10px] font-bold text-gray-700 leading-tight">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Main Canvas */}
            <div className="flex-1 flex flex-col relative bg-[#f0f2f5] overflow-hidden">
                
                {/* Canvas Toolbar */}
                <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        {activeProject ? (
                            <>
                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">Borrador</span>
                                <input 
                                    value={activeProject.name}
                                    onChange={(e) => {
                                        const updated = { ...activeProject, name: e.target.value };
                                        setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
                                    }}
                                    className="font-bold text-lg text-gray-900 bg-transparent border-none focus:ring-0 p-0" 
                                />
                            </>
                        ) : (
                            <span className="text-gray-400 font-medium italic">Selecciona un proyecto para comenzar</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleSimulate}
                            disabled={!activeProject || activeProject.nodes.length === 0}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSimulating ? <span className="animate-spin">⚙️</span> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                            {isSimulating ? 'Validando...' : 'Ejecutar Prueba'}
                        </button>
                    </div>
                </div>

                {/* Infinite Canvas Area */}
                <div 
                    className="flex-1 overflow-auto custom-scrollbar relative flex items-start justify-center pt-20"
                    style={{ 
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                        backgroundSize: '24px 24px',
                    }}
                    onClick={() => setSelectedNodeId(null)}
                >
                    {activeProject ? (
                        activeProject.nodes.length > 0 ? (
                            <div className="min-w-max px-20 pb-20">
                                {activeProject.nodes.map(node => (
                                    <NodeCard 
                                        key={node.uuid} 
                                        node={node} 
                                        selectedId={selectedNodeId} 
                                        onSelect={setSelectedNodeId}
                                        onDelete={handleDeleteNode}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center opacity-40 mt-20 pointer-events-none">
                                <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-[2rem] flex items-center justify-center mb-6">
                                    <span className="text-6xl text-gray-300">+</span>
                                </div>
                                <p className="text-xl font-bold text-gray-400">Canvas Vacío</p>
                                <p className="text-sm text-gray-400">Añade nodos desde la librería izquierda</p>
                            </div>
                        )
                    ) : null}
                </div>
            </div>

            {/* 3. Enhanced Properties Panel (Node Manager) */}
            {selectedNode && activeProject && (
                <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col z-20 animate-in slide-in-from-right duration-300 h-full overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gestor de Nodo</h3>
                        <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-mono text-gray-500">{selectedNode.uuid.substring(0,6)}</div>
                    </div>
                    
                    {/* Header Info */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{selectedNode.action.icon}</span>
                            <div>
                                <h4 className="font-bold text-blue-900 leading-tight">{selectedNode.action.label}</h4>
                                <span className="text-[10px] font-bold text-blue-500 uppercase">{selectedNode.action.category}</span>
                            </div>
                        </div>
                        <p className="text-xs text-blue-800/70 leading-relaxed">
                            {selectedNode.action.description}
                        </p>
                    </div>

                    <div className="space-y-6">
                        
                        {/* 1. Change Action Type */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Acción / Herramienta</label>
                            <select 
                                value={selectedNode.action.id}
                                onChange={(e) => updateNodeAction(selectedNode.uuid, e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {STUDIO_ACTIONS.map(a => (
                                    <option key={a.id} value={a.id}>{a.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Output Toggle (Main Request) */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div>
                                <label className="block text-xs font-bold text-gray-900">Guardar como Resultado</label>
                                <p className="text-[10px] text-gray-500">¿Este paso genera un archivo final?</p>
                            </div>
                            <button 
                                onClick={() => updateNodeProperty(selectedNode.uuid, 'isOutput', !selectedNode.isOutput)}
                                className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${selectedNode.isOutput ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${selectedNode.isOutput ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        {/* 3. AI Config */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Prompt del Sistema (Opcional)</label>
                            <textarea 
                                value={selectedNode.customPrompt || ''}
                                onChange={(e) => updateNodeProperty(selectedNode.uuid, 'customPrompt', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400" 
                                placeholder="Escribe instrucciones específicas para este paso..." 
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
                        <button 
                            onClick={() => handleDeleteNode(selectedNode.uuid)}
                            className="w-full py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Eliminar Nodo
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default WorkflowStudioView;
