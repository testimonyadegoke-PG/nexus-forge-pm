import React from "react";
import { Milestone } from "@/types/milestone";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMilestoneAlerts, useAddMilestoneComment, useDeleteMilestoneComment } from "@/hooks/useMilestones";

interface MilestoneDetailProps {
  milestone: Milestone;
  onEdit?: () => void;
}

export const MilestoneDetail: React.FC<MilestoneDetailProps> = ({ milestone, onEdit }) => {
  const alert = getMilestoneAlerts(milestone);
  const [commentInput, setCommentInput] = React.useState("");
  const [commentError, setCommentError] = React.useState<string | null>(null);
  const addComment = useAddMilestoneComment();
  const deleteComment = useDeleteMilestoneComment();
  const [submitting, setSubmitting] = React.useState(false);

  // Add comment handler
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setSubmitting(true);
    setCommentError(null);
    try {
      await addComment.mutateAsync({ milestone_id: milestone.id, content: commentInput });
      setCommentInput("");
    } catch (err: any) {
      setCommentError(err?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment handler
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment.mutateAsync(commentId);
    } catch (err: any) {
      setCommentError(err?.message || "Failed to delete comment");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-4 max-w-xl w-full">
      {alert && (
        <div className={`rounded px-3 py-2 text-xs mb-2 ${alert === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {alert === 'overdue' ? 'This milestone is overdue!' : 'This milestone is due soon!'}
        </div>
      )}
      <div className="flex items-center gap-4">
        <ProgressRing value={milestone.progress} size={64} stroke={6} className="text-primary" />
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {milestone.name}
            {milestone.is_achieved && <Badge variant="default" style={{background:'#22c55e',color:'#fff'}}>Achieved</Badge>}
            {alert === 'overdue' && <Badge variant="destructive">Overdue</Badge>}
            {alert === 'due-soon' && <Badge variant="outline" style={{borderColor:'#f59e42',color:'#f59e42'}}>Due Soon</Badge>}
          </h2>
          <div className="text-xs text-muted-foreground">Due {new Date(milestone.due_date).toLocaleDateString()}</div>
          {milestone.achieved_date && (
            <div className="text-xs text-green-700">Achieved {new Date(milestone.achieved_date).toLocaleDateString()}</div>
          )}
        </div>
        {onEdit && (
          <Button className="ml-auto" size="sm" variant="outline" onClick={onEdit}>Edit</Button>
        )}
      </div>
      {milestone.description && <div className="text-sm text-muted-foreground">{milestone.description}</div>}
      <div>
        <div className="font-semibold text-sm mb-1">Linked Tasks</div>
        <ul className="space-y-1">
          {(Array.isArray(milestone.linked_tasks) && milestone.linked_tasks.length === 0) && <li className="text-xs text-muted-foreground">No linked tasks.</li>}
          {(Array.isArray(milestone.linked_tasks) ? milestone.linked_tasks : []).map(mt => (
            <li key={mt.task_id} className="flex items-center gap-2 text-sm">
              <span className={
                mt.task?.status === 'completed'
                  ? 'text-green-600'
                  : mt.task?.status === 'in-progress'
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }>
                ●
              </span>
              <span>{mt.task?.name || 'Task'}</span>
              <span className="text-xs text-muted-foreground">[{mt.task?.status || 'unknown'}]</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="font-semibold text-sm mb-1">Comments</div>
        <ul className="space-y-1">
          {(!Array.isArray(milestone.comments) || milestone.comments.length === 0) && <li className="text-xs text-muted-foreground">No comments yet.</li>}
          {(Array.isArray(milestone.comments) ? milestone.comments : []).map(c => (
            <li key={c.id} className="flex items-center gap-2 text-xs text-gray-700 border-b py-1 last:border-b-0">
              <span className="flex-1">{c.content}</span>
              <button className="text-red-500 hover:underline" onClick={() => handleDeleteComment(c.id)} title="Delete">Delete</button>
            </li>
          ))}
        </ul>
        <form className="flex gap-2 mt-2" onSubmit={handleAddComment}>
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1 text-xs"
            placeholder="Add a comment..."
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            required
          />
          <button type="submit" className="text-xs bg-primary text-white px-3 py-1 rounded">Add</button>
        </form>
        {commentError && <div className="text-xs text-red-500 mt-1">{commentError}</div>}
      </div>
      <div>
        <div className="font-semibold text-sm mb-1">History</div>
        <div className="text-xs text-muted-foreground">
          Created {new Date(milestone.created_at).toLocaleDateString()} &bull; Last updated {new Date(milestone.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
