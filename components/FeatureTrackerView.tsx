
import React, { useState, useEffect, useMemo } from 'react';
import { Feature, FeatureStatus, FeatureSchema, FeatureType, FeaturePriority } from '../types';
import { featureService } from '../services/featureService';

// --- Sub-component: Feature Editor Modal ---

interface FeatureEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (feature: Feature) => void;
    initialData?: Feature | null;
}

const FeatureEditorModal = ({ isOpen, onClose, onSave, initialData }: FeatureEditorProps) => {
    const [formData, setFormData] = useState<Partial<Feature>>({
        id: `feat-${Date.now()}`,
        title: '',
        type: 'Feature',
        status: 'Backlog',
        priority: 'Medium',
        points: 1,
        tag: 'General',
        tagColor: 'bg-gray-100 text-gray-700',
        description: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                id: `feat-${Date.now()}`,
                title: '',
                type: 'Feature',
                status: 'Backlog',
                priority: 'Medium',
                points: 1,
                tag: 'General',
                tagColor: 'bg-gray-100 text-gray-700',
                description: ''
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        const result = FeatureSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach(err => {
                if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }
        onSave(result.data);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white font-serif">
                        {initialData ? 'Editar Requerimiento' : 'Nuevo Requerimiento'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Title */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Título de la Función</label>
                        <input 
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className={`w-full bg-gray-50 dark:bg-gray-800 border ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none`}
                            placeholder="Ej: Implementar Autenticación JWT"
                        />
                        {errors.title && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo</label>
                            <select 
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value as FeatureType})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none"
                            >
                                <option value="Epic">Epic</option>
                                <option value="Feature">Feature</option>
                                <option value="Task">Task</option>
                            </select>
                        </div>
                        {/* Status */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Estado</label>
                            <select 
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as FeatureStatus})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none"
                            >
                                <option value="Backlog">Backlog</option>
                                <option value="InProgress">In Progress</option>
                                <option value="Review">Review</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Priority */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Prioridad</label>
                            <select 
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value as FeaturePriority})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none"
                            >
                                <option value="High">Alta</option>
                                <option value="Medium">Media</option>
                                <option value="Low">Baja</option>
                            </select>
                        </div>
                        {/* Points */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Esfuerzo (Puntos)</label>
                            <input 
                                type="number"
                                value={formData.points}
                                onChange={e => setFormData({...formData, points: parseInt(e.target.value) || 0})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Tag */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Etiqueta</label>
                            <input 
                                value={formData.tag}
                                onChange={e => setFormData({...formData, tag: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none"
                                placeholder="UI, Backend, Dev, etc."
                            />
                        </div>
                        {/* Tag Color Sim (Simplified) */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Color Tag</label>
                            <select 
                                value={formData.tagColor}
                                onChange={e => setFormData({...formData, tagColor: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none"
                            >
                                <option value="bg-gray-100 text-gray-700">Gris</option>
                                <option value="bg-blue-100 text-blue-700">Azul</option>
                                <option value="bg-purple-100 text-purple-700">Púrpura</option>
                                <option value="bg-orange-100 text-orange-700">Naranja</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Descripción (Markdown)</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm h-24 resize-none outline-none focus:ring-1 focus:ring-black"
                            placeholder="Detalles técnicos..."
                        />
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg hover:opacity-90 transition-all"
                    >
                        Validar y Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main View Component ---

const FeatureTrackerView = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  // Carga inicial
  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setIsLoading(true);
    const data = await featureService.getAll();
    setFeatures(data);
    setIsLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: FeatureStatus) => {
    const feature = features.find(f => f.id === id);
    if (!feature) return;

    const updated = { ...feature, status: newStatus, updatedAt: new Date().toISOString() };
    setFeatures(prev => prev.map(f => f.id === id ? updated : f));
    await featureService.save(updated);
  };

  const handleSaveFeature = async (validatedFeature: Feature) => {
      const exists = features.find(f => f.id === validatedFeature.id);
      if (exists) {
          setFeatures(features.map(f => f.id === validatedFeature.id ? validatedFeature : f));
      } else {
          setFeatures([validatedFeature, ...features]);
      }
      await featureService.save(validatedFeature);
      setIsEditorOpen(false);
      setEditingFeature(null);
  };

  const handleOpenEditor = (feature?: Feature) => {
      setEditingFeature(feature || null);
      setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
      if (!confirm('¿Eliminar esta funcionalidad del rastro?')) return;
      setFeatures(features.filter(f => f.id !== id));
      await featureService.delete(id);
  };

  const renderBoard = () => {
      const columns: FeatureStatus[] = ['Backlog', 'InProgress', 'Review', 'Done'];
      return (
          <div className="flex gap-6 overflow-x-auto pb-4 h-full">
              {columns.map(col => (
                  <div key={col} className="w-80 flex-shrink-0 flex flex-col bg-gray-50/50 dark:bg-gray-900 rounded-2xl p-3 border border-transparent dark:border-gray-800">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2 flex justify-between">
                          {col}
                          <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm">{features.filter(f => f.status === col).length}</span>
                      </h3>
                      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
                          {features.filter(f => f.status === col).map(f => (
                              <div 
                                key={f.id} 
                                onClick={() => handleOpenEditor(f)}
                                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                              >
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="flex gap-1">
                                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${f.tagColor}`}>{f.tag}</span>
                                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 uppercase tracking-tighter">{f.type}</span>
                                      </div>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }} 
                                              className="p-1 hover:bg-red-50 text-red-400 rounded"
                                          >
                                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                          </button>
                                      </div>
                                  </div>
                                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-snug">{f.title}</h4>
                                  <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center text-[10px] font-mono text-gray-400">
                                      <span className={`font-bold ${f.priority === 'High' ? 'text-red-500' : 'text-gray-400'}`}>
                                          {f.priority}
                                      </span>
                                      <span className="font-bold text-gray-900 dark:text-white">{f.points} PTS</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="flex-1 h-screen bg-white dark:bg-gray-950 flex flex-col overflow-hidden relative">
      
      {/* Editor Modal */}
      <FeatureEditorModal 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveFeature}
        initialData={editingFeature}
      />

      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">Rastro de Funciones</h1>
            <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-widest">Localhost:3000</p>
                </div>
                <span className="text-gray-300 dark:text-gray-700">/</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sprint Q1 2026</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
             <button 
                onClick={() => setShowJsonInspector(!showJsonInspector)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showJsonInspector ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200'}`}
             >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                {showJsonInspector ? 'Cerrar Inspector' : 'Inspeccionar JSON'}
             </button>

             <button 
                onClick={() => handleOpenEditor()}
                className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
             >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nueva Funcionalidad
             </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
          
          {/* Main Workspace */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                      <span className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></span>
                  </div>
              ) : features.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl p-12">
                    <svg className="w-16 h-16 mb-4 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Sin datos en el rastro</h3>
                    <p className="text-[10px] mt-2">Usa el editor para añadir requerimientos validados por Zod.</p>
                </div>
              ) : (
                  renderBoard()
              )}
          </div>

          {/* JSON Inspector Sidebar (Para desarrollo del backend) */}
          {showJsonInspector && (
              <div className="w-[450px] bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/30">
                      <div className="flex flex-col">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Data Inspection (Zod)</h3>
                        <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mt-1">Contract-First Development</span>
                      </div>
                      <button onClick={loadFeatures} className="text-[10px] text-blue-400 hover:underline font-bold uppercase tracking-widest">Sync</button>
                  </div>
                  <div className="flex-1 overflow-auto p-6 font-mono text-[11px] leading-relaxed text-blue-300 custom-scrollbar">
                      <pre className="bg-black/50 p-4 rounded-xl border border-gray-800 shadow-inner">
                          {JSON.stringify(features, null, 2)}
                      </pre>
                      
                      <div className="mt-8 space-y-4">
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800 pb-2">Guía de Desarrollo Backend:</h4>
                          <div className="p-3 bg-gray-800/50 rounded-lg text-[10px] border border-gray-700 group hover:border-blue-500 transition-colors">
                              <span className="text-green-400 font-bold">GET</span> <span className="text-gray-300">/api/features</span>
                              <p className="text-gray-500 mt-1">Endpoint para hidratar el tablero con la lista de objetos validados.</p>
                          </div>
                          <div className="p-3 bg-gray-800/50 rounded-lg text-[10px] border border-gray-700 group hover:border-blue-500 transition-colors">
                              <span className="text-blue-400 font-bold">POST</span> <span className="text-gray-300">/api/features</span>
                              <p className="text-gray-500 mt-1">Recibe el payload validado. Implementa un 'Upsert' basado en el ID.</p>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 bg-black/40 border-t border-gray-800 text-[9px] text-gray-500 font-bold uppercase flex justify-between">
                      <span>Schema v2.5-Stable</span>
                      <span className="text-green-500">Validation: Strict</span>
                  </div>
              </div>
          )}
      </div>

    </div>
  );
};

export default FeatureTrackerView;
