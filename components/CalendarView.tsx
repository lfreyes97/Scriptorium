import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PROJECT_LIST, MOCK_DB, INITIAL_TASKS } from '../services/mockData';

type ViewType = 'timeline' | 'list';

const CalendarView = () => {
  const [currentView, setCurrentView] = useState<ViewType>('timeline');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Configuration for the Timeline
  const START_DATE = new Date('2026-01-01');
  const END_DATE = new Date('2026-12-31');
  const TOTAL_DAYS = 365;
  const PIXELS_PER_DAY = 3; // Adjust for density
  const TIMELINE_WIDTH = TOTAL_DAYS * PIXELS_PER_DAY; // ~1095px

  // Helper: Calculate position and width based on dates
  const getPosition = (start: string, end: string) => {
      const s = new Date(start);
      const e = new Date(end);
      
      const diffStart = Math.max(0, Math.ceil((s.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)));
      const duration = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      return {
          left: `${diffStart * PIXELS_PER_DAY}px`,
          width: `${duration * PIXELS_PER_DAY}px`
      };
  };

  const getMonthMarkers = () => {
      const months = [];
      const d = new Date(START_DATE);
      for(let i = 0; i < 12; i++) {
          d.setMonth(i);
          months.push({
              name: d.toLocaleString('es-ES', { month: 'short' }),
              longName: d.toLocaleString('es-ES', { month: 'long' }),
              days: new Date(2026, i + 1, 0).getDate()
          });
      }
      return months;
  };

  const monthMarkers = useMemo(() => getMonthMarkers(), []);

  // --- Render Components ---

  const renderTimelineHeader = () => (
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          {/* Quarters Row */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
              <div className="w-64 flex-shrink-0 border-r border-gray-200 p-2 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white z-20 sticky left-0">
                  Proyectos 2026
              </div>
              <div className="flex relative" style={{ width: TIMELINE_WIDTH }}>
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
                      <div key={q} className="flex-1 text-center text-[10px] font-bold text-gray-400 py-1 border-r border-gray-200 last:border-0 bg-gray-50">
                          {q}
                      </div>
                  ))}
              </div>
          </div>
          
          {/* Months Row */}
          <div className="flex">
              <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white sticky left-0 z-20"></div>
              <div className="flex relative h-8" style={{ width: TIMELINE_WIDTH }}>
                  {monthMarkers.map((m, i) => (
                      <div 
                        key={i} 
                        className="flex-shrink-0 border-r border-gray-100 text-[10px] uppercase font-bold text-gray-500 flex items-center justify-center"
                        style={{ width: `${m.days * PIXELS_PER_DAY}px` }}
                      >
                          {m.name}
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderTimelineRows = () => (
      <div className="relative">
          {/* Grid Background Lines */}
          <div className="absolute inset-0 flex pointer-events-none z-0 ml-64" style={{ width: TIMELINE_WIDTH }}>
               {monthMarkers.map((m, i) => (
                  <div key={i} className="flex-shrink-0 border-r border-gray-50 h-full" style={{ width: `${m.days * PIXELS_PER_DAY}px` }}></div>
               ))}
               {/* Today Marker (Simulated Feb 15) */}
               <div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10" style={{ left: `${45 * PIXELS_PER_DAY}px` }}>
                   <div className="bg-red-500 text-white text-[9px] px-1 py-0.5 rounded absolute -top-2 -left-3">HOY</div>
               </div>
          </div>

          {/* Project Rows */}
          {PROJECT_LIST.map((project) => {
              const items = MOCK_DB[project.id] || [];
              
              return (
                  <div key={project.id} className="flex border-b border-gray-100 hover:bg-gray-50/30 transition-colors group">
                      {/* Sidebar Label */}
                      <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200 bg-white sticky left-0 z-10 flex flex-col justify-center">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{project.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${project.category.includes('Q1') ? 'bg-green-100 text-green-700' : project.category.includes('Q2') ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {project.category}
                              </span>
                              <span className="text-[10px] text-gray-400">{project.progress}%</span>
                          </div>
                      </div>

                      {/* Timeline Items Area */}
                      <div className="relative h-20" style={{ width: TIMELINE_WIDTH }}>
                          {items.map(item => {
                              const pos = getPosition(item.startDate, item.endDate);
                              const isMilestone = item.type === 'milestone';
                              
                              return (
                                  <div 
                                    key={item.id}
                                    className={`absolute top-1/2 -translate-y-1/2 rounded-md shadow-sm border text-[10px] font-bold px-2 py-1 truncate cursor-pointer hover:z-20 hover:scale-105 transition-all
                                        ${isMilestone 
                                            ? 'bg-yellow-400 text-yellow-900 border-yellow-500 rotate-45 w-6 h-6 flex items-center justify-center !p-0' 
                                            : item.status === 'done' 
                                                ? 'bg-gray-200 text-gray-500 border-gray-300' 
                                                : 'bg-blue-600 text-white border-blue-700'
                                        }
                                    `}
                                    style={{ 
                                        left: pos.left, 
                                        width: isMilestone ? '24px' : pos.width,
                                        marginLeft: isMilestone ? '-12px' : '0' 
                                    }}
                                    title={`${item.title} (${item.subtitle})`}
                                  >
                                      {isMilestone ? (
                                          <div className="-rotate-45">★</div>
                                      ) : (
                                          item.title
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              );
          })}

          {/* Operational/Tasks Row */}
          <div className="flex border-b border-gray-100 bg-gray-50/20">
              <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200 bg-white sticky left-0 z-10 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-gray-700">Operativo & Tareas</h3>
                  <p className="text-[10px] text-gray-400">Mantenimiento recurrente</p>
              </div>
              <div className="relative h-16" style={{ width: TIMELINE_WIDTH }}>
                  {INITIAL_TASKS.map(task => {
                      if (!task.dueDate) return null;
                      const pos = getPosition(task.dueDate, task.dueDate); // Single day
                      return (
                          <div 
                            key={task.id}
                            className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-400 rounded-full hover:w-32 hover:z-30 hover:bg-orange-500 transition-all group/task"
                            style={{ left: pos.left }}
                          >
                              <div className="hidden group-hover/task:block absolute bottom-full left-0 mb-1 bg-black text-white text-[10px] p-2 rounded w-48 z-40">
                                  {task.title}
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>
      </div>
  );

  const renderListView = () => {
      // Flatten all items
      const allItems = [
          ...PROJECT_LIST.flatMap(p => (MOCK_DB[p.id] || []).map(i => ({ ...i, projectName: p.title }))),
          ...INITIAL_TASKS.map(t => ({ 
              id: t.id, 
              title: t.title, 
              startDate: t.dueDate || '', 
              endDate: t.dueDate || '', 
              type: 'task', 
              projectName: 'Operativo',
              status: t.status 
          }))
      ].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      return (
          <div className="max-w-4xl mx-auto p-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-700">Agenda Completa 2026</h3>
                      <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{allItems.length} Items</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                      {allItems.map((item, idx) => (
                          <div key={`${item.id}-${idx}`} className="p-4 hover:bg-gray-50 flex items-center gap-4 transition-colors">
                              <div className="w-16 text-center">
                                  <div className="text-xs font-bold text-gray-400 uppercase">{new Date(item.startDate).toLocaleString('es-ES', { month: 'short' })}</div>
                                  <div className="text-lg font-bold text-gray-900">{new Date(item.startDate).getDate()}</div>
                              </div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                                  <p className="text-xs text-gray-500">{item.projectName}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                  item.type === 'milestone' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                  item.type === 'project' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-gray-50 text-gray-600 border-gray-200'
                              }`}>
                                  {item.type}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex-1 h-screen bg-[#fafafa] flex flex-col overflow-hidden relative">
        
        {/* Header Controls */}
        <div className="px-8 py-4 bg-white border-b border-gray-200 flex justify-between items-center flex-shrink-0 z-30">
            <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Calendario Estratégico 
                    <span className="bg-black text-white px-2 py-0.5 rounded text-xs">2026</span>
                </h1>
                <p className="text-xs text-gray-500">Roadmap anual unificado</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button 
                        onClick={() => setCurrentView('timeline')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currentView === 'timeline' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Cronograma (Gantt)
                    </button>
                    <button 
                        onClick={() => setCurrentView('list')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currentView === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Lista
                    </button>
                </div>
            </div>
        </div>

        {/* View Body */}
        {currentView === 'timeline' ? (
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white" ref={scrollContainerRef}>
                <div className="min-w-max pb-20">
                    {renderTimelineHeader()}
                    {renderTimelineRows()}
                </div>
            </div>
        ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {renderListView()}
            </div>
        )}
    </div>
  );
};

export default CalendarView;