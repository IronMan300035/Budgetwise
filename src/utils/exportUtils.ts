
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

// Define export function types
export type ExportFormat = 'excel' | 'pdf' | 'csv';

// For the Excel export we'll use a simple CSV conversion for now
// In a real app, we would use a library like xlsx to create proper Excel files
export const exportToExcel = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }
  
  // Convert data to CSV
  const csv = convertToCSV(data);
  
  // Create a blob and trigger download
  const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8' });
  saveAs(blob, `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

// For the CSV export
export const exportToCSV = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }
  
  // Convert data to CSV
  const csv = convertToCSV(data);
  
  // Create a blob and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

// For the PDF export we'd normally use a library like jsPDF
// For now, we'll create a simple implementation
export const exportToPDF = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }
  
  // In a real app, we would generate a PDF here
  // For now we'll just log that the function was called
  console.log('PDF export requested', { data, fileName });
  
  // Create a simple HTML representation for now
  const html = convertToHTML(data);
  
  // Create a blob and trigger download
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.html`);
  
  // In a real implementation, we would:
  // 1. Use a library like jsPDF or html2pdf
  // 2. Convert the data to PDF format
  // 3. Trigger the download
};

// Helper function to convert data to CSV
const convertToCSV = (data: any[]) => {
  if (!data || data.length === 0) return '';
  
  // Get headers from first object keys
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      let cell = item[header];
      
      // Handle different data types
      if (cell === null || cell === undefined) {
        return '';
      } else if (typeof cell === 'string') {
        // Escape quotes and wrap in quotes if it contains commas or quotes
        if (cell.includes('"') || cell.includes(',')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      } else if (typeof cell === 'object' && cell instanceof Date) {
        return format(cell, 'yyyy-MM-dd');
      } else {
        return String(cell);
      }
    }).join(',');
    
    csv += row + '\n';
  });
  
  return csv;
};

// Helper function to convert data to HTML
const convertToHTML = (data: any[]) => {
  if (!data || data.length === 0) return '';
  
  // Get headers from first object keys
  const headers = Object.keys(data[0]);
  
  // Create HTML table
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Export Data</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>Exported Data</h1>
      <p>Generated on: ${format(new Date(), 'PPP')}</p>
      <table>
        <thead>
          <tr>
  `;
  
  // Add headers
  headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  
  html += `
          </tr>
        </thead>
        <tbody>
  `;
  
  // Add data rows
  data.forEach(item => {
    html += '<tr>';
    
    headers.forEach(header => {
      let cell = item[header];
      
      // Handle different data types
      if (cell === null || cell === undefined) {
        html += '<td></td>';
      } else if (typeof cell === 'object' && cell instanceof Date) {
        html += `<td>${format(cell, 'yyyy-MM-dd')}</td>`;
      } else {
        html += `<td>${cell}</td>`;
      }
    });
    
    html += '</tr>';
  });
  
  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  return html;
};
