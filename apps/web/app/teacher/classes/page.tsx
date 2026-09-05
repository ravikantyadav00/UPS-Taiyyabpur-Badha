'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { BookOpen, Users, CalendarCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

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

export default function MyClassesPage() {
  const [classes, setClasses] = useState<AssignedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AssignedClass[]>('/teacher/classes');
      setClasses(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-sm font-medium">Loading your assigned classes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Classes</h1>
        <p className="text-xs text-slate-400 mt-1">
          Classes and sections assigned to you for Academic Year 2026-27
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800/80 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No Assigned Classes Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            You do not currently have any active class assignments. Please ask the school Admin to assign your classes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs font-extrabold border border-cyan-500/20">
                    {cls.className} - {cls.sectionName}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{cls.studentCount} Students</span>
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {cls.subjectName}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{cls.academicYear}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
                <Link
                  href={`/teacher/classes/${cls.classId}${cls.sectionId ? `?sectionId=${cls.sectionId}` : ''}`}
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  View Students
                </Link>
                <Link
                  href={`/teacher/attendance?classId=${cls.classId}${cls.sectionId ? `&sectionId=${cls.sectionId}` : ''}`}
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Attendance</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
