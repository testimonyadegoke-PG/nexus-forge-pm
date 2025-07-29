
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from './FileUpload';
import { RichTextEditor } from './RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateProject, CreateProjectData } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { useProjectStatuses } from '@/hooks/useProjectStatus';
import { useProjectCategories } from '@/hooks/useProjectCategory';
import { useProjectSubcategories } from '@/hooks/useProjectSubcategory';
import { useProjectTypes } from '@/hooks/useProjectType';
import { useProjectStages } from '@/hooks/useProjectStage';
import { useProjectPhases } from '@/hooks/useProjectPhase';
import { useCompanies } from '@/hooks/useCompany';
import { useCustomers } from '@/hooks/useCustomer';
import { useCurrencies } from '@/hooks/useCurrency';
import { Plus } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status_id: z.number().optional(),
  stage_id: z.number().optional(),
  category_id: z.number().optional(),
  subcategory_id: z.number().optional(),
  type_id: z.number().optional(),
  phase_id: z.number().optional(),
  company_id: z.number().optional(),
  customer_id: z.number().optional(),
  currency_id: z.number().optional(),
  manager_id: z.string().optional(),
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

interface ProjectFormProps {
  onSuccess?: () => void;
}

export const ProjectForm = ({ onSuccess }: ProjectFormProps) => {
  const [open, setOpen] = useState(false);
  const { data: users } = useUsers();
  const { data: statuses = [] } = useProjectStatuses();
  const { data: categories = [] } = useProjectCategories();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const { data: subcategories = [] } = useProjectSubcategories(selectedCategory);
  const { data: types = [] } = useProjectTypes();
  const { data: stages = [] } = useProjectStages();
  const { data: phases = [] } = useProjectPhases();
  const { data: companies = [] } = useCompanies();
  const { data: customers = [] } = useCustomers();
  const { data: currencies = [] } = useCurrencies();
  const createProject = useCreateProject();
  
  // Autosave/draft support
  const draftKey = `projectform-draft`;
  const savedDraft = typeof window !== 'undefined' ? localStorage.getItem(draftKey) : null;
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: savedDraft ? JSON.parse(savedDraft) : {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status_id: undefined,
      stage_id: undefined,
      category_id: undefined,
      subcategory_id: undefined,
      type_id: undefined,
      phase_id: undefined,
      company_id: undefined,
      customer_id: undefined,
      currency_id: undefined,
      manager_id: '',
    },
  });
  // Save draft on change
  const watchAll = form.watch();
  useState(() => {
    const sub = form.watch((values) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(draftKey, JSON.stringify(values));
      }
    });
    return () => sub.unsubscribe();
  });

  const onSubmit = async (data: z.infer<typeof projectSchema>) => {
    const projectData: CreateProjectData = {
      name: data.name,
      description: data.description || undefined,
      start_date: data.start_date,
      end_date: data.end_date,
      status_id: data.status_id,
      stage_id: data.stage_id,
      category_id: data.category_id,
      subcategory_id: data.subcategory_id,
      type_id: data.type_id,
      phase_id: data.phase_id,
      company_id: data.company_id,
      customer_id: data.customer_id,
      currency_id: data.currency_id,
      manager_id: data.manager_id || undefined,
    };
    await createProject.mutateAsync(projectData);
    setOpen(false);
    form.reset();
    if (typeof onSuccess === 'function') onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hero-button">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* File Upload for attachments */}
            <div>
              <label className="block font-medium mb-1">Attachments</label>
              <FileUpload onFiles={(files) => {/* handle files as needed */}} multiple />
              <div className="text-xs text-muted-foreground">You can attach files to this project. (Not yet saved to backend)</div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">Drafts are autosaved locally and restored if you reload.</div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
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
                    <RichTextEditor value={field.value || ''} onChange={field.onChange} placeholder="Enter project description (Markdown supported)" label={undefined} />
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
                      <Input type="date" aria-label="Project Start Date" {...field} />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">The planned start date of the project.</div>
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
                      <Input type="date" aria-label="Project End Date" {...field} />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">The planned end date. Must be after the start date.</div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                    <FormControl>
                      <SelectTrigger aria-label="Project Status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.length === 0 ? (
                        <div className="p-2 text-xs text-muted-foreground animate-pulse">Loading statuses...</div>
                      ) : (
                        statuses.map(status => (
                          <SelectItem key={status.id} value={status.id.toString()}>{status.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">Project status, e.g., Planned, In Progress, Completed.</div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subcategory_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories.map(subcategory => (
                        <SelectItem key={subcategory.id} value={subcategory.id.toString()}>{subcategory.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {types.map(type => (
                        <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stage_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stages.map(stage => (
                        <SelectItem key={stage.id} value={stage.id.toString()}>{stage.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phase_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phase</FormLabel>
                  <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {phases.map(phase => (
                        <SelectItem key={phase.id} value={phase.id.toString()}>{phase.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id.toString()}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.id} value={currency.id.toString()}>{currency.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="manager_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Manager</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProject.isPending}>
                {createProject.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
