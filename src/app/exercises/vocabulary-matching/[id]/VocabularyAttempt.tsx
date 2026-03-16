'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type Question =
  | {
      mode: 'image_to_text';
      prompt: { image_name: string };
      options: Array<{ word: string }>;
      answer: { word: string };
    }
  | {
      mode: 'audio_to_image';
      prompt: { audio_name: string | null };
      options: Array<{ image_name: string }>;
      answer: { image_name: string };
    };

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default function VocabularyAttempt({ setId }: { setId: number }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  const [title, setTitle] = useState<string>('Vocabulary Matching');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const total = questions.length;
  const current = questions[index];

  const progressPct = useMemo(() => {
    if (!total) return 0;
    return Math.round(((index + 1) / total) * 100);
  }, [index, total]);

  useEffect(() => {
    const run = async () => {
      const token = getAccessToken();
      if (!token) {
        setError('Please log in to continue.');
        setLoading(false);
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/v1/vocabulary-exercises/exercise-sets/${setId}/questions`, {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store',
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(data?.detail || 'Failed to load exercise');
          return;
        }
        setTitle(data?.title || 'Vocabulary Matching');
        setQuestions(Array.isArray(data?.questions) ? data.questions : []);
        setIndex(0);
        setSelectedKey(null);
        setRevealed(false);
        setCorrectCount(0);
        setCompleted(false);
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [API_BASE, setId]);

  useEffect(() => {
    setAudioReady(false);
    setAudioPlaying(false);
    const audio = audioRef.current;
    if (!audio) return;
    const onCanPlay = () => setAudioReady(true);
    const onPlay = () => setAudioPlaying(true);
    const onPause = () => setAudioPlaying(false);
    const onEnded = () => setAudioPlaying(false);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [current?.mode, index]);

  const correctKey = useMemo(() => {
    if (!current) return null;
    if (current.mode === 'image_to_text') return current.answer.word;
    return current.answer.image_name;
  }, [current]);

  const onSelect = (key: string) => {
    if (!current || revealed) return;
    setSelectedKey(key);
    setRevealed(true);
    if (key === correctKey) setCorrectCount((c) => c + 1);
    if (audioRef.current) audioRef.current.pause();
  };

  const goNext = () => {
    if (!revealed) return;
    const next = index + 1;
    if (next >= total) {
      setCompleted(true);
      return;
    }
    setIndex(next);
    setSelectedKey(null);
    setRevealed(false);
  };

  const submitAndExit = async () => {
    const token = getAccessToken();
    if (!token) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/v1/vocabulary-exercises/progress/${setId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ correct_count: correctCount, total_count: total }),
      });
    } catch {
    } finally {
      setSubmitting(false);
      window.location.href = '/dashboard?tab=my-exercises';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              <span className="text-xs font-semibold text-gray-700">Vocabulary Matching</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 truncate">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {completed ? 'Completed' : total ? `Question ${index + 1} of ${total}` : '—'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard?tab=my-exercises" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold">
              Back
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="h-2 bg-gray-200">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">
              Score: <span className="text-purple-700">{correctCount}</span>
              <span className="text-gray-400"> / </span>
              <span className="text-gray-700">{total || 0}</span>
            </div>
            <div className="text-xs font-semibold text-gray-500">{progressPct}%</div>
          </div>
        </div>

        {loading && (
          <div className="mt-6 rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5 p-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
              <div className="text-gray-700 font-semibold">Loading exercise…</div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5 p-6">
            <div className="text-sm text-red-600 font-semibold">{error}</div>
          </div>
        )}

        {!loading && !error && !completed && current && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/30 flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-800">
                    {current.mode === 'image_to_text' ? 'Image → Text' : 'Audio → Image'}
                  </div>
                  {current.mode === 'audio_to_image' && (
                    <div className="text-xs font-semibold text-gray-500">{audioReady ? 'Ready' : 'Loading…'}</div>
                  )}
                </div>

                {current.mode === 'image_to_text' && (
                  <div className="p-6">
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-inner">
                      <img
                        src={`/api/media/exercise_images/${encodeURIComponent(current.prompt.image_name)}`}
                        alt="Question"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
                    </div>
                    <div className="mt-4 text-xs text-gray-500 text-center">Choose the correct word</div>
                  </div>
                )}

                {current.mode === 'audio_to_image' && (
                  <div className="p-6">
                    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 p-5">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            const a = audioRef.current;
                            if (!a) return;
                            if (audioPlaying) a.pause();
                            else a.play();
                          }}
                          className={cx(
                            'h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md transition-colors',
                            audioPlaying ? 'bg-purple-700 hover:bg-purple-800' : 'bg-purple-600 hover:bg-purple-700'
                          )}
                        >
                          <i className={cx('fas', audioPlaying ? 'fa-pause' : 'fa-play')} />
                        </button>

                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">Listen and pick the correct image</div>
                          <div className="mt-2 flex items-center gap-1">
                            {Array.from({ length: 18 }).map((_, i) => (
                              <div
                                key={i}
                                className={cx(
                                  'w-1 rounded-full bg-purple-300/70',
                                  audioPlaying ? 'animate-pulse' : '',
                                  i % 3 === 0 ? 'h-6' : i % 3 === 1 ? 'h-3' : 'h-5'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <audio
                        ref={audioRef}
                        src={current.prompt.audio_name ? `/api/media/exercise_audio/${encodeURIComponent(current.prompt.audio_name)}` : undefined}
                        preload="auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/30 flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-800">Answer Options</div>
                  <div className="text-xs text-gray-500">Pick one</div>
                </div>

                <div className="p-6">
                  {current.mode === 'image_to_text' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {current.options.map((o) => {
                        const key = o.word;
                        const isSelected = selectedKey === key;
                        const isCorrect = key === correctKey;
                        const isWrongSelected = revealed && isSelected && !isCorrect;
                        const showCorrect = revealed && isCorrect;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => onSelect(key)}
                            disabled={revealed}
                            className={cx(
                              'rounded-xl px-4 py-3 text-left border transition-all',
                              'bg-white hover:bg-gray-50',
                              revealed ? 'cursor-not-allowed opacity-95' : 'cursor-pointer',
                              showCorrect ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200',
                              isWrongSelected ? 'border-red-500 ring-2 ring-red-200' : '',
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold text-gray-900">{o.word}</div>
                              {showCorrect && <span className="text-green-600 text-sm font-bold">Correct</span>}
                              {isWrongSelected && <span className="text-red-600 text-sm font-bold">Wrong</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {current.mode === 'audio_to_image' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {current.options.map((o) => {
                        const key = o.image_name;
                        const isSelected = selectedKey === key;
                        const isCorrect = key === correctKey;
                        const isWrongSelected = revealed && isSelected && !isCorrect;
                        const showCorrect = revealed && isCorrect;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => onSelect(key)}
                            disabled={revealed}
                            className={cx(
                              'rounded-2xl overflow-hidden border transition-all bg-white group',
                              revealed ? 'cursor-not-allowed opacity-95' : 'cursor-pointer hover:shadow-md',
                              showCorrect ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200',
                              isWrongSelected ? 'border-red-500 ring-2 ring-red-200' : '',
                            )}
                          >
                            <div className="relative">
                              <img
                                src={`/api/media/exercise_images/${encodeURIComponent(o.image_name)}`}
                                alt="Option"
                                className="w-full h-40 object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              {showCorrect && (
                                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-green-600 text-white text-xs font-bold shadow">
                                  Correct
                                </div>
                              )}
                              {isWrongSelected && (
                                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold shadow">
                                  Wrong
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-sm text-gray-600">
                      {revealed && selectedKey === correctKey && <span className="text-green-700 font-semibold">Nice! That’s correct.</span>}
                      {revealed && selectedKey !== correctKey && <span className="text-red-700 font-semibold">Not quite. The correct option is highlighted.</span>}
                    </div>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!revealed}
                      className={cx(
                        'px-5 py-2.5 rounded-xl font-semibold text-white shadow-md transition-colors',
                        revealed ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-300 cursor-not-allowed'
                      )}
                    >
                      {index + 1 >= total ? 'Finish' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && completed && (
          <div className="mt-6 rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/30 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-800">Completed</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">Score: {correctCount} / {total}</div>
              </div>
              <button
                type="button"
                onClick={submitAndExit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow-md bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Save & Return'}
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-semibold text-gray-500">Correct</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">{correctCount}</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-semibold text-gray-500">Total</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{total}</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-semibold text-gray-500">Accuracy</div>
                  <div className="text-2xl font-bold text-purple-700 mt-1">
                    {total ? Math.round((correctCount / total) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-600">
                Your progress updates in <span className="font-semibold text-gray-800">My Exercises</span> after saving.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

