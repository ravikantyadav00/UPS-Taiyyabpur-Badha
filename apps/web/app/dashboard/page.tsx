'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  ShieldAlert,
  Globe,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface SchoolProfile {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  status: string;
  _count?: {
    users: number;
    teachers: number;
    students: number;
    classes: number;
  };
}

export default function DashboardPage() {
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchoolData() {
      try {
        const data = await apiFetch<SchoolProfile>('/schools/me');
        setSchool(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch school profile');
      } finally {
        setLoading(false);
      }
    }
    loadSchoolData();

    const handleUpdate = () => {
      loadSchoolData();
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('mock_db_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('mock_db_updated', handleUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span>Loading School Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const counts = school?._count || { users: 0, teachers: 0, students: 0, classes: 0 };

  const stats = [
    { name: 'School Code', value: school?.code || 'N/A', icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { name: 'Total Users', value: counts.users.toString(), icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { name: 'Teachers', value: counts.teachers.toString(), icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Students', value: counts.students.toString(), icon: GraduationCap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { name: 'Classes', value: counts.classes.toString(), icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
            System Administration
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            {school?.name || 'School Dashboard'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Phase 1 Multi-Tenant Foundation & Security Overview
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start md:self-auto">
          <CheckCircle2 className="w-4 h-4" />
          <span>Tenant Scoped Active</span>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.name}</span>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100 tracking-tight">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* School Information Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">School Profile</h2>
              <p className="text-xs text-slate-400">Authenticated Tenant Information</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
            {school?.status || 'ACTIVE'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">School Name</span>
            <p className="font-semibold text-slate-200">{school?.name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">School Code</span>
            <p className="font-semibold text-cyan-400 font-mono">{school?.code}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Principal</span>
            <p className="font-semibold text-slate-200">{school?.principalName || 'Not configured'}</p>
          </div>

          <div className="space-y-1 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Address</span>
              <p className="text-slate-300">{school?.address || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-1 flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Phone</span>
              <p className="text-slate-300">{school?.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-1 flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Email</span>
              <p className="text-slate-300">{school?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-1 flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Website</span>
              <p className="text-slate-300">
                {school?.website ? (
                  <a href={school.website} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                    {school.website}
                  </a>
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
