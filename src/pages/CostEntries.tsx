import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewToggle, View } from '@/components/ViewToggle';
import { CostEntryTable } from '@/components/tables/CostEntryTable';
import { CostEntryGrid } from '@/components/grids/CostEntryGrid';
import { useProjects } from '@/hooks/useProjects';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const CostEntries = () => {
  const [view, setView] = useState<View>("grid");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  const { data: costEntries = [], isLoading } = useQuery({
    queryKey: ['cost-entries', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      const response = await fetch(`${BASE_URL}/cost-entries?project_id=${selectedProject}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cost entries");
      }
      return response.json();
    },
  });

  const totalCost = costEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-2xl font-bold">Cost Entries</CardTitle>
        <ViewToggle
          view={view as "list" | "grid"}
          onViewChange={(newView) => {
            if (newView === "list" || newView === "grid") {
              setView(newView);
            }
          }}
        />
      </div>

      <div className="mb-6">
        <Label htmlFor="project">Select Project</Label>
        <Select onValueChange={setSelectedProject} defaultValue={selectedProject || ""}>
          <SelectTrigger id="project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedProject
              ? `Cost Entries for ${projects.find((p) => p.id === selectedProject)?.name}`
              : "All Cost Entries"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading cost entries...</p>
          ) : (
            <>
              <div className="mb-4">
                <Badge variant="secondary">Total Cost: ${totalCost.toFixed(2)}</Badge>
              </div>
              {view === "grid" ? (
                <CostEntryGrid costEntries={costEntries} />
              ) : (
                <CostEntryTable costEntries={costEntries} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CostEntries;
