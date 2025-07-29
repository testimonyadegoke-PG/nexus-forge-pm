import React, { useRef, useState } from 'react';
import { parseCSVOrXLSX } from '@/utils/parseFile';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Task, useCreateTask } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';

interface BulkImportExportProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  exportData: Task[];
}

export function BulkImportExport({ isOpen, onClose, exportData, projectId }: BulkImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewRows, setPreviewRows] = useState<Partial<Task>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const { mutateAsync: createTask } = useCreateTask();

  const templateHeaders = ["name", "description", "start_date", "end_date", "status", "progress", "assignee_id"];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data, errors } = await parseCSVOrXLSX<Partial<Task>>(file);
    setPreviewRows(data);
    setErrors(errors);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      for (const row of previewRows) {
        if (!row.name || !row.start_date || !row.end_date) {
          throw new Error('Missing required fields (name, start_date, end_date) in one or more rows.');
        }
        await createTask({ ...row, project_id: projectId } as Task);
      }
      toast({ title: 'Success', description: `${previewRows.length} tasks imported successfully.` });
      setPreviewRows([]);
      setErrors([]);
      onClose();
    } catch (e: any) {
      toast({ title: 'Import Failed', description: e.message || 'An unknown error occurred.', variant: 'destructive' });
      setErrors([e.message || 'Import failed']);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      templateHeaders.join(','),
      ...exportData.map(row => 
        templateHeaders.map(h => JSON.stringify((row as any)[h] ?? '')).join(',')
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Success', description: 'Task data has been exported.' });
  };

  const handleDownloadTemplate = () => {
    const csvContent = templateHeaders.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bulk Import/Export Tasks</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Export Tasks</h3>
            <p className="text-sm text-muted-foreground">Export the currently filtered tasks to a CSV file.</p>
            <Button onClick={handleExport} disabled={exportData.length === 0}>
              Export {exportData.length} Tasks
            </Button>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Import Tasks</h3>
            <p className="text-sm text-muted-foreground">Import tasks from a CSV or XLSX file. Make sure the file matches the template.</p>
            <div className="flex gap-2">
              <Button onClick={handleDownloadTemplate} variant="outline">Download Template</Button>
              <Button onClick={() => fileInputRef.current?.click()}>Upload File</Button>
              <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx" className="hidden" />
            </div>
          </div>
        </div>
        {previewRows.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Import Preview</h4>
            <div className="max-h-60 overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(previewRows[0]).map(key => <TableHead key={key}>{key}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((val, j) => <TableCell key={j}>{String(val)}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {errors.length > 0 && (
          <div className="text-red-500 text-sm">
            <h4 className="font-semibold">Errors</h4>
            <ul>{errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={importing || previewRows.length === 0 || errors.length > 0}>
            {importing ? 'Importing...' : `Import ${previewRows.length} Tasks`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
