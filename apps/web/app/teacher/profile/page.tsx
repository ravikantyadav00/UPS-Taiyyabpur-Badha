'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { User, Mail, Phone, BookOpen, Award, Calendar, ShieldCheck, Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface TeacherProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  qualification?: string;
  phone?: string;
  email?: string;
  designation?: string;
  status: string;
  joinedDate?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  teacherAssignments?: {
    id: string;
    subjectName: string;
    class: { name: string };
    section?: { name: string };
  }[];
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<TeacherProfile>('/teacher/me');
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-sm font-medium">Loading teacher profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 border border-cyan-500/20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          {profile?.firstName?.[0]}
          {profile?.lastName?.[0]}
        </div>
        <div className="space-y-1 text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role: TEACHER</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            {profile?.firstName} {profile?.lastName}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Employee ID: <span className="text-cyan-300 font-semibold">{profile?.employeeId}</span> &bull; Status: <span className="text-emerald-400 font-semibold">{profile?.status}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Personal Information</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Full Name</p>
              <p className="text-slate-200 font-medium text-sm mt-0.5">
                {profile?.firstName} {profile?.lastName}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Designation</p>
              <p className="text-slate-200 font-medium mt-0.5">
                {profile?.designation || 'Senior Educator'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Qualification</p>
              <p className="text-slate-200 font-medium mt-0.5">
                {profile?.qualification || 'B.Ed, M.Sc'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Joining Date</p>
              <p className="text-slate-200 font-mono mt-0.5">
                {profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Account & Contact</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Email Address</p>
              <p className="text-slate-200 font-mono mt-0.5 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>{profile?.email || profile?.user?.email || 'N/A'}</span>
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Contact Mobile</p>
              <p className="text-slate-200 font-mono mt-0.5 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{profile?.phone || 'N/A'}</span>
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Account Username</p>
              <p className="text-slate-200 font-mono mt-0.5">
                {profile?.user?.username || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Assignments */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Active Teaching Assignments</span>
        </h2>

        {profile?.teacherAssignments?.length === 0 ? (
          <p className="text-xs text-slate-400">No active assignments assigned to this profile.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile?.teacherAssignments?.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                  {a.class.name} {a.section ? `- ${a.section.name}` : ''}
                </span>
                <p className="font-bold text-slate-100 mt-1">{a.subjectName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
