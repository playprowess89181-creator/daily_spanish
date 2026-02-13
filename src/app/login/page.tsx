'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { useAuth } from '../../lib/AuthContext';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentForm, setCurrentForm] = useState('login'); // 'login', 'email', 'otp', 'newPassword'
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await login(email, password, rememberMe);

      if (result.success) {
        const isAdmin = result.user?.is_staff || result.user?.is_superuser;
        if (isAdmin) {
          router.push('/admin');
        } else if (!result.user?.referral_source) {
          router.push('/hear-about-us');
        } else if (!result.user?.legal_notice_accepted) {
          router.push('/legal-notice');
        } else {
          router.push('/profile');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    setResetEmail(email);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL + '/api/auth'}/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentForm('otp');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const otpString = otp.join('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (otpString.length !== 5) {
      setOtpError('Please enter all 5 digits');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL + '/api/auth'}/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetEmail,
          otp: otpString,
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentForm('login');
        setResetEmail('');
        setOtp(['', '', '', '', '']);
        setError('');
        // Show success message
        alert('Password reset successful! Please login with your new password.');
      } else {
        if (data.error === 'Invalid or expired OTP') {
          setOtpError(data.error);
        } else {
          setError(data.error || 'Password reset failed');
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setCurrentForm('email');
    setOtp(['', '', '', '', '']);
    setOtpError('');
    setError('');
  };

  const handleBackToLogin = () => {
    setCurrentForm('login');
    setResetEmail('');
    setOtp(['', '', '', '', '']);
    setError('');
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    const newOtp = [...otp];
    
    for (let i = 0; i < 5; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    
    setOtp(newOtp);
    setOtpError('');
    
    const focusIndex = Math.min(pastedData.length, 4);
    const focusInput = document.getElementById(`otp-${focusIndex}`);
    focusInput?.focus();
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 5) {
      setOtpError('Please enter all 5 digits');
      return;
    }
    
    setCurrentForm('newPassword');
    setOtp(['', '', '', '', '']);
  };

  const handleOTPResend = async () => {
    setIsLoading(true);
    setError('');
    setOtpError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtp(['', '', '', '', '']);
        alert('New verification code sent!');
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #86c2a8 0%, #f4d0d0 50%, #f25a37 100%)'
    }}>
      {/* Floating Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]">
        <div 
          className="absolute w-20 h-20 rounded-full opacity-10 animate-float"
          style={{
            background: '#eca400',
            top: '20%',
            left: '10%',
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute w-30 h-30 rounded-full opacity-10"
          style={{
            background: '#f25a37',
            top: '60%',
            right: '15%',
            width: '120px',
            height: '120px',
            animation: 'float 6s ease-in-out infinite 2s'
          }}
        ></div>
        <div 
          className="absolute w-15 h-15 rounded-full opacity-10"
          style={{
            background: '#3b4bb1',
            bottom: '20%',
            left: '20%',
            width: '60px',
            height: '60px',
            animation: 'float 6s ease-in-out infinite 4s'
          }}
        ></div>
      </div>

      <Navbar />

      {/* Main Content */}
      <div className="flex min-h-screen pt-16">
        {/* Left Side - Form Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50"></div>

          <div className="w-full max-w-lg relative z-10">
            {/* Login Card */}
            <div 
              className="rounded-3xl shadow-2xl p-8 border"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #3b4bb1, #f25a37)'
                    }}
                  >
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                </div>
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: 'linear-gradient(135deg, #3b4bb1, #f25a37)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {currentForm === 'login' && 'Welcome Back'}
                  {currentForm === 'email' && 'Reset Password'}
                  {currentForm === 'otp' && 'Verify Email'}
                  {currentForm === 'newPassword' && 'Create New Password'}
                </h2>
                <p className="text-gray-600">
                  {currentForm === 'login' && '¡Bienvenido de nuevo! Continue your Spanish learning journey.'}
                  {currentForm === 'email' && 'Enter your email address to receive a verification code.'}
                  {currentForm === 'otp' && "We've sent a verification code to your email address."}
                  {currentForm === 'newPassword' && 'Create a strong new password for your account.'}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {currentForm === 'login' && (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <input
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(2px)'
                      }}
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      type="email"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        autoComplete="current-password"
                        className="w-full px-4 py-3 pr-12 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(2px)'
                        }}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Image
                          src={showPassword ? '/assets/icons/eye-closed.svg' : '/assets/icons/eye-open.svg'}
                          alt="Toggle password visibility"
                          width={20}
                          height={20}
                          className="cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-2"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCurrentForm('email')}
                      className="text-sm font-semibold text-blue-600 hover:text-orange-500 transition-colors duration-200 bg-transparent border-none cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="pt-6">
                    <button
                      className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #3b4bb1, #f25a37)'
                      }}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Signing In...
                        </div>
                      ) : (
                        '🚀 Sign In & Continue Learning'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {currentForm === 'email' && (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="reset-email"
                    >
                      Email Address
                    </label>
                    <input
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(2px)'
                      }}
                      id="reset-email"
                      name="email"
                      placeholder="you@example.com"
                      type="email"
                      required
                    />
                  </div>

                  <div className="pt-6 space-y-3">
                    <button
                      className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #3b4bb1, #f25a37)'
                      }}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending Code...
                        </div>
                      ) : (
                        '📧 Send Verification Code'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="w-full py-3 px-6 rounded-xl text-gray-600 font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              )}

              {currentForm === 'otp' && (
                <form onSubmit={handleOTPSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                      Enter the 5-digit code sent to <span className="text-blue-600">{resetEmail}</span>
                    </label>
                    <div className="flex justify-center space-x-3 mb-4">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          onKeyDown={(e) => handleOTPKeyDown(index, e)}
                          onPaste={index === 0 ? handleOTPPaste : undefined}
                          className="w-12 h-12 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(2px)'
                          }}
                        />
                      ))}
                    </div>
                    {otpError && (
                      <p className="text-red-500 text-sm text-center">{otpError}</p>
                    )}
                  </div>

                  <div className="pt-6 space-y-3">
                    <button
                      className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:-translate-y-0.5"
                      style={{
                        background: 'linear-gradient(135deg, #3b4bb1, #f25a37)'
                      }}
                      type="submit"
                    >
                      ✅ Verify Code
                    </button>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleOTPResend}
                        className="flex-1 py-3 px-4 rounded-xl text-blue-600 font-semibold border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Sending...' : '🔄 Resend Code'}
                      </button>
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="flex-1 py-3 px-4 rounded-xl text-gray-600 font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                      >
                        ← Back
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {currentForm === 'newPassword' && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="newPassword"
                    >
                      New Password
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(2px)'
                      }}
                      id="newPassword"
                      name="newPassword"
                      placeholder="••••••••"
                      type="password"
                      minLength={8}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="confirmPassword"
                    >
                      Confirm New Password
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(2px)'
                      }}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="••••••••"
                      type="password"
                      minLength={8}
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Password must be at least 8 characters long and include a mix of letters, numbers, and special characters. Avoid common passwords.
                  </p>

                  <div className="pt-6 space-y-3">
                    <button
                      className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #3b4bb1, #f25a37)'
                      }}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Resetting Password...
                        </div>
                      ) : (
                        '🔒 Reset Password'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentForm('otp')}
                      className="w-full py-3 px-6 rounded-xl text-gray-600 font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                      ← Back to Verification
                    </button>
                  </div>
                </form>
              )}

              {/* Sign Up Link */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="font-semibold text-blue-600 hover:text-orange-500 transition-colors duration-200"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Design Panel */}
        <div
          className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #3b4bb1 0%, #f25a37 50%, #f4d0d0 100%)'
          }}
        >
          {/* Animated Background Elements */}
          <div
            className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 animate-pulse"
            style={{
              background: 'radial-gradient(circle, #86c2a8, transparent)'
            }}
          ></div>
          <div
            className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, #eca400, transparent)',
              animation: 'bounce 3s infinite'
            }}
          ></div>
          <div
            className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full opacity-10"
            style={{
              background: '#f4d0d0',
              animation: 'float 4s ease-in-out infinite'
            }}
          ></div>

          {/* Main Content */}
          <div className="z-10 text-center text-white px-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center border shadow-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(2px)',
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <svg
                    className="h-12 w-12 text-white"
                    fill="none"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
            </div>

            <h1
              className="font-extrabold text-5xl mb-6 leading-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              ¡Bienvenido!<br />
              <span className="text-yellow-300">Welcome Back</span>
            </h1>

            <p className="text-xl mb-8 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Continue your Spanish learning adventure.<br />
              Your progress awaits you.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4 text-left max-w-sm mx-auto">
              <div
                className="flex items-center space-x-3 rounded-lg p-3 border"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(2px)',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Pick up where you left off</span>
              </div>
              <div
                className="flex items-center space-x-3 rounded-lg p-3 border"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(2px)',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📊</span>
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>View your learning stats</span>
              </div>
              <div
                className="flex items-center space-x-3 rounded-lg p-3 border"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(2px)',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🎯</span>
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Achieve your daily goals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}
