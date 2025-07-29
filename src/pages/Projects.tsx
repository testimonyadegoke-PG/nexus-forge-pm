import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, Edit, Eye, Archive, MoreVertical, Kanban, Users, CheckCircle2, DollarSign, CalendarDays, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggleWithKanban as ViewToggle } from '@/components/ViewToggleWithKanban';
import { ProjectForm } from '@/components/ProjectForm';
import { EditProjectForm } from '@/components/forms/EditProjectForm';
import { ProjectSettingsForm } from '@/components/forms/ProjectSettingsForm';
import { useProjects, useCreateProject, useUpdateProject, Project } from '@/hooks/useProjects';
import { useProjectTasks } from '@/hooks/useTasks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProjectBudgets } from '@/hooks/useBudgets';
import { useProjectCostEntries } from '@/hooks/useCostEntries';
import { BulkImportExport } from '@/components/BulkImportExport';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getBudgetStatusColor = (percentage: number) => {
  if (percentage <= 75) return 'text-green-600 dark:text-green-400';
  if (percentage <= 90) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

// Project Card Component
const ProjectCard = ({ project, setSelectedProject, setEditDialogOpen, setSettingsDialogOpen }: { 
  project: Project;
  setSelectedProject: (p: Project | null) => void;
  setEditDialogOpen: (b: boolean) => void;
  setSettingsDialogOpen: (b: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { data: budgets = [] } = useProjectBudgets(project.id);
  const { data: costEntries = [] } = useProjectCostEntries(project.id);
  const { data: tasks = [] } = useProjectTasks(project.id);

  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.allocated_amount), 0);
  const totalCosts = costEntries.reduce((sum, cost) => sum + Number(cost.amount), 0);
  const teamSize = new Set(tasks.map(t => t.assignee_id).filter(Boolean)).size;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const endDate = new Date(project.end_date);
  const today = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const totalDuration = new Date(project.end_date).getTime() - new Date(project.start_date).getTime();
  const elapsedDuration = today.getTime() - new Date(project.start_date).getTime();
  const progressPercentage = totalDuration > 0 ? Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100) : 0;

  // Budget progress for circular indicator
  const budgetUsedPercent = totalBudget > 0 ? Math.min((totalCosts / totalBudget) * 100, 100) : 0;
  const budgetColor = budgetUsedPercent <= 75 ? '#22c55e' : budgetUsedPercent <= 90 ? '#eab308' : '#ef4444'; // green/yellow/red

  // Animation (simple fade/slide-in)
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const handleCardClick = () => {
    navigate(`/dashboard/projects/${project.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative overflow-hidden rounded-2xl border border-white/20 shadow-xl transition-all duration-300 ease-in-out transform cursor-pointer flex flex-col h-full group
        bg-white/70 dark:bg-[#18181b]/60 backdrop-blur-lg
        hover:shadow-2xl hover:-translate-y-1 hover:border-primary/60
        ${mounted ? 'animate-fadein-slideup' : 'opacity-0 translate-y-4'}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
      aria-label={`View project ${project.name}`}
      style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.09) 100%)' }} />
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-white/10 flex justify-between items-start">
        <div>
          <h3 className="font-extrabold text-xl text-primary drop-shadow-sm mb-1">{project.name}</h3>
          <Badge className={`${getStatusColor(project.status)} font-medium capitalize backdrop-blur-sm bg-opacity-60`} variant="secondary">
            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={(e) => e.stopPropagation()} aria-label="Project actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/projects/${project.id}`); }}>
              <Eye className="h-4 w-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedProject(project); setEditDialogOpen(true); }}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedProject(project); setSettingsDialogOpen(true); }}>
              <Settings className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Archive className="h-4 w-4 mr-2" /> Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body with Stats */}
      <div className="relative z-10 p-4 flex-grow flex flex-col gap-4">
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {project.description || 'No description provided.'}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{teamSize} Team Members</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span>{completedTasks}/{tasks.length} Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {daysLeft >= 0 ? <span>{daysLeft} days left</span> : <span className="text-red-500">{Math.abs(daysLeft)} days overdue</span>}
          </div>
          {/* Budget Indicator (circular) */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center" title="Budget usage" aria-label={`Budget used: ${budgetUsedPercent.toFixed(0)}%`}>
              <svg width="38" height="38" viewBox="0 0 38 38" className="block">
                <circle
                  cx="19" cy="19" r="16"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  opacity="0.5"
                />
                <circle
                  cx="19" cy="19" r="16"
                  fill="none"
                  stroke={budgetColor}
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 16}
                  strokeDashoffset={2 * Math.PI * 16 * (1 - budgetUsedPercent / 100)}
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,2,.6,1)' }}
                  strokeLinecap="round"
                />
                <text
                  x="50%" y="54%" textAnchor="middle" fontSize="11" fontWeight="bold"
                  fill={budgetColor} dominantBaseline="middle"
                >
                  {Math.round(budgetUsedPercent)}%
                </text>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Budget</span>
              <span className="text-xs font-semibold">${totalCosts.toLocaleString()} / ${totalBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Progress and Manager */}
      <div className="relative z-10 p-4 border-t border-white/10">
        <div className="mb-2">
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-green-400 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            ></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={project.manager?.avatar_url} />
              <AvatarFallback>{project.manager?.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{project.manager?.full_name || 'Unassigned'}</span>
          </div>
          <span className="text-xs font-semibold">{progressPercentage.toFixed(0)}%</span>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadein-slideup {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein-slideup { animation: fadein-slideup 0.7s cubic-bezier(.4,2,.6,1) both; }
      `}</style>
    </div>
  );
};

// Project Row Component
const ProjectRow = ({ project, setSelectedProject, setEditDialogOpen, setSettingsDialogOpen }: { 
  project: Project;
  setSelectedProject: (p: Project | null) => void;
  setEditDialogOpen: (b: boolean) => void;
  setSettingsDialogOpen: (b: boolean) => void;
}) => {
  const { data: budgets = [] } = useProjectBudgets(project.id);
  const { data: costEntries = [] } = useProjectCostEntries(project.id);
  
  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.allocated_amount), 0);
  const totalCosts = costEntries.reduce((sum, cost) => sum + Number(cost.amount), 0);
  const spentPercentage = totalBudget > 0 ? (totalCosts / totalBudget) * 100 : 0;

  const isOverdue = new Date(project.end_date) < new Date() && project.status !== 'completed';
  const isOverBudget = spentPercentage > 100;

  return (
    <TableRow tabIndex={0} aria-label={`Project ${project.name}`}>
      <TableCell className="font-medium flex items-center gap-2">
        {project.name}
        {isOverdue && <Badge className="bg-orange-600 text-white ml-2">Overdue</Badge>}
        {isOverBudget && <Badge className="bg-red-600 text-white ml-2">Over Budget</Badge>}
      </TableCell>
      <TableCell><Badge variant="secondary" className="capitalize">{project.status.replace('-', ' ')}</Badge></TableCell>
      <TableCell>{format(new Date(project.start_date), 'MMM dd, yyyy')}</TableCell>
      <TableCell>{format(new Date(project.end_date), 'MMM dd, yyyy')}</TableCell>
      <TableCell>${totalBudget.toLocaleString()}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <span className={spentPercentage <= 75 ? 'text-green-600' : spentPercentage <= 90 ? 'text-yellow-600' : 'text-red-600'}>{spentPercentage.toFixed(1)}%</span>
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full ${spentPercentage <= 75 ? 'bg-green-500' : spentPercentage <= 90 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(spentPercentage, 100)}%` }} /></div>
        </div>
      </TableCell>
      <TableCell>{project.manager?.full_name || 'Unassigned'}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/dashboard/projects/${project.id}`, '_self')}>
              <Eye className="h-4 w-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedProject(project); setEditDialogOpen(true); }}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedProject(project); setSettingsDialogOpen(true); }}>
              <Edit className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem><Archive className="h-4 w-4 mr-2" /> Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

// Kanban View Component
const KanbanView = ({ projects, setEditDialogOpen, setSelectedProject, setSettingsDialogOpen, updateProjectStatus }) => {
  const columns = {
    'planning': { name: 'Planning', items: [] },
    'active': { name: 'Active', items: [] },
    'on-hold': { name: 'On Hold', items: [] },
    'completed': { name: 'Completed', items: [] },
    'cancelled': { name: 'Cancelled', items: [] },
  };

  projects.forEach(p => {
    if (columns[p.status]) {
      columns[p.status].items.push(p);
    }
  });

  const [board, setBoard] = useState(columns);

  useEffect(() => {
    const newBoard = {
      'planning': { name: 'Planning', items: [] },
      'active': { name: 'Active', items: [] },
      'on-hold': { name: 'On Hold', items: [] },
      'completed': { name: 'Completed', items: [] },
      'cancelled': { name: 'Cancelled', items: [] },
    };
    projects.forEach(p => {
      if (newBoard[p.status]) {
        newBoard[p.status].items.push(p);
      }
    });
    setBoard(newBoard);
  }, [projects]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const column = board[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setBoard({
        ...board,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    } else {
      // Moving to a different column
      const sourceColumn = board[source.droppableId];
      const destColumn = board[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      const updatedProject = { ...removed, status: destination.droppableId };
      destItems.splice(destination.index, 0, updatedProject);

      // Trigger mutation to update the project status in the backend
      updateProjectStatus({ id: removed.id, status: destination.droppableId });

      setBoard({
        ...board,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {Object.entries(board).map(([columnId, column]) => (
          <Droppable droppableId={columnId} key={columnId}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`bg-muted/50 rounded-lg p-3 w-80 flex-shrink-0 ${snapshot.isDraggingOver ? 'bg-muted' : ''}`}
              >
                <h3 className="font-semibold mb-3 px-1">{column.name} ({column.items.length})</h3>
                <div className="space-y-3 min-h-[100px]">
                  {column.items.map((project, index) => (
                    <Draggable key={project.id} draggableId={project.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            userSelect: 'none',
                            ...provided.draggableProps.style,
                          }}
                        >
                          <ProjectCard 
                            project={project} 
                            setSelectedProject={setSelectedProject} 
                            setEditDialogOpen={setEditDialogOpen} 
                            setSettingsDialogOpen={setSettingsDialogOpen} 
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

// Main Projects Page Component
const Projects = () => {
  const { mutate: createProject } = useCreateProject();
  const [view, setView] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading, refetch } = useProjects();
  const { mutate: updateProject } = useUpdateProject();

  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = project.name.toLowerCase().includes(searchLower) || (project.description && project.description.toLowerCase().includes(searchLower));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setBulkImportOpen(true)}>Bulk Import/Export</Button>
          <Button onClick={() => navigate('/dashboard/projects/new')}><Plus className="h-4 w-4 mr-2" />Create Project</Button>
        </div>
      </div>
      
      {bulkImportOpen && (
        <BulkImportExport<Project>
          entityName="Project"
          templateHeaders={["name","description","start_date","end_date","status","manager_id","currency_id"]}
          onImport={async (rows) => { for (const row of rows) { await createProject(row); } }}
          exportData={projects}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ViewToggle view={view} setView={setView} showKanban={true} />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter criteria' : 'Get started by creating your first project'}
          </p>
          <Button onClick={() => navigate('/dashboard/projects/new')}><Plus className="h-4 w-4 mr-2" />Create Project</Button>
        </div>
      ) : (
        <>
          {view === 'kanban' && 
            <KanbanView 
              projects={filteredProjects} 
              setSelectedProject={setSelectedProject} 
              setEditDialogOpen={setEditDialogOpen} 
              setSettingsDialogOpen={setSettingsDialogOpen} 
            />
          }
          {view === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} setSelectedProject={setSelectedProject} setEditDialogOpen={setEditDialogOpen} setSettingsDialogOpen={setSettingsDialogOpen} />
              ))}
            </div>
          )}
          {view === 'list' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <ProjectRow key={project.id} project={project} setSelectedProject={setSelectedProject} setEditDialogOpen={setEditDialogOpen} setSettingsDialogOpen={setSettingsDialogOpen} />
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {selectedProject && (
        <>
          <EditProjectForm project={selectedProject} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
          <ProjectSettingsForm project={selectedProject} open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen} />
        </>
      )}
    </div>
  );
};

export default Projects;




