import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';
import { useUiStore } from '@/store/uiStore';
import { useRefreshAuth, useAuth } from '@/features/auth/hooks/useAuth';
import { RoleGuard } from '@/components/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Landing } from '@/features/landing/views/Landing';
import { AuthPage } from '@/features/auth/views/AuthPage';
import { Dashboard } from '@/features/dashboard/views/Dashboard';
import { Materials as MaterialsList } from '@/features/materials/views/MaterialsList';
import { Upload as UploadPage } from '@/features/materials/views/UploadPage';
import { AdminPanel } from '@/features/admin/views/AdminPanel';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { isLoading } = useRefreshAuth();
  const theme = useUiStore((s) => s.theme);

  // Apply theme class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Show loading while checking auth via cookie refresh
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth" replace />} />

      {/* Protected */}
      <Route element={<RoleGuard><DashboardLayout /></RoleGuard>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/materials" element={<MaterialsList />} />
        <Route
          path="/upload"
          element={
            <RoleGuard allowedRoles={['teacher', 'admin']}>
              <UploadPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <AdminPanel />
            </RoleGuard>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
