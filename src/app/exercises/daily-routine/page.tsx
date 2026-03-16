'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';

interface Word {
  id: string;
  text: string;
  position: number;
  isPlaced: boolean;
}

interface Sentence {
  id: number;
  english: string;
  spanish: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface DraggedWord {
  word: Word;
  offset: { x: number; y: number };
}

function SentenceFormationInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const setIdRaw = params.get('set');
  const setId = setIdRaw ? Number(setIdRaw) : NaN;

  function getAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  const [title, setTitle] = useState<string>('Daily Routine');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);

  const [currentSentence, setCurrentSentence] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [draggedWord, setDraggedWord] = useState<DraggedWord | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [placedWords, setPlacedWords] = useState<(Word | null)[]>([]);

  const totalSentences = sentences.length;
  const progressPct = useMemo(() => {
    if (!totalSentences) return 0;
    return Math.round(((currentSentence + 1) / totalSentences) * 100);
  }, [currentSentence, totalSentences]);

  useEffect(() => {
    if (!user) return;
    if (!Number.isFinite(setId)) {
      setError('Missing exercise id.');
      setLoading(false);
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setError('Please log in to continue.');
      setLoading(false);
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`${API_BASE}/api/v1/daily-routine-exercises/exercise-sets/${setId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store',
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(data?.detail || 'Failed to load exercise');
          return;
        }
        const entries = Array.isArray(data?.entries) ? data.entries : [];
        const mapped: Sentence[] = entries.map((e: any) => {
          const spanishSentence = String(e.spanish_sentence || '').trim();
          const spanishWords = spanishSentence ? spanishSentence.split(/\s+/).filter(Boolean) : [];
          const wc = spanishWords.length;
          const difficulty: Sentence['difficulty'] = wc <= 4 ? 'easy' : wc <= 7 ? 'medium' : 'hard';
          return {
            id: Number(e.id),
            english: String(e.english_sentence || ''),
            spanish: spanishWords,
            difficulty,
          };
        }).filter((s: Sentence) => s.english && s.spanish.length > 0);
        const shuffled = [...mapped];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = shuffled[i];
          shuffled[i] = shuffled[j];
          shuffled[j] = tmp;
        }

        setTitle(String(data?.title || 'Daily Routine'));
        setSentences(shuffled);
        setCurrentSentence(0);
        setScore(0);
        setGameComplete(false);
        setTimeLeft(60);
        setShowResult(false);
        setIsCorrect(false);
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [API_BASE, setId, user]);

  // Initialize words for current sentence
  useEffect(() => {
    if (sentences[currentSentence]) {
      const currentSentenceWords = sentences[currentSentence].spanish;
      const shuffledWords = [...currentSentenceWords]
        .sort(() => Math.random() - 0.5)
        .map((word, index) => ({
          id: `word-${index}`,
          text: word,
          position: currentSentenceWords.indexOf(word),
          isPlaced: false
        }));
      setWords(shuffledWords);
      setPlacedWords(new Array(currentSentenceWords.length).fill(null));
    }
  }, [currentSentence, sentences]);

  const nextSentence = useCallback(() => {
    if (currentSentence < sentences.length - 1) {
      setCurrentSentence(currentSentence + 1);
      setShowResult(false);
      setTimeLeft(60);
      return;
    }
    setGameComplete(true);
  }, [currentSentence, sentences.length]);

  const handleTimeUp = useCallback(() => {
    setShowResult(true);
    setIsCorrect(false);
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !gameComplete && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && !showResult && !gameComplete) {
      handleTimeUp();
    }
  }, [gameComplete, handleTimeUp, showResult, timeLeft]);

  // Mouse move effect for drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (draggedWord) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [draggedWord]);

  const handleWordDragStart = (word: Word, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedWord({
      word,
      offset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    });
  };

  const handleWordDrop = (targetIndex: number) => {
    if (!draggedWord) return;

    const newPlacedWords = [...placedWords];
    const newWords = words.filter(w => w.id !== draggedWord.word.id);

    // Remove word from its current position if it was already placed
    const currentIndex = newPlacedWords.findIndex(w => w && w.id === draggedWord.word.id);
    if (currentIndex !== -1) {
      newPlacedWords[currentIndex] = null;
    }

    // Place word in new position
    if (newPlacedWords[targetIndex]) {
      // If slot is occupied, move that word back to available words
      newWords.push({ ...newPlacedWords[targetIndex]!, isPlaced: false });
    }

    newPlacedWords[targetIndex] = { ...draggedWord.word, isPlaced: true };
    
    setPlacedWords(newPlacedWords);
    setWords(newWords);
    setDraggedWord(null);
  };

  const handleWordRemove = (index: number) => {
    const wordToRemove = placedWords[index];
    if (!wordToRemove) return;

    const newPlacedWords = [...placedWords];
    newPlacedWords[index] = null;
    
    const newWords = [...words, { ...wordToRemove, isPlaced: false }];
    
    setPlacedWords(newPlacedWords);
    setWords(newWords);
  };

  const checkAnswer = () => {
    const currentSentenceWords = sentences[currentSentence].spanish;
    const userAnswer = placedWords.map(w => w?.text || '').filter(text => text !== '');
    
    if (userAnswer.length !== currentSentenceWords.length) {
      return;
    }

    const correct = userAnswer.every((word, index) => word === currentSentenceWords[index]);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore((s) => s + 1);
    }
  };

  const restartGame = () => {
    setCurrentSentence(0);
    setScore(0);
    setGameComplete(false);
    setTimeLeft(60);
    setShowResult(false);
  };

  const goBack = () => {
    router.push('/dashboard?tab=my-exercises');
  };

  const saveProgressAndExit = async () => {
    const token = getAccessToken();
    if (!token || !Number.isFinite(setId)) {
      goBack();
      return;
    }
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/v1/daily-routine-exercises/progress/${setId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ correct_count: score, total_count: sentences.length }),
      });
    } catch {
    } finally {
      setSubmitting(false);
      goBack();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl p-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="text-gray-700 font-semibold">Loading exercise…</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl p-8">
            <div className="text-red-600 font-semibold">{error}</div>
            <div className="mt-4">
              <button onClick={goBack} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300">
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    const percentage = Math.round((score / sentences.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="glass-effect rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <button onClick={goBack} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-bold gradient-text">{title}</h1>
              <div></div>
            </div>
          </div>

          {/* Results */}
          <div className="glass-effect rounded-2xl p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">
                {percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : '💪'}
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-2">Game Complete!</h2>
              <p className="text-gray-600">
                {percentage >= 80 ? 'Excellent sentence building!' : percentage >= 60 ? 'Good work!' : 'Keep practicing!'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-6 text-white mb-6">
              <div className="text-4xl font-bold mb-2">{score}/{sentences.length}</div>
              <div className="text-lg">Correct Sentences</div>
              <div className="text-2xl font-semibold mt-2">{percentage}%</div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Play Again
              </button>
              <button
                onClick={saveProgressAndExit}
                disabled={submitting}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black transition-all duration-300 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Save & Return'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl p-8">
            <div className="text-gray-800 font-semibold">No sentences found in this exercise.</div>
            <div className="mt-4">
              <button onClick={goBack} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300">
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSentenceData = sentences[currentSentence];
  const isComplete = placedWords.every(w => w !== null) && placedWords.length === currentSentenceData.spanish.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
              <span className="text-xs font-semibold text-gray-700">Daily Routine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 truncate">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">Sentence {currentSentence + 1} of {sentences.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={restartGame}
              className="px-4 py-2 rounded-lg bg-white/70 text-gray-800 hover:bg-white border border-white/30 shadow-sm ring-1 ring-black/5 font-semibold"
            >
              Restart
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="h-2 bg-gray-200">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-green-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm font-semibold text-gray-800">
              Score: <span className="text-blue-700">{score}</span>
              <span className="text-gray-400"> / </span>
              <span className="text-gray-700">{sentences.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold">
                <span className="text-gray-500">Time</span>{' '}
                <span className={timeLeft <= 15 ? 'text-red-600' : 'text-gray-900'}>{timeLeft}s</span>
              </div>
              <div className="text-xs font-semibold text-gray-500">{progressPct}%</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/30 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-800">Prompt</div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    currentSentenceData.difficulty === 'easy'
                      ? 'bg-green-100 text-green-800'
                      : currentSentenceData.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {currentSentenceData.difficulty.charAt(0).toUpperCase() + currentSentenceData.difficulty.slice(1)}
                </span>
              </div>
              <div className="p-6">
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-green-50 p-5">
                  <div className="text-xs font-semibold tracking-wide text-gray-500">English sentence</div>
                  <div className="mt-2 text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                    {currentSentenceData.english}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Drag words into the slots to build the Spanish sentence in the correct order.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm ring-1 ring-black/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/30 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-800">Sentence Builder</div>
                <div className="text-xs text-gray-500">Drop words into the slots</div>
              </div>

              {showResult && (
                <div className={`${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-b px-6 py-4`}>
                  <div className={`text-sm font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct!' : timeLeft === 0 ? "Time's up!" : 'Incorrect'}
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    Correct answer: <span className="font-semibold">{currentSentenceData.spanish.join(' ')}</span>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="text-sm font-semibold text-gray-800 mb-3">Your sentence</div>
                <div
                  className={`rounded-2xl border-2 border-dashed p-4 bg-gray-50 ${
                    showResult ? (isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : 'border-gray-300'
                  }`}
                >
                  <div className="flex flex-wrap gap-3 min-h-[72px]">
                    {placedWords.map((word, index) => (
                      <div
                        key={index}
                        className="relative"
                        onMouseUp={() => !word && draggedWord && handleWordDrop(index)}
                      >
                        {word ? (
                          <button
                            type="button"
                            onClick={() => handleWordRemove(index)}
                            disabled={showResult}
                            className={`inline-flex items-center gap-2 text-white px-4 py-2 rounded-xl font-semibold transition-colors ${
                              showResult ? (isCorrect ? 'bg-green-600' : 'bg-red-600') : 'bg-blue-600 hover:bg-blue-700'
                            } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span>{word.text}</span>
                            {!showResult && <span className="opacity-90">×</span>}
                          </button>
                        ) : (
                          <div className="h-10 min-w-20 px-3 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm font-semibold">
                            {index + 1}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 text-sm font-semibold text-gray-800 mb-3">Available words</div>
                <div className="flex flex-wrap gap-3">
                  {words.map((word) => (
                    <div
                      key={word.id}
                      className="select-none px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-move font-semibold text-gray-800 transition-all"
                      onMouseDown={(e) => handleWordDragStart(word, e)}
                    >
                      {word.text}
                    </div>
                  ))}
                  {words.length === 0 && (
                    <div className="text-sm text-gray-500">All words placed.</div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-sm text-gray-600">
                    {isComplete ? 'Ready to check your answer.' : 'Fill all slots to continue.'}
                  </div>
                  <div className="flex items-center gap-2">
                    {!showResult && (
                      <button
                        type="button"
                        onClick={checkAnswer}
                        disabled={!isComplete}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-white shadow-md transition-colors ${
                          isComplete ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Check Answer
                      </button>
                    )}
                    {showResult && (
                      <button
                        type="button"
                        onClick={nextSentence}
                        className="px-5 py-2.5 rounded-xl font-semibold text-white shadow-md bg-blue-600 hover:bg-blue-700"
                      >
                        {currentSentence + 1 >= sentences.length ? 'Finish' : 'Next'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {draggedWord && (
          <div
            className="fixed pointer-events-none z-50 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg"
            style={{
              left: mousePosition.x - draggedWord.offset.x,
              top: mousePosition.y - draggedWord.offset.y,
            }}
          >
            {draggedWord.word.text}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SentenceFormation() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SentenceFormationInner />
    </Suspense>
  );
}
