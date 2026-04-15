import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { usePWA } from '../hooks/usePWA';
import { ClipboardList, LayoutDashboard, Download, CalendarDays } from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isInstallable, installApp } = usePWA();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/landing" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <span className="font-bold text-textMain tracking-tight hidden xs:block">FlowTask</span>
          </Link>

          {/* Navigation Links */}
          {currentUser && (
            <div className="flex items-center bg-surfaceMuted p-1 rounded-lg border border-border">
              <Link 
                to="/app" 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  isActive('/app') ? 'bg-surface text-primary shadow-sm' : 'text-textSecondary hover:text-textMain'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Tasks
              </Link>
              <Link 
                to="/calendar"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  isActive('/calendar') ? 'bg-surface text-primary shadow-sm' : 'text-textSecondary hover:text-textMain'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Calendar
              </Link>
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  isActive('/dashboard') ? 'bg-surface text-primary shadow-sm' : 'text-textSecondary hover:text-textMain'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* User info */}
          {currentUser && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(6,182,212,0.08))',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 14,
              padding: '4px 12px 4px 5px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 16px rgba(99,102,241,0.12)',
            }}>
              {/* Glowing avatar circle */}
              <div style={{
                width: 30, height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px',
                boxShadow: '0 0 10px rgba(99,102,241,0.6), 0 0 24px rgba(6,182,212,0.3)',
              }}>
                {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              {/* Name + greeting — hidden on very small screens */}
              <div className="hidden sm:flex flex-col" style={{ lineHeight: 1 }}>
                <span style={{ fontSize: 9, color: '#818cf8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                  Hey 👋
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 800,
                  background: 'linear-gradient(135deg, #a5b4fc 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  maxWidth: 96, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                </span>
              </div>
            </div>
          )}

          {/* Install PWA Button */}
          {isInstallable && (
            <button
              onClick={installApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primaryHover transition-all duration-200 shadow-md animate-pulse"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-border bg-surfaceMuted text-textSecondary hover:bg-surface hover:text-primary transition-all duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
            )}
          </button>

          {/* Logout button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-danger bg-danger/10 hover:bg-danger hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
