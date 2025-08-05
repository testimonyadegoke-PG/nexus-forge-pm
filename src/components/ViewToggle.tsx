
import { Button } from "@/components/ui/button";
import { Grid, List, Columns } from "lucide-react";

export type View = "list" | "grid" | "kanban";

interface ViewToggleProps {
  view: View;
  onViewChange: (view: View) => void;
}

export const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex rounded-md overflow-hidden">
      <Button
        variant={view === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="rounded-r-none"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={view === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className="rounded-none border-l-0"
      >
        <Grid className="w-4 h-4" />
      </Button>
      <Button
        variant={view === "kanban" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("kanban")}
        className="rounded-l-none border-l-0"
      >
        <Columns className="w-4 h-4" />
      </Button>
    </div>
  );
};
