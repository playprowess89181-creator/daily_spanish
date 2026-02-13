'use client';

import { useState } from 'react';
import LessonsTable from './LessonsTable';

const API_LESSONS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/lessons';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

export default function LessonManagement() {
  const [showModal, setShowModal] = useState(false);
  const [lessonBlock, setLessonBlock] = useState('A1');
  const [parts, setParts] = useState<Array<{ id: number; name: string; file: File | null }>>([
    { id: Date.now(), name: '', file: null }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAccessToken();

  const addPart = () => {
    setParts(prev => [...prev, { id: Date.now(), name: '', file: null }]);
  };

  const removePart = (id: number) => {
    setParts(prev => prev.filter(p => p.id !== id));
  };

  const updatePartName = (id: number, value: string) => {
    setParts(prev => prev.map(p => (p.id === id ? { ...p, name: value } : p)));
  };

  const updatePartFile = (id: number, file: File | null) => {
    setParts(prev => prev.map(p => (p.id === id ? { ...p, file } : p)));
  };

  const isValidFile = (file: File) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.type)) return true;
    const name = file.name.toLowerCase();
    return name.endsWith('.pdf') || name.endsWith('.docx');
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!lessonBlock) {
      setError('Please select a block');
      return;
    }
    if (parts.length === 0) {
      setError('Add at least one part');
      return;
    }
    for (const p of parts) {
      if (!p.name.trim()) {
        setError('Each part must have a name');
        return;
      }
      if (!p.file) {
        setError('Each part must include a PDF or DOCX');
        return;
      }
      if (!isValidFile(p.file)) {
        setError('Only PDF or DOCX files are allowed');
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('block', lessonBlock);
      parts.forEach((p, idx) => {
        formData.append(`parts[${idx}][name]`, p.name);
        if (p.file) formData.append(`parts[${idx}][file]`, p.file);
      });
      const res = await fetch(`${API_LESSONS_BASE}/lessons/`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data && data.error) ? data.error : 'Failed to create lesson';
        setError(msg);
        return;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lessons:created'));
        window.dispatchEvent(new CustomEvent('lessons:changed'));
      }
      setLessonBlock('A1');
      setParts([{ id: Date.now(), name: '', file: null }]);
      setShowModal(false);
    } catch (e) {
      setError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Lesson Management</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Add New Lesson
          </button>
        </div>
        <LessonsTable />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--azul-ultramar)', color: 'white' }}>
                  <i className="fas fa-book"></i>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">Create Lesson</div>
                  <div className="text-sm text-gray-500">Select a block and add downloadable parts</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="px-6 py-4">
              {error && (
                <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg border border-red-200">{error}</div>
              )}
              <form className="space-y-6" onSubmit={handleCreateLesson}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={lessonBlock}
                      onChange={(e) => setLessonBlock(e.target.value)}
                    >
                      <option value="A1">A1 – Beginner</option>
                      <option value="A2">A2 – Basic</option>
                      <option value="B1">B1 – Intermediate</option>
                      <option value="B2">B2 – Upper Intermediate</option>
                      <option value="C1">C1 – Advanced</option>
                    </select>
                  </div>
                  <div className="hidden md:block"></div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-700">Parts</div>
                    <button type="button" onClick={addPart} className="px-3 py-2 rounded-md text-white hover:opacity-90" style={{ backgroundColor: 'var(--azul-ultramar)' }}>
                      <i className="fas fa-plus mr-2"></i>
                      Add Part
                    </button>
                  </div>
                  <div className="space-y-4">
                    {parts.map((p, idx) => (
                      <div key={p.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-semibold text-gray-800">Part {idx + 1}</div>
                          <button type="button" onClick={() => removePart(p.id)} className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
                            <i className="fas fa-trash mr-2"></i>
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={p.name}
                              onChange={(e) => updatePartName(p.id, e.target.value)}
                            >
                              <option value="">Select part</option>
                              <option value="Vocabulary">Vocabulary</option>
                              <option value="Speech">Speech</option>
                              <option value="Listening">Listening</option>
                              <option value="Reading">Reading</option>
                              <option value="Grammar">Grammar</option>
                              <option value="Writing">Writing</option>
                              <option value="Pronunciation">Pronunciation</option>
                              <option value="Conversation">Conversation</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload (PDF/DOCX)</label>
                            <input
                              type="file"
                              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              className="w-full"
                              onChange={(e) => updatePartFile(p.id, e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                            />
                            {p.file && (
                              <div className="text-xs text-gray-600 mt-2">Selected: {p.file.name}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-md text-white hover:opacity-90"
                    style={{ backgroundColor: 'var(--azul-ultramar)' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Lesson'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
