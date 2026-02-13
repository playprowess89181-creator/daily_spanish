"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

const API_LESSONS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/lessons';

interface LessonPart { name: string }
interface Lesson { id: string; block: string; parts: LessonPart[]; created_at: string }

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

export default function MyCourses() {
  const [activeBlock, setActiveBlock] = useState('A1');
  const { user } = useAuth();
  const avatarGender: 'male' | 'female' = (user?.gender?.toLowerCase() === 'female' ? 'female' : 'male');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, Set<string>>>({ A1: new Set(), A2: new Set(), B1: new Set(), B2: new Set(), C1: new Set() });
  const router = useRouter();
  const params = useSearchParams();

  const blocks = useMemo(() => ([
    { id: 'A1', name: 'A1 – Beginner', grammarLessons: 38, reviewLessons: 2, exam: 1, color: 'from-green-400 to-blue-500' },
    { id: 'A2', name: 'A2 – Basic', grammarLessons: 34, reviewLessons: 2, exam: 1, color: 'from-blue-400 to-purple-500' },
    { id: 'B1', name: 'B1 – Intermediate', grammarLessons: 15, reviewLessons: 2, exam: 1, color: 'from-purple-400 to-pink-500' },
    { id: 'B2', name: 'B2 – Upper Intermediate', grammarLessons: 38, reviewLessons: 2, exam: 1, color: 'from-pink-400 to-red-500' },
    { id: 'C1', name: 'C1 – Advanced', grammarLessons: 25, reviewLessons: 2, exam: 1, color: 'from-red-400 to-orange-500' }
  ]), []);

  const byBlock = useMemo(() => {
    const m: Record<string, Lesson[]> = { A1: [], A2: [], B1: [], B2: [], C1: [] };
    lessons.forEach((l) => {
      if (l.block && l.block in m) m[l.block].push(l);
    });
    for (const k of Object.keys(m)) {
      m[k] = m[k].slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return m;
  }, [lessons]);

  const totals = useMemo(() => {
    const totalLessons = lessons.length;
    const partsCount = lessons.reduce((sum, l) => sum + (Array.isArray(l.parts) ? l.parts.length : 0), 0);
    const listeningLessons = lessons.filter((l) => Array.isArray(l.parts) && l.parts.some((p) => String(p.name).toLowerCase() === 'listening')).length;
    return { totalLessons, partsCount, listeningLessons };
  }, [lessons]);

  const currentList = byBlock[activeBlock] || [];
  const completedSet = completed[activeBlock] || new Set<string>();
  const completedCount = currentList.filter((l) => completedSet.has(l.id)).length;

  const currentBlock = blocks.find(b => b.id === activeBlock);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_LESSONS_BASE}/lessons/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) {
          if (res.ok) {
            setLessons(Array.isArray(data.lessons) ? data.lessons : []);
          } else {
            setError(data.error || 'Failed to load lessons');
          }
        }
      } catch {
        if (!cancelled) setError('Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const handler = () => load();
    if (typeof window !== 'undefined') window.addEventListener('lessons:changed', handler);
    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') window.removeEventListener('lessons:changed', handler);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const key = `lesson_progress:${user.id}`;
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch {}
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, string[]>;
        const next: Record<string, Set<string>> = { A1: new Set(), A2: new Set(), B1: new Set(), B2: new Set(), C1: new Set() };
        for (const k of Object.keys(next)) {
          const arr = parsed[k] || [];
          next[k] = new Set(arr);
        }
        setCompleted(next);
      } catch {}
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const key = `lesson_progress:${user.id}`;
    const obj: Record<string, string[]> = { A1: [], A2: [], B1: [], B2: [], C1: [] };
    for (const k of Object.keys(obj)) {
      obj[k] = Array.from(completed[k] || new Set());
    }
    try {
      const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
      storage.setItem(key, JSON.stringify(obj));
    } catch {}
  }, [completed, user]);

  useEffect(() => {
    const block = params.get('block') || '';
    const lessonId = params.get('lesson') || '';
    if (!block || !lessonId) return;
    setActiveBlock(block);
    setCompleted((prev) => {
      const copy: Record<string, Set<string>> = { A1: new Set(prev.A1), A2: new Set(prev.A2), B1: new Set(prev.B1), B2: new Set(prev.B2), C1: new Set(prev.C1) };
      const set = copy[block] || new Set<string>();
      set.add(lessonId);
      copy[block] = set;
      return copy;
    });
  }, [params]);

  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data as any;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'exercise:complete') {
        const blockId = String(data.block || '');
        const lessonId = String(data.lesson || '');
        if (!blockId || !lessonId) return;
        setCompleted((prev) => {
          const copy: Record<string, Set<string>> = { A1: new Set(prev.A1), A2: new Set(prev.A2), B1: new Set(prev.B1), B2: new Set(prev.B2), C1: new Set(prev.C1) };
          const set = copy[blockId] || new Set<string>();
          set.add(lessonId);
          copy[blockId] = set;
          return copy;
        });
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [user]);

  const toggleComplete = (blockId: string, lessonId: string) => {
    setCompleted((prev) => {
      const copy: Record<string, Set<string>> = { A1: new Set(prev.A1), A2: new Set(prev.A2), B1: new Set(prev.B1), B2: new Set(prev.B2), C1: new Set(prev.C1) };
      const set = copy[blockId] || new Set<string>();
      if (set.has(lessonId)) set.delete(lessonId); else set.add(lessonId);
      copy[blockId] = set;
      return copy;
    });
  };

  const EXERCISE_MAP: Record<string, string> = {
    vocabulary: '/exercises/vocabulary-matching',
    listening: '/exercises/listening-comprehension',
    grammar: '/exercises/grammar-quiz',
    writing: '/exercises/sentence-formation',
    speech: '/exercises/oral-expression',
    pronunciation: '/exercises/oral-expression',
    conversation: '/exercises/oral-expression',
    reading: '/exercises/grammar-quiz',
  };

  const openExerciseForLesson = (l: Lesson) => {
    const target = (l.parts || [])
      .map((p) => EXERCISE_MAP[String(p.name).toLowerCase()])
      .find((route) => !!route) || '/exercises/grammar-quiz';
    const url = `${target}?block=${encodeURIComponent(activeBlock)}&lesson=${encodeURIComponent(l.id)}&user=${encodeURIComponent(user?.id || '')}`;
    router.push(url);
  };

  const renderRoadmap = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${avatarGender === 'male' ? 'from-blue-500 to-indigo-600' : 'from-pink-500 to-rose-600'}`}>
              <i className={`fas ${avatarGender === 'male' ? 'fa-male' : 'fa-female'}`}></i>
            </div>
            <div>
              <div className="text-sm text-neutral-600">Your Progress</div>
              <div className="text-lg font-semibold text-neutral-900">{currentBlock?.name || 'Select a block'}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-center">
              <div className="text-xl font-bold text-neutral-900">{totals.totalLessons}</div>
              <div className="text-xs text-neutral-600">Lessons</div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-center">
              <div className="text-xl font-bold text-neutral-900">{totals.partsCount}</div>
              <div className="text-xs text-neutral-600">Parts</div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-center">
              <div className="text-xl font-bold text-neutral-900">{totals.listeningLessons}</div>
              <div className="text-xs text-neutral-600">Listening</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-neutral-800">Overall Progress</div>
            <div className="text-sm text-neutral-600">{completedCount}/{currentList.length} completed</div>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500"
              style={{ width: `${Math.round((completedCount / Math.max(currentList.length, 1)) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {blocks.map((block) => {
            const count = byBlock[block.id]?.length || 0;
            const maxCount = Math.max(...Object.values(byBlock).map((arr) => arr.length), 1);
            const progress = Math.round((count / maxCount) * 100);
            const partsSum = (byBlock[block.id] || []).reduce((s, l) => s + (Array.isArray(l.parts) ? l.parts.length : 0), 0);
            return (
              <div key={block.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-neutral-900">{block.name}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-700">{block.id}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-neutral-600">{count} lessons · {partsSum} parts</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Level View */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <div className="flex flex-wrap gap-2 mb-6">
          {blocks.map((block) => (
            <button
              key={block.id}
              onClick={() => setActiveBlock(block.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeBlock === block.id
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg'
                  : 'bg-white/70 text-gray-700 hover:bg-white/90'
              }`}
            >
              {block.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {(() => {
            const arr = currentList;
            const nextIdx = arr.findIndex((l) => !completedSet.has(l.id));
            return arr.map((l, i) => {
              const isCompleted = completedSet.has(l.id);
              const isCurrent = !isCompleted && i === nextIdx;
              return (
                <div
                  key={l.id}
                  onClick={() => openExerciseForLesson(l)}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : isCurrent
                      ? 'bg-orange-100 border-orange-300 text-orange-800 ring-2 ring-orange-200'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <p className="text-xs font-medium">Lesson {i + 1}</p>
                  </div>
                  
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );


  return (
    <div>
      <h3 className="text-2xl font-bold gradient-text mb-6" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
        Lessons & Learning Roadmap
      </h3>
      
      {renderRoadmap()}
    </div>
  );
}
