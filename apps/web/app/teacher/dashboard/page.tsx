'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  BookOpen,
  Users,
  CalendarCheck,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface SummaryData {
  teacherName: string;
  employeeId: string;
  myClassesCount: number;
  myStudentsCount: number;
  todaysAttendanceCount: number;
  pendingAttendanceCount: number;
}

interface AssignedClass {
  id: string;
  classId: string;
  sectionId?: string;
  className: string;
  sectionName: string;
  subjectName: string;
  academicYear: string;
  studentCount: number;
}

export default function TeacherDashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, classesData] = await Promise.all([
        apiFetch<SummaryData>('/teacher/dashboard-summary'),
        apiFetch<AssignedClass[]>('/teacher/classes'),
      ]);
      setSummary(sumData);
      setAssignedClasses(classesData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-sm font-medium">Loading Teacher Dashboard metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-cyan-500/20">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Year 2026-27</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
            Good Morning, <span className="gradient-text">{summary?.teacherName || 'Teacher'}</span> 👋
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Employee ID: <span className="font-mono text-cyan-300">{summary?.employeeId || 'N/A'}</span> &bull; Role: Teacher
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/teacher/attendance"
            className="px-4 py-2.5 gradient-button text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Take Attendance</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* My Classes */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              My Classes
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">
            {summary?.myClassesCount || 0}
          </div>
          <p className="text-xs text-slate-400">Assigned class sections</p>
        </div>

        {/* My Students */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              My Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">
            {summary?.myStudentsCount || 0}
          </div>
          <p className="text-xs text-slate-400">Enrolled across my classes</p>
        </div>

        {/* Today's Attendance Marked */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">
            {summary?.todaysAttendanceCount || 0}
          </div>
          <p className="text-xs text-emerald-400 font-medium">Student records marked today</p>
        </div>

        {/* Pending Attendance */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Attendance
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">
            {summary?.pendingAttendanceCount || 0}
          </div>
          <p className="text-xs text-amber-400 font-medium">Classes pending attendance</p>
        </div>
      </div>

      {/* Assigned Classes Quick Action Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">My Assigned Classes</h2>
            <p className="text-xs text-slate-400">Select a class section to view students or record attendance</p>
          </div>
          <Link
            href="/teacher/classes"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {assignedClasses.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800/80">
            <GraduationCap className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 text-sm font-semibold">No Classes Assigned Yet</p>
            <p className="text-slate-500 text-xs mt-1">
              Please contact the school Admin to assign classes and subjects to your profile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assignedClasses.map((cls) => (
              <div
                key={cls.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                      {cls.className} &bull; Section {cls.sectionName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {cls.studentCount} Students
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {cls.subjectName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{cls.academicYear}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <Link
                    href={`/teacher/classes/${cls.classId}${cls.sectionId ? `?sectionId=${cls.sectionId}` : ''}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                  >
                    View Students
                  </Link>
                  <Link
                    href={`/teacher/attendance?classId=${cls.classId}${cls.sectionId ? `&sectionId=${cls.sectionId}` : ''}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Take Attendance</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
