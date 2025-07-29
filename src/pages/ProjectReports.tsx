import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProjectBudgets } from "@/hooks/useBudgets";
import { useProjectTasks } from "@/hooks/useTasks";
import { useProjectMilestones } from "@/hooks/useMilestones";
import { MilestoneKPI } from "@/components/milestones/MilestoneKPI";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e42", "#ef4444", "#14b8a6"];

const ProjectReports: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const { data: budgets = [], isLoading: budgetsLoading } = useProjectBudgets(id);
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(id);
  const { data: milestones = [], isLoading: milestonesLoading } = useProjectMilestones(id);

  // Budget vs Actual Spend (mock costs if no hook)
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  // Mock spent as 60% of budget for demo
  const totalSpent = totalBudget * 0.6;
  const budgetData = [
    { name: "Budgeted", value: totalBudget },
    { name: "Spent", value: totalSpent },
  ];

  // Task Completion Pie
  const statusCounts: Record<string, number> = {};
  tasks.forEach((t: any) => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });
  const taskStatusData = Object.entries(statusCounts).map(([status, count], i) => ({
    name: status.replace(/-/g, " "), value: count, fill: COLORS[i % COLORS.length],
  }));

  // Milestone Timeline: use real milestone model
  const milestoneData = milestones.map((m: any) => ({
    name: m.name,
    date: m.due_date,
    status: m.status,
  }));

  // Team Workload: tasks by assignee
  const teamWorkload: Record<string, number> = {};
  tasks.forEach((t: any) => {
    const assignee = t.assignee?.full_name || 'Unassigned';
    teamWorkload[assignee] = (teamWorkload[assignee] || 0) + 1;
  });
  const workloadData = Object.entries(teamWorkload).map(([name, value]) => ({ name, value }));

  // Burndown Chart: completed milestones over time
  const burndownData = milestones
    .filter((m: any) => m.status === 'completed')
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .map((m: any, i: number) => ({
      name: m.name,
      completed: i + 1,
      date: m.due_date,
    }));

  // Filters (stub)
  // TODO: implement real filters
  const [milestoneStatus, setMilestoneStatus] = React.useState<'all' | 'completed' | 'upcoming' | 'missed'>('all');
  const filteredMilestones = milestoneStatus === 'all' ? milestoneData : milestoneData.filter(m => m.status === milestoneStatus);

  // Export handler (stub)
  const handleExport = () => {
    // TODO: implement export as CSV/PNG/PDF
    alert('Export feature coming soon!');
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Project Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <MilestoneKPI milestones={milestones} />
            <div className="ml-auto flex gap-2">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={milestoneStatus}
                onChange={e => setMilestoneStatus(e.target.value as any)}
                aria-label="Filter milestones by status"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
                <option value="missed">Missed</option>
              </select>
              <button
                className="bg-primary text-white px-3 py-1 rounded text-sm"
                onClick={handleExport}
                aria-label="Export analytics"
              >
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Budget vs. Actual */}
            <div>
              <h3 className="font-semibold mb-2">Budget vs. Actual Spend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={budgetData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-xs text-muted-foreground mt-2">
                Budgeted: ${totalBudget.toLocaleString()} &nbsp; | &nbsp; Spent: ${totalSpent.toLocaleString()}
              </div>
            </div>

            {/* Task Completion Pie */}
            <div>
              <h3 className="font-semibold mb-2">Task Completion Status</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Milestone Timeline */}
          <div className="mt-10">
            <h3 className="font-semibold mb-2">Milestone Timeline</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={filteredMilestones} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} />
                <Bar dataKey={() => 1} fill="#22c55e" barSize={16} />
                <Tooltip formatter={() => "Milestone"} labelFormatter={(name) => name} />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground mt-2">
              {filteredMilestones.length === 0 && "No milestones found for this project."}
            </div>
          </div>

          {/* Team Workload */}
          <div className="mt-10">
            <h3 className="font-semibold mb-2">Team Workload</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={workloadData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Bar dataKey="value" fill="#14b8a6" barSize={28} />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground mt-2">
              {workloadData.length === 0 && "No team workload data."}
            </div>
          </div>

          {/* Burndown Chart */}
          <div className="mt-10">
            <h3 className="font-semibold mb-2">Milestone Burndown</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={burndownData}>
                <XAxis dataKey="date" />
                <YAxis dataKey="completed" allowDecimals={false} />
                <Bar dataKey="completed" fill="#f59e42" barSize={18} />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground mt-2">
              {burndownData.length === 0 && "No completed milestones yet."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectReports;
