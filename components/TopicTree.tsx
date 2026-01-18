
import React, { useState } from 'react';
import { Topic } from '../types';
import { ChevronRight, ChevronDown, Plus, MoreHorizontal } from 'lucide-react';

interface TopicTreeProps {
  topic: Topic & { subTopics: Topic[] };
  onSelect: (id: string) => void;
  onAddChild: (id: string) => void;
  level?: number;
}

export const TopicTree: React.FC<TopicTreeProps> = ({ topic, onSelect, onAddChild, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = topic.subTopics && topic.subTopics.length > 0;
  
  const completedRevisions = topic.revisions.filter(r => r.completedAt).length;
  const totalRevisions = topic.revisions.length;
  const progress = totalRevisions > 0 ? (completedRevisions / totalRevisions) * 100 : 0;

  return (
    <div className="group select-none">
      <div 
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
          {hasChildren ? (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          )}
        </div>
        
        <div 
          onClick={() => onSelect(topic.id)} 
          className="flex-1 flex items-center justify-between min-w-0"
        >
          <span className="font-medium truncate">{topic.name}</span>
          
          <div className="hidden md:flex items-center gap-4 flex-shrink-0 px-4">
            <div className="flex items-center gap-2 w-32">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 w-8">{Math.round(progress)}%</span>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onAddChild(topic.id); }}
                className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 rounded-md transition-all"
                title="Add Sub-topic"
              >
                <Plus size={14} />
              </button>
              <button 
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-md transition-all"
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="animate-in slide-in-from-top-1 duration-200">
          {topic.subTopics.map(sub => (
            <TopicTree 
              key={sub.id} 
              topic={sub as any} 
              onSelect={onSelect} 
              onAddChild={onAddChild} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
