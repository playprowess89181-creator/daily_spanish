'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';
import { withAdminAuth } from '../../../../../lib/AuthContext';

type ParsedPreview = {
  vocabulary: Array<{ word: string; imageName: string }>;
  exercises: Array<{ type: string; question: string; options: string[]; answer: string }>;
  errors: string[];
};

function CreateVocabularyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  function useAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }
  const token = useAccessToken();


  const onParse = async () => {
    setError(null);
    setPreview(null);
    if (!documentFile) {
      setError('Please select a Word/PDF document');
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append('document', documentFile);
    try {
      const res = await fetch(`${API_BASE}/api/v1/vocabulary-exercises/parse`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : undefined, body: fd });
      const data = await res.json();
      if (!res.ok) {
        const raw = data?.detail || 'Failed to parse';
        const normalized = typeof raw === 'string' ? raw.toLowerCase() : '';
        const friendly = normalized.includes('parser is not installed')
          ? 'Document parsing is not available on the server. Please upload a DOCX/PDF or contact support.'
          : raw;
        setError(friendly);
      } else {
        setPreview({
          vocabulary: data.vocabulary || [],
          exercises: data.exercises || [],
          errors: data.errors || [],
        });
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    setError(null);
    if (!documentFile) {
      setError('Please select a Word/PDF document');
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append('document', documentFile);
    try {
      const res = await fetch(`${API_BASE}/api/v1/vocabulary-exercises/upload`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : undefined, body: fd });
      const data = await res.json();
      if (!res.ok) {
        const raw = data?.detail || 'Failed to save';
        const normalized = typeof raw === 'string' ? raw.toLowerCase() : '';
        const friendly = normalized.includes('parser is not installed')
          ? 'Document parsing is not available on the server. Please upload a DOCX/PDF or contact support.'
          : raw;
        setError(friendly);
      } else {
        router.push('/admin/exercises/vocabulary');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} activeItem="exercises" />

      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title="Create Vocabulary Exercise" onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">New Vocabulary Exercise</h2>
              <Link href="/admin/exercises/vocabulary" className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">Back to list</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-effect rounded-xl p-6 border border-white/20">
                <label className="block text-sm font-medium text-gray-700 mb-2">Word/PDF Document</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input type="file" accept=".doc,.docx,.pdf" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
                  {documentFile && <p className="mt-2 text-sm text-gray-600">{documentFile.name}</p>}
                </div>

                

                {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

                <div className="mt-6 flex items-center space-x-3">
                  <button onClick={onParse} disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Parsing…' : 'Parse'}</button>
                  <button onClick={onSave} disabled={saving || !!(preview && preview.errors && preview.errors.length)} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </div>

              <div className="space-y-6">
                {preview && (preview.vocabulary.length > 0 || preview.exercises.length > 0 || (preview.errors && preview.errors.length > 0)) && (
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Vocabulary</h4>
                      <ul className="space-y-2">
                        {preview.vocabulary.map((v, i) => (
                          <li key={i} className="flex justify-between text-sm text-gray-700">
                            <span>{v.word}</span>
                            <span className="text-gray-500">{v.imageName}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Exercises</h4>
                      <ul className="space-y-3">
                        {preview.exercises.map((e, i) => (
                          <li key={i} className="text-sm text-gray-700">
                            <div className="font-medium">{e.type}</div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">Q:</span>
                              <span>{e.question}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">Options:</span>
                              <span>{e.options.join(', ')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">Answer:</span>
                              <span className="text-green-600 font-medium">{e.answer}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {preview.errors && preview.errors.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                        <h4 className="text-md font-semibold text-red-700 mb-3">Validation Errors</h4>
                        <ul className="list-disc pl-6 text-sm text-red-700">
                          {preview.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {preview && preview.vocabulary.length === 0 && preview.exercises.length === 0 && (!preview.errors || preview.errors.length === 0) && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-sm text-gray-700">No items were parsed from the document. Please ensure the format is correct.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(CreateVocabularyPage);
