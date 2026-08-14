import { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, Users, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import { BaseModal } from '../../modal/BaseModal';
import type { CustomerView, CustomerFormData } from '../../../types/customer.types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: CustomerView | null;          // null → add mode, object → edit mode
  onSave: (data: CustomerFormData) => Promise<void>;
  onDeactivate?: (customerId: number) => Promise<void>;
}

const DEFAULT_FORM_STATE: CustomerFormData = {
  fullName: '',
  phone: '',
  email: '',
  birthday: '',
  gender: '',
  notes: '',
  emailOptIn: false,   // kept in type but hidden for now
};

export function CustomerModal({
  isOpen,
  onClose,
  customer,
  onSave,
  onDeactivate,
}: CustomerModalProps) {
  const [formData, setFormData] = useState<CustomerFormData>(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = Boolean(customer);
  const title = isEditMode ? 'Edit Customer' : 'Add New Customer';
  const submitLabel = isEditMode ? 'Update Customer' : 'Add Customer';

  // Pre-fill when editing
  useEffect(() => {
    if (isOpen && customer) {
      setFormData({
        fullName: customer.fullName || '',
        phone: customer.phone || '',
        email: customer.email || '',
        birthday: customer.birthday ? customer.birthday.substring(0, 10) : '',
        gender: customer.gender || '',
        notes: customer.notes || '',
        emailOptIn: customer.emailOptIn || false,
      });
    } else if (isOpen) {
      setFormData(DEFAULT_FORM_STATE);
    }
    setError('');
  }, [isOpen, customer]);

  // ---------- Validation ----------
  const validate = (): string | null => {
    const fullName = formData.fullName.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();

    if (!fullName) return 'Full name is required';
    if (fullName.length < 2) return 'Full name must be at least 2 characters';

    if (!phone) return 'Phone number is required';
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return 'Please enter a valid phone number (10–15 digits)';
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return 'Please enter a valid email address';
    }

    if (formData.birthday) {
      const birthday = new Date(formData.birthday);
      if (isNaN(birthday.getTime())) return 'Please enter a valid birthday';
      if (birthday > new Date()) return 'Birthday cannot be in the future';
    }

    return null;
  };

  // ---------- Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      // Convert empty strings to null for optional fields
      const payload: CustomerFormData = {
        ...formData,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || '',
        birthday: formData.birthday || '',
        gender: formData.gender || '',
        notes: formData.notes.trim() || '',
        emailOptIn: formData.emailOptIn,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Deactivation ----------
  const handleDeactivate = async () => {
    if (!customer?.id || !onDeactivate) return;
    if (!window.confirm('Are you sure you want to deactivate this customer?')) return;

    try {
      setLoading(true);
      await onDeactivate(customer.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate customer');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Footer ----------
  const footerActions = (
    <>
      {isEditMode && onDeactivate && (
        <button
          type="button"
          onClick={handleDeactivate}
          className="btn-modal-danger flex items-center gap-1.5"
          disabled={loading}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Deactivate Customer
        </button>
      )}
      <div className="flex items-center gap-2.5 ml-auto">
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
          form="customer-form"
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
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </>
  );

  // ---------- Render ----------
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={User}
      error={error}
      footer={footerActions}
      maxWidth="max-w-xl"
    >
      <form id="customer-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="modal-label">
            <User className="w-3.5 h-3.5 text-purple-600" />
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="modal-input"
            placeholder="Enter full name"
            required
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="modal-label">
              <Phone className="w-3.5 h-3.5 text-purple-600" />
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="modal-input"
              placeholder="Enter phone number"
              required
            />
          </div>
          <div>
            <label className="modal-label">
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="modal-input"
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Birthday & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="modal-label">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              Birthday
            </label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className="modal-input"
            />
          </div>
          <div>
            <label className="modal-label">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="modal-input"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="modal-label">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            Notes / Preferences
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="modal-input resize-none"
            placeholder="Add any notes or preferences about the customer..."
          />
        </div>

        {/* 
          No opt‑in fields are shown – they are not needed until marketing/WhatsApp features exist.
          The DB columns remain, but we don't expose them in the UI.
        */}
      </form>
    </BaseModal>
  );
}