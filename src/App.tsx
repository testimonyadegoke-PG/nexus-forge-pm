
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { SecurityProvider } from '@/components/security/SecurityProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppLayout } from '@/components/layout/AppLayout';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Tasks from '@/pages/Tasks';
import Budgets from '@/pages/Budgets';
import CostEntries from '@/pages/CostEntries';
import ProjectDetail from '@/pages/ProjectDetail';
import ProjectReports from '@/pages/ProjectReports';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SecurityProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
                  <RequireAuth>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </RequireAuth>
                } />
                <Route path="/dashboard/projects" element={
                  <RequireAuth>
                    <AppLayout>
                      <Projects />
                    </AppLayout>
                  </RequireAuth>
                } />
                <Route path="/dashboard/tasks" element={
                  <RequireAuth>
                    <AppLayout>
                      <Tasks />
                    </AppLayout>
                  </RequireAuth>
                } />
                <Route path="/dashboard/budgets" element={
                  <RequireAuth>
                    <AppLayout>
                      <Budgets />
                    </AppLayout>
                  </RequireAuth>
                } />
                <Route path="/dashboard/cost-entries" element={
                  <RequireAuth>
                    <AppLayout>
                      <CostEntries />
                    </AppLayout>
                  </RequireAuth>
                } />
                <Route path="/projects/:id" element={
                  <RequireAuth>
                    <AppLayout>
                      <ProjectDetail />
                    </AppLayout>
                  </RequireAuth>
                } />
                <Route path="/projects/:id/reports" element={
                  <RequireAuth>
                    <AppLayout>
                      <ProjectReports />
                    </AppLayout>
                  </RequireAuth>
                } />
              </Routes>
              <Toaster />
            </Router>
          </SecurityProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
