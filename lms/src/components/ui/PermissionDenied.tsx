import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { KAMUS_UI } from '../../constants/dictionary';

export interface PermissionDeniedProps {
  title?: string;
  description?: string;
  onBack?: () => void;
}

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({
  title = KAMUS_UI.AKSES_DITOLAK,
  description = KAMUS_UI.AKSES_DITOLAK_DESKRIPSI,
  onBack
}) => {
  return (
    <div className="state-box">
      <div className="state-icon-wrapper state-icon-denied">
        <ShieldAlert size={28} />
      </div>
      <h4 className="state-title">{title}</h4>
      <p className="state-desc">{description}</p>
      {onBack && (
        <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
          {KAMUS_UI.KEMBALI}
        </Button>
      )}
    </div>
  );
};
