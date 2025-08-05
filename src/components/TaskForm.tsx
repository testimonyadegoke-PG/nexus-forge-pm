import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from './FileUpload';
import { RichTextEditor } from './RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateTask, CreateTaskData } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { useTaskStatuses } from '@/hooks/useTaskStatus';
import { usePriorities } from '@/hooks/usePriority';
import { Plus } from 'lucide-react';
import { useProjectCategories } from '@/hooks/useProjectCategory';
import { useProjectSubcategories } from '@/hooks/useProjectSubcategory';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  duration: z.number().min(1, 'Duration must be at least 1 day'),
  progress: z.number().min(0).max(100).default(0),
  assignee_id: z.string().optional(),
  status_id: z.number().optional(),
  priority_id: z.number().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
}).refine(
  (data) => {
    if (!data.start_date || !data.end_date) return true;
    return new Date(data.start_date) <= new Date(data.end_date);
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['end_date'],
  }
);

interface TaskFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export const TaskForm = ({ projectId, onSuccess }: TaskFormProps) => {
  const [open, setOpen] = useState(false);
  const { data: users } = useUsers();
  const { data: statuses } = useTaskStatuses();
  const { data: priorities } = usePriorities();
  const createTask = useCreateTask();
  const { data: categories = [] } = useProjectCategories();
  const [selectedCategory, setSelectedCategory] = useState<number>();
  const { data: subcategories = [] } = useProjectSubcategories(selectedCategory);
  
  const draftKey = `taskform-draft-${projectId}`;
  
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      due_date: '',
      duration: 1,
      progress: 0,
      assignee_id: '',
      status_id: undefined,
      priority_id: undefined,
      category: '',
      subcategory: '',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        form.reset(JSON.parse(savedDraft));
      }
    }
  }, [draftKey, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(draftKey, JSON.stringify(values));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, draftKey]);

  const onSubmit = async (data: z.infer<typeof taskSchema>) => {
    const taskData: CreateTaskData = {
      project_id: projectId,
      name: data.name,
      description: data.description || undefined,
      start_date: data.start_date,
      end_date: data.end_date,
      due_date: data.due_date,
      duration: data.duration,
      progress: data.progress,
      assignee_id: data.assignee_id || undefined,
      status_id: data.status_id,
      priority_id: data.priority_id,
      category: data.category,
      subcategory: data.subcategory || undefined,
    };

    await createTask.mutateAsync(taskData);
    setOpen(false);
    form.reset();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(draftKey);
    }
    if (typeof onSuccess === 'function') onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Attachments</label>
              <FileUpload onFiles={(files) => {}} multiple />
              <div className="text-xs text-muted-foreground">You can attach files to this task. (Not yet saved to backend)</div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">Drafts are autosaved locally and restored if you reload.</div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategory(parseInt(value));
                        form.setValue('subcategory', '');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCategory ? "Select subcategory" : "Select category first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories
                          .filter((subcat) => subcat.category_id === selectedCategory)
                          .map((subcat) => (
                            <SelectItem key={subcat.id} value={subcat.id.toString()}>
                              {subcat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value || ''} onChange={field.onChange} placeholder="Enter task description (Markdown supported)" />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">Supports Markdown formatting.</div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" aria-label="Task Start Date" {...field} />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">The planned start date of the task.</div>
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
                      <Input type="date" aria-label="Task End Date" {...field} />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">The planned end date. Must be after the start date.</div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" aria-label="Task Due Date" {...field} />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">The final deadline for the task.</div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="assignee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.map(user => (
                          <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses?.map(status => (
                          <SelectItem key={status.id} value={String(status.id)}>{status.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities?.map(priority => (
                          <SelectItem key={priority.id} value={String(priority.id)}>{priority.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="assignee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger aria-label="Task Assignee">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users && users.length === 0 ? (
                        <div className="p-2 text-xs text-muted-foreground animate-pulse">Loading users...</div>
                      ) : (
                        users?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">Only users assigned to this project are selectable.</div>
                  <FormMessage />
                </FormItem>
              )}
            />
            

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
