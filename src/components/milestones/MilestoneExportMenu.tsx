import React from "react";
import { Milestone } from "@/types/milestone";
import { exportMilestones } from "@/hooks/useMilestones";
import { Button } from "@/components/ui/button";

interface MilestoneExportMenuProps {
  milestones: Milestone[];
}

export const MilestoneExportMenu: React.FC<MilestoneExportMenuProps> = ({ milestones }) => {
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => exportMilestones(milestones, 'csv')}>Export CSV</Button>
      <Button size="sm" variant="outline" onClick={() => exportMilestones(milestones, 'png')}>Export PNG</Button>
      <Button size="sm" variant="outline" onClick={() => exportMilestones(milestones, 'pdf')}>Export PDF</Button>
    </div>
  );
};
