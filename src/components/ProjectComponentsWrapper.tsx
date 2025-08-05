
import React from 'react';

interface ProjectComponentWrapperProps {
  projectId: string;
  children: React.ReactNode;
}

export const ProjectComponentWrapper: React.FC<ProjectComponentWrapperProps> = ({ projectId, children }) => {
  return <div data-project-id={projectId}>{children}</div>;
};
