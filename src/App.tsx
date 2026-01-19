import React, { useState, useEffect, useCallback } from 'react';

import { AuthView } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { TopicDetails } from './components/TopicDetails';
import { FilteredCollection } from './components/FilteredCollection';

import { mockApi } from './services/api';
import { AuthState, User, Topic } from './types';

import { Toaster, toast } from 'react-hot-toast';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'details' | 'collection'>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<'due' | 'mastered' | 'all'>('all');
  const [darkMode, setDarkMode] = useState<boolean>(localStorage.getItem('theme') === 'dark');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchTopics = useCallback(async () => {
    if (!authState.token) return;
    setLoading(true);
    try {
      const data = await mockApi.getTopics();
      setTopics(data);
    } catch (err) {
      toast.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  }, [authState.token]);

  useEffect(() => {
    if (authState.token) {
      fetchTopics();
    }
  }, [authState.token, fetchTopics]);

  const handleLogin = (user: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    setAuthState({ user, token });
    toast.success(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthState({ user: null, token: null });
    toast.success("Logged out successfully");
  };

  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
    setActiveTab('details');
  };

  const handleOpenCollection = (filter: 'due' | 'mastered' | 'all') => {
    setActiveCollection(filter);
    setActiveTab('collection');
  };

  if (!authState.user) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <AuthView onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <Sidebar 
        activeTab={activeTab === 'collection' ? 'dashboard' : activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              topics={topics} 
              onRefresh={fetchTopics} 
              onSelectTopic={handleSelectTopic}
              onSelectCollection={handleOpenCollection}
              loading={loading}
            />
          )}
          {activeTab === 'profile' && (
            <Profile user={authState.user} />
          )}
          {activeTab === 'details' && selectedTopicId && (
            <TopicDetails 
              topicId={selectedTopicId} 
              onBack={() => setActiveTab('dashboard')} 
              onRefresh={fetchTopics}
            />
          )}
          {activeTab === 'collection' && (
            <FilteredCollection 
              topics={topics}
              filter={activeCollection}
              onBack={() => setActiveTab('dashboard')}
              onSelectTopic={handleSelectTopic}
            />
          )}
        </div>
      </main>
    </div>
  );
};


export default App;
