import { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Tag,
  CalendarDays,
  Scissors,
  Percent,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { type StaffDetails, type StaffMember } from '../../../types/staff.types';
import { api } from '../../../services/api';
import type { KeyValuePair } from '../../../shared/types/common';
import { EMPLOYMENT_TYPES } from '../staff';
import { DAYS_OF_WEEK } from '../../../shared/constants/common';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedStaff: StaffMember) => void;
  initialData?: StaffMember | null;
}

const DEFAULT_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  roleId: 0,
  employmentType: 'full_time',
  isActive: true,
  employeeCode: '',
  joiningDate: new Date().toISOString().split('T')[0],
  workingHoursStart: '09:00 AM',
  workingHoursEnd: '06:00 PM',
  weeklyOff: 'Sunday',
  services: [] as number[], // ✅ number[]
  commissionRate: 0
};

export function StaffModal({ isOpen, onClose, onSave, initialData }: StaffModalProps) {
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  //const [profileImage, setProfileImage] = useState<File | null>(null);
  //const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [services, setServices] = useState<KeyValuePair[]>([]);
  const [designations, setDesignations] = useState<KeyValuePair[]>([]);
  const previewUrl = null;

  const loadReferenceData = async () => {
    try {
      const [desigRes, serviceRes] = await Promise.all([
        api.getAllDesignations(),
        api.getAllServices(),
      ]);
      if (desigRes?.success) setDesignations(desigRes.data);
      if (serviceRes?.success) setServices(serviceRes.data);
    } catch (err) {
      console.error('Failed to load modal reference data:', err);
    }
  };

  const loadStaffData = async (id: number) => {
    try {
      const res = await api.getStaffDetails(id);
      const staff = res.data as StaffDetails;
console.log(staff.schedule);
      setFormData({
        name: staff.fullName || '',
        email: staff.email || '',
        phone: staff.phone || '',
        roleId: staff.designation?.id || 0,

        employmentType: staff.employmentDetails?.type || 'full_time',
        employeeCode: staff.employmentDetails?.employeeCode || '',
        joiningDate: staff.employmentDetails?.joiningDate
          ? new Date(staff.employmentDetails.joiningDate).toISOString().split('T')[0]
          : '',
        isActive: staff.employmentDetails?.status === 'Active',

        workingHoursStart: staff.schedule?.workingHoursStart,
        workingHoursEnd: staff.schedule?.workingHoursEnd,
        weeklyOff: staff.schedule?.weeklyOff || 'Sunday',

        services: staff.services.map((service) => service.id), // ✅ number[]

        commissionRate: staff.employmentDetails?.commissionRate ?? 0,
        //avatarUrl: staff.profileImage || '',
      });
    } catch (err) {
      console.error('Failed to load staff data:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    loadReferenceData();

    if (initialData) {
      loadStaffData(initialData.id);
      //setPreviewUrl((initialData as any).avatarUrl || (initialData as any).avatar || null);
      //setProfileImage(null);
    } else {
      setFormData(DEFAULT_FORM_STATE);
      //setPreviewUrl(null);
      //setProfileImage(null);
    }
    setError('');

    // Cleanup Blob URL when modal unmounts or closes
    // return () => {
    //   if (previewUrl && previewUrl.startsWith('blob:')) {
    //     URL.revokeObjectURL(previewUrl);
    //   }
    // };
  }, [isOpen, initialData]);

  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     if (previewUrl && previewUrl.startsWith('blob:')) {
  //       URL.revokeObjectURL(previewUrl);
  //     }
  //     setProfileImage(file);
  //     const url = URL.createObjectURL(file);
  //     setPreviewUrl(url);
  //   }
  // };

  // const handleRemoveImage = () => {
  //   if (previewUrl && previewUrl.startsWith('blob:')) {
  //     URL.revokeObjectURL(previewUrl);
  //   }
  //   setPreviewUrl(null);
  //   setProfileImage(null);
  //   setFormData((prev) => ({ ...prev, avatarUrl: '' }));
  // };

  // ✅ Accept number (service ID)
  const handleToggleService = (serviceId: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name.trim()) throw new Error('Full name is required');
      if (!formData.phone.trim()) throw new Error('Phone number is required');
      if (!formData.roleId) throw new Error('Role is required');
      if (!formData.joiningDate) throw new Error('Joining date is required');

      //let uploadedAvatarUrl = formData.avatarUrl;

      //if (profileImage) {
      //const uploadResponse = await api.uploadImage(profileImage);
      //uploadedAvatarUrl = uploadResponse.data.url;
      //}

      const payload: Partial<StaffMember> & Record<string, any> = {
        id: initialData ? initialData.id : undefined,
        name: formData.name,
        email: formData.email || '',
        phone: formData.phone,
        roleId: formData.roleId,
        isActive: formData.isActive,
        employmentType: formData.employmentType,
        employeeCode: formData.employeeCode,
        designationId: formData.roleId,
        serviceIds: formData.services,
        joiningDate: formData.joiningDate,
        workingHoursStart: formData.workingHoursStart,
        workingHoursEnd: formData.workingHoursEnd,
        weeklyOff: formData.weeklyOff,
        services: formData.services,
        commissionPercentage: Number(formData.commissionRate),
      };

      onSave(payload as StaffMember);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save staff member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base">
                {initialData ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h4>
              <p className="text-xs text-purple-200 opacity-80">
                {initialData
                  ? 'Update staff details'
                  : 'Add staff details to manage their role and schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-3 px-6 flex items-center gap-2.5 text-xs text-rose-600 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-purple-600" />
                <h5 className="text-xs font-bold text-slate-700">Basic Information</h5>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Role / Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Role / Position <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  required
                >
                  <option value="">Select role / position</option>
                  {designations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    <Phone className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    placeholder="+91 Enter phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    <Mail className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    placeholder="Enter email address (optional)"
                  />
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                  Employment Details
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.employmentType}
                    onChange={(e) =>
                      setFormData({ ...formData, employmentType: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {/* Status – as a checkbox */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-700">Active</label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => {
                        const isActive = e.target.checked;
                        setFormData({
                          ...formData,
                          isActive,
                        });
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Commission Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-purple-600" />
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commissionRate}
                  onChange={(e) =>
                    setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  placeholder="0"
                />
              </div>

              {/* Services Offered */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-purple-600" />
                  Services Offered
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleToggleService(service.id)} // ✅ number
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                        formData.services.includes(service.id)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Profile & Additional Info */}
            <div className="space-y-4">
              {/* Profile Picture */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Profile Picture
                </label>
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-purple-300 transition-all">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full mx-auto object-cover"
                      />
                      <button
                        type="button"
                        //onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Upload Photo</p>
                      <p className="text-[10px] text-slate-400">JPG, PNG up to 5MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    //onChange={handleImageUpload}
                    className="hidden"
                    id="profile-image"
                  />
                  {!previewUrl && (
                    <label
                      htmlFor="profile-image"
                      className="mt-2 inline-block px-4 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                  )}
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  Employee ID (Optional)
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  placeholder="Enter employee ID"
                />
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
                  Joining Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  disabled
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  required
                />
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  Working Hours
                </label>
                {formData.workingHoursStart}
                <select
                  value={formData.workingHoursStart}
                  onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                </select>
                <select
                  value={formData.workingHoursEnd}
                  onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                >
                  <option value="06:00 PM">06:00 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                  <option value="08:00 PM">08:00 PM</option>
                  <option value="08:00 PM">08:00 PM</option>
                </select>
              </div>

              {/* Weekly Off */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  Weekly Off
                </label>
                <select
                  value={formData.weeklyOff}
                  onChange={(e) => setFormData({ ...formData, weeklyOff: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 mt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {initialData ? 'Update Staff Member' : 'Save Staff Member'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}