'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { LogOut, User as UserIcon, Building } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2 text-xs text-slate-300 font-medium">
          <Building className="w-3.5 h-3.5 text-cyan-400" />
          <span>{user?.schoolName || 'School Admin'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            {user?.role ? user.role[0] : 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">
              {user?.email || user?.username || 'Administrator'}
            </p>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
              {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-all"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
