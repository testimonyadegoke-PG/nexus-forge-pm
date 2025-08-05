
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, Edit, Copy, Trash, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ProjectSettingsDialog } from '@/components/ProjectSettingsDialog';
import { ProjectEditDialog } from '@/components/ProjectEditDialog';
import { useToast } from '@/hooks/use-toast';

interface ProjectComponentsWrapperProps {
  projects: Project[];
  setSelectedProject: React.Dispatch<React.SetStateAction<Project>>;
  setEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSettingsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateProjectStatus: (projectId: string, status: string) => void;
}

const ProjectComponentsWrapper: React.FC<ProjectComponentsWrapperProps> = ({
  projects,
  setSelectedProject,
  setEditDialogOpen,
  setSettingsDialogOpen,
  updateProjectStatus,
}) => {
  const { toast } = useToast();

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleSettingsClick = (project: Project) => {
    setSelectedProject(project);
    setSettingsDialogOpen(true);
  };

  const handleStatusUpdate = (projectId: string, status: string) => {
    updateProjectStatus(projectId, status);
    toast({
      title: "Status Updated",
      description: `Project status updated to ${status}`,
    })
  };

  return (
    <>
      {projects.map((project) => (
        <TableRow key={project.id}>
          <TableCell className="font-medium">{project.name}</TableCell>
          <TableCell>{project.description}</TableCell>
          <TableCell>
            <div className="flex items-center">
              <Avatar className="mr-2 h-7 w-7">
                <AvatarImage src="https://github.com/shadcn.png" alt={project.name} />
                <AvatarFallback>{project.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{project.manager?.full_name || 'No manager assigned'}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline">{project.status}</Badge>
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEditClick(project)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSettingsClick(project)}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusUpdate(project.id, project.status === 'active' ? 'inactive' : 'active')}>
                  {project.status === 'active' ? 'Mark as Inactive' : 'Mark as Active'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" /> Copy Project Link
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem>
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this project and remove its data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project>({
    id: '',
    name: '',
    description: '',
    status: 'planning',
    created_at: '',
    created_by: '',
    manager_id: '',
    start_date: '',
    end_date: '',
    updated_at: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const { data: projects = [], isLoading } = useProjects();

  const updateProjectStatus = (projectId: string, status: string) => {
    console.log('Updating project status:', projectId, status);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center">
              <Label htmlFor="search">Search:</Label>
              <Input
                id="search"
                type="search"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2"
              />
              <Button onClick={() => navigate('/dashboard/projects/create')} className="ml-auto">
                Create Project
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableCaption>A list of your projects.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <ProjectComponentsWrapper
                    projects={filteredProjects}
                    setSelectedProject={setSelectedProject}
                    setEditDialogOpen={setEditDialogOpen}
                    setSettingsDialogOpen={setSettingsDialogOpen}
                    updateProjectStatus={updateProjectStatus}
                  />
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={selectedProject}
      />

      <ProjectSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        project={selectedProject}
      />
    </div>
  );
};

export default Projects;
