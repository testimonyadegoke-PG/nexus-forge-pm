
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  CheckSquare, 
  DollarSign, 
  Receipt, 
  Users, 
  BarChart3, 
  Settings,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Projects', url: '/dashboard/projects', icon: FolderOpen },
  { title: 'Tasks', url: '/dashboard/tasks', icon: CheckSquare },
  { title: 'Budgets', url: '/dashboard/budgets', icon: DollarSign },
  { title: 'Cost Entries', url: '/dashboard/costs', icon: Receipt },
  { title: 'Team', url: '/dashboard/team', icon: Users },
  { title: 'Reports', url: '/dashboard/reports', icon: BarChart3 },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={cn("transition-all duration-300", collapsed ? "w-14" : "w-64")}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn("transition-opacity", collapsed && "opacity-0")}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={cn(
                      "transition-colors",
                      isActive(item.url) && "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                    )}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
