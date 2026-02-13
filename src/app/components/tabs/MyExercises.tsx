'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function MyExercises() {
  const router = useRouter();

  const handleExerciseClick = (exercisePath: string) => {
    router.push(exercisePath);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold gradient-text mb-6" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
        My Exercises
      </h3>
      <p className="text-gray-600 mb-8">Interactive activities to enhance your Spanish learning</p>
      
      {/* Exercise Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Vocabulary Matching Game */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">Vocabulary Matching</h4>
              <p className="text-sm text-gray-600">Select correct word/image</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Match Spanish words with their corresponding images or English translations. Test your vocabulary knowledge through visual and textual associations.</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Progress: 15/25 completed</span>
            <span className="text-sm font-semibold text-purple-600">60% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '60%'}}></div>
          </div>
          <button 
            onClick={() => handleExerciseClick('/exercises/vocabulary-matching')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Start Vocabulary Matching
          </button>
        </div>
        
        {/* Sentence Formation Game */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8l4 4m0-8l4 4-4 4m6 0v12m0 0l4-4-4-4m0 8l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">Sentence Formation</h4>
              <p className="text-sm text-gray-600">Drag & drop words</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Build correct Spanish sentences by dragging and dropping words in the proper order. Practice sentence structure and word placement.</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Progress: 12/20 completed</span>
            <span className="text-sm font-semibold text-blue-600">60% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '60%'}}></div>
          </div>
          <button 
            onClick={() => handleExerciseClick('/exercises/sentence-formation')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Start Sentence Formation
          </button>
        </div>
        
        {/* Verb Conjugation Exercises */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">Verb Conjugation</h4>
              <p className="text-sm text-gray-600">Practice verb forms</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Master Spanish verb conjugations across different tenses and persons. Practice with regular and irregular verbs in various contexts.</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Progress: 18/30 completed</span>
            <span className="text-sm font-semibold text-green-600">60% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '60%'}}></div>
          </div>
          <button 
            onClick={() => handleExerciseClick('/exercises/verb-conjugation')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Start Verb Conjugation
          </button>
        </div>
        
        {/* Grammar Multiple-Choice Tests */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">Grammar Quiz</h4>
              <p className="text-sm text-gray-600">Multiple-choice tests</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Test your Spanish grammar knowledge with comprehensive multiple-choice questions covering various grammar topics and rules.</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Progress: 22/35 completed</span>
            <span className="text-sm font-semibold text-orange-600">63% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{width: '63%'}}></div>
          </div>
          <button 
            onClick={() => handleExerciseClick('/exercises/grammar-quiz')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Start Grammar Quiz
          </button>
        </div>

        {/* Listening Comprehension */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">Listening Comprehension</h4>
              <p className="text-sm text-gray-600">Audio-based exercises</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Improve your listening skills with audio-based multiple-choice questions and sentence rearrangement exercises based on spoken Spanish.</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Progress: 8/25 completed</span>
            <span className="text-sm font-semibold text-indigo-600">32% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{width: '32%'}}></div>
          </div>
          <button 
            onClick={() => handleExerciseClick('/exercises/listening-comprehension')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Start Listening Exercise
          </button>
        </div>

        {/* Oral Expression */}
        <div className="glass-effect rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">Oral Expression</h4>
              <p className="text-sm text-gray-600">Voice recording & AI feedback</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Practice your pronunciation by recording yourself conjugating verbs. Get AI-powered feedback on your pronunciation accuracy using advanced speech recognition.</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Progress: 5/20 completed</span>
            <span className="text-sm font-semibold text-pink-600">25% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full" style={{width: '25%'}}></div>
          </div>
          <button 
            onClick={() => handleExerciseClick('/exercises/oral-expression')}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Start Oral Practice
          </button>
        </div>
      </div>
      
      {/* Exercise Statistics */}
      <div className="glass-effect rounded-xl p-6 border border-white/20 mt-8">
        <h4 className="text-xl font-bold text-gray-800 mb-4">Exercise Statistics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">15</div>
            <div className="text-sm text-gray-600">Vocabulary Matches</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Sentences Formed</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">18</div>
            <div className="text-sm text-gray-600">Verbs Conjugated</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">22</div>
            <div className="text-sm text-gray-600">Grammar Tests</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 mb-1">8</div>
            <div className="text-sm text-gray-600">Listening Exercises</div>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600 mb-1">5</div>
            <div className="text-sm text-gray-600">Oral Practices</div>
          </div>
        </div>
      </div>
    </div>
  );
}