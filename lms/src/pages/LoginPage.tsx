import React, { useState, useEffect } from 'react';
import { AlertCircle, Lock, User, RefreshCw, Eye, EyeOff, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { captchaService } from '../services/captchaService';

export const LoginPage: React.FC = () => {
  const { login, loginWithSso, isAuthenticated } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [ssoStatus, setSsoStatus] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      window.history.replaceState({}, document.title, '/');
    }
  }, [isAuthenticated]);

  const fetchCaptcha = () => {
    setLoadingCaptcha(true);
    try {
      const res = captchaService.generate();
      setCaptchaImage(res.image);
      setCaptchaInput('');
    } catch (err) {
      console.error('Gagal memuat captcha', err);
    } finally {
      setTimeout(() => setLoadingCaptcha(false), 120);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Identitas pengguna (NIM / NIDN / Username / Email) wajib diisi.');
      return;
    }
    if (!kataSandi.trim()) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }
    if (!captchaInput.trim()) {
      setErrorMessage('Kode keamanan captcha wajib diisi.');
      return;
    }

    // 1. Validasi Captcha
    const isCaptchaValid = captchaService.verify(captchaInput);
    if (!isCaptchaValid) {
      setErrorMessage('Kode keamanan captcha salah atau sudah kedaluwarsa. Silakan coba lagi.');
      fetchCaptcha();
      return;
    }

    // 2. Eksekusi Login
    setIsSubmitting(true);
    try {
      await login(identifier, kataSandi);
      window.history.replaceState({}, document.title, '/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Identitas pengguna atau kata sandi tidak cocok.');
      fetchCaptcha();
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
  }, [loginWithSso]);

  const handleSiakadSsoRedirect = () => {
    const siakadHost = (import.meta as any).env?.VITE_SIAKAD_URL || 'http://salam.stai-alittihad.ac.id';
    const redirectUri = window.location.origin + window.location.pathname;
    window.location.href = `${siakadHost}/oauth/authorize?client_id=salam_lms&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
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
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: 'var(--radius-xl)', 
              background: '#ffffff', 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--color-slate-200)',
              padding: '6px',
              marginBottom: 'var(--space-2)'
            }}
          >
            <img 
              src="/logo.png" 
              alt="Logo STAI AL-ITTIHAD" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: '2px', fontWeight: 800 }}>
            SALAM LMS
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Sistem Pembelajaran Daring STAI Al-Ittihad Cianjur
          </p>
        </div>

        {/* Login Card */}
        <Card style={{ boxShadow: 'var(--shadow-lg)' }}>
          <CardBody style={{ padding: 'var(--space-6)' }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="flex justify-between items-center" style={{ marginBottom: '2px' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--text-base)', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Masuk ke Sistem LMS
                  </h2>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Portal perkuliahan &amp; kegiatan belajar daring
                  </span>
                </div>
                <Badge variant="primary" style={{ fontSize: '10px' }}>
                  2026/2027 Ganjil
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

              {/* 1. Identitas Pengguna */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                  Identitas Pengguna (NIM / NIDN / Username / Email)
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', insetBlockStart: 0, insetBlockEnd: 0, insetInlineStart: '10px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: 21010042 atau 2112087501"
                    className="form-input"
                    style={{ paddingLeft: '34px', fontSize: 'var(--text-xs)', height: '38px' }}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* 2. Kata Sandi dengan Show/Hide */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                  Kata Sandi (Password)
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', insetBlockStart: 0, insetBlockEnd: 0, insetInlineStart: '10px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={kataSandi}
                    onChange={(e) => setKataSandi(e.target.value)}
                    placeholder="Masukkan kata sandi akun Anda"
                    className="form-input"
                    style={{ paddingLeft: '34px', paddingRight: '36px', fontSize: 'var(--text-xs)', height: '38px' }}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      insetBlockStart: 0,
                      insetBlockEnd: 0,
                      insetInlineEnd: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* 3. Kode Keamanan Captcha 4-Digit */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                  Kode Keamanan (4 Digit)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Captcha Image Container */}
                  <div 
                    style={{ 
                      height: '38px', 
                      width: '120px', 
                      backgroundColor: '#f1f5f9', 
                      border: '1px solid var(--border-default)', 
                      borderRadius: 'var(--radius-md)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
                    }}
                  >
                    {loadingCaptcha ? (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RefreshCw size={12} className="animate-spin" /> Memuat...
                      </span>
                    ) : captchaImage ? (
                      <img 
                        src={captchaImage} 
                        alt="Captcha Keamanan" 
                        style={{ height: '100%', width: '100%', objectFit: 'contain', userSelect: 'none' }} 
                      />
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gagal</span>
                    )}
                  </div>

                  {/* Refresh Button */}
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    title="Segarkan Kode Captcha"
                    style={{
                      height: '38px',
                      width: '38px',
                      backgroundColor: 'var(--color-slate-100)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <RefreshCw size={15} className={loadingCaptcha ? 'animate-spin' : ''} />
                  </button>

                  {/* Captcha Input with auto uppercase */}
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      maxLength={4}
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      placeholder="KODE"
                      className="form-input"
                      style={{ 
                        textAlign: 'center', 
                        letterSpacing: '0.2em', 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        fontSize: 'var(--text-sm)',
                        height: '38px'
                      }}
                      required
                    />
                  </div>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '3px', display: 'block' }}>
                  * Masukkan 4 karakter di atas (otomatis kapital).
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={ShieldCheck}
                isLoading={isSubmitting}
                className="w-full"
                style={{ marginTop: 'var(--space-1)', height: '40px', fontWeight: 700 }}
              >
                Masuk ke SALAM LMS
              </Button>

              {/* SSO DIVIDER & BUTTON */}
              <div style={{ position: 'relative', margin: '4px 0' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '100%', borderTop: '1px solid var(--color-slate-200)' }} />
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <span style={{ backgroundColor: '#ffffff', padding: '0 8px' }}>Atau Masuk Terpadu</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSiakadSsoRedirect}
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-md)',
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
                <Sparkles size={15} color="#34d399" />
                <span>Masuk dengan Akun SIAKAD STAI (SSO)</span>
              </button>
            </form>
          </CardBody>
        </Card>

        {/* Bottom Link ke SIAKAD & Copyright */}
        <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Untuk administrasi KRS, KHS, dan Keuangan SPP:{' '}
            <a 
              href="http://salam.stai-alittihad.ac.id/" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ fontWeight: 700, color: 'var(--color-primary-700)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              Buka Portal SALAM SIAKAD <ExternalLink size={12} />
            </a>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
            © 2026 STAI AL-ITTIHAD CIANJUR. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
