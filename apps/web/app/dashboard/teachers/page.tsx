'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Users, Plus, Edit3, Trash2, Mail, Phone, BookOpen, Loader2, AlertCircle, Calendar, Sparkles, CheckCircle2, UserCheck, Key } from 'lucide-react';

interface TeacherAssignment {
  id: string;
  subjectName: string;
  class: { id: string; name: string };
  section?: { id: string; name: string };
  academicYear?: { name: string };
}

interface Teacher {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  qualification?: string;
  designation?: string;
  status: string;
  teacherAssignments: TeacherAssignment[];
}

interface ClassItem {
  id: string;
  name: string;
  sections?: { id: string; name: string }[];
}

interface AcademicYearItem {
  id: string;
  name: string;
  isCurrent: boolean;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Reset Password inputs
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [confirmTeacherPassword, setConfirmTeacherPassword] = useState('');

  // Onboard / Edit Teacher Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [designation, setDesignation] = useState('');

  // Assign Class Form inputs
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignClassId, setAssignClassId] = useState('');
  const [assignSectionId, setAssignSectionId] = useState('');
  const [assignSubjectName, setAssignSubjectName] = useState('');
  const [assignAcademicYearId, setAssignAcademicYearId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersData, classesData, yearsData] = await Promise.all([
        apiFetch<Teacher[]>('/teachers'),
        apiFetch<ClassItem[]>('/classes'),
        apiFetch<AcademicYearItem[]>('/academic-years'),
      ]);
      setTeachers(teachersData || []);
      setClasses(classesData || []);
      setAcademicYears(yearsData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load directory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !employeeId || !firstName || !lastName) return;

    setSubmitting(true);
    try {
      await apiFetch('/teachers', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
          employeeId: employeeId.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          qualification: qualification.trim() || undefined,
          designation: designation.trim() || undefined,
        }),
      });
      setShowCreateModal(false);
      resetForm();
      setSuccessMsg('Teacher onboarded successfully!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to onboard teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFirstName(teacher.firstName);
    setLastName(teacher.lastName);
    setEmployeeId(teacher.employeeId || '');
    setEmail(teacher.email || '');
    setPhone(teacher.phone || '');
    setQualification(teacher.qualification || '');
    setDesignation(teacher.designation || '');
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    setSubmitting(true);
    try {
      await apiFetch(`/teachers/${selectedTeacher.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          employeeId: employeeId.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          qualification: qualification.trim() || undefined,
          designation: designation.trim() || undefined,
        }),
      });
      setShowEditModal(false);
      resetForm();
      setSuccessMsg('Teacher profile updated successfully!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResetPassword = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setNewTeacherPassword('');
    setConfirmTeacherPassword('');
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    if (newTeacherPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (newTeacherPassword !== confirmTeacherPassword) {
      alert('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/teachers/${selectedTeacher.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: newTeacherPassword }),
      });
      setShowResetPasswordModal(false);
      setSuccessMsg(`Password for teacher "${selectedTeacher.firstName} ${selectedTeacher.lastName}" has been reset successfully!`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to reset teacher password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete teacher '${name}'? This action cannot be undone.`)) return;

    try {
      await apiFetch(`/teachers/${id}`, { method: 'DELETE' });
      setSuccessMsg('Teacher deleted successfully.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete teacher');
    }
  };

  // Open Assign Class Modal
  const handleOpenAssignModal = (teacher?: Teacher) => {
    const defaultTeacherId = teacher ? teacher.id : teachers[0]?.id || '';
    setAssignTeacherId(defaultTeacherId);

    const defaultClass = classes[0];
    const defaultClassId = defaultClass ? defaultClass.id : '';
    setAssignClassId(defaultClassId);
    setAssignSectionId(defaultClass?.sections?.[0]?.id || '');

    setAssignSubjectName('Mathematics');

    const currentYear = academicYears.find((y) => y.isCurrent) || academicYears[0];
    setAssignAcademicYearId(currentYear ? currentYear.id : '');

    setShowAssignModal(true);
  };

  // Class Selection Handler inside Assign Modal
  const handleAssignClassChange = (classId: string) => {
    setAssignClassId(classId);
    const selectedCls = classes.find((c) => c.id === classId);
    setAssignSectionId(selectedCls?.sections?.[0]?.id || '');
  };

  // Submit Class Assignment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTeacherId || !assignClassId || !assignSubjectName || !assignAcademicYearId) {
      alert('Please fill in all required assignment fields.');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/teachers/assign', {
        method: 'POST',
        body: JSON.stringify({
          teacherId: assignTeacherId,
          classId: assignClassId,
          sectionId: assignSectionId || undefined,
          subjectName: assignSubjectName.trim(),
          academicYearId: assignAcademicYearId,
        }),
      });

      setShowAssignModal(false);
      setSuccessMsg('Class assigned to teacher successfully!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign class to teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setEmployeeId('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setQualification('');
    setDesignation('');
    setSelectedTeacher(null);
  };

  // Sections for selected class in Assign modal
  const activeClassObj = classes.find((c) => c.id === assignClassId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-400" />
            <span>Teachers Directory</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Onboard faculty members, manage staff profiles, and assign classes & subjects
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <button
            onClick={() => handleOpenAssignModal()}
            disabled={teachers.length === 0 || classes.length === 0}
            className="px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-semibold rounded-xl border border-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <BookOpen className="w-4 h-4" />
            <span>Assign Class to Teacher</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 gradient-button text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md hover:shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Teacher</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <span>Loading faculty directory...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">{teacher.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenResetPassword(teacher)}
                      className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1 text-[11px] font-semibold px-2 border border-slate-800 hover:border-amber-500/30"
                      title="Reset Teacher Password"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(teacher)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-all"
                      title="Edit Teacher"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id, `${teacher.firstName} ${teacher.lastName}`)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all"
                      title="Delete Teacher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1.5 border-t border-b border-slate-800/60 py-3">
                  <p className="text-slate-300 font-medium">{teacher.designation || 'Faculty Member'}</p>
                  {teacher.qualification && <p>Qualification: {teacher.qualification}</p>}
                  <p className="flex items-center gap-1.5 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{teacher.email}</span>
                  </p>
                  {teacher.phone && (
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{teacher.phone}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Assigned Classes
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal(teacher)}
                      className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Assign Class
                    </button>
                  </div>
                  {teacher.teacherAssignments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/40 text-center">
                      No class assignments yet
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.teacherAssignments.map((asg) => (
                        <span
                          key={asg.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 font-medium flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3 h-3 text-cyan-400" />
                          <span>{asg.class.name} {asg.section?.name ? `(${asg.section.name})` : ''} - {asg.subjectName}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 text-right">
                <button
                  onClick={() => handleOpenAssignModal(teacher)}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>+ Assign Class / Subject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Teacher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-100">Onboard New Teacher</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="Rahul"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="EMP-101"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="teacher@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="M.Sc. Mathematics"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="Senior Teacher"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  <span>Save Teacher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-100">Edit Teacher Profile</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Class to Teacher Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Assign Class to Teacher</span>
              </h2>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {/* Select Teacher */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Teacher *
                </label>
                <select
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Class & Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Select Class *
                  </label>
                  <select
                    value={assignClassId}
                    onChange={(e) => handleAssignClassChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                    required
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Select Section (Optional)
                  </label>
                  <select
                    value={assignSectionId}
                    onChange={(e) => setAssignSectionId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">All Sections</option>
                    {activeClassObj?.sections?.map((s) => (
                      <option key={s.id} value={s.id}>
                        Section {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Science, English, Hindi"
                  value={assignSubjectName}
                  onChange={(e) => setAssignSubjectName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Academic Year */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Academic Year *
                </label>
                <select
                  value={assignAcademicYearId}
                  onChange={(e) => setAssignAcademicYearId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isCurrent ? '(Current Year)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 gradient-button text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>Assign Class Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Teacher Password Modal */}
      {showResetPasswordModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-amber-500/20 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Reset Teacher Password</span>
              </h2>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs">
              <p className="text-slate-100 font-bold text-sm">
                {selectedTeacher.firstName} {selectedTeacher.lastName}
              </p>
              <p className="text-amber-400 font-mono font-semibold">EMP ID: {selectedTeacher.employeeId}</p>
              <p className="text-slate-400">Email: {selectedTeacher.email}</p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  New Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter new password (min. 6 chars)"
                  value={newTeacherPassword}
                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Confirm New Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={confirmTeacherPassword}
                  onChange={(e) => setConfirmTeacherPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
