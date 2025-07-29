
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalSearch } from "@/components/GlobalSearch";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Budgets from "./pages/Budgets";
import Team from "./pages/Team";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectReports from "./pages/ProjectReports";
import ProjectSchedule from "./pages/ProjectSchedule";
import TaskDetail from "./pages/TaskDetail.tsx";
import ProjectSettings from "./pages/ProjectSettings";
import { CostEntries } from "./pages/CostEntries";
import NotFound from "./pages/NotFound";
import CreateProject from "./pages/CreateProject";
import CreateTask from "./pages/CreateTask";
import CreateBudget from "./pages/CreateBudget";
import CreateCostEntry from "./pages/CreateCostEntry";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Route guard for protected routes
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = window.location;
  if (loading) return <div>Loading...</div>;
  if (!user) {
    window.location.replace('/login');
    return null;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <div className="w-full flex flex-col items-center">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<RequireAuth><AppLayout /></RequireAuth>}>
                  <Route index element={<Dashboard />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/new" element={<CreateProject />} />
                  <Route path="projects/:id" element={<ProjectDetail />}>
                    <Route index element={<ProjectDetail />} />
                    <Route path="overview" element={<ProjectDetail />} />
                    <Route path="schedule" element={<ProjectSchedule />} />
                    <Route path="budget" element={<Budgets />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="reports" element={<ProjectReports />} />
                  </Route>
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="tasks/new" element={<CreateTask />} />
                  <Route path="tasks/:taskId" element={<TaskDetail />} />
                  <Route path="budgets" element={<Budgets />} />
                  <Route path="budgets/new" element={<CreateBudget />} />
                  <Route path="costs" element={<CostEntries />} />
                  <Route path="costs/new" element={<CreateCostEntry />} />
                  <Route path="team" element={<Team />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="settings/projects" element={<ProjectSettings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
