import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { Toaster } from 'react-hot-toast';
import { notificationService } from './services/notificationService';
import Login from './components/Login';
import Signup from './components/Signup';
import Navbar from './components/Navbar';

// ─── Lazy-load everything non-essential ────────────────────────────────────
const Dashboard   = lazy(() => import('./components/Dashboard'));
const TaskListView = lazy(() => import('./components/TaskListView'));
const Landing      = lazy(() => import('./components/Landing'));
const ReminderManager = lazy(() => import('./components/ReminderManager'));

// ─── Lightweight spinner ────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

// ─── Protected Route — unauthenticated → back to landing ───────────────────
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (currentUser) notificationService.requestPermission();
  }, [currentUser]);

  // Wait for Firebase auth to resolve before redirecting
  if (loading) return <PageLoader />;
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
}

// ─── Public Route — if already logged in, go to /app ──────────────────────
// Prevents logged-in users seeing login/signup/landing again
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (currentUser) return <Navigate to="/app" replace />;
  return children;
}

// ─── Authenticated shell (Navbar + page container) ─────────────────────────
function AuthenticatedLayout({ children }) {
  return (
    <TaskProvider>
      <Suspense fallback={null}>
        <ReminderManager />
      </Suspense>
      <div className="min-h-screen bg-background text-textMain">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 mt-4">
          {children}
        </div>
      </div>
    </TaskProvider>
  );
}

// ─── Bootstrap theme ────────────────────────────────────────────────────────
function applyStoredTheme() {
  try {
    const saved = localStorage.getItem('taskflow_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch { /* ignore */ }
}
applyStoredTheme();

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Premium Signature (Phones & Tablets Only) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex lg:hidden select-none pointer-events-none opacity-80 pb-safe">
        <div className="flex items-center gap-1.5 bg-black/10 dark:bg-white/10 backdrop-blur-md px-4 py-2 border border-black/10 dark:border-white/20 rounded-full shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            Designed by
          </span>
          <span className="text-[12px] font-black bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
            Him
          </span>
          <svg className="w-3 h-3 text-pink-500 animate-pulse opacity-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      </div>

      <Routes location={location} key={location.pathname}>

        {/* ── Public: Landing page — root, always shown first ── */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Suspense fallback={<PageLoader />}>
                <Landing />
              </Suspense>
            </PublicRoute>
          }
        />

        {/* ── Public: Login & Signup ── */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* ── Protected: Main task board ── */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}>
                  <TaskListView />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Analytics dashboard ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Catch-all: back to landing ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
