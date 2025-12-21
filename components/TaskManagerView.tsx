
import React, { useState, useMemo, useEffect } from 'react';
import { User, Task, Priority, Status, TEAM_MEMBERS, INITIAL_TASKS } from '../services/mockData';

// --- Icons ---

const Icons = {
  List: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  Board: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 00-2-2h-2" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Flag: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8l-6-3-6 3-6-3-6 3z" /></svg>,
  User: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Lock: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Bell: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
};

const TaskManagerView = () => {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<'All' | 'Todo' | 'High' | 'Mine'>('All');
  
  // Simulation State
  const [currentUser, setCurrentUser] = useState<User>(TEAM_MEMBERS[0]); // Default to Admin

  // New Task State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>(currentUser.id);
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('2023-10-15');
  const [newTaskReminder, setNewTaskReminder] = useState<string>('');

  // --- Logic ---

  // Request Notification Permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log("Notificaciones permitidas para recordatorios de tareas.");
        }
      });
    }
  }, []);

  const getFilteredTasks = () => {
    let filtered = tasks;
    if (filter === 'Todo') filtered = tasks.filter(t => t.status !== 'Done');
    else if (filter === 'High') filtered = tasks.filter(t => t.priority === 'High');
    else if (filter === 'Mine') filtered = tasks.filter(t => t.assigneeId === currentUser.id);
    return filtered;
  };

  const hasPermission = (action: 'delete' | 'edit', task?: Task) => {
      if (currentUser.role === 'Admin') return true;
      if (action === 'edit' && task && task.assigneeId === currentUser.id) return true;
      return false;
  };

  const handleDelete = (id: string) => {
    if (!hasPermission('delete')) {
        alert("Solo los administradores pueden eliminar tareas.");
        return;
    }
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: Status) => {
    const task = tasks.find(t => t.id === id);
    if (!hasPermission('edit', task)) {
        // Optional logic
    }
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: 'Todo',
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      tags: [],
      assigneeId: newTaskAssignee,
      reminder: newTaskReminder || undefined
    };
    setTasks([...tasks, newTask]);
    
    // Simulate scheduling a notification (In a real app, this would be a background job)
    if (newTaskReminder && 'Notification' in window && Notification.permission === 'granted') {
       // Just a visual confirmation for the user
       setTimeout(() => {
           new Notification(`Recordatorio Configurado: ${newTask.title}`, {
               body: `Te avisaremos ${newTaskReminder} antes de la fecha límite.`
           });
       }, 500);
    }

    // Sync with Calendar
    if (newTaskDueDate) {
        window.dispatchEvent(new CustomEvent('presup:sync-event', {
            detail: {
                id: newTask.id,
                title: newTask.title,
                date: newTask.dueDate,
                type: 'task',
                status: 'todo'
            }
        }));
    }

    setIsModalOpen(false);
    setNewTaskTitle('');
    setNewTaskReminder('');
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'Medium': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const getUserById = (id: string | null) => TEAM_MEMBERS.find(u => u.id === id);

  // --- Views ---

  const renderAssignee = (assigneeId: string | null) => {
      const user = getUserById(assigneeId);
      if (!user) return <span className="text-gray-300 text-xs">Sin asignar</span>;
      return (
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 pr-2 rounded-full border border-gray-100 dark:border-gray-700">
              <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" />
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 truncate max-w-[60px]">{user.name.split(' ')[0]}</span>
          </div>
      );
  };

  const renderListView = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {getFilteredTasks().length === 0 ? (
            <div className="p-12 text-center text-gray-400">
                <p>No hay tareas que coincidan con este filtro.</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {getFilteredTasks().map(task => (
                <div key={task.id} className="group flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                
                {/* Checkbox / Status Toggle */}
                <button 
                    onClick={() => handleStatusChange(task.id, task.status === 'Done' ? 'Todo' : 'Done')}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all flex-shrink-0 ${task.status === 'Done' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600 text-transparent hover:border-green-500'}`}
                >
                    <Icons.Check />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 mr-4">
                    <h3 className={`text-sm font-semibold truncate ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                    {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                        {task.dueDate && (
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                <Icons.Clock /> {task.dueDate}
                            </span>
                        )}
                        {task.reminder && (
                            <span className="flex items-center gap-1 text-[11px] text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded" title={`Recordatorio: ${task.reminder} antes`}>
                                <Icons.Bell /> {task.reminder}
                            </span>
                        )}
                        {task.tags.map(tag => (
                            <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Assignee */}
                <div className="flex-shrink-0 mr-4">
                    {renderAssignee(task.assigneeId)}
                </div>

                {/* Actions */}
                <div className="w-8 flex-shrink-0">
                    {hasPermission('delete') && (
                        <button 
                            onClick={() => handleDelete(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                            title="Eliminar (Solo Admins)"
                        >
                            <Icons.Trash />
                        </button>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );

  const renderBoardColumn = (title: string, status: Status, color: string) => {
      const columnTasks = tasks.filter(t => t.status === status);
      
      return (
        <div className="flex-1 min-w-[300px] bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex flex-col h-full border border-transparent dark:border-gray-800">
            <div className={`flex items-center justify-between mb-3 px-1 pb-2 border-b-2 ${color}`}>
                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{title}</h3>
                <span className="text-xs font-bold bg-white dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full shadow-sm">{columnTasks.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {columnTasks.map(task => (
                    <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {status !== 'Todo' && <button onClick={() => handleStatusChange(task.id, 'Todo')} className="w-2 h-2 rounded-full bg-gray-300 hover:bg-blue-500" title="Move to Todo"></button>}
                                {status !== 'InProgress' && <button onClick={() => handleStatusChange(task.id, 'InProgress')} className="w-2 h-2 rounded-full bg-gray-300 hover:bg-yellow-500" title="Move to In Progress"></button>}
                                {status !== 'Done' && <button onClick={() => handleStatusChange(task.id, 'Done')} className="w-2 h-2 rounded-full bg-gray-300 hover:bg-green-500" title="Move to Done"></button>}
                            </div>
                        </div>
                        
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 leading-snug">{task.title}</h4>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
                             {renderAssignee(task.assigneeId)}
                             
                             <div className="flex items-center text-[10px] text-gray-400 gap-2">
                                {task.reminder && <span className="text-yellow-500" title="Recordatorio activo"><Icons.Bell /></span>}
                                <span className="flex items-center gap-1"><Icons.Clock /> {task.dueDate}</span>
                                {hasPermission('delete') && (
                                    <button onClick={() => handleDelete(task.id)} className="text-gray-300 hover:text-red-500"><Icons.Trash /></button>
                                )}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      );
  };

  const renderBoardView = () => (
      <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-6 h-full min-w-max">
              {renderBoardColumn('Por Hacer', 'Todo', 'border-gray-300')}
              {renderBoardColumn('En Progreso', 'InProgress', 'border-yellow-400')}
              {renderBoardColumn('Completado', 'Done', 'border-green-500')}
          </div>
      </div>
  );

  return (
    <div className="flex-1 h-screen bg-[#fafafa] dark:bg-gray-950 flex flex-col overflow-hidden relative">
        
        {/* Simulation / User Switcher Bar */}
        <div className="bg-blue-600 text-white px-4 py-1 text-xs flex justify-between items-center z-20">
            <span className="font-bold opacity-80 uppercase tracking-wider">Modo Simulación de Equipo</span>
            <div className="flex items-center gap-2">
                <span className="opacity-70">Viendo como:</span>
                <select 
                    value={currentUser.id}
                    onChange={(e) => {
                        const user = TEAM_MEMBERS.find(u => u.id === e.target.value);
                        if(user) setCurrentUser(user);
                    }}
                    className="bg-blue-700 border-none text-white text-xs rounded px-2 py-0.5 focus:ring-0 cursor-pointer font-bold"
                >
                    {TEAM_MEMBERS.map(u => (
                        <option key={u.id} value={u.id}>
                            {u.name} {u.role === 'Admin' ? '(Admin)' : ''}
                        </option>
                    ))}
                </select>
                {currentUser.role === 'Admin' && <Icons.Lock />}
            </div>
        </div>

        {/* New Task Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl p-6 m-4 animate-in zoom-in-95">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nueva Tarea</h2>
                    <input 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="¿Qué necesitas hacer?"
                        className="w-full mb-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                        autoFocus
                    />
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Priority Selector */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Prioridad</label>
                            <div className="flex flex-col gap-2">
                                {['High', 'Medium', 'Low'].map((p) => (
                                    <button 
                                        key={p} 
                                        onClick={() => setNewTaskPriority(p as Priority)}
                                        className={`py-2 px-3 text-xs font-bold rounded-lg border text-left transition-all ${newTaskPriority === p ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Assignee, Date & Reminder */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha</label>
                                <input 
                                    type="date"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Recordatorio</label>
                                <div className="relative">
                                    <select 
                                        value={newTaskReminder} 
                                        onChange={(e) => setNewTaskReminder(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm appearance-none"
                                    >
                                        <option value="">Sin recordatorio</option>
                                        <option value="15m">15 minutos antes</option>
                                        <option value="1h">1 hora antes</option>
                                        <option value="24h">1 día antes</option>
                                    </select>
                                    <div className="absolute right-2 top-2.5 pointer-events-none text-gray-400">
                                        <Icons.Bell />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Asignar a</label>
                                <div className="flex flex-col gap-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                                    {TEAM_MEMBERS.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => setNewTaskAssignee(user.id)}
                                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${newTaskAssignee === user.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                        >
                                            <img src={user.avatar} className="w-5 h-5 rounded-full" alt="" />
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium">Cancelar</button>
                        <button onClick={handleAddTask} className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-bold shadow-lg hover:opacity-90">Crear Tarea</button>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="px-8 py-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center z-10 flex-shrink-0">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestor de Tareas</h1>
                <div className="flex items-center gap-4 mt-1">
                    <button onClick={() => setFilter('All')} className={`text-xs font-bold ${filter === 'All' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>Todas</button>
                    <button onClick={() => setFilter('Mine')} className={`text-xs font-bold ${filter === 'Mine' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}>Mis Tareas</button>
                    <button onClick={() => setFilter('Todo')} className={`text-xs font-bold ${filter === 'Todo' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>Pendientes</button>
                    <button onClick={() => setFilter('High')} className={`text-xs font-bold ${filter === 'High' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>Alta Prioridad</button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Icons.List />
                    </button>
                    <button 
                        onClick={() => setViewMode('board')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white dark:bg-gray-600 shadow-sm text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Icons.Board />
                    </button>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold shadow hover:opacity-90 transition-all"
                >
                    <Icons.Plus /> Nueva Tarea
                </button>
            </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? renderListView() : renderBoardView()}

    </div>
  );
};

export default TaskManagerView;
