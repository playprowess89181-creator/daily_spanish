'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export default function OTPVerification({ email, onVerify, onResend, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(5).fill(null));

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 4 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 5) {
      setIsLoading(true);
      try {
        await onVerify(otpString);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #3B4BB1, #F25A37)' }}>
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-2">
          We've sent a 5-digit verification code to
        </p>
        <p className="text-orange-600 font-semibold">
          {email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
            Enter Verification Code
          </label>
          <div className="flex justify-center space-x-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white/80 backdrop-blur-sm outline-none"
              />
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!isComplete || isLoading}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 ${
              isComplete && !isLoading
                ? 'btn-gradient hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              '✅ Verify Email'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center space-y-4">
        <div className="text-sm text-gray-600">
          Didn't receive the code?
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className={`ml-2 font-bold transition-colors duration-200 underline decoration-2 underline-offset-2 ${
              isResending
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-orange-500'
            }`}
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
        
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Registration</span>
        </button>
      </div>
    </div>
  );
}