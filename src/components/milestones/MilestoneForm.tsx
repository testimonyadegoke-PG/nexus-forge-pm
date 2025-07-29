import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProjectTasks } from "@/hooks/useTasks";
import { useCreateMilestone, useUpdateMilestone } from "@/hooks/useMilestones";
import { Milestone } from "@/types/milestone";

interface MilestoneFormProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  milestone?: Milestone;
}

import type { Task } from "@/hooks/useTasks";

export const MilestoneForm: React.FC<MilestoneFormProps> = ({ open, onClose, projectId, milestone }) => {
  const isEdit = !!milestone;
  const [name, setName] = useState(milestone?.name || "");
  const [description, setDescription] = useState(milestone?.description || "");
  const [dueDate, setDueDate] = useState(milestone?.due_date?.slice(0, 10) || "");
  const [taskIds, setTaskIds] = useState<string[]>(milestone?.linked_tasks?.map(t => t.task_id) || []);
  const [notes, setNotes] = useState("");

  const { data: tasksRaw } = useProjectTasks(projectId);
  const tasks: Task[] = Array.isArray(tasksRaw) ? tasksRaw : [];
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();

  useEffect(() => {
    if (open && milestone) {
      setName(milestone.name);
      setDescription(milestone.description || "");
      setDueDate(milestone.due_date?.slice(0, 10) || "");
      setTaskIds(milestone.linked_tasks?.map(t => t.task_id) || []);
    }
  }, [open, milestone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dueDate) return;
    const payload = {
      name,
      description,
      due_date: dueDate,
      project_id: projectId,
    };
    if (isEdit && milestone) {
      await updateMilestone.mutateAsync({ milestone: { ...payload, id: milestone.id }, taskIds });
    } else {
      await createMilestone.mutateAsync({ milestone: payload, taskIds });
    }
    onClose && onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Milestone" : "Create Milestone"}</DialogTitle>
          </DialogHeader>
          <div>
            <label className="block text-sm font-medium">Milestone Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} required maxLength={80} />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={300} />
          </div>
          <div>
            <label className="block text-sm font-medium">Due Date</label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Linked Tasks</label>
            <div className="border rounded p-2 max-h-40 overflow-y-auto">
              {tasks.length === 0 && <div className="text-xs text-muted-foreground">No tasks available.</div>}
              {tasks.map(t => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={taskIds.includes(t.id)}
                    onChange={e => {
                      if (e.target.checked) setTaskIds([...taskIds, t.id]);
                      else setTaskIds(taskIds.filter(id => id !== t.id));
                    }}
                  />
                  {t.name}
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMilestone.isPending || updateMilestone.isPending}>
              {isEdit ? "Save Changes" : "Create Milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
