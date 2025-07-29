import React from 'react';

// Placeholder Kanban columns
const columns = [
  { key: 'todo', label: 'To Do' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

export interface KanbanTask {
  id: string;
  title: string;
  status: string;
}

export interface KanbanBoardProps {
  tasks: KanbanTask[];
  onDragEnd?: (taskId: string, newStatus: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks = [], onDragEnd }) => {
  // Simple drag-and-drop handlers (stubbed)
  const handleDrop = (taskId: string, newStatus: string) => {
    if (onDragEnd) onDragEnd(taskId, newStatus);
  };

  return (
    <div className="flex gap-4 w-full overflow-x-auto">
      {columns.map(col => (
        <div key={col.key} className="flex-1 bg-gray-50 rounded p-2 min-w-[220px]">
          <h3 className="font-bold mb-2">{col.label}</h3>
          <div className="space-y-2 min-h-[60px]">
            {tasks.filter(t => t.status === col.key).map(task => (
              <div
                key={task.id}
                className="bg-white border rounded shadow p-2 cursor-move"
                draggable
                onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('taskId');
                  if (id) handleDrop(id, col.key);
                }}
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
