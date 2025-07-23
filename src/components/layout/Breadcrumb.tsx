
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbItems = [
    { label: 'Home', path: '/', icon: Home },
    ...pathSegments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: `/${pathSegments.slice(0, index + 1).join('/')}`,
    })),
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
