'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';

interface VerbConjugation {
  id: number;
  verb: string;
  infinitive: string;
  tense: string;
  person: string;
  correctConjugation: string;
  pronunciation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface RecordingResult {
  transcription: string;
  accuracy: number;
  feedback: string;
  pronunciation_score: number;
}

function OralExpressionInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RecordingResult | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Sample verb conjugation exercises
  const verbExercises: VerbConjugation[] = [
    {
      id: 1,
      verb: 'hablar',
      infinitive: 'to speak',
      tense: 'Present',
      person: 'I (yo)',
      correctConjugation: 'hablo',
      pronunciation: 'AH-bloh',
      difficulty: 'beginner'
    },
    {
      id: 2,
      verb: 'comer',
      infinitive: 'to eat',
      tense: 'Present',
      person: 'You (tú)',
      correctConjugation: 'comes',
      pronunciation: 'KOH-mes',
      difficulty: 'beginner'
    },
    {
      id: 3,
      verb: 'vivir',
      infinitive: 'to live',
      tense: 'Present',
      person: 'He/She (él/ella)',
      correctConjugation: 'vive',
      pronunciation: 'BEE-beh',
      difficulty: 'beginner'
    },
    {
      id: 4,
      verb: 'hacer',
      infinitive: 'to do/make',
      tense: 'Present',
      person: 'We (nosotros)',
      correctConjugation: 'hacemos',
      pronunciation: 'ah-SEH-mos',
      difficulty: 'intermediate'
    },
    {
      id: 5,
      verb: 'tener',
      infinitive: 'to have',
      tense: 'Past (Preterite)',
      person: 'I (yo)',
      correctConjugation: 'tuve',
      pronunciation: 'TOO-beh',
      difficulty: 'intermediate'
    },
    {
      id: 6,
      verb: 'ser',
      infinitive: 'to be',
      tense: 'Imperfect',
      person: 'They (ellos)',
      correctConjugation: 'eran',
      pronunciation: 'EH-rahn',
      difficulty: 'advanced'
    }
  ];

  const currentExerciseData = verbExercises[currentExercise];

  // Timer effect for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setHasRecorded(true);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeRecording = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate API call to Whisper API for transcription and analysis
      // In a real implementation, you would send the audio to your backend
      // which would then call the Whisper API
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('expected_text', currentExerciseData.correctConjugation);
      formData.append('language', 'es');

      // Simulated response - in real implementation, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock analysis result based on the expected conjugation
      const mockResult: RecordingResult = {
        transcription: generateMockTranscription(),
        accuracy: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        feedback: generateMockFeedback(),
        pronunciation_score: Math.floor(Math.random() * 30) + 70
      };

      setAnalysisResult(mockResult);
      setShowFeedback(true);
      
      // Update score based on accuracy
      if (mockResult.accuracy >= 80) {
        setScore(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error analyzing recording:', error);
      alert('Error analyzing your recording. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockTranscription = (): string => {
    // Simulate various transcription results
    const variations = [
      currentExerciseData.correctConjugation,
      currentExerciseData.correctConjugation.replace(/o$/, 'a'), // Common mistake
      currentExerciseData.correctConjugation + 's', // Adding extra s
      currentExerciseData.correctConjugation.slice(0, -1), // Missing last letter
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  };

  const generateMockFeedback = (): string => {
    const feedbacks = [
      "Great pronunciation! Your accent is very clear.",
      "Good effort! Try to emphasize the stressed syllable more.",
      "Nice work! Pay attention to the vowel sounds.",
      "Well done! Your rhythm is improving.",
      "Excellent! Your pronunciation is very natural.",
      "Good job! Try to roll the 'r' sound a bit more."
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };

  const nextExercise = () => {
    if (currentExercise < verbExercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      resetExerciseState();
    } else {
      setGameComplete(true);
    }
  };

  const resetExerciseState = () => {
    setAudioBlob(null);
    setAnalysisResult(null);
    setHasRecorded(false);
    setShowFeedback(false);
    setRecordingTime(0);
  };

  const resetGame = () => {
    setCurrentExercise(0);
    setScore(0);
    setGameComplete(false);
    resetExerciseState();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = () => {
    const percentage = (score / verbExercises.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    const percentage = (score / verbExercises.length) * 100;
    if (percentage >= 80) return '¡Excelente! Your pronunciation is outstanding!';
    if (percentage >= 60) return '¡Bien! Good pronunciation, keep practicing!';
    return '¡Sigue practicando! Keep practicing to improve your pronunciation!';
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 p-4">
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
            <h1 className="text-2xl font-bold text-gray-800">Oral Expression</h1>
          </div>

          {/* Results */}
          <div className="glass-effect rounded-xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Practice Complete!</h2>
            <p className={`text-6xl font-bold mb-4 ${getScoreColor()}`}>
              {score}/{verbExercises.length}
            </p>
            <p className="text-xl text-gray-600 mb-6">{getScoreMessage()}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={resetGame}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Practice Again
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 p-4">
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
          <h1 className="text-2xl font-bold text-gray-800">Oral Expression</h1>
        </div>

        {/* Progress Bar */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Exercise {currentExercise + 1} of {verbExercises.length}
            </span>
            <span className="text-sm font-medium text-pink-600">
              Score: {score}/{verbExercises.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300"
              style={{width: `${((currentExercise + 1) / verbExercises.length) * 100}%`}}
            ></div>
          </div>
        </div>

        {/* Exercise Card */}
        <div className="glass-effect rounded-xl p-8 border border-white/20">
          {/* Exercise Info */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(currentExerciseData.difficulty)}`}>
                {currentExerciseData.difficulty.charAt(0).toUpperCase() + currentExerciseData.difficulty.slice(1)}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {currentExerciseData.tense}
              </span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {currentExerciseData.verb}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {currentExerciseData.infinitive}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-700 mb-2">
                <strong>Conjugate for:</strong> {currentExerciseData.person}
              </p>
              <p className="text-2xl font-bold text-pink-600 mb-2">
                {currentExerciseData.correctConjugation}
              </p>
              <p className="text-sm text-gray-500">
                Pronunciation: /{currentExerciseData.pronunciation}/
              </p>
            </div>
          </div>

          {/* Recording Section */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-pink-300 animate-pulse"></div>
              )}
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className="text-white hover:scale-110 transition-transform disabled:opacity-50"
              >
                {isRecording ? (
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                ) : (
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            </div>
            
            <p className="text-lg text-gray-700 mb-4">
              {isRecording 
                ? `Recording... ${recordingTime}s` 
                : hasRecorded 
                ? 'Recording complete!' 
                : 'Click to start recording'
              }
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Say the conjugated verb clearly into your microphone
            </p>

            {/* Analyze Button */}
            {hasRecorded && !showFeedback && (
              <button
                onClick={analyzeRecording}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Pronunciation'
                )}
              </button>
            )}
          </div>

          {/* Feedback Section */}
          {showFeedback && analysisResult && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">AI Feedback</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Accuracy Score</p>
                  <p className={`text-3xl font-bold ${analysisResult.accuracy >= 80 ? 'text-green-600' : analysisResult.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {analysisResult.accuracy}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Pronunciation Score</p>
                  <p className={`text-3xl font-bold ${analysisResult.pronunciation_score >= 80 ? 'text-green-600' : analysisResult.pronunciation_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {analysisResult.pronunciation_score}%
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">What we heard:</p>
                <p className="text-lg font-semibold text-gray-800">"{analysisResult.transcription}"</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Feedback:</p>
                <p className="text-gray-700">{analysisResult.feedback}</p>
              </div>

              <div className="text-center">
                <button
                  onClick={nextExercise}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  {currentExercise < verbExercises.length - 1 ? 'Next Exercise' : 'Complete Practice'}
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Speak clearly and at a normal pace. The AI will analyze your pronunciation and provide feedback to help you improve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OralExpression() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <OralExpressionInner />
    </Suspense>
  );
}
