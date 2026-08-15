import React, { useState } from 'react';
import {
  LockKeyhole,
  ShieldCheck,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { superAdminLogin } = useAuth();

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (phone.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (!pin.trim()) {
      setError('Please enter the secret PIN.');
      return;
    }

    try {
      setLoading(true);

      await superAdminLogin(
        phone,
        pin
      );

      navigate('/tenants', {
        replace: true,
      });
    } catch (err: any) {
      console.error(
        'Super admin login failed:',
        err
      );

      setError(
        err.message ||
        'Invalid credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">

      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">✨</span>

            <span className="text-xl font-bold text-slate-800">
              Aurora
            </span>
          </div>

          <p className="text-sm text-slate-500">
            Platform Administration
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 rounded-xl bg-purple-100
                            flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              Platform Administrator
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Sign in to manage Aurora tenants
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50
                            border border-rose-200 text-sm text-rose-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mobile Number
              </label>

              <div className="flex items-center border-2 border-slate-200
                              rounded-xl focus-within:border-purple-500
                              focus-within:ring-2
                              focus-within:ring-purple-500/20">

                <Phone className="w-4 h-4 ml-4 text-slate-400" />

                <span className="px-2 text-slate-500 font-medium">
                  +91
                </span>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  placeholder="98765 43210"
                  maxLength={10}
                  className="w-full px-2 py-3.5 outline-none
                             bg-transparent text-slate-800
                             placeholder:text-slate-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Secret PIN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Secret PIN
              </label>

              <div className="flex items-center border-2 border-slate-200
                              rounded-xl focus-within:border-purple-500
                              focus-within:ring-2
                              focus-within:ring-purple-500/20">

                <LockKeyhole className="w-4 h-4 ml-4 text-slate-400" />

                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  placeholder="Enter secret PIN"
                  className="w-full px-3 py-3.5 outline-none
                             bg-transparent text-slate-800
                             placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                phone.length < 10 ||
                !pin ||
                loading
              }
              className="w-full py-3.5 bg-purple-600
                         hover:bg-purple-700 text-white
                         font-semibold rounded-xl transition-all
                         disabled:opacity-50
                         disabled:cursor-not-allowed
                         flex items-center justify-center gap-2
                         shadow-lg shadow-purple-600/30"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white
                                  border-t-transparent rounded-full
                                  animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="flex items-center justify-center gap-2
                          text-xs text-slate-400 mt-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure platform access</span>
          </div>

        </div>

        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-xs text-slate-500
                       hover:text-purple-600"
          >
            ← Back to business login
          </button>
        </div>

      </div>
    </div>
  );
}