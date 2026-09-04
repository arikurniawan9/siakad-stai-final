import React, { useState, useEffect, useCallback } from 'react';
import { PanelLeftOpen, ArrowUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export interface AppLayoutProps {
  activePath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
  isCbtLockdown?: boolean; // When true, all navigation is completely disabled and hidden
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activePath,
  onNavigate,
  children,
  isCbtLockdown = false
}) => {
  const { user } = useAuth();
  
  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Desktop sidebar collapse state (persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('salam_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Focus mode / Fullscreen state
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  const toggleSidebarCollapse = useCallback(() => {
    if (isCbtLockdown) return;
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('salam_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, [isCbtLockdown]);

  const toggleFocusMode = useCallback(() => {
    if (isCbtLockdown) return;
    setIsFocusMode((prev) => !prev);
  }, [isCbtLockdown]);

  // Keyboard shortcut: Ctrl + B or Cmd + B to toggle sidebar (disabled during CBT)
  useEffect(() => {
    if (isCbtLockdown) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapse, isCbtLockdown]);

  // Scroll listener for back-to-top button
  useEffect(() => {
    if (isCbtLockdown) return;
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCbtLockdown]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in CBT Lockdown, render a pure full-screen shell with zero navigation
  if (isCbtLockdown) {
    return (
      <div 
        className="app-shell cbt-lockdown-active"
        style={{
          width: '100vw',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-app)',
          margin: 0,
          padding: 0,
          overflowX: 'hidden'
        }}
      >
        <div 
          className="app-main"
          style={{
            marginLeft: 0,
            width: '100%',
            minHeight: '100vh',
            padding: 0
          }}
        >
          <main 
            className="page-container" 
            style={{ 
              padding: 'var(--space-4) var(--space-6)', 
              maxWidth: '1440px', 
              margin: '0 auto',
              width: '100%'
            }}
          >
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Determine classes for main container and sidebar
  const mainClassNames = [
    'app-main',
    isFocusMode ? 'sidebar-hidden' : isSidebarCollapsed ? 'sidebar-collapsed' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="app-shell">
      {/* Floating Button in Focus Mode */}
      {isFocusMode && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={toggleFocusMode}
          title="Keluar dari Mode Fokus (Tampilkan Menu)"
          aria-label="Keluar dari Mode Fokus"
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 16px',
            fontSize: 'var(--text-xs)'
          }}
        >
          <PanelLeftOpen size={16} />
          <span>Keluar Mode Fokus</span>
        </button>
      )}

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          title="Kembali ke Atas"
          aria-label="Kembali ke Atas"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-800)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      {!isFocusMode && (
        <Sidebar
          activePath={activePath}
          onNavigate={onNavigate}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      )}

      {/* Main Content Area */}
      <div className={mainClassNames}>
        <Header
          activePath={activePath}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          onNavigate={onNavigate}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={toggleSidebarCollapse}
          isFocusMode={isFocusMode}
          onToggleFocusMode={toggleFocusMode}
        />

        <main className="page-container">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible for all roles on small viewports) */}
      {!isFocusMode && user && (
        <MobileNav activePath={activePath} onNavigate={onNavigate} />
      )}
    </div>
  );
};
