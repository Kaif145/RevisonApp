
import React, { useEffect, useState } from 'react';
import { Topic, RevisionInterval } from '../types';
import { mockApi } from '../services/api';
import { ArrowLeft, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TopicDetailsProps {
  topicId: string;
  onBack: () => void;
  onRefresh: () => void;
}

export const TopicDetails: React.FC<TopicDetailsProps> = ({ topicId, onBack, onRefresh }) => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await mockApi.getTopic(topicId);
        setTopic(data);
        setNotes(data.notes || '');
      } catch (err) {
        toast.error("Topic not found");
        onBack();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topicId, onBack]);

  const toggleRevision = async (interval: RevisionInterval) => {
    if (!topic) return;
    try {
      const updated = await mockApi.toggleRevision(topic.id, interval);
      setTopic(updated);
      onRefresh();
      toast.success("Progress updated!");
    } catch (err) {
      toast.error("Failed to update revision");
    }
  };

  const handleSaveNotes = async () => {
    if (!topic) return;
    try {
      await mockApi.updateTopicNotes(topic.id, notes);
      toast.success("Notes saved");
    } catch (err) {
      toast.error("Failed to save notes");
    }
  };

  if (loading || !topic) return (
    <div className="py-24 text-center">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group font-bold">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{topic.name}</h1>
          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Calendar size={14} />
              Opened {new Date(topic.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <CheckCircle2 size={14} />
              {topic.revisions.filter(r => r.completedAt).length} / {topic.revisions.length} Mastery Progress
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Revision Schedule */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-widest text-xs">
              <Calendar className="text-indigo-600" size={20} />
              Spaced Logic
            </h3>
            <div className="space-y-5">
              {topic.revisions.map((rev) => {
                const isDone = !!rev.completedAt;
                const isOverdue = !isDone && new Date(rev.dueDate) < new Date();
                
                return (
                  <div 
                    key={rev.interval}
                    onClick={() => toggleRevision(rev.interval)}
                    className={`flex items-center justify-between p-5 rounded-[1.75rem] border-2 cursor-pointer transition-all group ${
                      isDone 
                        ? 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10' 
                        : isOverdue 
                          ? 'border-rose-100 bg-rose-50 dark:border-rose-900/30 dark:bg-rose-900/10'
                          : 'border-slate-50 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 hover:border-indigo-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
                        isDone ? 'bg-emerald-500 text-white rotate-12' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 group-hover:scale-110 group-hover:border-indigo-500'
                      }`}>
                        {isDone ? <CheckCircle2 size={20} /> : rev.interval}
                      </div>
                      <div>
                        <div className={`font-black uppercase text-[11px] tracking-widest ${isDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>Review {rev.interval}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1">
                          {isDone 
                            ? `${new Date(rev.completedAt!).toLocaleDateString()}` 
                            : `${new Date(rev.dueDate).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                    {!isDone && isOverdue && <AlertCircle className="text-rose-500 animate-pulse" size={18} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-widest text-xs">
                <FileText className="text-indigo-600" size={20} />
                Knowledge Base
              </h3>
              <button 
                onClick={handleSaveNotes}
                className="px-6 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                Save Draft
              </button>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Start documentations for this subject..."
              className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] p-8 text-lg outline-none transition-all resize-none font-medium leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
