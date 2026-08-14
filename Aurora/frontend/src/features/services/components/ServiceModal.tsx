import { useState, useEffect } from 'react';
import { BaseModal } from '../../modal/BaseModal';
import { Scissors, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import type { Service } from '../../../types/service.types';


interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Service | null;
  onSave: (data: Service) => Promise<void>;
  categories: string[]; // available categories from API
}

const DEFAULT_FORM: Service = {
    id:0,
  name: '',
  description: '',
  category: '',
  durationMinutes: 30,
  price: 0,
  color: '#8B5CF6',
  isOnlineBookable: true,
  isActive: true,
};

export function ServiceModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  categories,
}: ServiceModalProps) {
  const [formData, setFormData] = useState<Service>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(initialData?.id);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData(DEFAULT_FORM);
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const name = formData.name.trim();
    if (!name) {
      setError('Service name is required');
      return;
    }
    if (formData.price < 0) {
      setError('Price cannot be negative');
      return;
    }
    if (formData.durationMinutes < 1) {
      setError('Duration must be at least 1 minute');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save service');
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
        form="service-form"
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
            {isEdit ? 'Update Service' : 'Add Service'}
          </>
        )}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Service' : 'Add New Service'}
      icon={Scissors}
      error={error}
      footer={footerActions}
      maxWidth="max-w-lg"
    >
      <form id="service-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="modal-label">
            Service Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="modal-input"
            placeholder="e.g. Haircut"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="modal-label">Category</label>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="modal-input"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="modal-label">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              Duration (min) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
              className="modal-input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="modal-label">
              <DollarSign className="w-3.5 h-3.5 inline mr-1" />
              Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="modal-input"
              required
            />
          </div>
          <div>
            <label className="modal-label">Color (optional)</label>
            <input
              type="text"
              value={formData.color || ''}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="modal-input"
              placeholder="#8B5CF6"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.isOnlineBookable}
              onChange={(e) => setFormData({ ...formData, isOnlineBookable: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            Online Bookable
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            Active
          </label>
        </div>

        <div>
          <label className="modal-label">Description</label>
          <input
            type="text"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="modal-input"
            placeholder="Optional description"
          />
        </div>
      </form>
    </BaseModal>
  );
}