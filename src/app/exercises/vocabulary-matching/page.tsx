'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';

interface VocabularyItem {
  id: number;
  spanish: string;
  english: string;
  image: string;
  category: string;
}

interface Question {
  id: number;
  type: 'word-to-image' | 'image-to-word' | 'translation';
  question: string;
  correctAnswer: string;
  options: string[];
  image?: string;
}

function VocabularyMatchingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);

  // Sample vocabulary data
  const vocabularyData: VocabularyItem[] = [
    { id: 1, spanish: 'casa', english: 'house', image: '🏠', category: 'home' },
    { id: 2, spanish: 'perro', english: 'dog', image: '🐕', category: 'animals' },
    { id: 3, spanish: 'agua', english: 'water', image: '💧', category: 'drinks' },
    { id: 4, spanish: 'libro', english: 'book', image: '📚', category: 'objects' },
    { id: 5, spanish: 'sol', english: 'sun', image: '☀️', category: 'nature' },
    { id: 6, spanish: 'coche', english: 'car', image: '🚗', category: 'transport' },
    { id: 7, spanish: 'manzana', english: 'apple', image: '🍎', category: 'food' },
    { id: 8, spanish: 'gato', english: 'cat', image: '🐱', category: 'animals' },
    { id: 9, spanish: 'flor', english: 'flower', image: '🌸', category: 'nature' },
    { id: 10, spanish: 'mesa', english: 'table', image: '🪑', category: 'furniture' }
  ];

  // Generate questions
  const generateQuestions = (): Question[] => {
    const questions: Question[] = [];
    const shuffledVocab = [...vocabularyData].sort(() => Math.random() - 0.5).slice(0, 8);

    shuffledVocab.forEach((item, index) => {
      const questionTypes: ('word-to-image' | 'image-to-word' | 'translation')[] = ['word-to-image', 'image-to-word', 'translation'];
      const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let question: Question;
      const wrongOptions = vocabularyData
        .filter(v => v.id !== item.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      switch (randomType) {
        case 'word-to-image':
          question = {
            id: index + 1,
            type: 'word-to-image',
            question: `Which image represents "${item.spanish}"?`,
            correctAnswer: item.image,
            options: [item.image, ...wrongOptions.map(w => w.image)].sort(() => Math.random() - 0.5)
          };
          break;
        case 'image-to-word':
          question = {
            id: index + 1,
            type: 'image-to-word',
            question: 'What is this in Spanish?',
            correctAnswer: item.spanish,
            options: [item.spanish, ...wrongOptions.map(w => w.spanish)].sort(() => Math.random() - 0.5),
            image: item.image
          };
          break;
        case 'translation':
          question = {
            id: index + 1,
            type: 'translation',
            question: `What does "${item.spanish}" mean in English?`,
            correctAnswer: item.english,
            options: [item.english, ...wrongOptions.map(w => w.english)].sort(() => Math.random() - 0.5)
          };
          break;
      }
      questions.push(question);
    });

    return questions;
  };

  const [questions] = useState<Question[]>(generateQuestions());

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswered, gameComplete]);

  useEffect(() => {
    if (!gameComplete) return;
    const block = params.get('block') || '';
    const lessonId = params.get('lesson') || '';
    const userParam = params.get('user') || '';
    const userId = userParam || user?.id || '';
    if (!block || !lessonId || !userId) return;
    const key = `lesson_progress:${userId}`;
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

  const handleTimeUp = () => {
    setIsAnswered(true);
    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setShowResult(true);

    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setGameComplete(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameComplete(false);
    setTimeLeft(30);
    setIsAnswered(false);
  };

  const goBack = () => {
    const block = params.get('block') || '';
    const lessonId = params.get('lesson') || '';
    const qs = block && lessonId ? `?block=${encodeURIComponent(block)}&lesson=${encodeURIComponent(lessonId)}` : '';
    router.push(`/dashboard${qs}`);
  };

  if (gameComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="glass-effect rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <button onClick={goBack} className="flex items-center text-purple-600 hover:text-purple-800 transition-colors">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Lessons
              </button>
              <h1 className="text-2xl font-bold gradient-text">Vocabulary Matching</h1>
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
                {percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-6">
              <div className="text-4xl font-bold mb-2">{score}/{questions.length}</div>
              <div className="text-lg">Correct Answers</div>
              <div className="text-2xl font-semibold mt-2">{percentage}%</div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
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

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goBack} className="flex items-center text-purple-600 hover:text-purple-800 transition-colors">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </button>
            <h1 className="text-2xl font-bold gradient-text">Vocabulary Matching</h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">Question</div>
              <div className="font-bold text-lg">{currentQuestion + 1}/{questions.length}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Timer and Score */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-semibold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-700'}`}>
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

        {/* Question */}
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentQ.question}</h2>
            {currentQ.image && (
              <div className="text-8xl mb-6">{currentQ.image}</div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            {currentQ.options.map((option, index) => {
              let buttonClass = "p-6 rounded-xl border-2 transition-all duration-300 text-center font-semibold text-lg ";
              
              if (showResult) {
                if (option === currentQ.correctAnswer) {
                  buttonClass += "bg-green-100 border-green-500 text-green-800";
                } else if (option === selectedAnswer && option !== currentQ.correctAnswer) {
                  buttonClass += "bg-red-100 border-red-500 text-red-800";
                } else {
                  buttonClass += "bg-gray-100 border-gray-300 text-gray-600";
                }
              } else {
                buttonClass += "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={buttonClass}
                >
                  {currentQ.type === 'word-to-image' ? (
                    <div className="text-6xl">{option}</div>
                  ) : (
                    <div>{option}</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Result Message */}
          {showResult && (
            <div className="mt-6 text-center">
              {selectedAnswer === currentQ.correctAnswer ? (
                <div className="text-green-600 font-semibold text-xl">✅ Correct!</div>
              ) : timeLeft === 0 ? (
                <div className="text-orange-600 font-semibold text-xl">⏰ Time's up!</div>
              ) : (
                <div className="text-red-600 font-semibold text-xl">❌ Incorrect!</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VocabularyMatching() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <VocabularyMatchingInner />
    </Suspense>
  );
}
