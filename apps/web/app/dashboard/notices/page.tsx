'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Bell, Plus, Trash2, Edit3, Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  isPublic: boolean;
  createdAt: string;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotices = async () => {
    try {
      const data = await apiFetch<Notice[]>('/notices');
      setNotices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const openCreateModal = () => {
    setEditingNotice(null);
    setTitle('');
    setCategory('GENERAL');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsPublic(true);
    setShowModal(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setCategory(notice.category || 'GENERAL');
    setDescription(notice.description);
    setDate(notice.date ? new Date(notice.date).toISOString().split('T')[0] : '');
    setIsPublic(notice.isPublic !== undefined ? notice.isPublic : true);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      if (editingNotice) {
        // Edit Notice
        await apiFetch(`/notices/${editingNotice.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title,
            category,
            description,
            date,
            isPublic,
          }),
        });
      } else {
        // Create Notice
        await apiFetch('/notices', {
          method: 'POST',
          body: JSON.stringify({
            title,
            category,
            description,
            date,
            isPublic,
          }),
        });
      }

      setShowModal(false);
      await loadNotices();
    } catch (err: any) {
      alert(err.message || 'Failed to save notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, noticeTitle: string) => {
    if (!confirm(`Are you sure you want to delete notice "${noticeTitle}"?`)) return;
    try {
      await apiFetch(`/notices/${id}`, { method: 'DELETE' });
      await loadNotices();
    } catch (err: any) {
      alert(err.message || 'Failed to delete notice');
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'ACADEMIC':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'SPORTS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'EVENT':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'EMERGENCY':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-[#D4A84F]/10 text-[#D4A84F] border-[#D4A84F]/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Bell className="w-7 h-7 text-[#D4A84F]" />
            <span>Notice Board Management (सूचना प्रबंधन)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, edit, and publish official school notices for the public homepage and staff dashboard.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4A84F]" />
          <span>Add New Notice (नया नोटिस जोड़ें)</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#D4A84F]" />
          <span>Declared Notices ({notices.length})</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            <span>Loading notices...</span>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center p-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No notices published yet.</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4A84F] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create your first notice</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title & Description</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Public Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {notices.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-100">{item.title}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadge(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                      {item.date ? new Date(item.date).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${item.isPublic ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'}`}>
                        {item.isPublic ? 'Public' : 'Internal'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit Notice"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl space-y-6 border border-slate-700/80 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4A84F]" />
                <span>{editingNotice ? 'Edit Notice' : 'Add New Notice'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notice Title (शीर्षक) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. शैक्षणिक सत्र 2026-27 प्रवेश सूचना"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="SPORTS">SPORTS</option>
                    <option value="EVENT">EVENT</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description (विवरण) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type notice details here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="text-xs font-medium text-slate-300">
                  Publish on public school homepage (होम पेज पर प्रदर्शित करें)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingNotice ? 'Update Notice' : 'Save Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
