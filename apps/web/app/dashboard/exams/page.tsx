'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Award, Plus, FileSpreadsheet, UserCheck, BookOpen, Loader2, AlertCircle, Eye, CheckCircle2 } from 'lucide-react';

interface ExamSubject {
  id: string;
  classId: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
  examDate?: string;
  class?: { name: string };
  _count?: { examResults: number };
}

interface Exam {
  id: string;
  name: string;
  term?: string;
  startDate: string;
  endDate: string;
  status: string;
  academicYear?: { name: string };
  examSubjects: ExamSubject[];
}

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
}

interface ReportCard {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    className: string;
    sectionName: string;
  };
  results: {
    examName: string;
    term?: string;
    subjectName: string;
    maxMarks: number;
    passMarks: number;
    marksObtained: number;
    grade: string;
    remarks?: string;
  }[];
  summary: {
    totalObtained: number;
    totalMax: number;
    percentage: number;
    overallGrade: string;
  };
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Selection
  const [showExamModal, setShowExamModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [showReportCardModal, setShowReportCardModal] = useState(false);

  // Exam Form
  const [name, setName] = useState('');
  const [term, setTerm] = useState('Mid-Term');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Marks Form
  const [selectedSubject, setSelectedSubject] = useState<ExamSubject | null>(null);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});

  // Report Card State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [loadingReportCard, setLoadingReportCard] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [examsData, studentsData] = await Promise.all([
        apiFetch<Exam[]>('/exams'),
        apiFetch<Student[]>('/students'),
      ]);
      setExams(examsData);
      setStudents(studentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    setSubmitting(true);
    try {
      const years = await apiFetch<any[]>('/academic-years');
      const currentYear = years.find((y) => y.isCurrent) || years[0];

      await apiFetch('/exams', {
        method: 'POST',
        body: JSON.stringify({
          name,
          term,
          academicYearId: currentYear.id,
          startDate,
          endDate,
        }),
      });

      setShowExamModal(false);
      setName('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenMarksModal = async (subject: ExamSubject) => {
    setSelectedSubject(subject);
    try {
      const classStudents = await apiFetch<Student[]>(`/students?classId=${subject.classId}`);
      const map: Record<string, number> = {};
      classStudents.forEach((s) => {
        map[s.id] = 85; // Default score placeholder for fast entry
      });
      setMarksMap(map);
      setShowMarksModal(true);
    } catch (err: any) {
      alert(err.message || 'Failed to load class students');
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedSubject) return;
    setSubmitting(true);
    try {
      const marks = Object.entries(marksMap).map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained: Number(marksObtained),
      }));

      await apiFetch('/exams/marks', {
        method: 'POST',
        body: JSON.stringify({
          examSubjectId: selectedSubject.id,
          marks,
        }),
      });

      setShowMarksModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record marks');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewReportCard = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setLoadingReportCard(true);
    setShowReportCardModal(true);
    try {
      const data = await apiFetch<ReportCard>(`/exams/report-card/${studentId}`);
      setReportCard(data);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch report card');
    } finally {
      setLoadingReportCard(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Award className="w-7 h-7 text-purple-400" />
            <span>Examinations & Report Cards</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage exam terms, enter subject marks, auto-compute grades, and issue student transcripts
          </p>
        </div>
        <button
          onClick={() => setShowExamModal(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Exam Term</span>
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
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          <span>Loading examination schedules...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Exam Schedules List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{exam.name}</h3>
                    <p className="text-xs text-purple-400 font-mono">Term: {exam.term || 'N/A'}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
                    {exam.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1 py-2 border-t border-b border-slate-800/80">
                  <p>
                    <span className="text-slate-500">Duration:</span>{' '}
                    {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-slate-500">Academic Year:</span> {exam.academicYear?.name || 'Current'}
                  </p>
                </div>

                {/* Exam Subjects Table */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Subject Papers ({exam.examSubjects.length})
                  </h4>
                  <div className="space-y-2">
                    {exam.examSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">
                            {sub.subjectName}{' '}
                            <span className="text-slate-400 font-normal">({sub.class?.name})</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Max: {sub.maxMarks} | Pass: {sub.passMarks}
                          </p>
                        </div>
                        <button
                          onClick={() => handleOpenMarksModal(sub)}
                          className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Enter Marks</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Student Report Card Generator Section */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-400" />
              <span>Generate Student Report Cards</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {students.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm">
                      {st.firstName} {st.lastName}
                    </h4>
                    <p className="text-xs text-purple-400 font-mono">{st.admissionNumber}</p>
                  </div>
                  <button
                    onClick={() => handleViewReportCard(st.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    <span>Report Card</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-100">Create Exam Term</h2>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Exam Title</label>
                <input
                  type="text"
                  placeholder="Mid-Term 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Term</label>
                <input
                  type="text"
                  placeholder="Term 1 / Mid-Term / Final"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create Exam</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Marks Modal */}
      {showMarksModal && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[85vh] overflow-y-auto">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Enter Subject Marks</h2>
              <p className="text-xs text-purple-400 mt-1">
                Subject: {selectedSubject.subjectName} (Max: {selectedSubject.maxMarks})
              </p>
            </div>

            <div className="space-y-3">
              {students.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">
                      {st.firstName} {st.lastName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{st.admissionNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      max={selectedSubject.maxMarks}
                      min={0}
                      value={marksMap[st.id] ?? 0}
                      onChange={(e) =>
                        setMarksMap({ ...marksMap, [st.id]: Number(e.target.value) })
                      }
                      className="w-20 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-semibold text-right focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-xs text-slate-500">/ {selectedSubject.maxMarks}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowMarksModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMarks}
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Marks</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Report Card Modal */}
      {showReportCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            {loadingReportCard ? (
              <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                <span>Generating report card...</span>
              </div>
            ) : reportCard ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                      Official Academic Transcript
                    </span>
                    <h2 className="text-2xl font-bold text-slate-100">{reportCard.student.name}</h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Adm #: {reportCard.student.admissionNumber} | Class: {reportCard.student.className} (
                      {reportCard.student.sectionName})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold border border-purple-500/30">
                      Grade: {reportCard.summary.overallGrade}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{reportCard.summary.percentage}% Score</p>
                  </div>
                </div>

                {/* Marks Breakdown Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Subject Performance
                  </h4>
                  <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden">
                    {reportCard.results.map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/60 text-xs">
                        <div>
                          <p className="font-semibold text-slate-200">{res.subjectName}</p>
                          <p className="text-[10px] text-slate-500">{res.examName}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-slate-300">
                            {res.marksObtained} / {res.maxMarks}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">
                            {res.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowReportCardModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-700"
                  >
                    Close Transcript
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
