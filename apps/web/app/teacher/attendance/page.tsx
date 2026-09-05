'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

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

interface AttendanceStudentRow {
  studentId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  rollNumber?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  markedAt?: string | null;
}

export default function TakeAttendancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialClassId = searchParams.get('classId') || '';
  const initialSectionId = searchParams.get('sectionId') || '';

  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialSectionId);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [records, setRecords] = useState<AttendanceStudentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load Assigned Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await apiFetch<AssignedClass[]>('/teacher/classes');
        setAssignedClasses(data || []);
        if (data && data.length > 0 && !selectedClassId) {
          setSelectedClassId(data[0].classId);
          setSelectedSectionId(data[0].sectionId || '');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch assigned classes');
      }
    };
    fetchClasses();
  }, []);

  // Fetch Attendance Records when Class, Section or Date changes
  const fetchAttendance = async () => {
    if (!selectedClassId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const secQuery = selectedSectionId ? `&sectionId=${selectedSectionId}` : '';
      const dateQuery = `&date=${date}`;
      const res = await apiFetch<{ date: string; records: AttendanceStudentRow[] }>(
        `/teacher/attendance?classId=${selectedClassId}${secQuery}${dateQuery}`
      );
      setRecords(res.records || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchAttendance();
    }
  }, [selectedClassId, selectedSectionId, date]);

  // Select class handler
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selected = assignedClasses.find((c) => c.classId === val);
    setSelectedClassId(val);
    if (selected) {
      setSelectedSectionId(selected.sectionId || '');
    }
  };

  // Toggle Status for a single student
  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  // Mark All Present
  const handleMarkAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'PRESENT' })));
  };

  // Submit Attendance
  const handleSubmitAttendance = async () => {
    if (!selectedClassId || records.length === 0) return;

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload = {
        classId: selectedClassId,
        sectionId: selectedSectionId || undefined,
        date,
        records: records.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks,
        })),
      };

      const res = await apiFetch<any>('/teacher/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccessMsg(res.message || 'Attendance successfully recorded!');
      await fetchAttendance();
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Daily Attendance Entry</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mark daily attendance for your assigned class sections
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllPresent}
            disabled={loading || records.length === 0 || submitting}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={handleSubmitAttendance}
            disabled={loading || records.length === 0 || submitting}
            className="px-5 py-2.5 gradient-button text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Selector Bar */}
      <div className="glass-panel p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 border border-slate-800/80">
        {/* Class Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={handleClassChange}
            disabled={loading || submitting}
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

        {/* Date Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Attendance Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading || submitting}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Counts Summary */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <div className="flex items-center gap-4 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Present: {presentCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span>Absent: {absentCount}</span>
            </div>
            <div className="text-slate-400 ml-auto font-mono">
              Total: {records.length}
            </div>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-sm font-medium">Loading attendance roster...</span>
        </div>
      ) : records.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800/80">
          <CalendarCheck className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-200 text-sm font-bold">No Students Found</p>
          <p className="text-slate-400 text-xs mt-1">
            There are no active students enrolled in this class section.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">SR No.</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((r, idx) => (
                  <tr key={r.studentId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-cyan-400 font-semibold">
                      {r.admissionNumber}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-100">
                      {r.firstName} {r.lastName}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">
                      {r.rollNumber || (idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.studentId, 'PRESENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.studentId, 'ABSENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            r.status === 'ABSENT'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>
                      </div>
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
