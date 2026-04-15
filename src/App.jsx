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
