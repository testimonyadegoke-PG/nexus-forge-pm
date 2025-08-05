
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Tasks from '@/pages/Tasks';
import Budgets from '@/pages/Budgets';
import CostEntries from '@/pages/CostEntries';
import Team from '@/pages/Team';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import ProjectDetail from '@/pages/ProjectDetail';
import TaskDetail from '@/pages/TaskDetail';
import CreateProject from '@/pages/CreateProject';
import CreateTask from '@/pages/CreateTask';
import CreateBudget from '@/pages/CreateBudget';
import CreateCostEntry from '@/pages/CreateCostEntry';
import ProjectSchedule from '@/pages/ProjectSchedule';
import ProjectSettings from '@/pages/ProjectSettings';
import ProjectReports from '@/pages/ProjectReports';
import NotFound from '@/pages/NotFound';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route path="/" element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/new" element={<CreateProject />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/schedule" element={<ProjectSchedule />} />
              <Route path="projects/:id/settings" element={<ProjectSettings />} />
              <Route path="projects/:id/reports" element={<ProjectReports />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/new" element={<CreateTask />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="budgets/new" element={<CreateBudget />} />
              <Route path="cost-entries" element={<CostEntries />} />
              <Route path="cost-entries/new" element={<CreateCostEntry />} />
              <Route path="team" element={<Team />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
