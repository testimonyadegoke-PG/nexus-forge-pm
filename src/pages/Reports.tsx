
import React, { useState } from 'react';
import { Calendar, Filter, Download, TrendingUp, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useProjects } from '@/hooks/useProjects';
import { useProjectBudgets } from '@/hooks/useBudgets';
import { useProjectCostEntries } from '@/hooks/useCostEntries';
import { format } from 'date-fns';

const Reports = () => {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [projectFilter, setProjectFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: projects = [] } = useProjects();

  // Mock data for charts
  const budgetVsActualData = projects.slice(0, 6).map(project => ({
    name: project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name,
    budget: Math.floor(Math.random() * 100000) + 50000,
    actual: Math.floor(Math.random() * 80000) + 30000,
  }));

  const costOverTimeData = [
    { month: 'Jan', cost: 45000, budget: 50000 },
    { month: 'Feb', cost: 52000, budget: 55000 },
    { month: 'Mar', cost: 48000, budget: 50000 },
    { month: 'Apr', cost: 61000, budget: 65000 },
    { month: 'May', cost: 55000, budget: 60000 },
    { month: 'Jun', cost: 67000, budget: 70000 },
  ];

  const categoryDistribution = [
    { name: 'Labor', value: 45, color: '#8884d8' },
    { name: 'Materials', value: 25, color: '#82ca9d' },
    { name: 'Equipment', value: 15, color: '#ffc658' },
    { name: 'Overhead', value: 10, color: '#ff7300' },
    { name: 'Other', value: 5, color: '#d084d0' },
  ];

  const topProjectsData = [
    { name: 'Project Alpha', budget: 150000, spent: 135000, overrun: 0, completion: 90 },
    { name: 'Project Beta', budget: 120000, spent: 132000, overrun: 12000, completion: 85 },
    { name: 'Project Gamma', budget: 100000, spent: 85000, overrun: 0, completion: 95 },
    { name: 'Project Delta', budget: 80000, spent: 78000, overrun: 0, completion: 75 },
    { name: 'Project Epsilon', budget: 200000, spent: 175000, overrun: 0, completion: 80 },
  ];

  const taskCompletionData = [
    { status: 'Completed', count: 156, color: '#22c55e' },
    { status: 'In Progress', count: 43, color: '#3b82f6' },
    { status: 'Not Started', count: 28, color: '#6b7280' },
    { status: 'Blocked', count: 12, color: '#ef4444' },
  ];

  const chartConfig = {
    budget: {
      label: 'Budget',
      color: 'hsl(var(--primary))',
    },
    actual: {
      label: 'Actual',
      color: 'hsl(var(--destructive))',
    },
    cost: {
      label: 'Cost',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Visual insights and project metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
            <SelectItem value="last-90-days">Last 90 days</SelectItem>
            <SelectItem value="last-year">Last year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="labor">Labor</SelectItem>
            <SelectItem value="materials">Materials</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="overhead">Overhead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,456,789</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,876,543</div>
            <p className="text-xs text-muted-foreground">
              76.4% of total budget
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects On Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/12</div>
            <p className="text-xs text-muted-foreground">
              66.7% success rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Overruns</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$87,432</div>
            <p className="text-xs text-muted-foreground">
              3.6% over budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetVsActualData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="budget" fill="var(--color-budget)" />
                  <Bar dataKey="actual" fill="var(--color-actual)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} />
                  <Line type="monotone" dataKey="budget" stroke="var(--color-budget)" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Completion Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskCompletionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill={(entry) => entry.color} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Projects by Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Overrun</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProjectsData.map((project, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>${project.budget.toLocaleString()}</TableCell>
                  <TableCell>${project.spent.toLocaleString()}</TableCell>
                  <TableCell>
                    {project.overrun > 0 ? (
                      <span className="text-red-600">${project.overrun.toLocaleString()}</span>
                    ) : (
                      <span className="text-green-600">On Budget</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${project.completion}%` }}
                        />
                      </div>
                      <span className="text-sm">{project.completion}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.overrun > 0 ? "destructive" : "default"}>
                      {project.overrun > 0 ? "Over Budget" : "On Track"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
