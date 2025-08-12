
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { SecurityProvider } from '@/components/security/SecurityProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { Outlet } from 'react-router-dom';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import CreateProject from '@/pages/CreateProject';
import ProjectDetail from '@/pages/ProjectDetail';
import ProjectDetailFullScreen from '@/pages/ProjectDetailFullScreen';
import ProjectSchedule from '@/pages/ProjectSchedule';
import ProjectReports from '@/pages/ProjectReports';
import ProjectAdvanced from '@/pages/ProjectAdvanced';
import ProjectSettings from '@/pages/ProjectSettings';
import ProjectScheduling from '@/pages/ProjectScheduling';
import Tasks from '@/pages/Tasks';
import CreateTask from '@/pages/CreateTask';
import TaskDetail from '@/pages/TaskDetail';
import TaskDetailFullScreen from '@/pages/TaskDetailFullScreen';
import Budgets from '@/pages/Budgets';
import CreateBudget from '@/pages/CreateBudget';
import CostEntries from '@/pages/CostEntries';
import CostManagement from '@/pages/CostManagement';
import CreateCostEntry from '@/pages/CreateCostEntry';
import Team from '@/pages/Team';
import TeamManagement from '@/pages/TeamManagement';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Create a wrapper component for protected routes
const ProtectedLayout = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" enableSystem>
        <BrowserRouter>
          <AuthProvider>
            <SecurityProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Protected dashboard routes */}
                <Route path="/dashboard" element={<ProtectedLayout />}>
                  <Route index element={<Dashboard />} />
                  
                  {/* Projects */}
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/new" element={<CreateProject />} />
                  <Route path="projects/:id" element={<ProjectDetail />} />
                  <Route path="projects/:id/schedule" element={<ProjectSchedule />} />
                  <Route path="projects/:id/reports" element={<ProjectReports />} />
                  <Route path="projects/:id/advanced" element={<ProjectAdvanced />} />
                  <Route path="projects/:id/settings" element={<ProjectSettings />} />
                  <Route path="projects/:id/scheduling" element={<ProjectScheduling />} />
                  
                  {/* Tasks */}
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="tasks/new" element={<CreateTask />} />
                  <Route path="tasks/:taskId" element={<TaskDetail />} />
                  
                  {/* Budgets */}
                  <Route path="budgets" element={<Budgets />} />
                  <Route path="budgets/new" element={<CreateBudget />} />
                  
                  {/* Cost Management */}
                  <Route path="costs" element={<CostManagement />} />
                  <Route path="cost-entries" element={<CostEntries />} />
                  <Route path="cost-entries/new" element={<CreateCostEntry />} />
                  
                  {/* Team */}
                  <Route path="team" element={<TeamManagement />} />
                  
                  {/* Reports & Settings */}
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Full screen routes */}
                <Route path="/projects/:id/fullscreen" element={<ProjectDetailFullScreen />} />
                <Route path="/tasks/:taskId/fullscreen" element={<TaskDetailFullScreen />} />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
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
