'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { BookOpen, Plus, Users, Layers, Loader2, AlertCircle, Edit, Trash2 } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  roomNumber?: string;
  capacity?: number;
}

interface ClassItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  sections: Section[];
  _count: {
    students: number;
    sections: number;
  };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState<string | null>(null);

  // Edit states
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // Create Form states
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('40');

  // Edit Form states
  const [editClassName, setEditClassName] = useState('');
  const [editClassCode, setEditClassCode] = useState('');
  const [editClassDesc, setEditClassDesc] = useState('');
  const [editSectionName, setEditSectionName] = useState('');
  const [editRoomNumber, setEditRoomNumber] = useState('');
  const [editCapacity, setEditCapacity] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = async () => {
    try {
      const data = await apiFetch<ClassItem[]>('/classes');
      setClasses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className) return;

    setSubmitting(true);
    try {
      await apiFetch('/classes', {
        method: 'POST',
        body: JSON.stringify({ name: className, code: classCode, description: classDesc }),
      });
      setShowClassModal(false);
      setClassName('');
      setClassCode('');
      setClassDesc('');
      await loadClasses();
    } catch (err: any) {
      alert(err.message || 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditClass = (cls: ClassItem) => {
    setEditingClass(cls);
    setEditClassName(cls.name);
    setEditClassCode(cls.code || '');
    setEditClassDesc(cls.description || '');
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassName) return;

    setSubmitting(true);
    try {
      await apiFetch(`/classes/${editingClass.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editClassName,
          code: editClassCode,
          description: editClassDesc,
        }),
      });
      setEditingClass(null);
      await loadClasses();
    } catch (err: any) {
      alert(err.message || 'Failed to update class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (cls: ClassItem) => {
    if (!confirm(`Are you sure you want to delete class "${cls.name}"? This will also remove all associated sections.`)) {
      return;
    }

    try {
      await apiFetch(`/classes/${cls.id}`, {
        method: 'DELETE',
      });
      await loadClasses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete class');
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName || !showSectionModal) return;

    setSubmitting(true);
    try {
      await apiFetch(`/classes/${showSectionModal}/sections`, {
        method: 'POST',
        body: JSON.stringify({
          name: sectionName,
          roomNumber,
          capacity: capacity ? parseInt(capacity, 10) : undefined,
        }),
      });
      setShowSectionModal(null);
      setSectionName('');
      setRoomNumber('');
      setCapacity('40');
      await loadClasses();
    } catch (err: any) {
      alert(err.message || 'Failed to add section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditSection = (sec: Section) => {
    setEditingSection(sec);
    setEditSectionName(sec.name);
    setEditRoomNumber(sec.roomNumber || '');
    setEditCapacity(sec.capacity ? String(sec.capacity) : '');
  };

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editSectionName) return;

    setSubmitting(true);
    try {
      await apiFetch(`/classes/sections/${editingSection.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editSectionName,
          roomNumber: editRoomNumber,
          capacity: editCapacity ? parseInt(editCapacity, 10) : undefined,
        }),
      });
      setEditingSection(null);
      await loadClasses();
    } catch (err: any) {
      alert(err.message || 'Failed to update section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSection = async (sec: Section) => {
    if (!confirm(`Are you sure you want to delete section "${sec.name}"?`)) {
      return;
    }

    try {
      await apiFetch(`/classes/sections/${sec.id}`, {
        method: 'DELETE',
      });
      await loadClasses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete section');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-purple-400" />
            <span>Classes & Sections</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure academic classes, section divisions, and room allocations
          </p>
        </div>
        <button
          onClick={() => setShowClassModal(true)}
          className="px-4 py-2.5 gradient-button text-white text-sm font-semibold rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class</span>
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
          <span>Loading classes and sections...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{cls.name}</h3>
                  {cls.code && <span className="text-xs text-purple-400 font-mono">{cls.code}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {cls._count.sections}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {cls._count.students}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
                    <button
                      onClick={() => handleOpenEditClass(cls)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-purple-400 transition-colors"
                      title="Edit Class"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sections list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Sections</span>
                  <button
                    onClick={() => setShowSectionModal(cls.id)}
                    className="text-purple-400 hover:underline text-[11px]"
                  >
                    + Add Section
                  </button>
                </div>

                {cls.sections.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No sections created yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {cls.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{sec.name}</span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditSection(sec)}
                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-purple-400"
                              title="Edit Section"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(sec)}
                              className="p-1 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-400"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 flex justify-between mt-1">
                          <span>{sec.roomNumber || 'No Room'}</span>
                          <span>Cap: {sec.capacity || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-100">Create New Class</h2>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 10"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Class Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. G10"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  placeholder="Description of class"
                  value={classDesc}
                  onChange={(e) => setClassDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
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
                  <span>Create Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-100">Edit Class</h2>

            <form onSubmit={handleUpdateClass} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 10"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Class Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. G10"
                  value={editClassCode}
                  onChange={(e) => setEditClassCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  placeholder="Description of class"
                  value={editClassDesc}
                  onChange={(e) => setEditClassDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
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
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-100">Add Section</h2>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Section Name</label>
                <input
                  type="text"
                  placeholder="e.g. Section A"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. Room 302"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Capacity</label>
                <input
                  type="number"
                  placeholder="40"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(null)}
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
                  <span>Save Section</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-100">Edit Section</h2>

            <form onSubmit={handleUpdateSection} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Section Name</label>
                <input
                  type="text"
                  placeholder="e.g. Section A"
                  value={editSectionName}
                  onChange={(e) => setEditSectionName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. Room 302"
                  value={editRoomNumber}
                  onChange={(e) => setEditRoomNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Capacity</label>
                <input
                  type="number"
                  placeholder="40"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
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
