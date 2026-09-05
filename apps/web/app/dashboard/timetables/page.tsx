'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Clock, Plus, Trash2, BookOpen, User, Building, Loader2, AlertCircle } from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  sections?: { id: string; name: string }[];
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

interface TimetablePeriod {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  roomNumber?: string;
  teacher?: { firstName: string; lastName: string };
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

export default function TimetablePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<string>('MONDAY');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('09:30');
  const [subjectName, setSubjectName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [roomNumber, setRoomNumber] = useState('Room 201');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      const [classesData, teachersData] = await Promise.all([
        apiFetch<ClassItem[]>('/classes'),
        apiFetch<Teacher[]>('/teachers'),
      ]);
      setClasses(classesData);
      setTeachers(teachersData);
      if (classesData.length > 0) {
        setSelectedClass(classesData[0].id);
        if (classesData[0].sections && classesData[0].sections.length > 0) {
          setSelectedSection(classesData[0].sections[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load initial data');
    }
  };

  const loadTimetable = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const data = await apiFetch<TimetablePeriod[]>(
        `/timetables?classId=${selectedClass}&sectionId=${selectedSection}`
      );
      setPeriods(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadTimetable();
    }
  }, [selectedClass, selectedSection]);

  const handleAddPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !subjectName || !startTime || !endTime) return;

    setSubmitting(true);
    try {
      await apiFetch('/timetables', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClass,
          sectionId: selectedSection || undefined,
          teacherId: teacherId || undefined,
          dayOfWeek,
          startTime,
          endTime,
          subjectName,
          roomNumber,
        }),
      });

      setShowModal(false);
      setSubjectName('');
      await loadTimetable();
    } catch (err: any) {
      alert(err.message || 'Failed to add timetable period');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePeriod = async (id: string) => {
    if (!confirm('Are you sure you want to remove this timetable slot?')) return;
    try {
      await apiFetch(`/timetables/${id}`, { method: 'DELETE' });
      await loadTimetable();
    } catch (err: any) {
      alert(err.message || 'Failed to delete period');
    }
  };

  const currentClassObj = classes.find((c) => c.id === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Clock className="w-7 h-7 text-blue-400" />
            <span>Class Timetable & Schedule</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize weekly subject periods, classroom allocations, and faculty teaching schedules
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Period Slot</span>
        </button>
      </div>

      {/* Class & Section Filter */}
      <div className="glass-panel p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('');
            }}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500"
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
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Sections</option>
            {currentClassObj?.sections?.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Weekly Schedule Matrix */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span>Loading weekly timetable matrix...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAYS.map((day) => {
            const dayPeriods = periods.filter((p) => p.dayOfWeek === day);

            return (
              <div key={day} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="font-bold text-slate-100 text-sm tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>{day}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {dayPeriods.length} Period{dayPeriods.length === 1 ? '' : 's'}
                  </span>
                </div>

                {dayPeriods.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">No periods scheduled</p>
                ) : (
                  <div className="space-y-2.5">
                    {dayPeriods.map((period) => (
                      <div
                        key={period.id}
                        className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 text-sm">{period.subjectName}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {period.startTime} - {period.endTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>{period.teacher ? `${period.teacher.firstName} ${period.teacher.lastName}` : 'TBA'}</span>
                          <span>{period.roomNumber || 'Room N/A'}</span>
                        </div>

                        <button
                          onClick={() => handleDeletePeriod(period.id)}
                          className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Period Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-100">Add Schedule Period Slot</h2>

            <form onSubmit={handleAddPeriod} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="Mathematics / Science"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Teacher</label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="Room 201"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Add Period</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
