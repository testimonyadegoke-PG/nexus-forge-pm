
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProjectTasks, useUpdateTask } from "@/hooks/useTasks";
import { useProjectMilestones } from "@/hooks/useMilestones";
import { MilestoneList } from "@/components/milestones/MilestoneList";
import { MilestoneKPI } from "@/components/milestones/MilestoneKPI";
import { MilestoneForm } from "@/components/milestones/MilestoneForm";
import { MilestoneDetail } from "@/components/milestones/MilestoneDetail";
import { MilestoneExportMenu } from "@/components/milestones/MilestoneExportMenu";
import type { Milestone } from "@/types/milestone";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import { MilestoneGanttMarker } from "@/components/milestones/MilestoneGanttMarker";
import { GanttExportMenu } from '@/components/GanttExportMenu';
import "gantt-task-react/dist/index.css";
import { ProjectTasksList } from "@/components/ProjectTasksList";

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

const ProjectSchedule: React.FC = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [editMilestone, setEditMilestone] = React.useState<Milestone | undefined>(undefined);
  const [selectedMilestone, setSelectedMilestone] = React.useState<Milestone | undefined>(undefined);
  const { id = "" } = useParams<{ id: string }>();
  const { data: tasksRaw, isLoading: tasksLoading, refetch: refetchTasks } = useProjectTasks(id);
  const { data: milestonesRaw, isLoading: milestonesLoading } = useProjectMilestones(id);
  const { mutate: updateTask } = useUpdateTask();
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const milestones: Milestone[] = Array.isArray(milestonesRaw) ? milestonesRaw : [];

  // Map tasks to Gantt format
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
        styles: { progressColor: getTaskColor(t.status), backgroundColor: getTaskColor(t.status) },
      })),
    [tasks]
  );

  // Add milestones as Gantt milestones
  const ganttMilestones: GanttTask[] = useMemo(() =>
    milestones.map((m) => ({
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

  const [allGanttItems, setAllGanttItems] = React.useState<GanttTask[]>([...ganttTasks, ...ganttMilestones]);

  React.useEffect(() => {
    setAllGanttItems([...ganttTasks, ...ganttMilestones]);
  }, [ganttTasks, ganttMilestones]);

  const handleTaskChange = (task: GanttTask) => {
    console.log("On date change Id:" + task.id);
    const changedTask = tasks.find(t => t.id === task.id);
    if (changedTask) {
      updateTask({ 
        id: task.id, 
        data: { 
          start_date: task.start.toISOString(), 
          end_date: task.end.toISOString() 
        } 
      });
    }
  };

  const handleExpanderClick = (task: GanttTask) => {
    setAllGanttItems(allGanttItems.map(t => (t.id === task.id ? task : t)));
  };

  // Gantt Zoom State
  const ZOOM_LEVELS = [
    { viewMode: ViewMode.Month, columnWidth: 150, label: 'Month' },
    { viewMode: ViewMode.Week, columnWidth: 60, label: 'Week' },
    { viewMode: ViewMode.Day, columnWidth: 90, label: 'Day' },
    { viewMode: ViewMode.Hour, columnWidth: 120, label: 'Hour' },
  ];
  const [zoomLevel, setZoomLevel] = React.useState(2); // Default to Day
  const [listCellWidth, setListCellWidth] = React.useState('180px');
  const ganttRef = React.useRef<HTMLDivElement>(null);

  // Auto-fit Gantt on mount or data change
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setListCellWidth('120px');
      } else {
        setListCellWidth('180px');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial width

    if (!ganttRef.current || allGanttItems.length === 0) return;
    // Estimate columns needed
    const minDate = allGanttItems.reduce((min, t) => t.start < min ? t.start : min, allGanttItems[0].start);
    const maxDate = allGanttItems.reduce((max, t) => t.end > max ? t.end : max, allGanttItems[0].end);
    const days = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    // Auto-select zoom level based on range
    let autoZoom = 2; // Day
    if (days > 90) autoZoom = 0; // Month
    else if (days > 30) autoZoom = 1; // Week
    else if (days < 7) autoZoom = 3; // Hour
    setZoomLevel(autoZoom);
    // Scroll to left
    ganttRef.current.scrollLeft = 0;

    return () => window.removeEventListener('resize', handleResize);
  }, [allGanttItems.length]);

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoomLevel(z => Math.max(0, Math.min(ZOOM_LEVELS.length - 1, z + delta)));
  };
  const { viewMode, columnWidth, label: zoomLabel } = ZOOM_LEVELS[zoomLevel];
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Project Gantt Chart</CardTitle>
            <div className="flex items-center gap-4 flex-wrap justify-end">
              <GanttExportMenu ganttRef={ganttRef} tasks={allGanttItems} />
              <div className="flex items-center gap-2" aria-label="Zoom controls">
                <button
                  className="bg-muted px-2 py-1 rounded text-lg font-bold"
                  aria-label="Zoom out"
                  disabled={zoomLevel === 0}
                  onClick={() => handleZoom(-1)}
                  onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && zoomLevel > 0) handleZoom(-1); }}
                >-
                </button>
                <span className="text-xs text-muted-foreground">{zoomLabel} View</span>
                <button
                  className="bg-muted px-2 py-1 rounded text-lg font-bold"
                  aria-label="Zoom in"
                  disabled={zoomLevel === ZOOM_LEVELS.length - 1}
                  onClick={() => handleZoom(1)}
                  onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && zoomLevel < ZOOM_LEVELS.length - 1) handleZoom(1); }}
                >+
                </button>
              </div>
            </div> 
          </div>
        </CardHeader>
        <CardContent>
          {tasksLoading && milestonesLoading ? (
            <div className="text-muted-foreground">Loading schedule...</div>
          ) : (
            allGanttItems.length > 0 ? (
              <div
                ref={ganttRef}
                className="bg-card p-2 rounded-lg shadow-inner overflow-auto"
                style={{ maxHeight: 480 }}
                tabIndex={0}
                aria-label="Gantt chart scroll area"
              >
                <div style={{ position: 'relative', minWidth: 600 }}>
                  <Gantt
                    tasks={allGanttItems}
                    viewMode={viewMode}
                    locale="en-GB"
                    listCellWidth={listCellWidth}
                    ganttHeight={380}
                    columnWidth={columnWidth}
                    onDateChange={handleTaskChange}
                    onExpanderClick={handleExpanderClick}
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
                    onSelect={(task) => {
                      if (task.type === "milestone") {
                        const m = milestones.find(mil => mil.id === task.id);
                        if (m) setSelectedMilestone(m);
                      }
                    }}
                  />
                  {/* Render diamond markers for milestones */}
                  {(Array.isArray(ganttMilestones) ? ganttMilestones : []).map((milestone) => {
                    // Find the corresponding DOM element for the milestone row
                    // For simplicity, let's estimate the left position by date
                    const chartStart = allGanttItems.reduce((min, t) => t.start < min ? t.start : min, allGanttItems[0]?.start || new Date());
                    const chartEnd = allGanttItems.reduce((max, t) => t.end > max ? t.end : max, allGanttItems[0]?.end || new Date());
                    const totalDays = (chartEnd.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24) || 1;
                    const milestoneDate = new Date(milestone.start);
                    const daysFromStart = (milestoneDate.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24);
                    const left = Math.max(0, Math.round((daysFromStart / totalDays) * 900)); // 900px is typical chart width
                    return (
                      <MilestoneGanttMarker
                        key={milestone.id}
                        milestone={milestones.find(m => m.id === milestone.id)!}
                        left={left}
                        top={32 + ganttMilestones.indexOf(milestone) * 44} // stagger vertically
                        onHover={() => {}}
                        onClick={setSelectedMilestone}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No schedule data found for this project.</div>
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectTasksList projectId={id} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <div className="ml-auto">
            <button
              className="bg-primary text-white px-3 py-1 rounded text-sm"
              onClick={() => setShowForm(true)}
            >
              + Add Milestone
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <MilestoneKPI milestones={milestones} />
            <MilestoneExportMenu milestones={milestones} />
          </div>
          <MilestoneList
            milestones={milestones}
            onMilestoneClick={setSelectedMilestone}
            onEditMilestone={setEditMilestone}
          />
        </CardContent>

        {/* Milestone Form Modal */}
        <MilestoneForm
          open={showForm || !!editMilestone}
          onClose={() => { setShowForm(false); setEditMilestone(undefined); }}
          projectId={id}
          milestone={editMilestone}
        />
        {/* Milestone Detail Modal */}
        {selectedMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-xl p-6 relative w-full max-w-xl">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedMilestone(undefined)}
                aria-label="Close"
              >
                ×
              </button>
              <MilestoneDetail
                milestone={selectedMilestone}
                onEdit={() => {
                  setEditMilestone(selectedMilestone);
                  setSelectedMilestone(undefined);
                }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProjectSchedule;
