
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

  const todayStr = new Date().toDateString();
  const isDue = topic.revisions.some(r => !r.completedAt && new Date(r.dueDate).toDateString() === todayStr);

  return (
    <div className="group select-none">
      <div 
        className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${level === 0 ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          {hasChildren ? (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div className={`w-2 h-2 rounded-full ${isDue ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
          )}
        </div>
        
        <div 
          onClick={() => onSelect(topic.id)} 
          className="flex-1 flex items-center justify-between min-w-0"
        >
          <div className="flex flex-col min-w-0">
            <span className={`font-bold truncate text-slate-900 dark:text-white ${level === 0 ? 'text-lg' : 'text-base'}`}>
              {topic.name}
            </span>
            {isDue && <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Review Due Today</span>}
          </div>
          
          <div className="hidden md:flex items-center gap-6 flex-shrink-0 px-4">
            <div className="flex items-center gap-3 w-40">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] font-black text-slate-400 w-10 text-right">{Math.round(progress)}%</span>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onAddChild(topic.id); }}
                className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all"
                title="Add Sub-topic"
              >
                <Plus size={18} />
              </button>
              <button 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 rounded-xl transition-all"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
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
