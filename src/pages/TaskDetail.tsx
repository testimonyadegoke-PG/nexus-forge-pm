import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTask, useUpdateTask } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { useProjects } from '@/hooks/useProjects';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Edit, Paperclip, MessageSquare, CheckSquare, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string().optional(),
  assignee_id: z.string().nullable(),
  start_date: z.string(),
  end_date: z.string(),
});

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const { data: task, isLoading, isError } = useTask(taskId!);
  const { mutate: updateTask } = useUpdateTask();
  const { data: users = [] } = useUsers();
  const { data: projects = [] } = useProjects();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (task) {
      form.reset({
        ...task,
        assignee_id: task.assignee_id || null,
        start_date: format(parseISO(task.start_date), 'yyyy-MM-dd'),
        end_date: format(parseISO(task.end_date), 'yyyy-MM-dd'),
      });
    }
  }, [task, form]);

  if (isLoading) return <div className="flex justify-center items-center h-full"><p>Loading task...</p></div>;
  if (isError || !task) return <div className="flex justify-center items-center h-full"><p>Error loading task details.</p></div>;

  const project = projects?.find(p => p.id === task.project_id);

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    updateTask({ ...values, id: taskId! }, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const renderDetailItem = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between items-center">
      <span className="font-semibold text-muted-foreground">{label}</span>
      <div>{value}</div>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col p-4 sm:p-6 lg:p-8 bg-muted/40">
        <header className="flex items-center justify-between mb-6">
          <Button variant="outline" asChild>
            <Link to={`/dashboard/projects/${task.project_id}/tasks`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Task
              </Button>
            )}
          </div>
        </header>

        <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                {isEditing ? (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 p-0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{task.name}</h1>
                )}
                {isEditing ? (
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormControl>
                          <Textarea {...field} placeholder="Add a more detailed description..." className="border-0 shadow-none focus-visible:ring-0 p-0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <p className="text-muted-foreground mt-2">{task.description || 'No description provided.'}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for checklist/sub-tasks */}
                <div className="flex items-center text-muted-foreground">
                  <CheckSquare className="h-5 w-5 mr-2" />
                  <span>No checklist items yet.</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for attachments */}
                <div className="flex items-center text-muted-foreground">
                  <Paperclip className="h-5 w-5 mr-2" />
                  <span>No attachments.</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for comments */}
                <div className="flex items-center text-muted-foreground">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span>No comments yet.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="not-started">Not Started</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="assignee_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignee</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {users.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={user.avatar_url} />
                                      <AvatarFallback>{user.full_name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <span>{user.full_name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <>
                    {renderDetailItem('Status', <Badge>{task.status}</Badge>)}
                    {renderDetailItem('Priority', <Badge variant="outline">{task.priority || 'Medium'}</Badge>)}
                    {renderDetailItem('Project', <Link to={`/dashboard/projects/${project?.id}`} className="text-primary hover:underline">{project?.name || 'N/A'}</Link>)}
                    {renderDetailItem('Assignee', (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={users.find(u => u.id === task.assignee_id)?.avatar_url} />
                          <AvatarFallback>{users.find(u => u.id === task.assignee_id)?.full_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span>{users.find(u => u.id === task.assignee_id)?.full_name || 'Unassigned'}</span>
                      </div>
                    ))}
                    {renderDetailItem('Start Date', <span>{format(parseISO(task.start_date), 'MMM dd, yyyy')}</span>)}
                    {renderDetailItem('End Date', <span>{format(parseISO(task.end_date), 'MMM dd, yyyy')}</span>)}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </form>
    </Form>
  );
};

export default TaskDetail;
