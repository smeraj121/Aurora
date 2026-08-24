// src/pages/Login/PhoneStep.tsx
import React, { useState } from 'react';
import { ArrowRight, Shield } from 'lucide-react';

interface PhoneStepProps {
  onSubmit: (phone: string) => void;
  loading: boolean;
  error?: string;
}

export function PhoneStep({ onSubmit, loading, error }: PhoneStepProps) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      onSubmit(phone);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">✨</span>
            <span className="text-xl font-bold text-slate-800">Aurora</span>
          </div>
          <p className="text-sm text-slate-500">Salon & Clinic Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Welcome to Aurora</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your mobile number to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center border-2 border-slate-200 rounded-xl focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                <span className="pl-4 pr-2 text-slate-500 font-medium">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  maxLength={10}
                  className="w-full px-3 py-3.5 outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-rose-500 mt-1.5">{error}</p>
              )}
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl">
              <span>📱</span>
              <span>We'll send a verification code on your phone</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={phone.length < 10 || loading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Secure */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure & Encrypted</span>
            </div>

            {/* Terms */}
            <p className="text-center text-[11px] text-slate-400 mt-4">
              By continuing, you agree to our{' '}
              <a href="#" className="text-purple-600 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
