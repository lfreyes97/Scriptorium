import React from 'react';
import { GuideCardProps } from '../types';

interface FeaturedGuidesProps {
  onGuideClick: (prompt: string) => void;
}

const GuideCard = ({ title, subtitle, tag, tagColor, image, onClick }: GuideCardProps & { onClick: () => void }) => (
  <div onClick={onClick} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer h-64 flex flex-col">
    {/* Image Section */}
    <div className="h-40 overflow-hidden relative">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1.5 rounded-full backdrop-blur-sm">
        <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </div>
    
    {/* Content Section */}
    <div className="p-4 flex flex-col justify-between flex-1">
        <div>
            <p className="text-xs text-gray-500 font-medium mb-1">{subtitle}</p>
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColor}`}>
                    {tag}
                </span>
            </div>
        </div>
    </div>
  </div>
);

const FeaturedGuides = ({ onGuideClick }: FeaturedGuidesProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GuideCard 
            image="https://picsum.photos/id/102/400/250" 
            subtitle="Your Image with" 
            title="PRESUP.AI" 
            tag="Upscaling" 
            tagColor="bg-pink-100 text-pink-600"
            onClick={() => onGuideClick("How do I upscale images using Presup.AI while maintaining quality?")}
        />
        <GuideCard 
            image="https://picsum.photos/id/338/400/250" 
            subtitle="Consistent" 
            title="CHARACTERS" 
            tag="Creating" 
            tagColor="bg-green-100 text-green-600"
            onClick={() => onGuideClick("What are the best techniques for generating consistent characters across multiple images?")}
        />
        <GuideCard 
            image="https://picsum.photos/id/435/400/250" 
            subtitle="Style" 
            title="REFERENCE" 
            tag="How to use" 
            tagColor="bg-blue-100 text-blue-600"
            onClick={() => onGuideClick("Explain how to use style references effectively in my prompts.")}
        />
        <GuideCard 
            image="https://picsum.photos/id/250/400/250" 
            subtitle="Content" 
            title="REFERENCE" 
            tag="Using" 
            tagColor="bg-yellow-100 text-yellow-600"
            onClick={() => onGuideClick("What is a content reference and how does it differ from a style reference?")}
        />
      </div>
    </div>
  );
};

export default FeaturedGuides;