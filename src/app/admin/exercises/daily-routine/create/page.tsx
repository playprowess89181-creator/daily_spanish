'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';
import { withAdminAuth } from '../../../../../lib/AuthContext';

type CsvRow = { spanish_sentence: string; english_sentence: string };
type ParsedRow = { rowNumber: number; spanish_sentence: string; english_sentence: string; status: 'valid' | 'invalid' };

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

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function DailyRoutineCreatePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParsedAt, setLastParsedAt] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  const summary = useMemo(() => {
    const total = parsedRows.length;
    const valid = parsedRows.filter((r) => r.status === 'valid').length;
    const invalid = parsedRows.filter((r) => r.status === 'invalid').length;
    return { total, valid, invalid };
  }, [parsedRows]);

  const downloadTemplate = () => {
    const csv = 'spanish_sentence,english_sentence\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_routine_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onSave = async () => {
    setError(null);
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }
    const valid = parsedRows.filter((r) => r.status === 'valid').map((r) => ({
      spanish_sentence: r.spanish_sentence,
      english_sentence: r.english_sentence,
    })) satisfies CsvRow[];
    if (valid.length === 0) {
      setError('No valid rows to save.');
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/daily-routine-exercises/exercise-sets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sentences: valid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
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
        <Header title="Create Daily Routine Exercise" onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">New Daily Routine Exercise</h2>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Link href="/admin/exercises/daily-routine" className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">Back to list</Link>
                <button type="button" onClick={downloadTemplate} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Download template
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-effect rounded-xl p-6 border border-white/20">
                <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
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

                {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

                <div className="mt-6 flex items-center space-x-3">
                  <button
                    onClick={onSave}
                    disabled={saving || parsing || summary.valid === 0}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Upload / Save'}
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
                {parsing && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-sm text-gray-700">Parsing…</p>
                  </div>
                )}
                {!parsing && parsedRows.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Valid Rows</h4>
                    {summary.valid === 0 ? (
                      <p className="text-sm text-gray-700">No valid rows found.</p>
                    ) : (
                      <ul className="space-y-3">
                        {parsedRows.filter((r) => r.status === 'valid').slice(0, 50).map((r) => (
                          <li key={r.rowNumber} className="text-sm text-gray-700">
                            <div className="font-semibold text-gray-900">{r.spanish_sentence}</div>
                            <div className="text-gray-500">{r.english_sentence}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {summary.valid > 50 && <p className="mt-3 text-xs text-gray-500">Showing first 50 valid rows.</p>}
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

export default withAdminAuth(DailyRoutineCreatePage);

