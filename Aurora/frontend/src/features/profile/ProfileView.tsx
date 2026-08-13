import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import type { ProfileData } from '../../types/profile.types';
import { useAuth } from '../../context/AuthContext';

export function ProfileView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    id: 0,
    fullName: '',
    email: '',
    phone: '',
    birthday: '',
    gender: null,
    systemRole: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = await api.getCurrentUserProfile();
        setFormData({
          id: user.id,
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          birthday: user.birthday ? user.birthday.split('T')[0] : '',
          gender: user.gender || null,
          systemRole: user.systemRole || 'Customer',
        });
      } catch (err) {
        setError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateProfile({
          fullName: formData.fullName,
          email: formData.email,
          birthday: formData.birthday || undefined,
          gender: formData.gender || undefined,
        });
      await refreshUser();
    //toast.success('Profile updated successfully');
     
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.fullName
    ? formData.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500">Manage your personal details and preferences.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {initials}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{formData.fullName || 'User'}</h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 font-medium text-xs rounded-full border border-purple-200">
              {formData.systemRole || 'Customer'}
            </span>
          </div>
        </div>

        {/* Editable & Readonly Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              disabled
              className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Birthday</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div>
  <label className="block text-xs font-semibold text-slate-700 mb-2">
    Gender
  </label>

  <div className="flex flex-wrap gap-6">
    {[
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ].map((option) => (
      <label
        key={option.value}
        className="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="radio"
          name="gender"
          value={option.value}
          checked={formData.gender === option.value}
          onChange={handleChange}
          className="h-4 w-4 border-slate-300 text-purple-600 focus:ring-purple-500"
        />
        <span className="text-sm text-slate-700">{option.label}</span>
      </label>
    ))}
  </div>
</div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}