'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Award,
  CreditCard,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  active: boolean;
  badge?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: true },
  { name: 'School Profile', href: '/dashboard/school', icon: Building2, active: true },
  { name: 'Academic Years', href: '/dashboard/academic-years', icon: Calendar, active: true },
  { name: 'Classes & Sections', href: '/dashboard/classes', icon: BookOpen, active: true },
  { name: 'Teachers', href: '/dashboard/teachers', icon: Users, active: true },
  { name: 'Students', href: '/dashboard/students', icon: GraduationCap, active: true },
  { name: 'Attendance', href: '/dashboard/attendance', icon: CheckSquare, active: true },
  { name: 'Exams & Grades', href: '/dashboard/exams', icon: Award, active: true },
  { name: 'Fees & Billing', href: '/dashboard/fees', icon: CreditCard, active: true },
  { name: 'Timetables', href: '/dashboard/timetables', icon: Clock, active: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 hidden md:flex flex-col justify-between p-4 min-h-screen">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100 tracking-wide">SMS Admin</h2>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
              PHASE 3 COMPLETE
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isCurrent = pathname === item.href;

            return item.active ? (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ) : (
              <div
                key={item.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 glass-card rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-200">School Isolation Engine</p>
        <p className="text-[11px] text-slate-500">Scoped to active tenant ID</p>
      </div>
    </aside>
  );
}
