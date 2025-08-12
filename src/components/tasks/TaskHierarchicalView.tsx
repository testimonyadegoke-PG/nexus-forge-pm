
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Calendar, User, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  due_date: string;
  assignee_id?: string;
  category: string;
  subcategory?: string;
  dependencies?: string[];
}

interface TaskHierarchicalViewProps {
  tasks: Task[];
  projectId: string;
  onCreateTask?: () => void;
}

export const TaskHierarchicalView: React.FC<TaskHierarchicalViewProps> = ({
  tasks,
  projectId,
  onCreateTask
}) => {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const groupTasksByCategory = () => {
    const grouped: Record<string, Record<string, Task[]>> = {};
    
    tasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      const subcategory = task.subcategory || 'General';
      
      if (!grouped[category]) {
        grouped[category] = {};
      }
      if (!grouped[category][subcategory]) {
        grouped[category][subcategory] = [];
      }
      grouped[category][subcategory].push(task);
    });

    return grouped;
  };

  const groupedTasks = groupTasksByCategory();

  const getCategoryProgress = (categoryTasks: Record<string, Task[]>) => {
    const allTasks = Object.values(categoryTasks).flat();
    if (allTasks.length === 0) return 0;
    
    const totalProgress = allTasks.reduce((sum, task) => sum + task.progress, 0);
    return totalProgress / allTasks.length;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'blocked': return 'text-red-600';
      case 'on-hold': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/dashboard/tasks/${taskId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Tasks</h3>
        <Button onClick={onCreateTask} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedTasks).map(([category, subcategories]) => {
          const isExpanded = expandedCategories.has(category);
          const categoryProgress = getCategoryProgress(subcategories);
          const totalTasks = Object.values(subcategories).flat().length;

          return (
            <Card key={category}>
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{category}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {totalTasks} task{totalTasks !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <div className="text-sm font-medium mb-1">
                          {categoryProgress.toFixed(0)}% Complete
                        </div>
                        <Progress value={categoryProgress} className="h-2" />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {Object.entries(subcategories).map(([subcategory, subcategoryTasks]) => (
                        <div key={subcategory} className="space-y-2">
                          {subcategory !== 'General' && (
                            <h4 className="font-medium text-sm text-muted-foreground border-l-2 border-primary pl-2">
                              {subcategory}
                            </h4>
                          )}
                          
                          <div className="space-y-2 ml-4">
                            {subcategoryTasks.map((task) => (
                              <Card 
                                key={task.id}
                                className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-all"
                                onClick={() => handleTaskClick(task.id)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h5 className="font-medium">{task.name}</h5>
                                        <Badge 
                                          variant="outline" 
                                          className={getStatusColor(task.status)}
                                        >
                                          {task.status}
                                        </Badge>
                                        {task.progress === 100 && (
                                          <Badge variant="default" className="bg-green-100 text-green-800">
                                            Complete
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      {task.description && (
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                          {task.description}
                                        </p>
                                      )}

                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{formatDate(task.start_date)} - {formatDate(task.due_date)}</span>
                                        </div>
                                        {task.assignee_id && (
                                          <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            <span>Assigned</span>
                                          </div>
                                        )}
                                        {task.dependencies && task.dependencies.length > 0 && (
                                          <Badge variant="secondary" className="text-xs">
                                            {task.dependencies.length} dependencies
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="text-right min-w-[80px]">
                                        <div className="text-sm font-medium mb-1">
                                          {task.progress}%
                                        </div>
                                        <Progress value={task.progress} className="h-2" />
                                      </div>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTaskClick(task.id);
                                        }}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}

        {Object.keys(groupedTasks).length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No tasks found for this project</p>
              </div>
              <Button onClick={onCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
