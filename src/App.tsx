import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider, RequireAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Settings from './pages/Settings';
import AppLayout from './components/AppLayout';
import ProjectSettings from './pages/ProjectSettings';
import ProjectAdvanced from './pages/ProjectAdvanced';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <RequireAuth>
                      <AppLayout>
                        <Projects />
                      </AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/projects/:id"
                  element={
                    <RequireAuth>
                      <AppLayout>
                        <ProjectDetail />
                      </AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <RequireAuth>
                      <AppLayout>
                        <Tasks />
                      </AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <RequireAuth>
                      <AppLayout>
                        <Users />
                      </AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireAuth>
                      <AppLayout>
                        <Settings />
                      </AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/project-settings"
                  element={
                    <RequireAuth>
                      <AppLayout>
                        <ProjectSettings />
                      </AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/projects/:id/advanced"
                  element={
                    <RequireAuth>
                      <AppLayout>
                        <ProjectAdvanced />
                      </AppLayout>
                    </RequireAuth>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
