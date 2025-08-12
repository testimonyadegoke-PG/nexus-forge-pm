
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  Briefcase,
  CreditCard,
  Receipt,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Budgets', href: '/dashboard/budgets', icon: Briefcase },
  { name: 'Cost Management', href: '/dashboard/costs', icon: CreditCard },
  { name: 'Cost Entries', href: '/dashboard/cost-entries', icon: Receipt },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const AppSidebar = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-card border-r">
      <div className="flex items-center h-16 px-6 border-b">
        <h1 className="text-xl font-semibold">Nexus Forge</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
