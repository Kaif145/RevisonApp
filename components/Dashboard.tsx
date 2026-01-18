
import React, { useState, useMemo } from 'react';
import { TopicTree } from './TopicTree';
import { Topic, RevisionInterval } from '../types';
import { Plus, Search, BarChart3, Clock, CheckCircle2, Download } from 'lucide-react';
import { mockApi } from '../services/api';

interface DashboardProps {
  topics: Topic[];
  onRefresh: () => void;
  onSelectTopic: (id: string) => void;
  loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ topics, onRefresh, onSelectTopic, loading }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);

  const filteredTopics = useMemo(() => {
    if (!searchTerm) return topics;
    const term = searchTerm.toLowerCase();
    return topics.filter(t => t.name.toLowerCase().includes(term));
  }, [topics, searchTerm]);

  // Hierarchical view construction
  const topicHierarchy = useMemo(() => {
    const map = new Map<string, Topic & { subTopics: Topic[] }>();
    topics.forEach(t => map.set(t.id, { ...t, subTopics: [] }));
    const root: (Topic & { subTopics: Topic[] })[] = [];
    
    map.forEach(t => {
      if (t.parentId && map.has(t.parentId)) {
        map.get(t.parentId)!.subTopics.push(t);
      } else {
        root.push(t);
      }
    });
    return root;
  }, [topics]);

  const stats = useMemo(() => {
    const total = topics.length;
    let completed = 0;
    let totalRevisions = 0;
    let doneRevisions = 0;

    topics.forEach(t => {
      totalRevisions += t.revisions.length;
      const tDone = t.revisions.filter(r => r.completedAt).length;
      doneRevisions += tDone;
      if (tDone === t.revisions.length && t.revisions.length > 0) completed++;
    });

    return {
      total,
      completed,
      overallProgress: totalRevisions > 0 ? Math.round((doneRevisions / totalRevisions) * 100) : 0,
      dueToday: topics.filter(t => 
        t.revisions.some(r => !r.completedAt && new Date(r.dueDate).toDateString() === new Date().toDateString())
      ).length
    };
  }, [topics]);

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

  const exportCSV = () => {
    const headers = "ID,Name,Parent,Progress,Created At\n";
    const rows = topics.map(t => {
      const prog = t.revisions.filter(r => r.completedAt).length / t.revisions.length;
      return `${t.id},"${t.name}",${t.parentId || 'None'},${(prog * 100).toFixed(0)}%,${t.createdAt}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revision-progress-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Focus Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your progress and stay consistent with spaced repetition.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus size={16} />
            New Subject
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-indigo-600 dark:text-indigo-400">
            <BarChart3 size={20} />
            <span className="font-semibold">Overall Progress</span>
          </div>
          <div className="text-3xl font-bold">{stats.overallProgress}%</div>
          <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000" 
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
            <span className="font-semibold">Completed Subjects</span>
          </div>
          <div className="text-3xl font-bold">{stats.completed} <span className="text-sm font-normal text-slate-500">/ {stats.total}</span></div>
          <p className="text-xs text-slate-500 mt-2">All revisions done</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-400">
            <Clock size={20} />
            <span className="font-semibold">Due Today</span>
          </div>
          <div className="text-3xl font-bold">{stats.dueToday}</div>
          <p className="text-xs text-slate-500 mt-2">Revision milestones reached</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-600 dark:text-slate-400">
            <Plus size={20} />
            <span className="font-semibold">Total Topics</span>
          </div>
          <div className="text-3xl font-bold">{stats.total}</div>
          <p className="text-xs text-slate-500 mt-2">Active learning journey</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Topics Hierarchy</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search topics..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-100 dark:border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 animate-pulse">Organizing your studies...</p>
            </div>
          ) : topicHierarchy.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={40} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No topics yet</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Create your first subject to start tracking your revision journey with spaced repetition.</p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="text-indigo-600 font-medium hover:underline flex items-center gap-1 mx-auto"
              >
                <Plus size={16} /> Add Subject
              </button>
            </div>
          ) : (
            <div className="space-y-1">
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{parentId ? 'Add Sub-topic' : 'Create New Subject'}</h3>
              <p className="text-slate-500 text-sm mb-6">Give it a clear name to track your progress effectively.</p>
              
              <form onSubmit={handleAddTopic} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Topic Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="e.g. Organic Chemistry"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setIsAddModalOpen(false); setParentId(null); }}
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
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

const GraduationCap = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
