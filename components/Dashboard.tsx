
import React, { useState, useMemo } from 'react';
import { TopicTree } from './TopicTree';
import { Topic } from '../types';
import { Plus, Search, BarChart3, Clock, CheckCircle2, GraduationCap, X, LayoutGrid } from 'lucide-react';
import { mockApi } from '../services/api';

interface DashboardProps {
  topics: Topic[];
  onRefresh: () => void;
  onSelectTopic: (id: string) => void;
  onSelectCollection: (filter: 'due' | 'mastered' | 'all') => void;
  loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ topics, onRefresh, onSelectTopic, onSelectCollection, loading }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);

  const parentTopic = useMemo(() => 
    parentId ? topics.find(t => t.id === parentId) : null,
  [parentId, topics]);

  const stats = useMemo(() => {
    const total = topics.length;
    let masteredCount = 0;
    let totalRevisions = 0;
    let doneRevisions = 0;
    let dueTodayCount = 0;
    const todayStr = new Date().toDateString();

    topics.forEach(t => {
      totalRevisions += t.revisions.length;
      const tDone = t.revisions.filter(r => r.completedAt).length;
      doneRevisions += tDone;
      if (t.revisions.some(r => !r.completedAt && new Date(r.dueDate).toDateString() === todayStr)) dueTodayCount++;
      if (tDone === t.revisions.length && t.revisions.length > 0) masteredCount++;
    });

    return {
      total,
      masteredCount,
      overallProgress: totalRevisions > 0 ? Math.round((doneRevisions / totalRevisions) * 100) : 0,
      dueTodayCount
    };
  }, [topics]);

  const topicHierarchy = useMemo(() => {
    const map = new Map<string, Topic & { subTopics: Topic[] }>();
    const filtered = searchTerm 
      ? topics.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : topics;

    filtered.forEach(t => map.set(t.id, { ...t, subTopics: [] }));
    const root: (Topic & { subTopics: Topic[] })[] = [];
    
    map.forEach(t => {
      if (t.parentId && map.has(t.parentId)) {
        map.get(t.parentId)!.subTopics.push(t);
      } else {
        root.push(t);
      }
    });
    return root;
  }, [topics, searchTerm]);

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    try {
      await mockApi.createTopic(newTopicName, parentId);
      setNewTopicName('');
      setIsAddModalOpen(false);
      setParentId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Revision Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Your progress is permanent, keep it growing.</p>
        </div>
        <button 
          onClick={() => { setParentId(null); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 dark:shadow-none"
        >
          <Plus size={20} strokeWidth={3} />
          New Subject
        </button>
      </header>

      {/* Interactive Stats Grid - Clicking these now navigates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => onSelectCollection('all')}
          className="text-left p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group"
        >
          <div className="flex items-center gap-3 mb-6 text-indigo-600 dark:text-indigo-400">
            <BarChart3 size={24} />
            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Overall Progress</span>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform">{stats.overallProgress}%</div>
          <div className="mt-6 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${stats.overallProgress}%` }} />
          </div>
        </button>

        <button 
          onClick={() => onSelectCollection('mastered')}
          className="text-left p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center gap-3 mb-6 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={24} />
            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Mastered</span>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform">{stats.masteredCount}</div>
          <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Click to see Mastery Gap</p>
        </button>

        <button 
          onClick={() => onSelectCollection('due')}
          className="text-left p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center gap-3 mb-6 text-amber-600 dark:text-amber-400">
            <Clock size={24} />
            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Due Today</span>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform">{stats.dueTodayCount}</div>
          <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Click for schedule</p>
        </button>

        <button 
          onClick={() => onSelectCollection('all')}
          className="text-left p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-slate-400 transition-all group"
        >
          <div className="flex items-center gap-3 mb-6 text-slate-600 dark:text-slate-400">
            <GraduationCap size={24} />
            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Total Subjects</span>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform">{stats.total}</div>
          <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">View Curriculum Map</p>
        </button>
      </div>

      {/* Main List Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[1.25rem]">
              <LayoutGrid size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Curriculum Map</h2>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Filter subjects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.75rem] text-sm transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="p-10">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Loading Database...</p>
            </div>
          ) : topicHierarchy.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-bold">No matches found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Try a different search term or add a new subject to your curriculum.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topicHierarchy.map(topic => (
                <TopicTree 
                  key={topic.id} 
                  topic={topic} 
                  onSelect={onSelectTopic} 
                  onAddChild={(id) => { setParentId(id); setIsAddModalOpen(true); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[4rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-12">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                    {parentId ? 'Sub-topic' : 'New Subject'}
                  </h3>
                  {parentId && (
                    <div className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 dark:border-indigo-800">
                      Parent: {parentTopic?.name}
                    </div>
                  )}
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddTopic} className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Identity</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="Subject title..."
                    className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[2.5rem] outline-none transition-all text-slate-900 dark:text-white text-xl font-black placeholder:text-slate-400 shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    type="button" 
                    onClick={() => { setIsAddModalOpen(false); setParentId(null); setNewTopicName(''); }}
                    className="flex-1 px-8 py-6 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-8 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 dark:shadow-none"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
