
import React, { useState, useEffect } from 'react';
import { SidebarTab } from '../types';

interface CommandMenuProps {
  activeTab: SidebarTab;
  onNavigate: (tab: SidebarTab) => void;
  onThemeToggle: () => void;
  onNewChat: () => void;
}

interface Command {
  id: string;
  label: string;
  group: string;
  action: () => void;
  icon?: React.ReactNode;
}

const CommandMenu = ({ activeTab, onNavigate, onThemeToggle, onNewChat }: CommandMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands: Command[] = [
    { id: 'nav-dash', label: 'Ir al Tablero', group: 'Navegación', action: () => onNavigate(SidebarTab.Dashboard), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { id: 'nav-proj', label: 'Gestor de Proyectos', group: 'Navegación', action: () => onNavigate(SidebarTab.ProjectManager), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { id: 'nav-flow', label: 'Workflow Studio', group: 'Navegación', action: () => onNavigate(SidebarTab.WorkflowStudio), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { id: 'nav-notes', label: 'Notas Rápidas', group: 'Navegación', action: () => onNavigate(SidebarTab.Notes), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'nav-edit', label: 'Lector de Libros', group: 'Navegación', action: () => onNavigate(SidebarTab.Reader), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { id: 'act-new', label: 'Nueva Sesión de Trabajo', group: 'Acciones', action: onNewChat, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> },
    { id: 'act-theme', label: 'Modo Oscuro/Claro', group: 'Acciones', action: onThemeToggle, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) || 
    cmd.group.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="¿Qué necesitas buscar en el Scriptorium?" className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none" />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No hay resultados.</div>
          ) : (
            ['Navegación', 'Acciones'].map(group => {
              const groupCommands = filteredCommands.filter(c => c.group === group);
              if (groupCommands.length === 0) return null;
              return (
                <div key={group} className="mb-2">
                  <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{group}</div>
                  {groupCommands.map(cmd => (
                    <button key={cmd.id} onClick={() => { cmd.action(); setIsOpen(false); setSearch(''); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                      <div className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">{cmd.icon}</div>
                      {cmd.label}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <span>Scriptorium Command Protocol (Cmd+K)</span>
            <span>v2.5</span>
        </div>
      </div>
    </div>
  );
};

export default CommandMenu;
