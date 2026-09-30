'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Image as ImageIcon,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  Sparkles,
  Tag,
  ExternalLink
} from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
  createdAt?: string;
}

const PRESET_IMAGES = [
  { label: 'School Building / Campus', url: '/images/school-building.jpg' },
  { label: 'Mid-Day Meal / Students', url: '/images/school-midday-meal.jpg' },
];

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  // Form Inputs
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/school-building.jpg');
  const [category, setCategory] = useState('CAMPUS');

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<GalleryItem[]>('/gallery');
      setPhotos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load gallery photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();

    const handleUpdate = () => {
      loadPhotos();
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('mock_db_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('mock_db_updated', handleUpdate);
    };
  }, []);

  const resetForm = () => {
    setTitle('');
    setImageUrl('/images/school-building.jpg');
    setCategory('CAMPUS');
    setSelectedPhoto(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size is too large. Please select an image smaller than 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImageUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      alert('Please enter a photo title and image URL.');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/gallery', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          category,
        }),
      });

      setShowAddModal(false);
      resetForm();
      setSuccessMsg('Photo added to school gallery successfully! Live on website now.');
      await loadPhotos();
    } catch (err: any) {
      alert(err.message || 'Failed to add photo to gallery');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (photo: GalleryItem) => {
    setSelectedPhoto(photo);
    setTitle(photo.title || '');
    setImageUrl(photo.imageUrl || '');
    setCategory(photo.category || 'CAMPUS');
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto) return;

    setSubmitting(true);
    try {
      await apiFetch(`/gallery/${selectedPhoto.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          category,
        }),
      });

      setShowEditModal(false);
      resetForm();
      setSuccessMsg('Photo updated successfully! Live on website now.');
      await loadPhotos();
    } catch (err: any) {
      alert(err.message || 'Failed to update photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (photoId: string, photoTitle: string) => {
    if (!confirm(`Are you sure you want to delete photo "${photoTitle}" from gallery?`)) return;

    try {
      await apiFetch(`/gallery/${photoId}`, { method: 'DELETE' });
      setSuccessMsg('Photo deleted from gallery successfully.');
      await loadPhotos();
    } catch (err: any) {
      alert(err.message || 'Failed to delete photo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <ImageIcon className="w-7 h-7 text-cyan-400" />
            <span>School Photo Gallery Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload, edit, and delete photos dynamically displayed on the school website homepage
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Photo</span>
        </button>
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
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span>Loading school photo gallery...</span>
        </div>
      ) : photos.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Photos In Gallery</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Add New Photo" button above to upload photos and publish them to the official website.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-cyan-600 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Photo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-3 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 border-b border-slate-800">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/school-building.jpg';
                    }}
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-cyan-300 border border-white/10 uppercase">
                    {photo.category || 'CAMPUS'}
                  </span>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 line-clamp-2">{photo.title}</h3>
                  {photo.createdAt && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Added: {new Date(photo.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-end gap-2 border-t border-slate-800/60 mt-2">
                <button
                  onClick={() => handleOpenEdit(photo)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/20 transition-all flex items-center gap-1.5"
                  title="Edit Photo Title / URL"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(photo.id, photo.title)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-all flex items-center gap-1.5"
                  title="Delete Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Photo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>Add New Photo to Website Gallery</span>
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Photo Title (हिंदी या English में शीर्षक) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. वार्षिकोत्सव समारोह / Sports Day Celebration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Photo Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="CAMPUS">Campus & Building (विद्यालय भवन)</option>
                  <option value="EVENTS">Events & Mid-Day Meal (कार्यक्रम एवं मध्याह्न भोजन)</option>
                  <option value="ACADEMIC">Classroom & Lab (स्मार्ट क्लास व लैब)</option>
                  <option value="SPORTS">Sports & Activities (खेलकूद)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Select Image Source</label>

                {/* Preset Options */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {PRESET_IMAGES.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        imageUrl === preset.url
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <img src={preset.url} alt="preset" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[11px] leading-tight">{preset.label}</span>
                    </button>
                  ))}
                </div>

                {/* File Upload Option */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Or Upload Custom Photo File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                  />
                </div>

                {/* Custom URL Input */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Or Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg or Data URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Preview Thumbnail */}
              {imageUrl && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Image Preview:</span>
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Publish to Website</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {showEditModal && selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-cyan-400" />
              <span>Edit Photo Details</span>
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Photo Title (शीर्षक) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Photo Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="CAMPUS">Campus & Building (विद्यालय भवन)</option>
                  <option value="EVENTS">Events & Mid-Day Meal (कार्यक्रम एवं मध्याह्न भोजन)</option>
                  <option value="ACADEMIC">Classroom & Lab (स्मार्ट क्लास व लैब)</option>
                  <option value="SPORTS">Sports & Activities (खेलकूद)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              {/* Preview Thumbnail */}
              {imageUrl && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Image Preview:</span>
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

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
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg"
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
