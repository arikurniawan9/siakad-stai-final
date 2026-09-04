import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { KAMUS_UI } from '../../constants/dictionary';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('SALAM Uncaught Error Boundary Catch:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 'var(--space-4)',
            backgroundColor: 'var(--bg-canvas)'
          }}
        >
          <Card style={{ maxWidth: '560px', width: '100%', borderTop: '4px solid var(--color-danger-main)' }}>
            <CardBody style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <div 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--color-danger-bg)', 
                  color: 'var(--color-danger-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4)'
                }}
              >
                <AlertOctagon size={32} />
              </div>

              <Badge variant="danger" style={{ marginBottom: 'var(--space-2)' }}>
                Pemulihan Kesalahan Sistem
              </Badge>

              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
                {KAMUS_UI.TERJADI_KESALAHAN}
              </h2>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
                Aplikasi mengalami kendala tak terduga saat memproses halaman ini. Data sesi Anda tetap aman dan tidak ada informasi yang hilang.
              </p>

              {this.state.error && (
                <div 
                  style={{ 
                    padding: 'var(--space-3)', 
                    backgroundColor: 'var(--color-slate-100)', 
                    borderRadius: 'var(--radius-md)', 
                    fontSize: 'var(--text-xs)', 
                    fontFamily: 'var(--font-mono)', 
                    color: 'var(--text-muted)',
                    textAlign: 'left',
                    marginBottom: 'var(--space-6)',
                    overflowX: 'auto'
                  }}
                >
                  <strong>Detail Masalah:</strong> {this.state.error.toString()}
                </div>
              )}

              <div className="flex justify-center gap-3">
                <Button 
                  variant="primary" 
                  icon={RotateCcw} 
                  onClick={this.handleReload}
                >
                  {KAMUS_UI.COBA_LAGI}
                </Button>
                <Button 
                  variant="secondary" 
                  icon={Home} 
                  onClick={this.handleReset}
                >
                  Kembali ke {KAMUS_UI.BERANDA}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
