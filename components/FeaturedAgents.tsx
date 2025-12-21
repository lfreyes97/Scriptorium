import React from 'react';
import { GuideCardProps, AgentConfig } from '../types';

interface FeaturedAgentsProps {
  onAgentSelect: (config: AgentConfig) => void;
}

// Design matched to screenshot: Image top, content bottom with specific typography
const AgentCard = ({ title, subtitle, tag, tagColor, image, onClick }: GuideCardProps & { onClick: () => void }) => (
  <div onClick={onClick} className="group flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full">
    {/* Image Section */}
    <div className="h-40 overflow-hidden relative">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
    </div>
    
    {/* Content Section */}
    <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">{subtitle}</p>
            <div className="flex items-center flex-wrap gap-2 mt-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColor}`}>
                    {tag}
                </span>
            </div>
        </div>
    </div>
  </div>
);

const FeaturedAgents = ({ onAgentSelect }: FeaturedAgentsProps) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AgentCard 
            image="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1000&auto=format&fit=crop" 
            subtitle="IDEACIÓN Y ESTRATEGIA" 
            title="LLUVIA DE IDEAS PRO" 
            tag="Innovación" 
            tagColor="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
            onClick={() => onAgentSelect({
                id: 'brainstorm',
                name: 'Lluvia de Ideas Pro',
                type: 'chat',
                initialPrompt: "Actúa como un facilitador creativo diseñado para la lluvia de ideas rápida. Necesito ideas innovadoras y divergentes. Exploremos posibilidades para:"
            })}
        />
        <AgentCard 
            image="https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop" 
            subtitle="SOFTWARE Y LÓGICA" 
            title="ARQUITECTO DEV" 
            tag="Ingeniería" 
            tagColor="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            onClick={() => onAgentSelect({
                id: 'dev',
                name: 'Arquitecto Dev',
                type: 'chat',
                initialPrompt: "Actúa como un Arquitecto de Software Senior. Necesito ayuda para diseñar un sistema escalable. Empecemos con..."
            })}
        />
        <AgentCard 
            image="https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop" 
            subtitle="VISUALES Y UI" 
            title="MENTOR DE DISEÑO" 
            tag="Creativo" 
            tagColor="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            onClick={() => onAgentSelect({
                id: 'design',
                name: 'Mentor de Diseño',
                type: 'chat',
                initialPrompt: "Actúa como un Diseñador Líder UI/UX. Necesito una crítica y mejoras para un concepto de diseño. Aquí están los detalles:"
            })}
        />
        <AgentCard 
            image="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop" 
            subtitle="REDACCIÓN Y CONTENIDO" 
            title="EDITOR PRO" 
            tag="Escritura" 
            tagColor="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            onClick={() => onAgentSelect({
                id: 'editor',
                name: 'Editor Pro',
                type: 'editor'
            })}
        />
      </div>
    </div>
  );
};

export default FeaturedAgents;