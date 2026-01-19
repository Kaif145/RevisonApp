
import React, { useState } from 'react';
import { User } from '../types';
import { mockApi } from '../services/api';
import { GraduationCap, ArrowRight, Loader2, Mail, Lock, User as UserIcon, Zap } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User, token: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const { user, token } = await mockApi.login(email, password);
        onLogin(user, token);
      } else {
        const { user, token } = await mockApi.signup(email, password, name);
        onLogin(user, token);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setLoading(true);
    try {
      const { user, token } = await mockApi.guestLogin();
      onLogin(user, token);
    } catch (err: any) {
      setError("Guest access failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-indigo-200 dark:shadow-none">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">ReviseMaster</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Smart Spaced-Repetition System</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1 text-slate-700 dark:text-slate-300">Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold ml-1 text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm rounded-2xl font-bold text-center border border-rose-100 dark:border-rose-900/50">
                {error}
              </div>
            )}

            <div className="space-y-4 pt-4">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <button
                disabled={loading}
                type="button"
                onClick={handleGuestAccess}
                className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
              >
                <Zap size={18} />
                Quick Guest Access
              </button>
            </div>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
