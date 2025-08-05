
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateMilestone, useUpdateMilestone } from "@/hooks/useMilestones";
import type { Milestone } from "@/types/milestone";

const milestoneSchema = z.object({
  name: z.string().min(1, "Milestone name is required"),
  description: z.string().optional(),
  due_date: z.string().min(1, "Due date is required"),
  is_achieved: z.boolean().default(false),
  status: z.enum(["pending", "completed", "overdue"]).default("pending"),
});

interface MilestoneFormProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  milestone?: Milestone;
}

export const MilestoneForm: React.FC<MilestoneFormProps> = ({
  open,
  onClose,
  projectId,
  milestone,
}) => {
  const { mutate: createMilestone, isPending: isCreating } = useCreateMilestone();
  const { mutate: updateMilestone, isPending: isUpdating } = useUpdateMilestone();

  const form = useForm<z.infer<typeof milestoneSchema>>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      name: milestone?.name || "",
      description: milestone?.description || "",
      due_date: milestone?.due_date ? new Date(milestone.due_date).toISOString().split('T')[0] : "",
      is_achieved: milestone?.is_achieved || false,
      status: milestone?.status || "pending",
    },
  });

  const onSubmit = (data: z.infer<typeof milestoneSchema>) => {
    const milestoneData = {
      name: data.name,
      description: data.description || "",
      due_date: data.due_date,
      project_id: projectId,
      is_achieved: data.is_achieved,
      status: data.status,
    };

    if (milestone) {
      updateMilestone({ id: milestone.id, ...milestoneData }, {
        onSuccess: () => {
          onClose();
          form.reset();
        }
      });
    } else {
      createMilestone(milestoneData, {
        onSuccess: () => {
          onClose();
          form.reset();
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {milestone ? "Edit Milestone" : "Create New Milestone"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter milestone name" {...field} />
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
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? "Saving..." : milestone ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
