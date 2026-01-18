
import React, { useMemo } from 'react';
import { Topic } from '../types';
import { ArrowLeft, Clock, CheckCircle2, ListChecks, Calendar, Sparkles } from 'lucide-react';

interface FilteredCollectionProps {
  topics: Topic[];
  filter: 'due' | 'mastered' | 'all';
  onBack: () => void;
  onSelectTopic: (id: string) => void;
}

export const FilteredCollection: React.FC<FilteredCollectionProps> = ({ topics, filter, onBack, onSelectTopic }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredData = useMemo(() => {
    if (filter === 'due') {
      return topics.filter(t => t.revisions.some(r => !r.completedAt && new Date(r.dueDate).toDateString() === today.toDateString()));
    }
    if (filter === 'mastered') {
      return topics.filter(t => t.revisions.every(r => r.completedAt));
    }
    return topics;
  }, [topics, filter]);

  const nextReviewGlobal = useMemo(() => {
    const futureReviews = topics.flatMap(t => 
      t.revisions.filter(r => !r.completedAt)
        .map(r => new Date(r.dueDate).getTime())
    ).filter(d => d > Date.now());

    if (futureReviews.length === 0) return null;
    const earliest = Math.min(...futureReviews);
    const diff = earliest - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [topics]);

  const getTitle = () => {
    if (filter === 'due') return 'Revision Schedule';
    if (filter === 'mastered') return 'Mastery Archive';
    return 'Full Curriculum';
  };

  const getIcon = () => {
    if (filter === 'due') return <Clock className="text-amber-500" size={32} />;
    if (filter === 'mastered') return <CheckCircle2 className="text-emerald-500" size={32} />;
    return <ListChecks className="text-indigo-600" size={32} />;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-700">
          {getIcon()}
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{getTitle()}</h1>
          <p className="text-slate-500 font-medium mt-1">
            {filter === 'due' && filteredData.length === 0 
              ? `You're all caught up! Next review in ${nextReviewGlobal} days.`
              : `${filteredData.length} Subjects in this list.`}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-10">
        {filteredData.length === 0 ? (
          <div className="py-24 text-center space-y-6">
             <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Sparkles size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Nothing to show here</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                {filter === 'due' 
                  ? "Enjoy your break! No revisions are due at this moment. We'll alert you when the next one is ready." 
                  : "Start completing your revision steps to see subjects appear here."}
              </p>
            </div>
            {filter === 'due' && nextReviewGlobal !== null && (
               <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-2xl font-black uppercase text-xs tracking-widest">
                  <Calendar size={16} />
                  Next Review in {nextReviewGlobal} days
               </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredData.map(topic => {
              const completed = topic.revisions.filter(r => r.completedAt).length;
              const total = topic.revisions.length;
              const progress = Math.round((completed / total) * 100);
              
              return (
                <div 
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.id)}
                  className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-indigo-500 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate pr-4">
                      {topic.name}
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {completed}/{total} Complete
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                      <span className={progress === 100 ? 'text-emerald-500' : 'text-slate-500'}>
                        {progress === 100 ? 'Mastered' : `${total - completed} steps remaining`}
                      </span>
                      <span className="text-slate-900 dark:text-white">{progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
