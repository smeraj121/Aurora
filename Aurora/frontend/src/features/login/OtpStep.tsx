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
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      onVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      onVerify(otp.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    const digits = pasted.split('');
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6 && /^\d$/.test(digit)) {
        newOtp[i] = digit;
      }
    });
    setOtp(newOtp);
    if (newOtp.every((d) => d !== '')) {
      onVerify(newOtp.join(''));
    }
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
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-xl outline-none transition-all bg-slate-50 ${
                  digit
                    ? 'border-purple-500 bg-white'
                    : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                }`}
                autoComplete="off"
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
                onClick={onResend}
                className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
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
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
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

          {/* Secure */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Your code is secure with Aurora</span>
          </div>
        </div>
      </div>
    </div>
  );
}