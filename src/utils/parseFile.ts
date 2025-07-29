import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type ParsedFileResult<T> = {
  data: T[];
  errors: string[];
};

export async function parseCSVOrXLSX<T = any>(file: File): Promise<ParsedFileResult<T>> {
  return new Promise((resolve) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve({ data: results.data as T[], errors: results.errors.map(e => e.message) });
        },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<T>(worksheet, { defval: '' });
        resolve({ data: json, errors: [] });
      };
      reader.readAsArrayBuffer(file);
    } else {
      resolve({ data: [], errors: ['Unsupported file type'] });
    }
  });
}
