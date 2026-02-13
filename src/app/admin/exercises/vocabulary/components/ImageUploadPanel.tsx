'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function getActiveStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem('refresh_token')) return localStorage;
  if (sessionStorage.getItem('refresh_token')) return sessionStorage;
  return localStorage;
}

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
}

async function refreshAccessToken(apiBase: string) {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const r = await fetch(`${apiBase}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    const data = await r.json();
    if (!r.ok) return null;
    const storage = getActiveStorage();
    storage?.setItem('access_token', data.access);
    if (data.refresh) storage?.setItem('refresh_token', data.refresh);
    return data.access as string;
  } catch {
    return null;
  }
}

export default function ImageUploadPanel() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedToDelete, setSelectedToDelete] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmNames, setConfirmNames] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const [token, setToken] = useState<string | null>(getAccessToken());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setToken(getAccessToken());
    setMounted(true);
  }, []);

  const previews = useMemo(() => selectedFiles.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })), [selectedFiles]);

  const removePreview = (idx: number) => {
    const next = selectedFiles.slice();
    const removed = next.splice(idx, 1);
    setSelectedFiles(next);
    if (removed[0]) URL.revokeObjectURL(previews[idx]?.url);
    if (next.length === 0 && fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const authFetch = async (input: RequestInfo, init?: RequestInit) => {
    const access = getAccessToken();
    const headers = new Headers(init?.headers || {});
    if (access) headers.set('Authorization', `Bearer ${access}`);
    let res = await fetch(input, { ...init, headers });
    if (res.status === 401) {
      let data: any = null;
      try { data = await res.clone().json(); } catch {}
      const code = data?.code || data?.detail;
      if (typeof code === 'string' && code.toLowerCase().includes('token')) {
        const newAccess = await refreshAccessToken(API_BASE);
        if (newAccess) {
          const retryHeaders = new Headers(init?.headers || {});
          retryHeaders.set('Authorization', `Bearer ${newAccess}`);
          res = await fetch(input, { ...init, headers: retryHeaders });
          setToken(newAccess);
        }
      }
    }
    return res;
  };

  const loadImages = () => {
    authFetch(`${API_BASE}/api/v1/vocabulary-exercises/images`).then(async (r) => {
      if (!r.ok) return;
      const data = await r.json();
      setExistingImages(Array.isArray(data.images) ? data.images : []);
    }).catch(() => {});
  };

  useEffect(() => {
    loadImages();
  }, [token]);

  const onUpload = async () => {
    setError(null);
    if (selectedFiles.length === 0) {
      setError('Please select images to upload');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    selectedFiles.forEach((f) => fd.append('images', f));
    try {
      const res = await authFetch(`${API_BASE}/api/v1/vocabulary-exercises/images`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.detail || 'Failed to upload images');
      } else {
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadImages();
      }
    } catch {
      setError('Network error');
    } finally {
      setUploading(false);
    }
  };

  const deleteImages = async (names: string[]) => {
    setError(null);
    if (names.length === 0) return;
    try {
      const res = await authFetch(`${API_BASE}/api/v1/vocabulary-exercises/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: names }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.detail || 'Failed to delete images');
      } else {
        setSelectedToDelete(new Set());
        loadImages();
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upload Images</h3>
        <span className="text-sm text-gray-500">{existingImages.length} uploaded</span>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />
        {selectedFiles.length > 0 && <p className="mt-2 text-sm text-gray-600">{selectedFiles.length} files selected</p>}
      </div>

      {previews.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Preview</h4>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((p, idx) => (
              <li key={`${p.name}-${idx}`} className="relative rounded-xl border border-gray-200 p-2">
                <button
                  aria-label="Remove"
                  onClick={() => removePreview(idx)}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                >
                  Remove
                </button>
                <img src={p.url} alt={p.name} className="w-full h-28 object-cover rounded-lg" />
                <div className="mt-2 text-xs text-gray-700 truncate">{p.name}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      <div className="mt-4">
        <button onClick={onUpload} disabled={uploading || selectedFiles.length === 0} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Available Images</h4>
        {existingImages.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setSelectedToDelete(new Set(existingImages))} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">
              Select All
            </button>
            <button onClick={() => setSelectedToDelete(new Set())} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">
              Deselect All
            </button>
            <button
              onClick={() => {
                if (selectedToDelete.size === 0) return;
                setConfirmNames(Array.from(selectedToDelete));
                setConfirmOpen(true);
              }}
              disabled={selectedToDelete.size === 0}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete Selected
            </button>
          </div>
        )}
        {existingImages.length === 0 ? (
          <p className="text-sm text-gray-600">No images uploaded yet.</p>
        ) : (
          <ul className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {existingImages.map((name) => {
              const url = `/api/media/vocabulary_images/${encodeURIComponent(name)}`;
              const checked = selectedToDelete.has(name);
              return (
                <li key={name} className="rounded-xl border border-gray-200 p-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="h-5 w-5" checked={checked} onChange={(e) => {
                        const next = new Set(selectedToDelete);
                        if (e.target.checked) next.add(name); else next.delete(name);
                        setSelectedToDelete(next);
                      }} />
                      <div className="text-xs text-gray-700 truncate max-w-[120px]">{name}</div>
                    </div>
                    <button
                      onClick={() => { setConfirmNames([name]); setConfirmOpen(true); }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                  <img src={url} alt={name} className="mt-2 w-full h-16 object-cover rounded-md" loading="lazy" />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {confirmOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h5 className="text-base font-semibold text-gray-900 mb-2">Confirm Deletion</h5>
            <p className="text-sm text-gray-700 mb-4">
              {confirmNames.length > 1 ? `Delete ${confirmNames.length} selected image(s)?` : `Delete image '${confirmNames[0]}'?`}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setConfirmOpen(false); setConfirmNames([]); }} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">Cancel</button>
              <button onClick={async () => { await deleteImages(confirmNames); setConfirmOpen(false); setConfirmNames([]); }} className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
