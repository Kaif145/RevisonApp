
import React, { useEffect, useState } from 'react';
import { Topic, RevisionInterval } from '../types';
import { mockApi } from '../services/api';
import { ArrowLeft, Calendar, FileText, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
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

  if (loading || !topic) return null;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{topic.name}</h1>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              Created {new Date(topic.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={14} />
              {topic.revisions.filter(r => r.completedAt).length} / {topic.revisions.length} Steps
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revision Schedule */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={20} />
              Spaced Repetition
            </h3>
            <div className="space-y-4">
              {topic.revisions.map((rev) => {
                const isDone = !!rev.completedAt;
                const isOverdue = !isDone && new Date(rev.dueDate) < new Date();
                
                return (
                  <div 
                    key={rev.interval}
                    onClick={() => toggleRevision(rev.interval)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all group ${
                      isDone 
                        ? 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10' 
                        : isOverdue 
                          ? 'border-rose-100 bg-rose-50 dark:border-rose-900/30 dark:bg-rose-900/10'
                          : 'border-slate-50 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 hover:border-indigo-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isDone ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-indigo-500'
                      }`}>
                        {isDone ? <CheckCircle2 size={18} /> : rev.interval}
                      </div>
                      <div>
                        <div className={`font-semibold ${isDone ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>Day {rev.interval} Review</div>
                        <div className="text-xs text-slate-500">
                          {isDone 
                            ? `Done on ${new Date(rev.completedAt!).toLocaleDateString()}` 
                            : `Due on ${new Date(rev.dueDate).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                    {!isDone && isOverdue && <AlertCircle className="text-rose-500" size={18} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} />
                Study Notes
              </h3>
              <button 
                onClick={handleSaveNotes}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down key points, equations, or concepts you need to remember..."
              className="flex-1 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
