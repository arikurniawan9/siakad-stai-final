import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={20} color="var(--color-success-main)" />;
      case 'warning':
        return <AlertTriangle size={20} color="var(--color-warning-main)" />;
      case 'danger':
        return <AlertCircle size={20} color="var(--color-danger-main)" />;
      case 'info':
      default:
        return <Info size={20} color="var(--color-info-main)" />;
    }
  };

  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{getIcon()}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
          {toast.title}
        </p>
        {toast.message && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {toast.message}
          </p>
        )}
      </div>
      <button 
        onClick={() => onDismiss(toast.id)}
        style={{ color: 'var(--text-muted)', padding: '2px', cursor: 'pointer' }}
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  );
};
