import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ElementType;
  error?: string | null;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string; // e.g., 'max-w-md', 'max-w-lg', 'max-w-2xl'
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  error,
  children,
  footer,
  maxWidth = 'max-w-lg',
}: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className={`modal-container ${maxWidth}`}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            {Icon && <Icon className="modal-header-icon"/>}
            <h4 className="font-bold text-sm">{title}</h4>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="modal-error-banner">
            <AlertCircle className="w-4 h-4 shrink-0"/>
            <p>{error}</p>
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal-footer px-5 py-3 bg-slate-50 border-t border-slate-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}