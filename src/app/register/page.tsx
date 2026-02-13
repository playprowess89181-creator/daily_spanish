'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import OTPVerification from '../components/OTPVerification';
import { useAuth } from '../../lib/AuthContext';
import { COUNTRIES, LANGUAGES } from '../../lib/options';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    nativeLanguage: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const requestData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      country: formData.country,
      native_language: formData.nativeLanguage
    };

    try {
      const response = await fetch( `${process.env.NEXT_PUBLIC_API_BASE_URL + '/api/auth'}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle detailed validation errors
        if (data.details) {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(data.details)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          }
          throw new Error(errorMessages.join('; '));
        }
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Verification email sent! Please check your inbox.');
      setShowOTPVerification(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL + '/api/auth'}/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      // Auto-login after successful verification
      const result = await login(formData.email, formData.password, true);
      if (!('success' in result) || !result.success) {
        throw new Error('Auto-login failed after verification');
      }
      setSuccess('Email verified successfully! Let’s finish onboarding...');
      router.push('/hear-about-us');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const handleOTPResend = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL + '/api/auth'}/resend-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setSuccess('New verification code sent!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend code');
    }
  };

  const handleBackToRegistration = () => {
    setShowOTPVerification(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--verde-menta) 0%, var(--rosa-palo) 50%, var(--naranja) 100%)' }}>
      {/* Floating Background Shapes */}
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex min-h-screen pt-16">
        {/* Left Side - Enhanced Design Panel */}
        <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3B4BB1 0%, #F25A37 50%, #E6A5A5 100%)' }}>
          {/* Animated Background Elements */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #86C2A8, transparent)' }}></div>
          <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full opacity-15 animate-bounce" style={{ background: 'radial-gradient(circle, #ECA400, transparent)', animationDuration: '3s' }}></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full opacity-10" style={{ background: '#E6A5A5', animation: 'float 4s ease-in-out infinite' }}></div>
          
          {/* Main Content */}
          <div className="z-10 text-center text-white px-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-2xl">
                  <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <h1 className="font-extrabold text-5xl mb-6 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              ¡Hola! Welcome to<br/>
              <span className="text-yellow-300">Daily Spanish</span>
            </h1>
            
            <p className="text-xl mb-8 text-white/90 leading-relaxed">
              Embark on an extraordinary linguistic adventure.<br/>
              Your journey to mastering Spanish starts here.
            </p>
            
            {/* Feature highlights */}
            <div className="space-y-4 text-left max-w-sm mx-auto">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <span className="text-white/90">Interactive lessons & exercises</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🎯</span>
                </div>
                <span className="text-white/90">Personalized learning path</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🏆</span>
                </div>
                <span className="text-white/90">Track your progress daily</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Enhanced Form Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50"></div>
          
          <div className="w-full max-w-lg relative z-10">
            {/* Registration Card or OTP Verification */}
            {showOTPVerification ? (
              <div>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                    {success}
                  </div>
                )}
                <OTPVerification
                  email={formData.email}
                  onVerify={handleOTPVerify}
                  onResend={handleOTPResend}
                  onBack={handleBackToRegistration}
                />
              </div>
            ) : (
            <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #3B4BB1, #F25A37)' }}>
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Create Your Account
                </h2>
                <p className="text-gray-600">
                  ¡Comienza tu aventura en español! <br/> Start your Spanish journey today.
                </p>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
                      Name
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      id="name"
                      name="name"
                      placeholder="e.g. Maria Rodriguez"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="country">
                      Country
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 pr-10 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white/80 backdrop-blur-sm appearance-none"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      >
                      <option disabled value="">
                        Select your country
                      </option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Image
                          src="/assets/icons/chevron-down.svg"
                          alt="Dropdown"
                          width={20}
                          height={20}
                          className="text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="nativeLanguage">
                    Native Language
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 pr-10 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white/80 backdrop-blur-sm appearance-none"
                      id="nativeLanguage"
                      name="nativeLanguage"
                      value={formData.nativeLanguage}
                      onChange={handleInputChange}
                      required
                    >
                    <option disabled value="">
                      Select your native language
                    </option>
                    {LANGUAGES.map((language) => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                    <option>Portuguese</option>
                    <option>Italian</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Image
                        src="/assets/icons/chevron-down.svg"
                        alt="Dropdown"
                        width={20}
                        height={20}
                        className="text-gray-400"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-r-xl transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Image
                        src={showPassword ? '/assets/icons/eye-closed.svg' : '/assets/icons/eye-open.svg'}
                        alt={showPassword ? 'Hide password' : 'Show password'}
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    Password must be at least 8 characters and not too common (avoid simple passwords like 'password123')
                  </p>
                </div>
                
                <div className="pt-6">
                  <button
                    className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'btn-gradient hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200'
                    }`}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      '🚀 Sign Up & Start Learning'
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <span>Already have an account?</span>
                  <Link
                    className="font-bold text-blue-600 hover:text-orange-500 transition-colors duration-200 underline decoration-2 underline-offset-2"
                    href="/login"
                  >
                    Sign In →
                  </Link>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
