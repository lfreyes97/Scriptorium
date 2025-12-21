
import React, { useState, useMemo } from 'react';

// --- Types ---

export interface WorkflowAction {
  id: string; 
  label: string;
  category: 'PROCESAMIENTO' | 'EDITORIAL' | 'ANALISIS' | 'SALIDA';
  icon?: string;
  description?: string;
}

// Tree Node Structure
export interface WorkflowNode {
  uuid: string;
  action: WorkflowAction;
  isOutput?: boolean; // New: Marks if this node produces a deliverable asset
  customPrompt?: string; // New: Override default prompt
  children: WorkflowNode[];
}

interface WorkflowManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workflow: { name: string; tree: WorkflowNode[] }) => void;
}

const AVAILABLE_ACTIONS: WorkflowAction[] = [
  // Procesamiento
  { id: 'transcribe_pro', label: 'Transcripción Pro', category: 'PROCESAMIENTO', icon: '🎧', description: 'Transcripción de alta fidelidad con corrección de contexto y limpieza inteligente.' },
  { id: 'clean', label: 'Limpiar Texto', category: 'PROCESAMIENTO', icon: '🧹', description: 'Elimina muletillas, repeticiones y titubeos.' },
  { id: 'diarization_fix', label: 'Formatear Diálogo', category: 'PROCESAMIENTO', icon: '🗣️', description: 'Estructura clara de Hablante A / Hablante B.' },
  { id: 'trans_en', label: 'Traducir (EN)', category: 'PROCESAMIENTO', icon: '🇺🇸', description: 'Traducción fiel al inglés.' },
  { id: 'trans_es', label: 'Traducir (ES)', category: 'PROCESAMIENTO', icon: '🇪🇸', description: 'Traducción fiel al español.' },
  
  // Editorial
  { id: 'book_editor', label: 'Editor Libro Pro', category: 'EDITORIAL', icon: '📖', description: 'Formato manuscrito, narrativa fluida y estilo literario profesional.' },
  { id: 'rewrite_article', label: 'Formato Artículo', category: 'EDITORIAL', icon: '📰', description: 'Reescribe como post de blog con títulos H2/H3.' },
  { id: 'extract_quotes', label: 'Extraer Citas', category: 'EDITORIAL', icon: '💬', description: 'Lista de frases memorables o "pull quotes".' },
  { id: 'format_interview', label: 'Entrevista Q&A', category: 'EDITORIAL', icon: '🎤', description: 'Formato periodístico Pregunta-Respuesta.' },
  { id: 'tone_journalistic', label: 'Tono Periodístico', category: 'EDITORIAL', icon: '🗞️', description: 'Ajusta el tono a tercera persona objetiva.' },
  { id: 'fix_grammar', label: 'Corrector Pro', category: 'EDITORIAL', icon: '✍️', description: 'Corrección gramatical y de estilo estricta.' },

  // Análisis
  { id: 'summary_exec', label: 'Resumen Ejecutivo', category: 'ANALISIS', icon: '📊', description: 'Síntesis de alto nivel para directivos.' },
  { id: 'summary_bullets', label: 'Bullet Points', category: 'ANALISIS', icon: '•', description: 'Lista de puntos clave.' },
  { id: 'detect_topics', label: 'Detectar Temas', category: 'ANALISIS', icon: '🏷️', description: 'Extracción de tópicos y keywords.' },

  // Salida
  { id: 'out_email', label: 'Email Newsletter', category: 'SALIDA', icon: '📧', description: 'Formato listo para enviar por correo.' },
];

const getCategoryColor = (category: string) => {
    switch(category) {
        case 'PROCESAMIENTO': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'EDITORIAL': return 'bg-pink-50 text-pink-700 border-pink-200';
        case 'ANALISIS': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'SALIDA': return 'bg-gray-800 text-white border-gray-600';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const getPathToNode = (nodes: WorkflowNode[], targetUuid: string): WorkflowNode[] | null => {
    for (const node of nodes) {
        if (node.uuid === targetUuid) {
            return [node];
        }
        if (node.children.length > 0) {
            const path = getPathToNode(node.children, targetUuid);
            if (path) {
                return [node, ...path];
            }
        }
    }
    return null;
};

interface WorkflowNodeRendererProps {
  node: WorkflowNode;
  selectedNodeUuid: string | null;
  onNodeClick: (e: React.MouseEvent, uuid: string) => void;
  onRemoveNode: (e: React.MouseEvent, uuid: string) => void;
}

const WorkflowNodeRenderer: React.FC<WorkflowNodeRendererProps> = ({ node, selectedNodeUuid, onNodeClick, onRemoveNode }) => {
  const isSelected = selectedNodeUuid === node.uuid;
  
  return (
    <div className="flex flex-col items-center">
      <div 
          onClick={(e) => onNodeClick(e, node.uuid)}
          className={`
              relative flex items-center gap-3 px-4 py-3 rounded-2xl border-2 shadow-sm cursor-pointer transition-all z-10 min-w-[220px] group
              ${isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100 transform scale-105' 
                  : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-md'
              }
          `}
      >
          {/* Connector Top */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-300"></div>
          
          <div className={`w-1.5 h-full absolute left-0 top-0 bottom-0 rounded-l-xl ${getCategoryColor(node.action.category).split(' ')[0]}`}></div>
          
          <div className="flex-1 overflow-hidden">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">{node.action.category}</span>
              <div className="flex items-center gap-2">
                  <span className="text-xl">{node.action.icon}</span>
                  <div className="flex flex-col">
                      <span className={`text-sm font-bold truncate ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                          {node.action.label}
                      </span>
                  </div>
              </div>
          </div>

          {/* Output Indicator Badge */}
          {node.isOutput && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-md z-20" title="Genera un archivo de salida">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              </div>
          )}

          <button 
              onClick={(e) => onRemoveNode(e, node.uuid)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-all absolute top-1 right-1"
          >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
      </div>

      {node.children.length > 0 && (
          <div className="flex flex-col items-center mt-6">
               <div className="w-0.5 h-6 bg-gray-300"></div>
               <div className="relative flex gap-8 pt-0">
                   {node.children.length > 1 && (
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 border-t-2 border-l-2 border-r-2 border-gray-300 rounded-t-lg" style={{ width: `calc(100% - 220px)` }}></div>
                   )}
                   {node.children.map((child) => (
                       <div key={child.uuid} className="relative flex flex-col items-center">
                           <WorkflowNodeRenderer 
                              node={child} 
                              selectedNodeUuid={selectedNodeUuid}
                              onNodeClick={onNodeClick}
                              onRemoveNode={onRemoveNode}
                           />
                       </div>
                   ))}
               </div>
          </div>
      )}
    </div>
  );
};

const WorkflowManagerModal = ({ isOpen, onClose, onSave }: WorkflowManagerModalProps) => {
  const [workflowName, setWorkflowName] = useState('');
  const [rootNodes, setRootNodes] = useState<WorkflowNode[]>([]);
  const [selectedNodeUuid, setSelectedNodeUuid] = useState<string | null>(null);

  const activePath = useMemo(() => {
      if (!selectedNodeUuid) return [];
      return getPathToNode(rootNodes, selectedNodeUuid) || [];
  }, [selectedNodeUuid, rootNodes]);

  if (!isOpen) return null;

  const generateUuid = () => Math.random().toString(36).substr(2, 9);

  const addNodeToTree = (nodes: WorkflowNode[], parentUuid: string, newAction: WorkflowAction): WorkflowNode[] => {
    return nodes.map(node => {
      if (node.uuid === parentUuid) {
        return {
          ...node,
          children: [...node.children, { uuid: generateUuid(), action: newAction, children: [] }]
        };
      } else if (node.children.length > 0) {
        return {
          ...node,
          children: addNodeToTree(node.children, parentUuid, newAction)
        };
      }
      return node;
    });
  };

  const addAction = (action: WorkflowAction) => {
    if (selectedNodeUuid) {
      const newNodes = addNodeToTree(rootNodes, selectedNodeUuid, action);
      setRootNodes(newNodes);
    } else {
      if (rootNodes.length > 0) {
          alert("Selecciona un nodo existente para conectar, o elimina el inicio para empezar de nuevo.");
          return;
      }
      const newUuid = generateUuid();
      setRootNodes(prev => [...prev, { uuid: newUuid, action, children: [] }]);
      setSelectedNodeUuid(newUuid);
    }
  };

  const deleteNodeFromTree = (nodes: WorkflowNode[], targetUuid: string): WorkflowNode[] => {
    return nodes
      .filter(node => node.uuid !== targetUuid)
      .map(node => ({
        ...node,
        children: deleteNodeFromTree(node.children, targetUuid)
      }));
  };

  const removeNode = (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation();
    if (selectedNodeUuid === uuid) setSelectedNodeUuid(null);
    setRootNodes(prev => deleteNodeFromTree(prev, uuid));
  };

  const handleSave = () => {
    if (!workflowName.trim()) {
        alert("Nombra tu flujo.");
        return;
    }
    if (rootNodes.length === 0) {
        alert("El flujo está vacío.");
        return;
    }
    onSave({ name: workflowName, tree: rootNodes });
    onClose();
  };

  const RenderCategory = ({ title, category }: { title: string, category: string }) => (
      <div className="mb-6">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              {title}
          </h4>
          <div className="grid grid-cols-1 gap-2">
              {AVAILABLE_ACTIONS.filter(a => a.category === category).map(action => (
                  <button 
                    key={action.id} 
                    onClick={() => addAction(action)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 text-left transition-all active:scale-95 group relative bg-white shadow-sm"
                  >
                      <span className="text-xl group-hover:scale-110 transition-transform">{action.icon}</span>
                      <div>
                          <span className="text-xs font-bold text-gray-700 group-hover:text-blue-700 block">
                              {action.label}
                          </span>
                          <span className="text-[10px] text-gray-400 leading-tight">
                              {action.description}
                          </span>
                      </div>
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-blue-400">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                      </div>
                  </button>
              ))}
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-100/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-[95vw] h-[90vh] rounded-[2rem] shadow-2xl border border-white/50 flex flex-col overflow-hidden ring-1 ring-black/5">
            
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4">
                    <div className="bg-black text-white p-3 rounded-2xl shadow-lg shadow-gray-200">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Editor de Flujos</h2>
                        <p className="text-xs text-gray-500 font-medium">Diseña tu pipeline de procesamiento de audio.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <input 
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Nombre del Flujo..."
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-black outline-none w-64 text-center"
                    />
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden bg-[#fafafa]">
                
                {/* 1. Library */}
                <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar p-6">
                    <RenderCategory title="Limpieza & Formato" category="PROCESAMIENTO" />
                    <RenderCategory title="Editorial & Estilo" category="EDITORIAL" />
                    <RenderCategory title="Inteligencia & Datos" category="ANALISIS" />
                    <RenderCategory title="Formatos de Salida" category="SALIDA" />
                </div>

                {/* 2. Canvas */}
                <div 
                    className="flex-1 relative overflow-auto custom-scrollbar flex flex-col items-center pt-20 pb-20"
                    onClick={() => setSelectedNodeUuid(null)}
                    style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                >
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-gray-200 text-xs font-medium text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Entrada: Texto Transcrito (Base)
                    </div>

                    {rootNodes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center opacity-40 mt-20 pointer-events-none">
                            <div className="w-24 h-24 border-3 border-dashed border-gray-300 rounded-[2rem] flex items-center justify-center mb-4">
                                <span className="text-4xl text-gray-300">+</span>
                            </div>
                            <p className="font-bold text-gray-400">Añade el primer paso desde la librería</p>
                        </div>
                    ) : (
                        <div className="flex gap-16">
                            {rootNodes.map(node => (
                                <WorkflowNodeRenderer 
                                    key={node.uuid} 
                                    node={node} 
                                    selectedNodeUuid={selectedNodeUuid}
                                    onNodeClick={(e, id) => { e.stopPropagation(); setSelectedNodeUuid(id); }}
                                    onRemoveNode={removeNode}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. Preview (Right Sidebar) */}
                <div className="w-72 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Secuencia Lógica</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                        {activePath.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center italic mt-10">Selecciona un paso para ver su ruta.</p>
                        ) : (
                            <div className="space-y-0 relative">
                                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                                {activePath.map((node, i) => (
                                    <div key={node.uuid} className="relative pl-8 pb-6 last:pb-0">
                                        <div className="absolute left-[9px] top-1 w-2 h-2 rounded-full bg-black ring-4 ring-white"></div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                            <span className="text-[10px] text-gray-400 font-bold block mb-1">PASO {i + 1}</span>
                                            <div className="flex items-center gap-2">
                                                <span>{node.action.icon}</span>
                                                <span className="text-xs font-bold text-gray-800">{node.action.label}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-6 border-t border-gray-100 bg-white">
                        <button 
                            onClick={handleSave}
                            disabled={rootNodes.length === 0}
                            className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                        >
                            Guardar Flujo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default WorkflowManagerModal;
