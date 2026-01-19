
import React from 'react';
import { LayoutDashboard, UserCircle, LogOut, Sun, Moon, GraduationCap } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'profile' | 'details';
  setActiveTab: (tab: 'dashboard' | 'profile' | 'details') => void;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  darkMode, 
  setDarkMode 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <aside className="w-20 md:w-64 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 bg-white dark:bg-slate-950">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <GraduationCap size={24} />
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight">ReviseMaster</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'details');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Icon size={20} />
              <span className="hidden md:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="hidden md:block">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
        >
          <LogOut size={20} />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </aside>
  );
};
