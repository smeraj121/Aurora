import { useEffect, useState } from 'react';
import {
  Building2,
  Globe,
  Phone,
  Mail,
  Power,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { BaseModal } from '../../modal/BaseModal';
import type { Tenant, TenantFormData } from '../../../types/tenant.types';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Tenant | null;
  onSave: (data: TenantFormData) => Promise<void>;
  onToggleStatus?: (
    tenantId: number,
    isActive: boolean
  ) => Promise<void>;
}

const DEFAULT_FORM_STATE: TenantFormData = {
  name: '',
  slug: '',
  phone: '',
  email: '',
  businessTypeId: 1,
};

const BUSINESS_TYPES = [
  { id: 1, name: 'Salon' },
  { id: 2, name: 'Dermatology Clinic' },
  { id: 3, name: 'Spa' },
  { id: 4, name: 'Nail Studio' },
  { id: 5, name: 'Barbershop' },
  { id: 6, name: 'Aesthetic Clinic' },
];

export function TenantModal({
  isOpen,
  onClose,
  tenant,
  onSave,
  onToggleStatus,
}: TenantModalProps) {
  const [formData, setFormData] =
    useState<TenantFormData>(DEFAULT_FORM_STATE);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = Boolean(tenant);

  const title = isEditMode
    ? 'Edit Tenant'
    : 'Add New Tenant';

  const submitLabel = isEditMode
    ? 'Update Tenant'
    : 'Add Tenant';

  useEffect(() => {
    if (isOpen && tenant) {
      setFormData({
        name: tenant.name || '',
        slug: tenant.slug || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        businessTypeId: tenant.businessTypeId || 1,
      });
    } else if (isOpen) {
      setFormData(DEFAULT_FORM_STATE);
    }

    setError('');
  }, [isOpen, tenant]);

  // ---------- Validation ----------

  const validate = (): string | null => {
  const name = formData.name.trim();
  const slug = formData.slug.trim();
  const phone = formData.phone.trim();
  const email = formData.email.trim();
  const businessTypeId = formData.businessTypeId;

  if (!businessTypeId) return 'Business type is required';
  if (!name) return 'Tenant name is required';
  if (name.length < 2) return 'Tenant name must be at least 2 characters';
  if (!slug) return 'Tenant slug is required';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Slug can only contain lowercase letters, numbers and hyphens';
  }

  // --- NEW: email required ---
  if (!email) return 'Email address is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';

  if (phone) {
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return 'Please enter a valid phone number (10–15 digits)';
    }
  }

  return null;
};

  // ---------- Submit ----------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setError('');

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload: TenantFormData = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        businessTypeId: formData.businessTypeId,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(
        err.message || 'Failed to save tenant'
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- Activate / Deactivate ----------

  const handleToggleStatus = async () => {
    if (!tenant || !onToggleStatus) return;

    const action = tenant.isActive
      ? 'deactivate'
      : 'activate';

    if (
      !window.confirm(
        `Are you sure you want to ${action} this tenant?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await onToggleStatus(
        tenant.id,
        !tenant.isActive
      );

      onClose();
    } catch (err: any) {
      setError(
        err.message ||
        `Failed to ${action} tenant`
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- Footer ----------

  const footerActions = (
    <>
      {isEditMode && onToggleStatus && (
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={loading}
          className={
            tenant?.isActive
              ? 'btn-modal-danger flex items-center gap-1.5'
              : 'btn-modal-secondary flex items-center gap-1.5'
          }
        >
          {tenant?.isActive ? (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              Deactivate Tenant
            </>
          ) : (
            <>
              <Power className="w-3.5 h-3.5" />
              Activate Tenant
            </>
          )}
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
          form="tenant-form"
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
      icon={Building2}
      error={error}
      footer={footerActions}
      maxWidth="max-w-xl"
    >
      <form
        id="tenant-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Tenant Name */}
        <div>
          <label className="modal-label">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            Tenant Name
            <span className="text-rose-500">*</span>
          </label>

          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            className="modal-input"
            placeholder="Enter tenant name"
            required
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="modal-label">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            Business Type
            <span className="text-rose-500">*</span>
          </label>

          <select
            value={formData.businessTypeId}
            onChange={(e) =>
              setFormData({
                ...formData,
                businessTypeId: Number(e.target.value),
              })
            }
            className="modal-input"
            required
          >
            {BUSINESS_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Slug */}
        <div>
          <label className="modal-label">
            <Globe className="w-3.5 h-3.5 text-purple-600" />
            Tenant Slug
            <span className="text-rose-500">*</span>
          </label>

          <input
            type="text"
            value={formData.slug}
            onChange={(e) =>
              setFormData({
                ...formData,
                slug: e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, '-'),
              })
            }
            className="modal-input"
            placeholder="e.g. aurora-salon"
            required
          />

          <p className="text-[10px] text-slate-400 mt-1">
            Used as the tenant's unique identifier.
          </p>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="modal-label">
              <Phone className="w-3.5 h-3.5 text-purple-600" />
              Phone Number
            </label>

            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              className="modal-input"
              placeholder="Enter phone number"
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="modal-input"
              placeholder="Enter email address"
            />
          </div>
        </div>
      </form>
    </BaseModal>
  );
}