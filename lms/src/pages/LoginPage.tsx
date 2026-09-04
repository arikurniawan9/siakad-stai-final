import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle, Shield, Key, UserCheck, ArrowRight, Info, Sparkles, ShieldCheck } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { REGISTERED_USERS } from '../services/authService';

export const LoginPage: React.FC = () => {
  const { login, loginWithSso, switchRole, isAuthenticated } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [kataSandi, setKataSandi] = useState('salam123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [ssoStatus, setSsoStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'accounts'>('form');

  useEffect(() => {
    if (isAuthenticated) {
      window.history.replaceState({}, document.title, '/');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!identifier.trim()) {
      setErrorMessage('NIM / NIDN / NIP atau Email wajib diisi.');
      return;
    }
    if (!kataSandi.trim()) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier, kataSandi);
      window.history.replaceState({}, document.title, '/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk. Periksa kembali data Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setSsoLoading(true);
      setSsoStatus('Menghubungkan ke Akun SIAKAD STAI Al-Ittihad...');
      loginWithSso(code)
        .then(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err: any) => {
          setSsoLoading(false);
          setErrorMessage(err.message || 'Otorisasi SSO SIAKAD gagal. Silakan coba login manual.');
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, []);

  const handleSiakadSsoRedirect = () => {
    const siakadHost = (import.meta as any).env?.VITE_SIAKAD_URL || 'http://localhost:8000';
    const redirectUri = window.location.origin + window.location.pathname;
    window.location.href = `${siakadHost}/oauth/authorize?client_id=salam_lms&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
  };

  const handleSelectAccount = (user: typeof REGISTERED_USERS[0]) => {
    setIdentifier(user.username);
    setKataSandi('salam123');
    setActiveTab('form');
  };

  if (ssoLoading) {
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: 'var(--space-4)',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)' 
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <Card style={{ boxShadow: 'var(--shadow-lg)' }}>
            <CardBody style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}
              >
                <ShieldCheck size={32} color="#059669" />
              </div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                Single Sign-On (SSO) Terpadu
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: '#64748b', marginBottom: '20px' }}>
                {ssoStatus || 'Memverifikasi kredensial akun dengan basis data SIAKAD STAI Al-Ittihad...'}
              </p>
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #059669',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 'var(--space-4)',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)' 
      }}
    >
      <div style={{ width: '100%', maxWidth: '520px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
          <div 
            style={{ 
              width: '68px', 
              height: '68px', 
              borderRadius: 'var(--radius-xl)', 
              background: '#ffffff', 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--color-slate-200)',
              padding: '6px',
              marginBottom: 'var(--space-3)'
            }}
          >
            <img 
              src="/logo.png" 
              alt="Logo STAI AL-ITTIHAD" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
            SALAM LMS
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Sistem Aplikasi Layanan Akademik & Mahasiswa<br />
            <strong>STAI AL-ITTIHAD CIANJUR</strong>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div 
          className="flex rounded-lg" 
          style={{ 
            backgroundColor: 'var(--color-slate-100)', 
            padding: '4px', 
            marginBottom: 'var(--space-4)',
            border: '1px solid var(--border-subtle)' 
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === 'form' 
                ? 'bg-white shadow-sm text-primary-800' 
                : 'text-muted hover:text-primary'
            }`}
          >
            <LogIn size={14} /> Form Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === 'accounts' 
                ? 'bg-white shadow-sm text-primary-800' 
                : 'text-muted hover:text-primary'
            }`}
          >
            <UserCheck size={14} /> Daftar Akun 7 Role ({REGISTERED_USERS.length})
          </button>
        </div>

        {/* Login Card */}
        <Card style={{ boxShadow: 'var(--shadow-lg)' }}>
          <CardBody style={{ padding: 'var(--space-6)' }}>
            {activeTab === 'form' ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
                    Masuk ke Sistem
                  </h2>
                  <Badge variant="primary" style={{ fontSize: '10px' }}>
                    Tahun Akademik 2026/2027 Ganjil
                  </Badge>
                </div>

                {errorMessage && (
                  <div 
                    className="flex items-center gap-2" 
                    style={{ 
                      padding: 'var(--space-3)', 
                      backgroundColor: 'var(--color-danger-bg)', 
                      border: '1px solid var(--color-danger-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-danger-text)',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Input
                  label="NIM / NIDN / Username / Email"
                  placeholder="Contoh: 21010042 atau 2112087501"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />

                <Input
                  label="Kata Sandi"
                  type="password"
                  placeholder="Masukkan kata sandi (Default: salam123)"
                  value={kataSandi}
                  onChange={(e) => setKataSandi(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <div className="flex items-center justify-between" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Key size={12} /> Default Sandi: <strong>salam123</strong>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('accounts')}
                    className="text-primary-700 hover:underline"
                  >
                    Lihat Akun Role
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={LogIn}
                  isLoading={isSubmitting}
                  className="w-full"
                  style={{ marginTop: 'var(--space-1)' }}
                >
                  Masuk ke SALAM
                </Button>

                {/* SSO DIVIDER & BUTTON */}
                <div style={{ position: 'relative', margin: '4px 0' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '100%', borderTop: '1px solid var(--color-slate-200)' }} />
                  </div>
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    <span style={{ backgroundColor: '#ffffff', padding: '0 8px' }}>Atau Masuk Terpusat</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSiakadSsoRedirect}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 700,
                    fontSize: 'var(--text-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '0.92')}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <Sparkles size={16} color="#34d399" />
                  <span>Masuk dengan Akun SIAKAD STAI (SSO)</span>
                  <span style={{ fontSize: '9px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    1-Klik
                  </span>
                </button>

                {/* Quick Persona Demo Selector */}
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-1 text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>
                    <Shield size={13} />
                    <span style={{ fontWeight: 'bold' }}>Masuk Cepat 1-Klik (Evaluasi Role):</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {REGISTERED_USERS.slice(0, 6).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => switchRole(u.role)}
                        className="flex flex-col text-left p-2 rounded border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                        style={{ fontSize: '11px' }}
                      >
                        <span className="font-semibold text-slate-800 truncate">{u.roleLabel}</span>
                        <span className="text-slate-500 truncate">{u.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 style={{ fontSize: 'var(--text-base)', margin: 0, fontWeight: 'bold' }}>
                    Daftar Akun Pengguna Aktif
                  </h2>
                  <span className="text-xs text-muted">Kata Sandi: <strong>salam123</strong></span>
                </div>

                <div 
                  className="flex items-center gap-2 p-2 rounded" 
                  style={{ backgroundColor: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)', fontSize: '11px', color: 'var(--color-primary-900)' }}
                >
                  <Info size={14} className="flex-shrink-0" />
                  <span>Klik tombol <strong>"Gunakan Akun"</strong> untuk auto-fill form atau <strong>"Masuk Langsung"</strong> untuk membuka dashboard role tersebut.</span>
                </div>

                <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {REGISTERED_USERS.map((u) => (
                    <div
                      key={u.id}
                      className="flex flex-col gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                          <div className="text-slate-600 text-xs font-mono">Username/NIM: <strong>{u.username}</strong></div>
                          <div className="text-slate-500 text-xs">{u.studyProgram}</div>
                        </div>
                        <Badge variant={u.role === 'mahasiswa' ? 'primary' : u.role === 'dosen' ? 'success' : 'warning'}>
                          {u.roleLabel}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSelectAccount(u)}
                          className="flex-1"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          Gunakan Akun
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ArrowRight}
                          onClick={() => switchRole(u.role)}
                          className="flex-1"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          Masuk Langsung
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Footer Notice */}
        <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-5)' }}>
          © 2026 STAI AL-ITTIHAD. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
