import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, Building, Users, ClipboardCheck, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateDropdown: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'New Project', icon: Building, path: '/dashboard/projects/new' },
    { label: 'New Task', icon: ClipboardCheck, path: '/dashboard/tasks/new' },
    { label: 'New Budget', icon: DollarSign, path: '/dashboard/budgets/new' },
    { label: 'New Team Member', icon: Users, path: '/dashboard/team/new' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Create</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((item, index) => (
          <DropdownMenuItem key={index} onClick={() => navigate(item.path)}>
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
