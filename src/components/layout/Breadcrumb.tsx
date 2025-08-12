
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Detect /dashboard/projects/:id or any subroute
  const isProjectRoute = pathSegments[0] === 'dashboard' && pathSegments[1] === 'projects' && pathSegments[2];
  const projectId = isProjectRoute ? pathSegments[2] : null;

  // Detect /dashboard/tasks/:id
  const isTaskRoute = pathSegments[0] === 'dashboard' && pathSegments[1] === 'tasks' && pathSegments[2];
  const taskId = isTaskRoute ? pathSegments[2] : null;

  // Fetch project name using React Query
  const { data: projectName } = useQuery({
    queryKey: ['breadcrumb-project-name', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      if (error) return null;
      return data?.name || null;
    },
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });

  // Fetch task name using React Query
  const { data: taskName } = useQuery({
    queryKey: ['breadcrumb-task-name', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const { data, error } = await supabase
        .from('tasks')
        .select('name')
        .eq('id', taskId)
        .single();
      if (error) return null;
      return data?.name || null;
    },
    enabled: !!taskId,
    staleTime: 60 * 1000,
  });

  const breadcrumbItems = [
    { label: 'Home', path: '/', icon: Home },
    ...pathSegments.map((segment, index) => {
      // If this is the /dashboard/projects/:id segment, use projectName if available
      if (index === 2 && isProjectRoute) {
        return {
          label: projectName || segment,
          path: `/${pathSegments.slice(0, index + 1).join('/')}`,
        };
      }
      
      // If this is the /dashboard/tasks/:id segment, use taskName if available
      if (index === 2 && isTaskRoute) {
        return {
          label: taskName || segment,
          path: `/${pathSegments.slice(0, index + 1).join('/')}`,
        };
      }
      
      return {
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: `/${pathSegments.slice(0, index + 1).join('/')}`,
      };
    }),
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          <Link
            to={item.path}
            className={`flex items-center gap-1 hover:text-foreground transition-colors ${
              index === breadcrumbItems.length - 1 ? 'text-foreground font-medium' : ''
            }`}
          >
            {'icon' in item && item.icon && <item.icon className="h-4 w-4" />}
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};
