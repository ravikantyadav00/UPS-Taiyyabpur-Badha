'use client';

import React from 'react';
import TeacherSidebar from '@/components/TeacherSidebar';
import { useAuth } from '@/lib/auth-context';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-sm font-medium">Verifying teacher session...</span>
      </div>
    );
  }

  if (!user || user.role !== 'TEACHER') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-4 border border-red-500/20">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Access Restricted</h2>
          <p className="text-sm text-slate-400">
            You must be logged in as an authorized Teacher to view this area.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Notification Bar */}
        <header className="h-16 px-6 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-200">
              Welcome, <span className="text-cyan-400">{user.username || user.email}</span>
            </h1>
            <p className="text-xs text-slate-400">School Management Teacher Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Active Teacher
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
