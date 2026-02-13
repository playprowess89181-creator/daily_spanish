'use client';

import { useEffect, useState } from 'react';

const API_LESSONS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/lessons';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

type LessonPart = {
  id: string;
  name: string;
  file: string;
  created_at: string;
};

type Lesson = {
  id: string;
  block: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  created_by_email?: string;
  created_at: string;
  updated_at: string;
  parts: LessonPart[];
};

export default function LessonsTable() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAccessToken();
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editBlock, setEditBlock] = useState('A1');
  const [editParts, setEditParts] = useState<Array<{ id: number; name: string; file: File | null }>>([]);
  const [updating, setUpdating] = useState(false);

  const fetchLessons = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_LESSONS_BASE}/lessons/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        const list: Lesson[] = Array.isArray(data.lessons) ? data.lessons : [];
        setLessons(list);
      } else {
        setError(data.error || 'Failed to load lessons');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [token]);

  useEffect(() => {
    const handler = () => fetchLessons();
    if (typeof window !== 'undefined') {
      window.addEventListener('lessons:created', handler);
      window.addEventListener('lessons:updated', handler);
      window.addEventListener('lessons:deleted', handler);
      window.addEventListener('lessons:changed', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('lessons:created', handler);
        window.removeEventListener('lessons:updated', handler);
        window.removeEventListener('lessons:deleted', handler);
        window.removeEventListener('lessons:changed', handler);
      }
    };
  }, []);

  const openView = (lesson: Lesson) => {
    setSelected(lesson);
    setViewOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setSelected(lesson);
    setEditBlock(lesson.block);
    setEditParts(lesson.parts.map((p) => ({ id: Date.now() + Math.floor(Math.random()*1000), name: p.name, file: null })));
    setEditOpen(true);
  };

  const openDelete = (lesson: Lesson) => {
    setSelected(lesson);
    setDeleteOpen(true);
  };

  const addEditPart = () => {
    setEditParts((prev) => [...prev, { id: Date.now(), name: '', file: null }]);
  };

  const removeEditPart = (id: number) => {
    setEditParts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateEditPartName = (id: number, value: string) => {
    setEditParts((prev) => prev.map((p) => (p.id === id ? { ...p, name: value } : p)));
  };

  const updateEditPartFile = (id: number, file: File | null) => {
    setEditParts((prev) => prev.map((p) => (p.id === id ? { ...p, file } : p)));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('block', editBlock);
      editParts.forEach((p, idx) => {
        formData.append(`parts[${idx}][name]`, p.name);
        if (p.file) formData.append(`parts[${idx}][file]`, p.file);
      });
      const res = await fetch(`${API_LESSONS_BASE}/lessons/${selected.id}/`, {
        method: 'PUT',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data && data.error) ? data.error : 'Failed to update lesson');
        return;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lessons:updated'));
        window.dispatchEvent(new CustomEvent('lessons:changed'));
      }
      setEditOpen(false);
      setSelected(null);
      await fetchLessons();
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`${API_LESSONS_BASE}/lessons/${selected.id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data && data.error) ? data.error : 'Failed to delete lesson');
        return;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lessons:deleted'));
        window.dispatchEvent(new CustomEvent('lessons:changed'));
      }
      setDeleteOpen(false);
      setSelected(null);
      await fetchLessons();
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg border border-red-200">{error}</div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Lesson</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Block</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Parts</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={5}>Loading...</td>
              </tr>
            ) : lessons.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-600" colSpan={5}>No lessons found</td>
              </tr>
            ) : (
              lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--azul-ultramar)', color: 'white' }}>
                        <i className="fas fa-book"></i>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{lesson.id}</div>
                        <div className="text-xs text-gray-500">by {lesson.created_by_email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">{lesson.block}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {lesson.parts.map((p) => (
                        <a key={p.id} href={p.file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200">
                          <i className="fas fa-file"></i>
                          <span>{p.name}</span>
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{new Date(lesson.created_at).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-100" onClick={() => openView(lesson)}>
                        <i className="fas fa-eye mr-1"></i> View
                      </button>
                      <button className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-100" onClick={() => openEdit(lesson)}>
                        <i className="fas fa-pen mr-1"></i> Edit
                      </button>
                      <button className="px-2.5 py-1.5 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50" onClick={() => openDelete(lesson)}>
                        <i className="fas fa-trash mr-1"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div className="text-base font-semibold">Lesson Details</div>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" onClick={() => setViewOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="text-sm"><span className="font-medium">ID:</span> {selected.id}</div>
              <div className="text-sm"><span className="font-medium">Block:</span> {selected.block}</div>
              <div className="text-sm"><span className="font-medium">Created:</span> {new Date(selected.created_at).toLocaleString()}</div>
              <div>
                <div className="text-sm font-medium mb-2">Parts</div>
                <div className="flex flex-wrap gap-2">
                  {selected.parts.map((p) => (
                    <a key={p.id} href={p.file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200">
                      <i className="fas fa-file"></i>
                      <span>{p.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div className="text-base font-semibold">Edit Lesson</div>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" onClick={() => setEditOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="px-5 py-4 space-y-4" onSubmit={handleUpdate}>
              <div>
                <label className="block text-sm font-medium mb-1">Block</label>
                <select className="w-full px-3 py-2 border rounded-md" value={editBlock} onChange={(e) => setEditBlock(e.target.value)}>
                  <option value="A1">A1 – Beginner</option>
                  <option value="A2">A2 – Basic</option>
                  <option value="B1">B1 – Intermediate</option>
                  <option value="B2">B2 – Upper Intermediate</option>
                  <option value="C1">C1 – Advanced</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Parts</div>
                  <button type="button" className="px-2.5 py-1.5 text-xs rounded-md text-white" style={{ backgroundColor: 'var(--azul-ultramar)' }} onClick={addEditPart}>
                    <i className="fas fa-plus mr-1"></i> Add Part
                  </button>
                </div>
                <div className="space-y-3">
                  {editParts.map((p, idx) => (
                    <div key={p.id} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select className="px-3 py-2 border rounded-md" value={p.name} onChange={(e) => updateEditPartName(p.id, e.target.value)}>
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
                      <input type="file" className="px-3 py-2 border rounded-md" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => updateEditPartFile(p.id, e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                      <div className="md:col-span-2 flex justify-end">
                        <button type="button" className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-100" onClick={() => removeEditPart(p.id)}>
                          <i className="fas fa-trash mr-1"></i> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100" onClick={() => setEditOpen(false)}>Cancel</button>
                <button type="submit" className="px-3 py-2 rounded-md text-white" style={{ backgroundColor: 'var(--azul-ultramar)' }} disabled={updating}>{updating ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border">
            <div className="px-5 py-4">
              <div className="text-base font-semibold mb-2">Delete Lesson</div>
              <div className="text-sm text-gray-700 mb-4">Are you sure you want to delete this lesson?</div>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100" onClick={() => setDeleteOpen(false)}>Cancel</button>
                <button className="px-3 py-2 rounded-md text-white" style={{ backgroundColor: 'var(--azul-ultramar)' }} onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
