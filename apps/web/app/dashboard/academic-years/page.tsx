'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Calendar, Plus, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: string;
}

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadYears = async () => {
    try {
      const data = await apiFetch<AcademicYear[]>('/academic-years');
      setYears(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    setSubmitting(true);
    try {
      await apiFetch('/academic-years', {
        method: 'POST',
        body: JSON.stringify({ name, startDate, endDate, isCurrent }),
      });
      setShowModal(false);
      setName('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
      await loadYears();
    } catch (err: any) {
      alert(err.message || 'Failed to create academic year');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetCurrent = async (id: string) => {
    try {
      await apiFetch(`/academic-years/${id}/set-current`, { method: 'PATCH' });
      await loadYears();
    } catch (err: any) {
      alert(err.message || 'Failed to update current academic year');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-cyan-400" />
            <span>Academic Years</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage school academic sessions and active term calendar
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 gradient-button text-white text-sm font-semibold rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Year</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span>Loading academic calendar...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map((year) => (
            <div
              key={year.id}
              className={`glass-card p-6 rounded-2xl border transition-all space-y-4 ${
                year.isCurrent ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100">{year.name}</h3>
                {year.isCurrent ? (
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Current Active
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetCurrent(year.id)}
                    className="text-xs text-slate-400 hover:text-cyan-400 border border-slate-700 px-3 py-1 rounded-lg hover:border-cyan-500/40 transition-all"
                  >
                    Set Active
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>Start Date: {new Date(year.startDate).toLocaleDateString()}</p>
                <p>End Date: {new Date(year.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-100">Create Academic Year</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Academic Year Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026-2027"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="isCurrent" className="text-xs font-medium text-slate-300">
                  Set as current active year
                </label>
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
                  className="px-4 py-2 gradient-button text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Academic Year</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
