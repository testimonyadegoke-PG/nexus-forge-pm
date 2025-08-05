
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ViewToggle, View } from '@/components/ViewToggle';
import { TaskForm } from '@/components/TaskForm';
import { TaskEditFormWrapper } from '@/components/TaskEditFormWrapper';
import { useTasks, useProjectTasks, Task } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Plus, Calendar, Clock, User, BarChart } from 'lucide-react';

const Tasks = () => {
  const [view, setView] = useState<View>("list");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: allTasks = [], isLoading: allTasksLoading } = useTasks();
  const { data: projectTasks = [], isLoading: projectTasksLoading } = useProjectTasks(selectedProject || '');
  const { data: projects = [] } = useProjects();

  const tasks = selectedProject ? projectTasks : allTasks;
  const isLoading = selectedProject ? projectTasksLoading : allTasksLoading;

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setShowEditDialog(true);
  };

  const handleTaskFormSuccess = () => {
    setShowTaskForm(false);
  };

  const handleProjectChange = (value: string) => {
    if (value === "all-projects") {
      setSelectedProject(null);
    } else {
      setSelectedProject(value);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage and track your project tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle
              view={view}
              onViewChange={setView}
            />
            <Button onClick={() => setShowTaskForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select onValueChange={handleProjectChange} defaultValue="all-projects">
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-projects">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Content */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found. Create your first task to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleEditTask(task)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{task.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{task.assignee.full_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <BarChart className="w-4 h-4" />
                          <span>{task.progress}% complete</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{task.category}</Badge>
                      <Badge 
                        variant={task.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Creation Form */}
      {showTaskForm && selectedProject && (
        <TaskForm
          projectId={selectedProject}
          onSuccess={handleTaskFormSuccess}
        />
      )}

      {/* Show message if no project selected */}
      {showTaskForm && !selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <p className="text-center">Please select a project first to create a task.</p>
            <Button className="mt-4 w-full" onClick={() => setShowTaskForm(false)}>
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Task Edit Form */}
      {editTask && (
        <TaskEditFormWrapper
          task={editTask}
          projectId={editTask.project_id}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </div>
  );
};

export default Tasks;
