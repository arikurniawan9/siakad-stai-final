import React from 'react';
import { ShieldAlert, Home, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { KAMUS_UI } from '../constants/dictionary';

export interface AksesDitolakPageProps {
  requiredPermission?: string;
  onNavigateHome?: () => void;
}

export const AksesDitolakPage: React.FC<AksesDitolakPageProps> = ({
  requiredPermission,
  onNavigateHome
}) => {
  const { user, switchRole } = useAuth();

  return (
    <div style={{ maxWidth: '640px', margin: 'var(--space-8) auto' }}>
      <Card>
        <CardBody className="flex flex-col items-center text-center gap-4" style={{ padding: 'var(--space-8)' }}>
          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: 'var(--radius-full)', 
              backgroundColor: 'var(--color-danger-bg)', 
              color: 'var(--color-danger-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center' 
            }}
          >
            <ShieldAlert size={34} />
          </div>

          <div>
            <Badge variant="danger" style={{ marginBottom: 'var(--space-2)' }}>
              Kode 403: Hak Akses Tidak Mencukupi
            </Badge>
            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
              {KAMUS_UI.AKSES_DITOLAK}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: '480px' }}>
              Akun Anda saat ini (<strong>{user?.name}</strong> — {user?.roleLabel}) tidak memiliki izin untuk membuka halaman ini. Halaman ini memerlukan kewenangan administratif.
            </p>
          </div>

          {requiredPermission && (
            <div style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Kewenangan yang dibutuhkan: <code>{requiredPermission}</code>
            </div>
          )}

          <div className="flex gap-3 flex-wrap justify-center" style={{ marginTop: 'var(--space-2)' }}>
            <Button 
              variant="outline" 
              icon={Home} 
              onClick={onNavigateHome || (() => window.location.href = '/')}
            >
              Kembali ke {KAMUS_UI.BERANDA}
            </Button>
            {user?.role !== 'administrator_sistem' && (
              <Button 
                variant="primary" 
                icon={UserCheck} 
                onClick={() => switchRole('administrator_sistem')}
              >
                Beralih ke Administrator Sistem
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
