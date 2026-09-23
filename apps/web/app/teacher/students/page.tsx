'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Users, Search, Eye, X, Loader2, AlertCircle, BookOpen } from 'lucide-react';

interface AssignedClass {
  id: string;
  classId: string;
  sectionId?: string;
  className: string;
  sectionName: string;
  subjectName: string;
}

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

export default function TeacherStudentsPage() {
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Student Profile Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load Assigned Classes
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

  // Fetch Students for selected class
  const fetchStudents = async () => {
    if (!selectedClassId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const secQuery = selectedSectionId ? `?sectionId=${selectedSectionId}` : '';
      const data = await apiFetch<StudentItem[]>(`/teacher/classes/${selectedClassId}/students${secQuery}`);
      setStudents(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents();
    }
  }, [selectedClassId, selectedSectionId]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selected = assignedClasses.find((c) => c.classId === val);
    setSelectedClassId(val);
    if (selected) {
      setSelectedSectionId(selected.sectionId || '');
    }
  };

  const handleOpenDetail = async (studentId: string) => {
    setLoadingDetail(true);
    try {
      const data = await apiFetch<StudentDetailResponse>(`/teacher/students/${studentId}`);
      setSelectedStudent(data);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch student profile');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Students Directory</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          View enrolled students in your assigned class sections
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
            Select Class Section
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
            Search Students
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SR No, or roll no..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-sm font-medium">Loading student list...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800/80">
          <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-200 text-sm font-bold">No Students Found</p>
          <p className="text-slate-400 text-xs mt-1">
            No students found matching your search query in this class.
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
                  <th className="px-5 py-3.5">Class & Section</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((s) => (
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
                      {s.class?.name} - {s.section?.name || 'A'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetail(s.id)}
                        disabled={loadingDetail}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 font-medium transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
