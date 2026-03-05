'use client';

import React, { Suspense, useEffect, useState } from 'react';
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
  category: string;
}

interface DraggedWord {
  word: Word;
  offset: { x: number; y: number };
}

function SentenceFormationInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const [currentSentence, setCurrentSentence] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [draggedWord, setDraggedWord] = useState<DraggedWord | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Sample sentences data
  const sentencesData: Sentence[] = [
    {
      id: 1,
      english: "I eat an apple",
      spanish: ["Yo", "como", "una", "manzana"],
      difficulty: 'easy',
      category: 'food'
    },
    {
      id: 2,
      english: "The cat is sleeping",
      spanish: ["El", "gato", "está", "durmiendo"],
      difficulty: 'easy',
      category: 'animals'
    },
    {
      id: 3,
      english: "We are studying Spanish",
      spanish: ["Nosotros", "estamos", "estudiando", "español"],
      difficulty: 'medium',
      category: 'education'
    },
    {
      id: 4,
      english: "She lives in a big house",
      spanish: ["Ella", "vive", "en", "una", "casa", "grande"],
      difficulty: 'medium',
      category: 'home'
    },
    {
      id: 5,
      english: "My friends are playing football",
      spanish: ["Mis", "amigos", "están", "jugando", "fútbol"],
      difficulty: 'medium',
      category: 'sports'
    },
    {
      id: 6,
      english: "The teacher explains the lesson very well",
      spanish: ["El", "profesor", "explica", "la", "lección", "muy", "bien"],
      difficulty: 'hard',
      category: 'education'
    }
  ];

  const [sentences] = useState<Sentence[]>(sentencesData.slice(0, 5));
  const [words, setWords] = useState<Word[]>([]);
  const [placedWords, setPlacedWords] = useState<(Word | null)[]>([]);

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

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !gameComplete && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, gameComplete, showResult]);

  useEffect(() => {
    if (!gameComplete) return;
    const block = params.get('block') || '';
    const lessonId = params.get('lesson') || '';
    if (!block || !lessonId || !user) return;
    const key = `lesson_progress:${user.id}`;
    let obj: Record<string, string[]> = { A1: [], A2: [], B1: [], B2: [], C1: [] };
    try {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (raw) obj = JSON.parse(raw);
    } catch {}
    const arr = obj[block] || [];
    if (!arr.includes(lessonId)) arr.push(lessonId);
    obj[block] = arr;
    try {
      const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
      storage.setItem(key, JSON.stringify(obj));
    } catch {}
    try {
      window.postMessage({ type: 'exercise:complete', block, lesson: lessonId }, '*');
    } catch {}
  }, [gameComplete, params, user]);

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

  const handleTimeUp = () => {
    setShowResult(true);
    setIsCorrect(false);
    setTimeout(() => {
      nextSentence();
    }, 3000);
  };

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
      setScore(score + 1);
    }

    setTimeout(() => {
      nextSentence();
    }, 3000);
  };

  const nextSentence = () => {
    if (currentSentence < sentences.length - 1) {
      setCurrentSentence(currentSentence + 1);
      setShowResult(false);
      setTimeLeft(60);
    } else {
      setGameComplete(true);
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
    router.push('/dashboard');
  };

  if (gameComplete) {
    const percentage = Math.round((score / sentences.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="glass-effect rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <button onClick={goBack} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Lessons
              </button>
              <h1 className="text-2xl font-bold gradient-text">Sentence Formation</h1>
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
                onClick={goBack}
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Back to Exercises
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goBack} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </button>
            <h1 className="text-2xl font-bold gradient-text">Sentence Formation</h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">Sentence</div>
              <div className="font-bold text-lg">{currentSentence + 1}/{sentences.length}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentSentence + 1) / sentences.length) * 100}%` }}
            ></div>
          </div>

          {/* Timer and Score */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-semibold ${timeLeft <= 15 ? 'text-red-600' : 'text-gray-700'}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-gray-700">Score: {score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* English Sentence */}
        <div className="glass-effect rounded-2xl p-6 mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Translate to Spanish:</h2>
          <p className="text-2xl font-bold text-blue-600">"{currentSentenceData.english}"</p>
          <div className="mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentSentenceData.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              currentSentenceData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentSentenceData.difficulty.charAt(0).toUpperCase() + currentSentenceData.difficulty.slice(1)}
            </span>
          </div>
        </div>

        {/* Drop Zone */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Build your sentence:</h3>
          <div className="flex flex-wrap gap-3 min-h-[80px] p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            {placedWords.map((word, index) => (
              <div
                key={index}
                className="relative"
                onMouseUp={() => !word && draggedWord && handleWordDrop(index)}
              >
                {word ? (
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer hover:bg-blue-600 transition-colors group">
                    {word.text}
                    <button
                      onClick={() => handleWordRemove(index)}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-10 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400">
                    {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available Words */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available words:</h3>
          <div className="flex flex-wrap gap-3">
            {words.map((word) => (
              <div
                key={word.id}
                className="bg-white border-2 border-gray-300 px-4 py-2 rounded-lg font-semibold cursor-move hover:border-blue-400 hover:shadow-md transition-all duration-200 select-none"
                onMouseDown={(e) => handleWordDragStart(word, e)}
              >
                {word.text}
              </div>
            ))}
          </div>
        </div>

        {/* Check Answer Button */}
        {isComplete && !showResult && (
          <div className="text-center mb-8">
            <button
              onClick={checkAnswer}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Check Answer
            </button>
          </div>
        )}

        {/* Result Message */}
        {showResult && (
          <div className="glass-effect rounded-2xl p-6 text-center">
            {isCorrect ? (
              <div className="text-green-600 font-semibold text-2xl">✅ Correct! Well done!</div>
            ) : timeLeft === 0 ? (
              <div className="text-orange-600 font-semibold text-2xl">⏰ Time's up!</div>
            ) : (
              <div className="text-red-600 font-semibold text-2xl">❌ Incorrect. Try again next time!</div>
            )}
            <div className="mt-4 text-gray-600">
              Correct answer: <span className="font-semibold">{currentSentenceData.spanish.join(' ')}</span>
            </div>
          </div>
        )}

        {/* Dragged Word */}
        {draggedWord && (
          <div
            className="fixed pointer-events-none z-50 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg"
            style={{
              left: mousePosition.x - draggedWord.offset.x,
              top: mousePosition.y - draggedWord.offset.y,
            }}
          >
            {draggedWord.word.text}
          </div>
        )}
      </div>
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
