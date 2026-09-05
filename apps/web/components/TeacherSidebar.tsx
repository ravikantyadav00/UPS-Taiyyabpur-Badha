'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarCheck,
  History,
  User,
  LogOut,
  GraduationCap,
  Sparkles,
  FileText,
  Award,
  Bell,
  Lock,
} from 'lucide-react';

const mainNavItems = [
  { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { name: 'My Classes', href: '/teacher/classes', icon: BookOpen },
  { name: 'Students', href: '/teacher/students', icon: Users },
  { name: 'Take Attendance', href: '/teacher/attendance', icon: CalendarCheck },
  { name: 'Attendance History', href: '/teacher/attendance/history', icon: History },
  { name: 'My Profile', href: '/teacher/profile', icon: User },
];

const futureNavItems = [
  { name: 'Homework', icon: FileText },
  { name: 'Assignments', icon: Sparkles },
  { name: 'Exams & Marks', icon: Award },
  { name: 'Notices', icon: Bell },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-100 text-sm tracking-tight gradient-text">
            School SMS
          </h2>
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
            Teacher Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Active Modules */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Future Modules */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Upcoming Modules
          </p>
          {futureNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 bg-slate-900/40 border border-slate-800/30 opacity-60 cursor-not-allowed"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 flex items-center gap-1 font-mono">
                  <Lock className="w-2.5 h-2.5" /> Soon
                </span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              {user?.username?.[0]?.toUpperCase() || 'T'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.username || user?.email?.split('@')[0] || 'Teacher'}
              </p>
              <p className="text-[10px] text-cyan-400 font-medium">TEACHER</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
