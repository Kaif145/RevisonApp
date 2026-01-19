
import React, { useState } from 'react';
import { User } from '../types';
import { Mail, User as UserIcon, Shield, Bell, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProfileProps {
  user: User;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [notifications, setNotifications] = useState(true);

  const toggleNotifications = () => {
    if (!notifications) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotifications(true);
          toast.success("Notifications enabled!");
        } else {
          toast.error("Permission denied");
        }
      });
    } else {
      setNotifications(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your identity and app preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <div className="px-6 pb-6">
              <div className="relative -mt-10 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-xl">
                  {user.name[0]}
                </div>
              </div>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
              
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Shield size={16} />
                  <span>Free Plan</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <UserIcon size={16} />
                  <span>Active Learner</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Key className="text-indigo-600" size={20} />
              Security & Credentials
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Display Name</label>
                  <input type="text" readOnly value={user.name} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email Address</label>
                  <input type="email" readOnly value={user.email} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 outline-none" />
                </div>
              </div>
              <button className="text-sm text-indigo-600 font-medium hover:underline">Change Password</button>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Bell className="text-indigo-600" size={20} />
              Preferences
            </h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Desktop Notifications</p>
                <p className="text-sm text-slate-500">Get alerted when a revision is due.</p>
              </div>
              <button 
                onClick={toggleNotifications}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
