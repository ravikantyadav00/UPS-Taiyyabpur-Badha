'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { History, Calendar, Loader2, AlertCircle, CheckCircle2, XCircle, Users } from 'lucide-react';

interface AssignedClass {
  id: string;
  classId: string;
  sectionId?: string;
  className: string;
  sectionName: string;
  subjectName: string;
  academicYear: string;
}

interface AttendanceHistoryItem {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

export default function AttendanceHistoryPage() {
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await apiFetch<AssignedClass[]>('/teacher/classes');
        setAssignedClasses(data || []);
        if (data && data.length > 0) {
          setSelectedClassId(data[0].classId);
          setSelectedSectionId(data[0].sectionId || '');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch assigned classes');
      }
    };
    fetchClasses();
  }, []);

  // Fetch History
  const fetchHistory = async () => {
    if (!selectedClassId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const secQuery = selectedSectionId ? `&sectionId=${selectedSectionId}` : '';
      const monthQuery = `&month=${month}`;
      const data = await apiFetch<AttendanceHistoryItem[]>(
        `/teacher/attendance/history?classId=${selectedClassId}${secQuery}${monthQuery}`
      );
      setHistory(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchHistory();
    }
  }, [selectedClassId, selectedSectionId, month]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selected = assignedClasses.find((c) => c.classId === val);
    setSelectedClassId(val);
    if (selected) {
      setSelectedSectionId(selected.sectionId || '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Attendance History</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          View daily attendance logs and monthly summaries for assigned classes
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-800/80">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={handleClassChange}
            disabled={loading}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            {assignedClasses.length === 0 ? (
              <option value="">No classes assigned</option>
            ) : (
              assignedClasses.map((cls) => (
                <option key={cls.id} value={cls.classId}>
                  {cls.className} - {cls.sectionName} ({cls.subjectName})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Month
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            disabled={loading}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-sm font-medium">Loading attendance history...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800/80">
          <History className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-200 text-sm font-bold">No Attendance Logged</p>
          <p className="text-slate-400 text-xs mt-1">
            No attendance records found for the selected class and month.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Present</th>
                  <th className="px-5 py-3.5">Absent</th>
                  <th className="px-5 py-3.5">Total Records</th>
                  <th className="px-5 py-3.5 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-cyan-400 font-semibold">
                      {row.date}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-400">
                      {row.present}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-red-400">
                      {row.absent}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 font-mono">
                      {row.total}
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-slate-100">
                      <span className={`px-2.5 py-1 rounded-lg ${
                        row.percentage >= 90
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : row.percentage >= 75
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {row.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
