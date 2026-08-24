// src/pages/Login/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { OtpStep } from './OtpStep';
import { PhoneStep } from './PhoneStep';
import { apiService } from '../../services/api';


export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // Step 1: Request OTP
  // ============================================================

  const handlePhoneSubmit = async (phoneNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.requestOtp(phoneNumber, 'login');
      setPhone(phoneNumber);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Step 2: Verify OTP
  // ============================================================

  const handleOtpVerify = async (otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.verifyOtp(phone, otp, 'login');
      // Complete login
      const loginResult = await login(result.verificationToken);

      if (loginResult.requiresTenantSelection && loginResult.tenants) {
        // Navigate to tenant selection
        navigate('/select-tenant', {
          state: {
            verificationToken: result.verificationToken,
            tenants: loginResult.tenants,
          },
        });
        return;
      }

      // Single tenant - go to dashboard
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Resend OTP
  // ============================================================

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiService.requestOtp(phone, 'login');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <>
      {step === 'phone' && (
        <PhoneStep
          onSubmit={handlePhoneSubmit}
          loading={loading}
          error={error || undefined}
        />
      )}
      {step === 'otp' && (
        <OtpStep
          phone={phone}
          onVerify={handleOtpVerify}
          onResend={handleResend}
          onBack={() => setStep('phone')}
          loading={loading}
          error={error || undefined}
          resendCooldown={45}
        />
      )}
    </>
  );
}
