
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProjectTasks, useUpdateTask } from '@/hooks/useTasks';
import { useProjectMilestones } from '@/hooks/useMilestones';
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import "gantt-task-react/dist/index.css";

interface ProjectGanttChartProps {
  projectId: string;
}

const ZOOM_LEVELS = [
  { viewMode: ViewMode.Month, columnWidth: 150, label: 'Month' },
  { viewMode: ViewMode.Week, columnWidth: 60, label: 'Week' },
  { viewMode: ViewMode.Day, columnWidth: 90, label: 'Day' },
  { viewMode: ViewMode.Hour, columnWidth: 120, label: 'Hour' },
];

const getTaskColor = (status: string) => {
  const colors: { [key: string]: { light: string; dark: string } } = {
    completed: { light: "#16a34a", dark: "#4ade80" },
    'in-progress': { light: "#4f46e5", dark: "#818cf8" },
    blocked: { light: "#dc2626", dark: "#f87171" },
    default: { light: "#6b7280", dark: "#9ca3af" },
  };
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  return colors[status]?.[theme] || colors.default[theme];
};

export const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { data: tasksRaw, isLoading: tasksLoading } = useProjectTasks(projectId);
  const { data: milestonesRaw, isLoading: milestonesLoading } = useProjectMilestones(projectId);
  const { mutate: updateTask } = useUpdateTask();
  const ganttRef = useRef<HTMLDivElement>(null);
  
  const [zoomLevel, setZoomLevel] = useState(2); // Default to Day view
  const [listCellWidth, setListCellWidth] = useState('180px');

  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const milestones = Array.isArray(milestonesRaw) ? milestonesRaw : [];

  // Convert tasks to Gantt format
  const ganttTasks: GanttTask[] = useMemo(() =>
    tasks
      .filter((t: any) => t.start_date && t.end_date && t.name)
      .map((t: any) => ({
        id: t.id,
        name: t.name,
        start: new Date(t.start_date),
        end: new Date(t.end_date),
        type: "task" as const,
        progress: t.progress || 0,
        isDisabled: false,
        dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
        styles: { 
          progressColor: getTaskColor(t.status), 
          backgroundColor: getTaskColor(t.status) 
        },
      })),
    [tasks]
  );

  // Convert milestones to Gantt format
  const ganttMilestones: GanttTask[] = useMemo(() =>
    milestones.map((m: any) => ({
      id: m.id,
      name: m.name,
      start: new Date(m.due_date),
      end: new Date(m.due_date),
      type: "milestone" as const,
      progress: 100,
      isDisabled: false,
      dependencies: [],
      styles: { progressColor: "#22c55e", backgroundColor: "#22c55e" },
    })),
    [milestones]
  );

  const allGanttItems = useMemo(() => 
    [...ganttTasks, ...ganttMilestones],
    [ganttTasks, ganttMilestones]
  );

  // Auto-fit and responsive handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setListCellWidth('120px');
      } else {
        setListCellWidth('180px');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Auto-fit zoom level based on date range
    if (allGanttItems.length > 0) {
      const minDate = allGanttItems.reduce((min, t) => t.start < min ? t.start : min, allGanttItems[0].start);
      const maxDate = allGanttItems.reduce((max, t) => t.end > max ? t.end : max, allGanttItems[0].end);
      const days = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Auto-select zoom level based on range
      let autoZoom = 2; // Day
      if (days > 90) autoZoom = 0; // Month
      else if (days > 30) autoZoom = 1; // Week
      else if (days < 7) autoZoom = 3; // Hour
      
      setZoomLevel(autoZoom);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [allGanttItems.length]);

  const handleTaskChange = (task: GanttTask) => {
    const changedTask = tasks.find((t: any) => t.id === task.id);
    if (changedTask) {
      updateTask({ 
        id: task.id, 
        data: { 
          start_date: task.start.toISOString().split('T')[0], 
          end_date: task.end.toISOString().split('T')[0]
        } 
      });
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(current => Math.max(0, Math.min(ZOOM_LEVELS.length - 1, current + delta)));
  };

  const handleReset = () => {
    setZoomLevel(2); // Reset to Day view
    if (ganttRef.current) {
      ganttRef.current.scrollLeft = 0;
    }
  };

  const { viewMode, columnWidth, label: zoomLabel } = ZOOM_LEVELS[zoomLevel];
  const isDark = document.documentElement.classList.contains('dark');

  if (tasksLoading || milestonesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading Gantt chart...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Project Gantt Chart</CardTitle>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <div className="flex items-center gap-2" aria-label="Zoom controls">
              <Button
                variant="outline"
                size="sm"
                disabled={zoomLevel === 0}
                onClick={() => handleZoom(-1)}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-16 text-center">
                {zoomLabel}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={zoomLevel === ZOOM_LEVELS.length - 1}
                onClick={() => handleZoom(1)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div> 
        </div>
      </CardHeader>
      <CardContent>
        {allGanttItems.length > 0 ? (
          <div
            ref={ganttRef}
            className="bg-card p-2 rounded-lg shadow-inner overflow-auto"
            style={{ maxHeight: 600 }}
            tabIndex={0}
            aria-label="Gantt chart scroll area"
          >
            <div style={{ position: 'relative', minWidth: 800 }}>
              <Gantt
                tasks={allGanttItems}
                viewMode={viewMode}
                locale="en-GB"
                listCellWidth={listCellWidth}
                ganttHeight={400}
                columnWidth={columnWidth}
                onDateChange={handleTaskChange}
                barProgressColor={isDark ? '#e2e8f0' : '#f1f5f9'}
                barProgressSelectedColor="#a78bfa"
                barBackgroundColor={isDark ? '#374151' : '#d1d5db'}
                barBackgroundSelectedColor="#8b5cf6"
                projectProgressColor="#a5b4fc"
                projectProgressSelectedColor="#a78bfa"
                projectBackgroundColor="#6366f1"
                projectBackgroundSelectedColor="#8b5cf6"
                milestoneBackgroundColor={isDark ? '#16a34a' : '#22c55e'}
                milestoneBackgroundSelectedColor="#a78bfa"
                arrowColor={isDark ? '#e5e7eb' : '#4b5563'}
                todayColor={isDark ? 'rgba(252, 165, 165, 0.5)' : 'rgba(252, 165, 165, 0.5)'}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks or milestones found for this project.</p>
            <p className="text-sm">Add some tasks to see the Gantt chart.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
