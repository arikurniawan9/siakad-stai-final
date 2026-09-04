import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Terjadi Kesalahan',
  message = 'Sistem tidak dapat memproses permintaan Anda. Silakan coba beberapa saat lagi.',
  onRetry,
  retryLabel = 'Coba Lagi'
}) => {
  return (
    <div className="state-box">
      <div className="state-icon-wrapper state-icon-error">
        <AlertCircle size={28} />
      </div>
      <h4 className="state-title">{title}</h4>
      <p className="state-desc">{message}</p>
      {onRetry && (
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
