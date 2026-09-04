import React from 'react';
import { Clock, LogIn } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export const SessionExpiredModal: React.FC = () => {
  const { isSessionExpired, dismissSessionExpired } = useAuth();

  if (!isSessionExpired) return null;

  return (
    <Modal
      isOpen={isSessionExpired}
      onClose={dismissSessionExpired}
      title="Sesi Anda Telah Berakhir"
      maxWidth="480px"
      footer={
        <Button variant="primary" icon={LogIn} onClick={dismissSessionExpired}>
          Masuk Kembali
        </Button>
      }
    >
      <div className="flex flex-col items-center text-center gap-3" style={{ padding: 'var(--space-3) 0' }}>
        <div 
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--color-warning-bg)', 
            color: 'var(--color-warning-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center' 
          }}
        >
          <Clock size={26} />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Demi keamanan akun Anda, sesi pembelajaran telah berakhir karena tidak ada aktivitas dalam waktu tertentu. 
          Silakan masuk kembali untuk melanjutkan.
        </p>
      </div>
    </Modal>
  );
};
