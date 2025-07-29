
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { CreateDropdown } from '@/components/CreateDropdown';
import { useAuth } from '@/contexts/AuthContext';

export const TopNavigation: React.FC = () => {
  const { user, signOut } = useAuth();
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
        </div>
        <div className="flex items-center gap-2">
          <CreateDropdown />
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button size="sm" variant="outline" onClick={signOut}>Sign Out</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
