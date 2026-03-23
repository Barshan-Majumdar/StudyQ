import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import { useStore } from "./store/useStore"

import { DashboardLayout } from "./components/layout/DashboardLayout"
import { RoleGuard } from "./components/RoleGuard"

import { Landing } from "./pages/Landing"
import { AuthPage } from "./pages/AuthPage"
import { Dashboard } from "./pages/Dashboard"
import { Materials } from "./pages/Materials"
import { Upload } from "./pages/Upload"
import { Analytics } from "./pages/Analytics"
import { AdminPanel } from "./pages/AdminPanel"

function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const authLoading = useStore((s) => s.authLoading)
  const theme = useStore((s) => s.theme)
  const initAuth = useStore((s) => s.initAuth)

  // Try silent refresh on mount (uses HTTP-only cookie)
  useEffect(() => {
    initAuth()
  }, [initAuth])

  // Apply theme class on mount and whenever it changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage initialMode="signin" />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage initialMode="signup" />} />

        {/* Protected */}
        <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/upload" element={
            <RoleGuard allowedRoles={['teacher', 'admin']}>
              <Upload />
            </RoleGuard>
          } />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin" element={
            <RoleGuard allowedRoles={['admin']}>
              <AdminPanel />
            </RoleGuard>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
