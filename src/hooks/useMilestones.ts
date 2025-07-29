import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Milestone, MilestoneTask, MilestoneComment } from '@/types/milestone';
import { Task } from '@/hooks/useTasks';

// Utility: Calculate milestone progress and status
function computeMilestoneProgress(linkedTasks: Task[]): { progress: number; isAchieved: boolean } {
  if (!Array.isArray(linkedTasks) || linkedTasks.length === 0) return { progress: 0, isAchieved: false };
  const completed = linkedTasks.filter(t => t.status === 'completed').length;
  const progress = Math.round((completed / linkedTasks.length) * 100);
  return { progress, isAchieved: completed === linkedTasks.length };
}

function getMilestoneStatus(m: Milestone): 'completed' | 'upcoming' | 'missed' {
  if (m.is_achieved) return 'completed';
  const now = new Date();
  const due = new Date(m.due_date);
  if (due < now) return 'missed';
  return 'upcoming';
}

function isDueSoon(m: Milestone, days = 3) {
  if (m.is_achieved) return false;
  const now = new Date();
  const due = new Date(m.due_date);
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days && diff >= 0;
}

// Fetch milestones with linked tasks and comments
export function useProjectMilestones(projectId: string) {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const { data: milestones, error } = await supabase
        .from('milestones')
        .select(`*, milestone_tasks:milestone_tasks(*, task:tasks(*)), milestone_comments:milestone_comments(*)`)
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (milestones || []).map((m: any) => {
        const linkedTasks: Task[] = (m.milestone_tasks || []).map((mt: any) => mt.task).filter(Boolean);
        const { progress, isAchieved } = computeMilestoneProgress(linkedTasks);
        return {
          ...m,
          linked_tasks: m.milestone_tasks || [],
          comments: m.milestone_comments || [],
          progress,
          is_achieved: isAchieved || m.is_achieved,
          status: getMilestoneStatus({ ...m, is_achieved: isAchieved || m.is_achieved }),
        };
      });
    },
    initialData: [],
  });
}

// Create milestone with linked tasks
export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ milestone, taskIds }: { milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'linked_tasks' | 'progress' | 'comments'>, taskIds: string[] }) => {
      const { data: mData, error: mError } = await supabase
        .from('milestones')
        .insert([{ ...milestone }])
        .select()
        .single();
      if (mError) throw mError;
      if (taskIds.length > 0) {
        const joinRows = taskIds.map(task_id => ({ milestone_id: mData.id, task_id }));
        const { error: jtError } = await supabase.from('milestone_tasks').insert(joinRows);
        if (jtError) throw jtError;
      }
      return mData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}


// Edit milestone and linked tasks
export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ milestone, taskIds }: { milestone: Partial<Milestone> & { id: string }, taskIds: string[] }) => {
      // Update milestone
      const { error: mError } = await supabase
        .from('milestones')
        .update(milestone)
        .eq('id', milestone.id);
      if (mError) throw mError;
      // Remove old links
      await supabase.from('milestone_tasks').delete().eq('milestone_id', milestone.id);
      // Add new links
      if (taskIds.length > 0) {
        const joinRows = taskIds.map(task_id => ({ milestone_id: milestone.id, task_id }));
        const { error: jtError } = await supabase.from('milestone_tasks').insert(joinRows);
        if (jtError) throw jtError;
      }
      return milestone;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}

// Auto-complete milestone if all linked tasks are completed
export async function autoCompleteMilestonesForProject(projectId: string) {
  const { data: milestones } = await supabase
    .from('milestones')
    .select('id')
    .eq('project_id', projectId);
  if (!milestones) return;
  for (const m of milestones) {
    const { data: mtasks } = await supabase.from('milestone_tasks').select('task_id').eq('milestone_id', m.id);
    if (!mtasks || mtasks.length === 0) continue;
    const { data: tasks } = await supabase.from('tasks').select('status').in('id', mtasks.map((mt: any) => mt.task_id));
    if (tasks && tasks.every((t: any) => t.status === 'completed')) {
      await supabase.from('milestones').update({ is_achieved: true, achieved_date: new Date().toISOString() }).eq('id', m.id);
    }
  }
}

// Milestone comments CRUD
export function useAddMilestoneComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ milestone_id, user_id, content }: { milestone_id: string, user_id?: string, content: string }) => {
      const { data, error } = await supabase.from('milestone_comments').insert([{ milestone_id, user_id, content }]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['milestones'] }); }
  });
}

export function useDeleteMilestoneComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('milestone_comments').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['milestones'] }); }
  });
}

// Export utility (CSV/PNG/PDF)
export function exportMilestones(milestones: Milestone[], format: 'csv' | 'png' | 'pdf') {
  if (format === 'csv') {
    const headers = [
      'Name', 'Description', 'Due Date', 'Achieved', 'Achieved Date', 'Status', 'Progress', 'Linked Tasks'
    ];
    const rows = milestones.map(m => [
      m.name,
      m.description || '',
      m.due_date ? new Date(m.due_date).toLocaleDateString() : '',
      m.is_achieved ? 'Yes' : 'No',
      m.achieved_date ? new Date(m.achieved_date).toLocaleDateString() : '',
      m.status,
      (typeof m.progress === 'number' ? m.progress + '%' : ''),
      (m.linked_tasks || []).map(lt => lt.task?.name).join('; ')
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(','))
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milestones-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } else if (format === 'png' || format === 'pdf') {
    const table = document.getElementById('milestone-list-table');
    if (!table) {
      alert('Milestone list/table not found for export.');
      return;
    }
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(table).then(canvas => {
        if (format === 'png') {
          const imgData = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = imgData;
          a.download = `milestones-${new Date().toISOString().slice(0,10)}.png`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => document.body.removeChild(a), 100);
        } else if (format === 'pdf') {
          import('jspdf').then(({ jsPDF }) => {
            const pdf = new jsPDF({ orientation: 'landscape' });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
            pdf.save(`milestones-${new Date().toISOString().slice(0,10)}.pdf`);
          });
        }
      });
    });
  }
}

// Utility for due soon/overdue
export function getMilestoneAlerts(m: Milestone) {
  if (m.is_achieved) return null;
  const now = new Date();
  const due = new Date(m.due_date);
  if (due < now) return 'overdue';
  if (isDueSoon(m)) return 'due-soon';
  return null;
}
