// src/pages/Login/OtpStep.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, ChevronLeft } from 'lucide-react';

interface OtpStepProps {
  phone: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
  error?: string;
  resendCooldown?: number;
}

export function OtpStep({
  phone,
  onVerify,
  onResend,
  onBack,
  loading,
  error,
  resendCooldown = 45,
}: OtpStepProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(resendCooldown);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Initial focus on first input
    const firstInput = inputRefs.current[0];
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const digit = rawVal.slice(-1);

    if (digit && !/^\d$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Move focus immediately — focus() doesn't need to wait for this
    // input's own re-render, so the setTimeout was unnecessary and
    // could occasionally race with typing
    if (digit && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }

    if (newOtp.every((d) => d !== '')) {
      onVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
    if (e.key === 'Enter') {
      onVerify(otp.join(''));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select input text on focus for easy replacement
    e.target.select();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const digits = pasted.split('');
    const newOtp = ['', '', '', '', '', ''];

    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });

    setOtp(newOtp);

    // Focus next empty input or last input
    const nextIndex = Math.min(digits.length, 5);
    setTimeout(() => {
      inputRefs.current[nextIndex]?.focus();
    }, 10);

    if (newOtp.every((d) => d !== '')) {
      onVerify(newOtp.join(''));
    }
  };

  const handleResend = () => {
    setTimer(resendCooldown);
    setOtp(['', '', '', '', '', '']);
    onResend();
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 10);
  };

  const formattedPhone = phone.replace(/(\d{5})(\d{5})/, '$1 $2');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <span className="text-3xl">✨</span>
          <span className="text-xl font-bold text-slate-800 ml-2">Aurora</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Change Number
          </button>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Verify Your Number</h2>
            <p className="text-sm text-slate-500 mt-1">
              We've sent a 6-digit code to <br />
              <strong className="text-slate-700">+91 {formattedPhone}</strong>
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 my-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={handleFocus}
                className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-xl outline-none transition-all bg-slate-50 ${digit
                    ? 'border-purple-500 bg-white'
                    : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                  }`}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-rose-500 text-center mb-3">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between text-sm mb-4">
            {timer > 0 ? (
              <span className="text-slate-400">Resend in {timer}s</span>
            ) : (
              <button
                onClick={handleResend}
                className="text-purple-600 font-medium hover:text-purple-700 transition-colors cursor-pointer"
              >
                Resend OTP
              </button>
            )}
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Change Number
            </button>
          </div>

          {/* Verify Button */}
          <button
            onClick={() => onVerify(otp.join(''))}
            disabled={otp.some((d) => d === '') || loading}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Secure Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Your code is secure with Aurora</span>
          </div>
        </div>
      </div>
    </div>
  );
}