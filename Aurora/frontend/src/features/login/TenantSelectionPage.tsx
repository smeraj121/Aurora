// src/pages/TenantSelection/TenantSelectionPage.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Check, ArrowRight } from 'lucide-react';

interface LocationState {
  verificationToken: string;
  tenants: Array<{
    tenantId: number;
    tenantName: string;
    role: string;
    logoUrl?: string;
  }>;
}

export function TenantSelectionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const state = location.state as LocationState;

  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state?.tenants) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">No tenants found. Please try logging in again.</p>
        <button
          onClick={() => navigate('/login')}
          className="ml-2 text-purple-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const { verificationToken, tenants } = state;

  const handleSelect = async (tenantId: number) => {
    setSelectedTenantId(tenantId);
  };

  const handleContinue = async () => {
    if (!selectedTenantId) return;

    setLoading(true);
    setError(null);
    try {
      const result = await login(verificationToken, selectedTenantId);
      if (!result.requiresTenantSelection) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to select tenant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Select Your Business</h2>
            <p className="text-sm text-slate-500 mt-1">
              You have access to multiple locations
            </p>
          </div>

          {/* Tenant List */}
          <div className="space-y-3 mb-6">
            {tenants.map((tenant) => (
              <button
                key={tenant.tenantId}
                onClick={() => handleSelect(tenant.tenantId)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  selectedTenantId === tenant.tenantId
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {tenant.logoUrl ? (
                    <img
                      src={tenant.logoUrl}
                      alt={tenant.tenantName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{tenant.tenantName}</div>
                  <div className="text-xs text-slate-500">Role: {tenant.role}</div>
                </div>
                {selectedTenantId === tenant.tenantId && (
                  <Check className="w-5 h-5 text-purple-600" />
                )}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-sm text-rose-500 text-center mb-3">{error}</p>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedTenantId || loading}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}