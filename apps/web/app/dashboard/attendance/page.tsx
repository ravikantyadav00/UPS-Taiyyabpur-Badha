'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { CheckSquare, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, AlertCircle, Loader2, Save } from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  sections?: { id: string; name: string }[];
}

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  rollNumber?: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

interface AttendanceSummary {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadClasses = async () => {
    try {
      const data = await apiFetch<ClassItem[]>('/classes');
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0].id);
        if (data[0].sections && data[0].sections.length > 0) {
          setSelectedSection(data[0].sections[0].id);
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadAttendance = async () => {
    if (!selectedClass) return;
    setLoading(true);
    setMessage(null);
    try {
      const [studentsData, existingAttendance, summaryData] = await Promise.all([
        apiFetch<Student[]>(`/students?classId=${selectedClass}&sectionId=${selectedSection}`),
        apiFetch<any[]>(`/attendance?classId=${selectedClass}&sectionId=${selectedSection}&date=${date}`),
        apiFetch<AttendanceSummary>(`/attendance/summary?classId=${selectedClass}`),
      ]);

      setStudents(studentsData);
      setSummary(summaryData);

      const map: Record<string, AttendanceRecord> = {};
      studentsData.forEach((student) => {
        const found = existingAttendance.find((a) => a.studentId === student.id);
        map[student.id] = {
          studentId: student.id,
          status: found ? found.status : 'PRESENT',
          remarks: found ? found.remarks : '',
        };
      });
      setAttendanceMap(map);
    } catch (err: any) {
      setMessage(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadAttendance();
    }
  }, [selectedClass, selectedSection, date]);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const setAllStatus = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<string, AttendanceRecord> = {};
    Object.keys(attendanceMap).forEach((id) => {
      updated[id] = { ...attendanceMap[id], status };
    });
    setAttendanceMap(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const records = Object.values(attendanceMap);
      await apiFetch('/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClass,
          sectionId: selectedSection || undefined,
          date,
          records,
        }),
      });
      setMessage('Attendance register saved successfully!');
      await loadAttendance();
    } catch (err: any) {
      setMessage(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const currentClassObj = classes.find((c) => c.id === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-emerald-400" />
            <span>Daily Attendance Register</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track daily class attendance, bulk mark status, and review attendance metrics
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading || students.length === 0}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Register</span>
        </button>
      </div>

      {/* Filter & Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('');
            }}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Sections</option>
            {currentClassObj?.sections?.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Attendance Rate</p>
              <p className="text-xl font-bold text-emerald-400">{summary.attendanceRate}%</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500/40" />
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Present</p>
              <p className="text-xl font-bold text-slate-100">{summary.presentCount}</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-400/40" />
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Absent</p>
              <p className="text-xl font-bold text-red-400">{summary.absentCount}</p>
            </div>
            <XCircle className="w-6 h-6 text-red-400/40" />
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Late Arrived</p>
              <p className="text-xl font-bold text-amber-400">{summary.lateCount}</p>
            </div>
            <Clock className="w-6 h-6 text-amber-400/40" />
          </div>
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            message.includes('success')
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          <AlertCircle className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      {/* Student Attendance List */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">
            Student Register ({students.length} Students)
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAllStatus('PRESENT')}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-lg"
            >
              Mark All Present
            </button>
            <button
              onClick={() => setAllStatus('ABSENT')}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-lg"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span>Loading class register...</span>
          </div>
        ) : students.length === 0 ? (
          <p className="text-center py-12 text-slate-400 text-sm">
            No enrolled students found in this class section.
          </p>
        ) : (
          <div className="space-y-3">
            {students.map((student) => {
              const currentStatus = attendanceMap[student.id]?.status || 'PRESENT';

              return (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 gap-3"
                >
                  <div>
                    <h4 className="font-semibold text-slate-100">
                      {student.firstName} {student.lastName}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Adm: {student.admissionNumber} {student.rollNumber ? `| Roll #${student.rollNumber}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(student.id, st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          currentStatus === st
                            ? st === 'PRESENT'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                              : st === 'ABSENT'
                              ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm'
                              : st === 'LATE'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
