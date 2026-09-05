'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Building2, Edit, Mail, Phone, Globe, MapPin, User, Users, GraduationCap, BookOpen, Loader2, AlertCircle, Save } from 'lucide-react';

interface SchoolProfile {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  status: string;
  createdAt: string;
  _count?: {
    users: number;
    teachers: number;
    students: number;
    classes: number;
  };
}

export default function SchoolProfilePage() {
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadSchool = async () => {
    try {
      const data = await apiFetch<SchoolProfile>('/schools/me');
      setSchool(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load school profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchool();
  }, []);

  const handleOpenEdit = () => {
    if (!school) return;
    setName(school.name || '');
    setPhone(school.phone || '');
    setEmail(school.email || '');
    setWebsite(school.website || '');
    setAddress(school.address || '');
    setPrincipalName(school.principalName || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await apiFetch<SchoolProfile>('/schools/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          website: website.trim() || undefined,
          address: address.trim() || undefined,
          principalName: principalName.trim() || undefined,
        }),
      });
      setSchool(updated);
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update school profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-3 min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span>Loading school profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Building2 className="w-7 h-7 text-cyan-400" />
            <span>School Profile & Settings</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage multi-tenant institution identity, contact channels, and administrative details
          </p>
        </div>
        <button
          onClick={handleOpenEdit}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Edit className="w-4 h-4" />
          <span>Edit School Details</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {school && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  CODE: {school.code}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-100 mt-2">{school.name}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Principal: <span className="text-slate-200 font-semibold">{school.principalName || 'Not Assigned'}</span>
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                {school.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  Email Address
                </span>
                <p className="text-slate-200 font-medium">{school.email || 'N/A'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  Phone Contact
                </span>
                <p className="text-slate-200 font-medium">{school.phone || 'N/A'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Official Website
                </span>
                <p className="text-slate-200 font-medium">{school.website || 'N/A'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Campus Address
                </span>
                <p className="text-slate-200 font-medium">{school.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Institution Stats</h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Faculty Members
                </span>
                <span className="font-bold text-slate-100 text-sm">{school._count?.teachers || 0}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  Enrolled Students
                </span>
                <span className="font-bold text-slate-100 text-sm">{school._count?.students || 0}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Academic Classes
                </span>
                <span className="font-bold text-slate-100 text-sm">{school._count?.classes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit School Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-100">Edit School Details</h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">School Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Contact</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Principal Name</label>
                  <input
                    type="text"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Website URL</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
