'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Verb {
  infinitive: string;
  english: string;
  type: 'regular' | 'irregular';
  category: string;
}

interface ConjugationQuestion {
  id: number;
  verb: Verb;
  tense: string;
  pronoun: string;
  correctAnswer: string;
  userAnswer: string;
  isAnswered: boolean;
}

interface Tense {
  name: string;
  spanish: string;
  pronouns: string[];
}

export default function VerbConjugation() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [showResult, setShowResult] = useState(false);
  const [selectedTense, setSelectedTense] = useState('present');
  const [userInput, setUserInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Verb data
  const verbs: Verb[] = [
    { infinitive: 'hablar', english: 'to speak', type: 'regular', category: 'communication' },
    { infinitive: 'comer', english: 'to eat', type: 'regular', category: 'daily' },
    { infinitive: 'vivir', english: 'to live', type: 'regular', category: 'daily' },
    { infinitive: 'ser', english: 'to be', type: 'irregular', category: 'essential' },
    { infinitive: 'estar', english: 'to be', type: 'irregular', category: 'essential' },
    { infinitive: 'tener', english: 'to have', type: 'irregular', category: 'essential' },
    { infinitive: 'hacer', english: 'to do/make', type: 'irregular', category: 'action' },
    { infinitive: 'ir', english: 'to go', type: 'irregular', category: 'movement' },
    { infinitive: 'venir', english: 'to come', type: 'irregular', category: 'movement' },
    { infinitive: 'poder', english: 'can/to be able', type: 'irregular', category: 'modal' },
    { infinitive: 'querer', english: 'to want', type: 'irregular', category: 'emotion' },
    { infinitive: 'saber', english: 'to know', type: 'irregular', category: 'knowledge' }
  ];

  // Tenses
  const tenses: Record<string, Tense> = {
    present: {
      name: 'Present',
      spanish: 'Presente',
      pronouns: ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas']
    },
    preterite: {
      name: 'Preterite',
      spanish: 'Pretérito',
      pronouns: ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas']
    },
    imperfect: {
      name: 'Imperfect',
      spanish: 'Imperfecto',
      pronouns: ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas']
    }
  };

  // Conjugation rules
  const getConjugation = (verb: Verb, tense: string, pronoun: string): string => {
    const { infinitive, type } = verb;
    const stem = infinitive.slice(0, -2);
    const ending = infinitive.slice(-2);

    if (type === 'irregular') {
      return getIrregularConjugation(infinitive, tense, pronoun);
    }

    switch (tense) {
      case 'present':
        return getPresentConjugation(stem, ending, pronoun);
      case 'preterite':
        return getPreteriteConjugation(stem, ending, pronoun);
      case 'imperfect':
        return getImperfectConjugation(stem, ending, pronoun);
      default:
        return '';
    }
  };

  const getPresentConjugation = (stem: string, ending: string, pronoun: string): string => {
    const endings: Record<string, Record<string, string>> = {
      'ar': {
        'yo': 'o',
        'tú': 'as',
        'él/ella': 'a',
        'nosotros': 'amos',
        'vosotros': 'áis',
        'ellos/ellas': 'an'
      },
      'er': {
        'yo': 'o',
        'tú': 'es',
        'él/ella': 'e',
        'nosotros': 'emos',
        'vosotros': 'éis',
        'ellos/ellas': 'en'
      },
      'ir': {
        'yo': 'o',
        'tú': 'es',
        'él/ella': 'e',
        'nosotros': 'imos',
        'vosotros': 'ís',
        'ellos/ellas': 'en'
      }
    };
    return stem + endings[ending][pronoun];
  };

  const getPreteriteConjugation = (stem: string, ending: string, pronoun: string): string => {
    const endings: Record<string, Record<string, string>> = {
      'ar': {
        'yo': 'é',
        'tú': 'aste',
        'él/ella': 'ó',
        'nosotros': 'amos',
        'vosotros': 'asteis',
        'ellos/ellas': 'aron'
      },
      'er': {
        'yo': 'í',
        'tú': 'iste',
        'él/ella': 'ió',
        'nosotros': 'imos',
        'vosotros': 'isteis',
        'ellos/ellas': 'ieron'
      },
      'ir': {
        'yo': 'í',
        'tú': 'iste',
        'él/ella': 'ió',
        'nosotros': 'imos',
        'vosotros': 'isteis',
        'ellos/ellas': 'ieron'
      }
    };
    return stem + endings[ending][pronoun];
  };

  const getImperfectConjugation = (stem: string, ending: string, pronoun: string): string => {
    const endings: Record<string, Record<string, string>> = {
      'ar': {
        'yo': 'aba',
        'tú': 'abas',
        'él/ella': 'aba',
        'nosotros': 'ábamos',
        'vosotros': 'abais',
        'ellos/ellas': 'aban'
      },
      'er': {
        'yo': 'ía',
        'tú': 'ías',
        'él/ella': 'ía',
        'nosotros': 'íamos',
        'vosotros': 'íais',
        'ellos/ellas': 'ían'
      },
      'ir': {
        'yo': 'ía',
        'tú': 'ías',
        'él/ella': 'ía',
        'nosotros': 'íamos',
        'vosotros': 'íais',
        'ellos/ellas': 'ían'
      }
    };
    return stem + endings[ending][pronoun];
  };

  const getIrregularConjugation = (infinitive: string, tense: string, pronoun: string): string => {
    const irregulars: Record<string, Record<string, Record<string, string>>> = {
      'ser': {
        'present': {
          'yo': 'soy', 'tú': 'eres', 'él/ella': 'es',
          'nosotros': 'somos', 'vosotros': 'sois', 'ellos/ellas': 'son'
        },
        'preterite': {
          'yo': 'fui', 'tú': 'fuiste', 'él/ella': 'fue',
          'nosotros': 'fuimos', 'vosotros': 'fuisteis', 'ellos/ellas': 'fueron'
        },
        'imperfect': {
          'yo': 'era', 'tú': 'eras', 'él/ella': 'era',
          'nosotros': 'éramos', 'vosotros': 'erais', 'ellos/ellas': 'eran'
        }
      },
      'estar': {
        'present': {
          'yo': 'estoy', 'tú': 'estás', 'él/ella': 'está',
          'nosotros': 'estamos', 'vosotros': 'estáis', 'ellos/ellas': 'están'
        },
        'preterite': {
          'yo': 'estuve', 'tú': 'estuviste', 'él/ella': 'estuvo',
          'nosotros': 'estuvimos', 'vosotros': 'estuvisteis', 'ellos/ellas': 'estuvieron'
        },
        'imperfect': {
          'yo': 'estaba', 'tú': 'estabas', 'él/ella': 'estaba',
          'nosotros': 'estábamos', 'vosotros': 'estabais', 'ellos/ellas': 'estaban'
        }
      },
      'tener': {
        'present': {
          'yo': 'tengo', 'tú': 'tienes', 'él/ella': 'tiene',
          'nosotros': 'tenemos', 'vosotros': 'tenéis', 'ellos/ellas': 'tienen'
        },
        'preterite': {
          'yo': 'tuve', 'tú': 'tuviste', 'él/ella': 'tuvo',
          'nosotros': 'tuvimos', 'vosotros': 'tuvisteis', 'ellos/ellas': 'tuvieron'
        },
        'imperfect': {
          'yo': 'tenía', 'tú': 'tenías', 'él/ella': 'tenía',
          'nosotros': 'teníamos', 'vosotros': 'teníais', 'ellos/ellas': 'tenían'
        }
      },
      'hacer': {
        'present': {
          'yo': 'hago', 'tú': 'haces', 'él/ella': 'hace',
          'nosotros': 'hacemos', 'vosotros': 'hacéis', 'ellos/ellas': 'hacen'
        },
        'preterite': {
          'yo': 'hice', 'tú': 'hiciste', 'él/ella': 'hizo',
          'nosotros': 'hicimos', 'vosotros': 'hicisteis', 'ellos/ellas': 'hicieron'
        },
        'imperfect': {
          'yo': 'hacía', 'tú': 'hacías', 'él/ella': 'hacía',
          'nosotros': 'hacíamos', 'vosotros': 'hacíais', 'ellos/ellas': 'hacían'
        }
      },
      'ir': {
        'present': {
          'yo': 'voy', 'tú': 'vas', 'él/ella': 'va',
          'nosotros': 'vamos', 'vosotros': 'vais', 'ellos/ellas': 'van'
        },
        'preterite': {
          'yo': 'fui', 'tú': 'fuiste', 'él/ella': 'fue',
          'nosotros': 'fuimos', 'vosotros': 'fuisteis', 'ellos/ellas': 'fueron'
        },
        'imperfect': {
          'yo': 'iba', 'tú': 'ibas', 'él/ella': 'iba',
          'nosotros': 'íbamos', 'vosotros': 'ibais', 'ellos/ellas': 'iban'
        }
      }
    };

    return irregulars[infinitive]?.[tense]?.[pronoun] || '';
  };

  // Generate questions
  const generateQuestions = (): ConjugationQuestion[] => {
    const questions: ConjugationQuestion[] = [];
    const selectedVerbs = verbs.slice(0, 8);
    const availableTenses = Object.keys(tenses);

    selectedVerbs.forEach((verb, index) => {
      const tense = availableTenses[index % availableTenses.length];
      const pronouns = tenses[tense].pronouns;
      const pronoun = pronouns[Math.floor(Math.random() * pronouns.length)];
      const correctAnswer = getConjugation(verb, tense, pronoun);

      questions.push({
        id: index + 1,
        verb,
        tense,
        pronoun,
        correctAnswer,
        userAnswer: '',
        isAnswered: false
      });
    });

    return questions;
  };

  const [questions, setQuestions] = useState<ConjugationQuestion[]>(generateQuestions());

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !gameComplete && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, gameComplete, showResult]);

  const handleTimeUp = () => {
    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = userInput.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase();
    
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestion] = {
      ...currentQ,
      userAnswer: userInput.trim(),
      isAnswered: true
    };
    setQuestions(updatedQuestions);

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
    } else {
      setStreak(0);
    }

    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserInput('');
      setShowResult(false);
      setTimeLeft(45);
    } else {
      setGameComplete(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setGameComplete(false);
    setTimeLeft(45);
    setShowResult(false);
    setUserInput('');
    setQuestions(generateQuestions());
  };

  const goBack = () => {
    router.push('/dashboard');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit();
    }
  };

  if (gameComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="glass-effect rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <button onClick={goBack} className="flex items-center text-green-600 hover:text-green-800 transition-colors">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Profile
              </button>
              <h1 className="text-2xl font-bold gradient-text">Verb Conjugation</h1>
              <div></div>
            </div>
          </div>

          {/* Results */}
          <div className="glass-effect rounded-2xl p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">
                {percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : '💪'}
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-2">Exercise Complete!</h2>
              <p className="text-gray-600">
                {percentage >= 80 ? 'Excellent conjugation skills!' : percentage >= 60 ? 'Good work!' : 'Keep practicing!'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">{score}/{questions.length}</div>
                <div className="text-lg">Correct</div>
                <div className="text-xl font-semibold mt-1">{percentage}%</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">{maxStreak}</div>
                <div className="text-lg">Best Streak</div>
                <div className="text-xl font-semibold mt-1">🔥</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Practice Again
              </button>
              <button
                onClick={goBack}
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Back to Lessons
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isCorrect = showResult && currentQ.userAnswer.toLowerCase() === currentQ.correctAnswer.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goBack} className="flex items-center text-green-600 hover:text-green-800 transition-colors">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Lessons
            </button>
            <h1 className="text-2xl font-bold gradient-text">Verb Conjugation</h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">Question</div>
              <div className="font-bold text-lg">{currentQuestion + 1}/{questions.length}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-semibold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-700'}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-gray-700">Score: {score}</span>
              </div>
              <div className="flex items-center">
                <span className="text-orange-500 mr-1">🔥</span>
                <span className="font-semibold text-gray-700">Streak: {streak}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {tenses[currentQ.tense].name} ({tenses[currentQ.tense].spanish})
              </span>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                currentQ.verb.type === 'regular' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
              }`}>
                {currentQ.verb.type}
              </span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {currentQ.verb.infinitive}
            </h2>
            <p className="text-lg text-gray-600 mb-6">({currentQ.verb.english})</p>
            
            <div className="text-2xl font-semibold text-green-600 mb-6">
              Conjugate for: <span className="text-blue-600">{currentQ.pronoun}</span>
            </div>
          </div>

          {/* Input */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-4">
              <span className="text-xl font-semibold text-gray-700">{currentQ.pronoun}</span>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={showResult}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-lg font-semibold text-center focus:border-green-500 focus:outline-none disabled:bg-gray-100"
                placeholder="Type conjugation..."
                autoFocus
              />
            </div>
            
            {!showResult && (
              <div className="text-center mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {showResult && (
          <div className="glass-effect rounded-2xl p-6 text-center">
            {isCorrect ? (
              <div className="text-green-600 font-semibold text-2xl mb-4">✅ Correct!</div>
            ) : timeLeft === 0 ? (
              <div className="text-orange-600 font-semibold text-2xl mb-4">⏰ Time's up!</div>
            ) : (
              <div className="text-red-600 font-semibold text-2xl mb-4">❌ Incorrect</div>
            )}
            
            <div className="text-lg text-gray-700">
              <div className="mb-2">
                <span className="font-semibold">Your answer:</span> 
                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                  {currentQ.userAnswer || '(no answer)'}
                </span>
              </div>
              <div>
                <span className="font-semibold">Correct answer:</span> 
                <span className="text-green-600">{currentQ.correctAnswer}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
