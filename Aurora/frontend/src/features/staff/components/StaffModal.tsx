// views/staff/components/StaffModal.tsx
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
  FileText,
  Users,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { type StaffMember } from '../../../shared/types/staff';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: StaffMember) => Promise<void>;
  initialData?: StaffMember | null;
}

const ROLES = [
  'Dermatologist',
  'Senior Dermatologist',
  'Esthetician',
  'Senior Esthetician',
  'Nail Specialist',
  'Hair Stylist',
  'Senior Hair Stylist',
  'Massage Therapist',
  'Laser Specialist',
];

const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Freelancer'];
const STATUS_OPTIONS = ['Active', 'Inactive'];
const WEEKLY_OFF_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  role: '',
  employmentType: 'Full Time',
  status: 'Active',
  isActive: true,
  employeeId: '',
  joiningDate: '',
  workingHours: '10:00 AM - 07:00 PM',
  weeklyOff: 'Sunday',
  services: [] as string[],
  notes: '',
  commissionRate: 0,
  completedAppointments: 0,
};

const AVAILABLE_SERVICES = ['Hair Color', 'Hair Spa', 'Highlights', 'Haircut', 'Keratin Treatment', 'HydraFacial', 'Beard Grooming'];

export function StaffModal({ isOpen, onClose, onSave, initialData }: StaffModalProps) {
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || '',
        employmentType: (initialData as any).employmentType || 'Full Time',
        status: initialData.isActive ? 'Active' : 'Inactive',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        employeeId: (initialData as any).employeeId || '',
        joiningDate: (initialData as any).joiningDate || '',
        workingHours: (initialData as any).workingHours || '10:00 AM - 07:00 PM',
        weeklyOff: (initialData as any).weeklyOff || 'Sunday',
        services: (initialData as any).services || [],
        notes: (initialData as any).notes || '',
        commissionRate: (initialData as any).commissionRate || 0,
        completedAppointments: (initialData as any).completedAppointments || 0,
      });
      setPreviewUrl(null);
      setProfileImage(null);
    } else if (isOpen) {
      setFormData(DEFAULT_FORM_STATE);
      setPreviewUrl(null);
      setProfileImage(null);
    }
    setError('');
  }, [isOpen, initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name.trim()) throw new Error('Full name is required');
      if (!formData.phone.trim()) throw new Error('Phone number is required');
      if (!formData.role) throw new Error('Role is required');
      if (!formData.joiningDate) throw new Error('Joining date is required');

      const submitData: StaffMember = {
        id: initialData?.id || 0,
        name: formData.name,
        email: formData.email || '',
        phone: formData.phone,
        role: formData.role,
        isActive: formData.status === 'Active',
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        employmentType: formData.employmentType,
        employeeId: formData.employeeId,
        joiningDate: formData.joiningDate,
        workingHours: formData.workingHours,
        weeklyOff: formData.weeklyOff,
        services: formData.services,
        notes: formData.notes,
        commissionRate: formData.commissionRate,
        totalAppointments: 0 ,
        completedAppointments:formData.completedAppointments,
        totalRevenue:0, averageRating:0, totalReviews:0
      };

      await onSave(submitData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save staff member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {initialData ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <p className="text-xs text-purple-200 opacity-80">
                {initialData ? 'Update staff details' : 'Add staff details to manage their role and schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-3 px-6 flex items-center gap-2.5 text-xs text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold text-slate-700">Basic Information</h4>
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

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Role / Position <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  required
                >
                  <option value="">Select role / position</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
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
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Services & Commission */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-purple-600" />
                  Services Offered
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_SERVICES.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleToggleService(service)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                        formData.services.includes(service)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none"
                  placeholder="Enter any additional notes about the staff member..."
                />
              </div>
            </div>

            {/* Right Column - Profile & Additional Info */}
            <div className="space-y-4">
              {/* Profile Picture */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Profile Picture</label>
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
                        onClick={() => { setPreviewUrl(null); setProfileImage(null); }}
                        className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1"
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
                    onChange={handleImageUpload}
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
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
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
                <select
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                >
                  <option value="09:00 AM - 06:00 PM">09:00 AM - 06:00 PM</option>
                  <option value="10:00 AM - 07:00 PM">10:00 AM - 07:00 PM</option>
                  <option value="11:00 AM - 08:00 PM">11:00 AM - 08:00 PM</option>
                  <option value="10:00 AM - 08:00 PM">10:00 AM - 08:00 PM</option>
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
                  {WEEKLY_OFF_OPTIONS.map((day) => (
                    <option key={day} value={day}>{day}</option>
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