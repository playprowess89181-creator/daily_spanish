'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';

interface GrammarQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizResult {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

function GrammarQuizInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Grammar questions data
  const grammarQuestions: GrammarQuestion[] = [
    {
      id: 1,
      question: "Which article should be used with 'mesa' (table)?",
      options: ["el", "la", "los", "las"],
      correctAnswer: "la",
      explanation: "'Mesa' is a feminine noun, so it uses the feminine article 'la'.",
      category: "Articles",
      difficulty: "easy"
    },
    {
      id: 2,
      question: "What is the correct plural form of 'niño' (boy)?",
      options: ["niña", "niños", "niñas", "niñes"],
      correctAnswer: "niños",
      explanation: "Masculine nouns ending in 'o' form their plural by adding 's'.",
      category: "Plurals",
      difficulty: "easy"
    },
    {
      id: 3,
      question: "Choose the correct form: 'Yo _____ español.'",
      options: ["habla", "hablas", "hablo", "hablan"],
      correctAnswer: "hablo",
      explanation: "With 'yo' (I), regular -ar verbs end in 'o' in the present tense.",
      category: "Verb Conjugation",
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Which preposition means 'on' or 'above'?",
      options: ["en", "sobre", "bajo", "entre"],
      correctAnswer: "sobre",
      explanation: "'Sobre' means 'on' or 'above'. 'En' means 'in', 'bajo' means 'under', 'entre' means 'between'.",
      category: "Prepositions",
      difficulty: "medium"
    },
    {
      id: 5,
      question: "What is the correct possessive adjective: '_____ casa es grande' (Our house is big)?",
      options: ["Mi", "Tu", "Nuestra", "Su"],
      correctAnswer: "Nuestra",
      explanation: "'Nuestra' is the feminine form of 'our' and agrees with 'casa' (feminine).",
      category: "Possessive Adjectives",
      difficulty: "medium"
    },
    {
      id: 6,
      question: "Choose the correct subjunctive form: 'Espero que tú _____ bien.'",
      options: ["estás", "estés", "estar", "estado"],
      correctAnswer: "estés",
      explanation: "After 'espero que' (I hope that), we use the present subjunctive. 'Estés' is the subjunctive form of 'estar' for 'tú'.",
      category: "Subjunctive",
      difficulty: "hard"
    },
    {
      id: 7,
      question: "Which sentence uses 'ser' correctly?",
      options: [
        "Ella es en la cocina",
        "Ella es doctora",
        "Ella es comiendo",
        "Ella es muy cansada ahora"
      ],
      correctAnswer: "Ella es doctora",
      explanation: "'Ser' is used for permanent characteristics and professions. 'Doctora' is a profession.",
      category: "Ser vs Estar",
      difficulty: "medium"
    },
    {
      id: 8,
      question: "What is the correct direct object pronoun for 'los libros'?",
      options: ["lo", "la", "los", "las"],
      correctAnswer: "los",
      explanation: "'Los libros' is masculine plural, so the direct object pronoun is 'los'.",
      category: "Pronouns",
      difficulty: "medium"
    },
    {
      id: 9,
      question: "Choose the correct conditional form: 'Yo _____ a España si tuviera dinero.'",
      options: ["voy", "iré", "iría", "fui"],
      correctAnswer: "iría",
      explanation: "In conditional sentences with 'si' + imperfect subjunctive, we use the conditional tense. 'Iría' is the conditional of 'ir'.",
      category: "Conditional",
      difficulty: "hard"
    },
    {
      id: 10,
      question: "Which reflexive pronoun goes with 'nosotros'?",
      options: ["me", "te", "se", "nos"],
      correctAnswer: "nos",
      explanation: "The reflexive pronoun for 'nosotros' is 'nos'.",
      category: "Reflexive Pronouns",
      difficulty: "easy"
    }
  ];

  const [questions] = useState<GrammarQuestion[]>(
    grammarQuestions.sort(() => Math.random() - 0.5).slice(0, 8)
  );

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswered, gameComplete]);

  // Reset timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

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
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const result: QuizResult = {
      questionId: questions[currentQuestion].id,
      userAnswer: '',
      isCorrect: false,
      timeSpent
    };
    setResults([...results, result]);
    setIsAnswered(true);
    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = answer === questions[currentQuestion].correctAnswer;
    
    const result: QuizResult = {
      questionId: questions[currentQuestion].id,
      userAnswer: answer,
      isCorrect,
      timeSpent
    };
    
    setResults([...results, result]);
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setShowResult(true);

    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsAnswered(false);
      setTimeLeft(40);
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
    setTimeLeft(40);
    setIsAnswered(false);
    setResults([]);
  };

  const goBack = () => {
    const block = params.get('block') || '';
    const lessonId = params.get('lesson') || '';
    if (block && lessonId) {
      router.push(`/dashboard?block=${encodeURIComponent(block)}&lesson=${encodeURIComponent(lessonId)}`);
    } else {
      router.push('/profile');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Articles': 'bg-blue-100 text-blue-800',
      'Plurals': 'bg-purple-100 text-purple-800',
      'Verb Conjugation': 'bg-green-100 text-green-800',
      'Prepositions': 'bg-orange-100 text-orange-800',
      'Possessive Adjectives': 'bg-pink-100 text-pink-800',
      'Subjunctive': 'bg-red-100 text-red-800',
      'Ser vs Estar': 'bg-indigo-100 text-indigo-800',
      'Pronouns': 'bg-teal-100 text-teal-800',
      'Conditional': 'bg-amber-100 text-amber-800',
      'Reflexive Pronouns': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (gameComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const averageTime = results.length > 0 ? 
      Math.round(results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="glass-effect rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <button onClick={goBack} className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Lessons
              </button>
              <h1 className="text-2xl font-bold gradient-text">Grammar Quiz</h1>
              <div></div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="glass-effect rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : '📚'}
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-2">Quiz Complete!</h2>
              <p className="text-gray-600">
                {percentage >= 80 ? 'Excellent grammar knowledge!' : 
                 percentage >= 60 ? 'Good understanding!' : 'Keep studying grammar!'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white text-center">
                <div className="text-3xl font-bold mb-2">{score}/{questions.length}</div>
                <div className="text-lg">Correct Answers</div>
                <div className="text-xl font-semibold mt-1">{percentage}%</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white text-center">
                <div className="text-3xl font-bold mb-2">{averageTime}s</div>
                <div className="text-lg">Average Time</div>
                <div className="text-xl font-semibold mt-1">⏱️</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white text-center">
                <div className="text-3xl font-bold mb-2">{results.filter(r => r.isCorrect).length}</div>
                <div className="text-lg">Streak Record</div>
                <div className="text-xl font-semibold mt-1">🔥</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Take Quiz Again
              </button>
              <button
                onClick={goBack}
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Back to Exercises
              </button>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Question Review</h3>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const result = results[index];
                const isCorrect = result?.isCorrect || false;
                
                return (
                  <div key={question.id} className={`p-4 rounded-xl border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                            {question.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-800 mb-2">{question.question}</p>
                        <div className="text-sm text-gray-600">
                          <div className="mb-1">
                            <span className="font-medium">Your answer:</span> 
                            <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {result?.userAnswer || '(no answer)'}
                            </span>
                          </div>
                          <div className="mb-1">
                            <span className="font-medium">Correct answer:</span> 
                            <span className="text-green-600">{question.correctAnswer}</span>
                          </div>
                          <div className="text-gray-500 italic">{question.explanation}</div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className={`text-2xl ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                          {isCorrect ? '✅' : '❌'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {result?.timeSpent || 0}s
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goBack} className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </button>
            <h1 className="text-2xl font-bold gradient-text">Grammar Quiz</h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">Question</div>
              <div className="font-bold text-lg">{currentQuestion + 1}/{questions.length}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Timer and Score */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentQ.category)}`}>
                {currentQ.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQ.difficulty)}`}>
                {currentQ.difficulty.charAt(0).toUpperCase() + currentQ.difficulty.slice(1)}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentQ.question}</h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, index) => {
              let buttonClass = "p-4 rounded-xl border-2 transition-all duration-300 text-left font-semibold ";
              
              if (showResult) {
                if (option === currentQ.correctAnswer) {
                  buttonClass += "bg-green-100 border-green-500 text-green-800";
                } else if (option === selectedAnswer && option !== currentQ.correctAnswer) {
                  buttonClass += "bg-red-100 border-red-500 text-red-800";
                } else {
                  buttonClass += "bg-gray-100 border-gray-300 text-gray-600";
                }
              } else {
                buttonClass += "bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Result Message */}
        {showResult && (
          <div className="glass-effect rounded-2xl p-6 text-center">
            {selectedAnswer === currentQ.correctAnswer ? (
              <div className="text-green-600 font-semibold text-xl mb-4">✅ Correct!</div>
            ) : timeLeft === 0 ? (
              <div className="text-orange-600 font-semibold text-xl mb-4">⏰ Time’s up!</div>
            ) : (
              <div className="text-red-600 font-semibold text-xl mb-4">❌ Incorrect!</div>
            )}
            
            <div className="bg-blue-50 rounded-xl p-4 text-left">
              <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
              <p className="text-blue-700">{currentQ.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GrammarQuiz() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <GrammarQuizInner />
    </Suspense>
  );
}
