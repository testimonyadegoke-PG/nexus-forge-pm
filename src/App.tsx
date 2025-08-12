
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Budgets from './pages/Budgets';
import CostManagement from './pages/CostManagement';
import TeamManagement from './pages/TeamManagement';
import ProtectedLayout from './layouts/ProtectedLayout';
import { SecurityProvider } from './components/security/SecurityProvider';
import { AuthProvider } from './contexts/AuthContext';
import ProjectDetail from './pages/ProjectDetail';
import TaskDetail from './pages/TaskDetail';
import ProjectDetailFullScreen from './pages/ProjectDetailFullScreen';
import TaskDetailFullScreen from './pages/TaskDetailFullScreen';
import CreateBudget from './pages/CreateBudget';
import CreateTask from './pages/CreateTask';
import ProjectSchedule from './pages/ProjectSchedule';
import CreateProject from './pages/CreateProject';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <SecurityProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/dashboard/*" element={
                  <ProtectedLayout>
                    <Routes>
                      <Route index element={<Dashboard />} />
                      <Route path="projects" element={<Projects />} />
                      <Route path="projects/create" element={<CreateProject />} />
                      <Route path="projects/:id" element={<ProjectDetail />} />
                      <Route path="projects/:id/fullscreen" element={<ProjectDetailFullScreen />} />
                      <Route path="projects/:id/edit" element={<ProjectDetailFullScreen />} />
                      <Route path="projects/:id/schedule" element={<ProjectSchedule />} />
                      <Route path="tasks" element={<Tasks />} />
                      <Route path="tasks/create" element={<CreateTask />} />
                      <Route path="tasks/:taskId" element={<TaskDetail />} />
                      <Route path="tasks/:taskId/fullscreen" element={<TaskDetailFullScreen />} />
                      <Route path="tasks/:taskId/edit" element={<TaskDetailFullScreen />} />
                      <Route path="budgets" element={<Budgets />} />
                      <Route path="budgets/new" element={<CreateBudget />} />
                      <Route path="costs" element={<CostManagement />} />
                      <Route path="team" element={<TeamManagement />} />
                    </Routes>
                  </ProtectedLayout>
                } />
                
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </SecurityProvider>
          </AuthProvider>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
