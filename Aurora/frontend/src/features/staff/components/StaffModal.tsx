import { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    Clock,
    CheckCircle2,
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
import { BaseModal } from '../../modal/BaseModal';

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
    services: [] as number[],
    commissionRate: 0
};

export function StaffModal({ isOpen, onClose, onSave, initialData }: StaffModalProps) {
    const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [services, setServices] = useState<KeyValuePair[]>([]);
    const [designations, setDesignations] = useState<KeyValuePair[]>([]);
    // const previewUrl = null; // Commented: profile image preview

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
                services: staff.services.map((service) => service.id),
                commissionRate: staff.employmentDetails?.commissionRate ?? 0,
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
        } else {
            setFormData(DEFAULT_FORM_STATE);
        }
        setError('');
    }, [isOpen, initialData]);

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

    const footerActions = (
        <>
            <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-modal-secondary"
            >
                Cancel
            </button>
            <button
                type="submit"
                form="staff-form"
                disabled={loading}
                className="btn-modal-primary flex items-center gap-2"
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
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Staff Member' : 'Add New Staff Member'}
            icon={User}
            error={error}
            footer={footerActions}
            maxWidth="max-w-3xl"
        >
            <form id="staff-form" onSubmit={handleSubmit} className="space-y-5">
                {/* Two-column grid for basic + additional info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* LEFT COLUMN — Basic Info (2/3) */}
                    <div className="md:col-span-2 space-y-3.5">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-600" />
                            <h5 className="modal-label">Basic Information</h5>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="modal-label">
                                Full Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="modal-input"
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        {/* Role / Designation */}
                        <div>
                            <label className="modal-label">
                                Role / Position <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.roleId}
                                onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                                className="modal-input"
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
                                <label className="modal-label">
                                    <Phone className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
                                    Phone Number <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="modal-input"
                                    placeholder="+91 Enter phone number"
                                    required
                                />
                            </div>
                            <div>
                                <label className="modal-label">
                                    <Mail className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="modal-input"
                                    placeholder="Enter email address (optional)"
                                />
                            </div>
                        </div>

                        {/* Employment Details — inline Active + Commission */}
                        <div>
                            <label className="modal-label">
                                <Briefcase className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
                                Employment Details
                            </label>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <select
                                    value={formData.employmentType}
                                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                    className="modal-input flex-1 min-w-[130px]"
                                >
                                    {EMPLOYMENT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex items-center gap-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Active</label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                                        <Percent className="w-3 h-3 inline mr-0.5 text-purple-600" />
                                        Commission %
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={formData.commissionRate}
                                        onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                                        className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN — Additional Info (1/3) */}
                    <div className="space-y-3.5">
                        {/* Profile Picture — commented out
                        <div>
                            <label className="modal-label">Profile Picture</label>
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
                        */}

                        {/* Employee ID */}
                        <div>
                            <label className="modal-label">
                                <Tag className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
                                Employee ID (Optional)
                            </label>
                            <input
                                type="text"
                                disabled
                                value={formData.employeeCode}
                                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                                className="modal-input"
                                placeholder="Enter employee ID"
                            />
                        </div>

                        {/* Joining Date */}
                        <div>
                            <label className="modal-label">
                                <CalendarDays className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
                                Joining Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                disabled
                                value={formData.joiningDate}
                                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                className="modal-input"
                                required
                            />
                        </div>

                        {/* Working Hours */}
                        <div>
                            <label className="modal-label">
                                <Clock className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
                                Working Hours
                            </label>
                            <select
                                value={formData.workingHoursStart}
                                onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                                className="modal-input mb-1.5"
                            >
                                <option value="09:00 AM">09:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                            </select>
                            <select
                                value={formData.workingHoursEnd}
                                onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                                className="modal-input"
                            >
                                <option value="06:00 PM">06:00 PM</option>
                                <option value="07:00 PM">07:00 PM</option>
                                <option value="08:00 PM">08:00 PM</option>
                            </select>
                        </div>

                        {/* Weekly Off */}
                        <div>
                            <label className="modal-label">
                                <Calendar className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
                                Weekly Off
                            </label>
                            <select
                                value={formData.weeklyOff}
                                onChange={(e) => setFormData({ ...formData, weeklyOff: e.target.value })}
                                className="modal-input"
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

                {/* SERVICES — Full width at the bottom */}
                <div className="pt-2 border-t border-slate-200/60">
                    <label className="modal-label">
                        <Scissors className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
                        Services Offered
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() => handleToggleService(service.id)}
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
            </form>
        </BaseModal>
    );
}
