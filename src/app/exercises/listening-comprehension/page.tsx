'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';

interface AudioQuestion {
  id: number;
  type: 'multiple-choice' | 'sentence-arrangement';
  audioUrl: string;
  transcript: string;
  question: string;
  correctAnswer: string | string[];
  options?: string[];
  words?: string[];
}

function ListeningComprehensionInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [arrangedSentence, setArrangedSentence] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  // Sample audio questions data
  const audioQuestions: AudioQuestion[] = [
    {
      id: 1,
      type: 'multiple-choice',
      audioUrl: '/audio/spanish-greeting.mp3', // This would be actual audio files
      transcript: 'Hola, ¿cómo estás?',
      question: 'What did the speaker say?',
      correctAnswer: 'Hello, how are you?',
      options: ['Hello, how are you?', 'Good morning', 'See you later', 'Thank you very much']
    },
    {
      id: 2,
      type: 'sentence-arrangement',
      audioUrl: '/audio/spanish-sentence.mp3',
      transcript: 'Me gusta mucho la comida española',
      question: 'Arrange the words in the correct order as you heard:',
      correctAnswer: ['Me', 'gusta', 'mucho', 'la', 'comida', 'española'],
      words: ['española', 'Me', 'la', 'gusta', 'comida', 'mucho']
    },
    {
      id: 3,
      type: 'multiple-choice',
      audioUrl: '/audio/spanish-time.mp3',
      transcript: 'Son las tres y media de la tarde',
      question: 'What time is it according to the speaker?',
      correctAnswer: '3:30 PM',
      options: ['2:30 PM', '3:30 PM', '4:30 PM', '3:15 PM']
    },
    {
      id: 4,
      type: 'sentence-arrangement',
      audioUrl: '/audio/spanish-weather.mp3',
      transcript: 'Hoy hace mucho calor en Madrid',
      question: 'Arrange the words as you heard them:',
      correctAnswer: ['Hoy', 'hace', 'mucho', 'calor', 'en', 'Madrid'],
      words: ['Madrid', 'calor', 'Hoy', 'en', 'hace', 'mucho']
    },
    {
      id: 5,
      type: 'multiple-choice',
      audioUrl: '/audio/spanish-family.mp3',
      transcript: 'Mi hermana tiene veinte años',
      question: 'How old is the speaker\'s sister?',
      correctAnswer: '20 years old',
      options: ['18 years old', '20 years old', '22 years old', '25 years old']
    }
  ];

  const currentQuestionData = audioQuestions[currentQuestion];

  useEffect(() => {
    const questionData = audioQuestions[currentQuestion];
    if (questionData?.type === 'sentence-arrangement') {
      setAvailableWords([...questionData.words || []]);
      setArrangedSentence([]);
    }
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

  const playAudio = () => {
    if (audioRef.current && playCount < 3) {
      setIsPlaying(true);
      // Since we don't have actual audio files, we'll simulate audio playback
      setTimeout(() => {
        setIsPlaying(false);
        setPlayCount(prev => prev + 1);
      }, 3000); // Simulate 3-second audio
      
      // In a real implementation, you would:
      // audioRef.current.play();
    }
  };

  const handleMultipleChoiceAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setShowResult(true);

    if (answer === currentQuestionData.correctAnswer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleWordClick = (word: string, fromArranged: boolean = false) => {
    if (isAnswered) return;

    if (fromArranged) {
      // Move word back to available words
      setArrangedSentence(prev => prev.filter(w => w !== word));
      setAvailableWords(prev => [...prev, word]);
    } else {
      // Move word to arranged sentence
      setAvailableWords(prev => prev.filter(w => w !== word));
      setArrangedSentence(prev => [...prev, word]);
    }
  };

  const checkSentenceArrangement = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setShowResult(true);

    const correctAnswer = currentQuestionData.correctAnswer as string[];
    const isCorrect = JSON.stringify(arrangedSentence) === JSON.stringify(correctAnswer);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < audioQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsAnswered(false);
      setPlayCount(0);
    } else {
      setGameComplete(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setArrangedSentence([]);
    setAvailableWords([]);
    setShowResult(false);
    setGameComplete(false);
    setIsAnswered(false);
    setPlayCount(0);
  };

  const getScoreColor = () => {
    const percentage = (score / audioQuestions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    const percentage = (score / audioQuestions.length) * 100;
    if (percentage >= 80) return '¡Excelente! Your listening skills are great!';
    if (percentage >= 60) return '¡Bien! Good job, keep practicing!';
    return '¡Sigue practicando! Keep practicing to improve!';
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => {
                const block = params.get('block') || '';
                const lessonId = params.get('lesson') || '';
                const qs = block && lessonId ? `?block=${encodeURIComponent(block)}&lesson=${encodeURIComponent(lessonId)}` : '';
                router.push(`/dashboard${qs}`);
              }}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Lessons
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Listening Comprehension</h1>
          </div>

          {/* Results */}
          <div className="glass-effect rounded-xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Exercise Complete!</h2>
            <p className={`text-6xl font-bold mb-4 ${getScoreColor()}`}>
              {score}/{audioQuestions.length}
            </p>
            <p className="text-xl text-gray-600 mb-6">{getScoreMessage()}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={resetGame}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Try Again
              </button>
              <button 
                onClick={() => router.push('/profile')}
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Exercises
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Listening Comprehension</h1>
        </div>

        {/* Progress Bar */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {audioQuestions.length}
            </span>
            <span className="text-sm font-medium text-indigo-600">
              Score: {score}/{audioQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{width: `${((currentQuestion + 1) / audioQuestions.length) * 100}%`}}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-effect rounded-xl p-8 border border-white/20">
          {/* Audio Player */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <button 
                onClick={playAudio}
                disabled={isPlaying || playCount >= 3}
                className="text-white hover:scale-110 transition-transform disabled:opacity-50"
              >
                {isPlaying ? (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4m-6 0a2 2 0 012-2h2a2 2 0 012 2m-6 0V8a2 2 0 012-2h2a2 2 0 012 2v2" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {isPlaying ? 'Playing audio...' : `Click to play audio (${3 - playCount} plays remaining)`}
            </p>
            {/* Hidden audio element for future implementation */}
            <audio ref={audioRef} src={currentQuestionData.audioUrl} />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {currentQuestionData.question}
          </h2>

          {/* Multiple Choice Questions */}
          {currentQuestionData.type === 'multiple-choice' && (
            <div className="space-y-4">
              {currentQuestionData.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMultipleChoiceAnswer(option)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                    isAnswered
                      ? option === currentQuestionData.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : option === selectedAnswer
                        ? 'border-red-500 bg-red-50 text-red-800'
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                </button>
              ))}
            </div>
          )}

          {/* Sentence Arrangement */}
          {currentQuestionData.type === 'sentence-arrangement' && (
            <div className="space-y-6">
              {/* Arranged Sentence Area */}
              <div className="min-h-[80px] p-4 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50">
                <p className="text-sm text-gray-600 mb-2">Your arrangement:</p>
                <div className="flex flex-wrap gap-2">
                  {arrangedSentence.map((word, index) => (
                    <button
                      key={`arranged-${index}`}
                      onClick={() => handleWordClick(word, true)}
                      disabled={isAnswered}
                      className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Words */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Available words:</p>
                <div className="flex flex-wrap gap-2">
                  {availableWords.map((word, index) => (
                    <button
                      key={`available-${index}`}
                      onClick={() => handleWordClick(word)}
                      disabled={isAnswered}
                      className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Check Answer Button */}
              {arrangedSentence.length > 0 && !isAnswered && (
                <div className="text-center">
                  <button
                    onClick={checkSentenceArrangement}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Check Answer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Result Feedback */}
          {showResult && (
            <div className={`mt-6 p-4 rounded-lg text-center ${
              (currentQuestionData.type === 'multiple-choice' && selectedAnswer === currentQuestionData.correctAnswer) ||
              (currentQuestionData.type === 'sentence-arrangement' && JSON.stringify(arrangedSentence) === JSON.stringify(currentQuestionData.correctAnswer))
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="font-semibold mb-2">
                {(currentQuestionData.type === 'multiple-choice' && selectedAnswer === currentQuestionData.correctAnswer) ||
                 (currentQuestionData.type === 'sentence-arrangement' && JSON.stringify(arrangedSentence) === JSON.stringify(currentQuestionData.correctAnswer))
                  ? '¡Correcto! Correct!'
                  : '¡Incorrecto! Incorrect!'}
              </p>
              <p className="text-sm">
                Transcript: "{currentQuestionData.transcript}"
              </p>
              {currentQuestionData.type === 'sentence-arrangement' && (
                <p className="text-sm mt-1">
                  Correct order: {(currentQuestionData.correctAnswer as string[]).join(' ')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListeningComprehension() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ListeningComprehensionInner />
    </Suspense>
  );
}
