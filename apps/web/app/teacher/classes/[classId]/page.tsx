'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { BookOpen, CalendarCheck, Users, Search, Eye, X, Loader2, AlertCircle, UserCheck } from 'lucide-react';

interface StudentItem {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  rollNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  class?: { id: string; name: string };
  section?: { id: string; name: string };
}

interface StudentDetailResponse {
  student: StudentItem;
  attendanceStats: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
  };
}

export default function ClassDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const classId = params.classId as string;
  const sectionId = searchParams.get('sectionId') || undefined;

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Student Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = sectionId ? `?sectionId=${sectionId}` : '';
      const data = await apiFetch<StudentItem[]>(`/teacher/classes/${classId}/students${query}`);
      setStudents(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load class students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) loadStudents();
  }, [classId, sectionId]);

  const handleOpenStudentDetail = async (studentId: string) => {
    setLoadingDetail(true);
    try {
      const data = await apiFetch<StudentDetailResponse>(`/teacher/students/${studentId}`);
      setSelectedStudent(data);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch student details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = searchQuery.toLowerCase();
    const fn = s?.firstName?.toLowerCase() || '';
    const ln = s?.lastName?.toLowerCase() || '';
    const adm = s?.admissionNumber?.toLowerCase() || '';
    const roll = s?.rollNumber?.toLowerCase() || '';
    return fn.includes(term) || ln.includes(term) || adm.includes(term) || roll.includes(term);
  });

  const className = students[0]?.class?.name || 'Class';
  const sectionName = students[0]?.section?.name || searchParams.get('sectionName') || 'Assigned Section';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-sm font-medium">Loading class details and students...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-cyan-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{className} - {sectionName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Class Roster</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Students Enrolled: <span className="font-semibold text-cyan-300">{students.length}</span>
          </p>
        </div>
        <div>
          <Link
            href={`/teacher/attendance?classId=${classId}${sectionId ? `&sectionId=${sectionId}` : ''}`}
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

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student name, SR No, or roll number..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
      </div>

      {/* Student List Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">SR No.</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Roll No</th>
                <th className="px-5 py-3.5">Gender</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-cyan-400 font-semibold">
                      {s.admissionNumber}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-100">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">
                      {s.rollNumber || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {s.gender || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenStudentDetail(s.id)}
                        disabled={loadingDetail}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 font-medium transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Limited Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-6 border border-cyan-500/20 shadow-2xl relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto text-xl font-bold">
                {selectedStudent.student.firstName[0]}
                {selectedStudent.student.lastName[0]}
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                {selectedStudent.student.firstName} {selectedStudent.student.lastName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                SR No: <span className="text-cyan-400 font-semibold">{selectedStudent.student.admissionNumber}</span> &bull; Roll No: <span className="text-slate-200">{selectedStudent.student.rollNumber || 'N/A'}</span>
              </p>
            </div>

            {/* Attendance Summary */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Attendance Rate
                </span>
                <span className="text-sm font-extrabold text-emerald-400">
                  {selectedStudent.attendanceStats.attendanceRate}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Total</p>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedStudent.attendanceStats.totalRecords}</p>
                </div>
                <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <p className="text-emerald-400 text-[10px]">Present</p>
                  <p className="font-bold text-emerald-300 mt-0.5">{selectedStudent.attendanceStats.presentCount}</p>
                </div>
                <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  <p className="text-red-400 text-[10px]">Absent</p>
                  <p className="font-bold text-red-300 mt-0.5">{selectedStudent.attendanceStats.absentCount}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
