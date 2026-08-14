import { useState, useEffect } from 'react';
import { BaseModal } from '../../modal/BaseModal';
import { Users, CheckCircle2 } from 'lucide-react';
import type { DesignationDetails } from '../../../types/staff.types';

interface DesignationModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: DesignationDetails | null;
    onSave: (data: DesignationDetails) => Promise<void>;
}

const DEFAULT_FORM: DesignationDetails = {
    id: 0,
    name: '',
    description: '',
    isActive: true,
};

export function DesignationModal({
    isOpen,
    onClose,
    initialData,
    onSave,
}: DesignationModalProps) {
    const [formData, setFormData] = useState<DesignationDetails>(DEFAULT_FORM);
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
            setError('Role name is required');
            return;
        }

        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save designation');
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
                form="designation-form"
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
                        {isEdit ? 'Update Role' : 'Add Role'}
                    </>
                )}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Role' : 'Add New Role'}
            icon={Users}
            error={error}
            footer={footerActions}
            maxWidth="max-w-md"
        >
            <form id="designation-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="modal-label">
                        Role Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="modal-input"
                        placeholder="e.g. Senior Stylist"
                        required
                    />
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
                <div>
  <label className="modal-label">Display Order</label>
  <input
    type="number"
    min="0"
    value={formData.displayOrder || 0}
    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
    className="modal-input"
    placeholder="0"
  />
</div>
                <div className="flex items-center gap-3">
                    <label className="modal-label">Active</label>
                    <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                </div>
            </form>
        </BaseModal>
    );
}