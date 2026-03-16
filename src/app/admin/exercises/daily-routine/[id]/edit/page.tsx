'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../../../../components/Sidebar';
import Header from '../../../../components/Header';
import { withAdminAuth } from '../../../../../../lib/AuthContext';

type CsvRow = { spanish_sentence: string; english_sentence: string };
type ParsedRow = { rowNumber: number; spanish_sentence: string; english_sentence: string; status: 'valid' | 'invalid' };

type ExerciseSetDetail = {
  id: number;
  title: string;
  entries: Array<{ id: number; spanish_sentence: string; english_sentence: string; created_at: string }>;
  created_at: string;
};

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  const pushField = () => {
    currentRow.push(currentField);
    currentField = '';
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        currentField += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && ch === ',') {
      pushField();
      continue;
    }

    if (!inQuotes && ch === '\n') {
      pushField();
      rows.push(currentRow);
      currentRow = [];
      continue;
    }

    if (!inQuotes && ch === '\r') continue;

    currentField += ch;
  }

  pushField();
  if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
    rows.push(currentRow);
  }

  return rows;
}

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, '_');
}

function DailyRoutineEditPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detail, setDetail] = useState<ExerciseSetDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParsedAt, setLastParsedAt] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const params = useParams<{ id: string }>();
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const setId = Number(params?.id);

  const summary = useMemo(() => {
    const total = parsedRows.length;
    const valid = parsedRows.filter((r) => r.status === 'valid').length;
    const invalid = parsedRows.filter((r) => r.status === 'invalid').length;
    return { total, valid, invalid };
  }, [parsedRows]);

  const loadDetail = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !Number.isFinite(setId)) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/v1/daily-routine-exercises/exercise-sets/${setId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) {
        setError((data as any)?.detail || 'Failed to load');
        return;
      }
      setDetail(data as ExerciseSetDetail);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, setId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const onSave = async () => {
    setError(null);
    const valid = parsedRows.filter((r) => r.status === 'valid').map((r) => ({
      spanish_sentence: r.spanish_sentence,
      english_sentence: r.english_sentence,
    })) satisfies CsvRow[];
    if (valid.length === 0) {
      setError('No valid rows to save.');
      return;
    }
    const token = getAccessToken();
    if (!token || !Number.isFinite(setId)) return;
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/daily-routine-exercises/exercise-sets/${setId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sentences: valid }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError((data as any)?.detail || 'Failed to save');
        return;
      }
      router.push('/admin/exercises/daily-routine');
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
        <Header title="Edit Daily Routine Exercise" onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 truncate">{detail?.title || 'Exercise'}</h2>
                {detail?.created_at && <div className="text-xs text-gray-500 mt-1">{new Date(detail.created_at).toLocaleString()}</div>}
              </div>
              <Link href="/admin/exercises/daily-routine" className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">Back to list</Link>
            </div>

            {loading && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-700">Loading…</p>
              </div>
            )}

            {!loading && error && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-effect rounded-xl p-6 border border-white/20">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Replace Sentences via CSV</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0] || null;
                        setCsvFile(f);
                        setParsedRows([]);
                        setError(null);
                        setLastParsedAt(null);
                        if (!f) return;
                        setParsing(true);
                        try {
                          const text = await f.text();
                          const rows = parseCsv(text);
                          if (rows.length === 0) {
                            setError('CSV is empty');
                            return;
                          }
                          const header = rows[0].map((h) => normalizeHeader(h));
                          const esIdx = header.indexOf('spanish_sentence');
                          const enIdx = header.indexOf('english_sentence');
                          if (esIdx === -1 || enIdx === -1) {
                            setError('CSV must contain headers: spanish_sentence, english_sentence');
                            return;
                          }

                          const parsed: ParsedRow[] = [];
                          for (let i = 1; i < rows.length; i++) {
                            const cols = rows[i] || [];
                            const es = (cols[esIdx] ?? '').trim();
                            const en = (cols[enIdx] ?? '').trim();
                            if (!es || !en) {
                              parsed.push({ rowNumber: i + 1, spanish_sentence: es, english_sentence: en, status: 'invalid' });
                              continue;
                            }
                            parsed.push({ rowNumber: i + 1, spanish_sentence: es, english_sentence: en, status: 'valid' });
                          }
                          setParsedRows(parsed);
                          setLastParsedAt(Date.now());
                        } catch {
                          setError('Failed to read CSV');
                        } finally {
                          setParsing(false);
                        }
                      }}
                    />
                    {!csvFile && <p className="text-sm text-gray-600">Click to select a CSV file</p>}
                    {csvFile && <p className="mt-2 text-sm text-gray-600">{csvFile.name}</p>}
                  </div>

                  {parsing && <div className="mt-4 text-sm text-gray-700">Parsing…</div>}

                  <div className="mt-6 flex items-center space-x-3">
                    <button onClick={onSave} disabled={saving || parsing || summary.valid === 0} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>

                  {csvFile && (
                    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">File Details</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div><span className="text-gray-500">Name:</span> {csvFile.name}</div>
                        <div><span className="text-gray-500">Size:</span> {(csvFile.size / 1024).toFixed(1)} KB</div>
                        <div><span className="text-gray-500">Rows:</span> {summary.total}</div>
                        <div><span className="text-gray-500">Valid:</span> {summary.valid}</div>
                        <div><span className="text-gray-500">Skipped (invalid row):</span> {summary.invalid}</div>
                        {lastParsedAt && <div><span className="text-gray-500">Parsed:</span> {new Date(lastParsedAt).toLocaleString()}</div>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Current Sentences</h4>
                    {!detail || detail.entries.length === 0 ? (
                      <p className="text-sm text-gray-700">No sentences in this exercise.</p>
                    ) : (
                      <ul className="space-y-3">
                        {detail.entries.slice(0, 50).map((e) => (
                          <li key={e.id} className="text-sm text-gray-700">
                            <div className="font-semibold text-gray-900">{e.spanish_sentence}</div>
                            <div className="text-gray-500">{e.english_sentence}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {detail && detail.entries.length > 50 && <p className="mt-3 text-xs text-gray-500">Showing first 50 rows.</p>}
                  </div>

                  {!parsing && parsedRows.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Valid Rows (Preview)</h4>
                      {summary.valid === 0 ? (
                        <p className="text-sm text-gray-700">No valid rows found.</p>
                      ) : (
                        <ul className="space-y-3">
                          {parsedRows.filter((r) => r.status === 'valid').slice(0, 30).map((r) => (
                            <li key={r.rowNumber} className="text-sm text-gray-700">
                              <div className="font-semibold text-gray-900">{r.spanish_sentence}</div>
                              <div className="text-gray-500">{r.english_sentence}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                      {summary.valid > 30 && <p className="mt-3 text-xs text-gray-500">Showing first 30 valid rows.</p>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(DailyRoutineEditPage);

