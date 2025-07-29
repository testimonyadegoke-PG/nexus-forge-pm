import React from 'react';
import * as XLSX from 'xlsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileDown } from 'lucide-react';

interface GanttExportMenuProps {
  ganttRef: React.RefObject<HTMLDivElement>;
  tasks: any[];
}

export const GanttExportMenu: React.FC<GanttExportMenuProps> = ({ ganttRef, tasks }) => {
  const handleExport = async (format: 'pdf' | 'png') => {
    const { default: html2canvas } = await import('html2canvas');
    const ganttElement = ganttRef.current?.querySelector('.gantt-container');

    if (ganttElement instanceof HTMLElement) {
      const canvas = await html2canvas(ganttElement, {
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020817' : '#ffffff',
      });

      if (format === 'png') {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'gantt-chart.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('gantt-chart.pdf');
      }
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tasks.map(task => ({
      'Task ID': task.id,
      'Task Name': task.name,
      'Start Date': task.start,
      'End Date': task.end,
      'Progress': task.progress,
      'Type': task.type,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    XLSX.writeFile(workbook, 'gantt-data.xlsx');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileDown className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('png')}>
          <FileDown className="mr-2 h-4 w-4" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>Export as Excel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
