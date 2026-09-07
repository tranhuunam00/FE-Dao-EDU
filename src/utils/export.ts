import * as XLSX from 'xlsx-js-style';

/**
 * Exports data arrays into standard Excel (.xlsx) format.
 *
 * @param data Array of items to export.
 * @param filename File name for the exported sheet.
 * @param headers List of column header names to display.
 * @param keys Keys corresponding to properties in the data objects.
 * @param sheetName Name of the sheet inside the workbook.
 */
export const exportToExcel = (
  data: any[],
  filename: string,
  headers: string[],
  keys: string[],
  sheetName = 'Sheet1'
) => {
  const sheetData = [
    headers,
    ...data.map((r) =>
      keys.map((k) => {
        const val = r[k];
        return val === null || val === undefined || val === '' ? '—' : val;
      })
    ),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Apply a basic clean style to headers
  const range = XLSX.utils.decode_range(ws['!ref'] || '');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, name: 'Arial', size: 10 },
        alignment: { vertical: 'center', horizontal: 'center' },
        fill: { fgColor: { rgb: 'F3F4F6' } }, // light gray bg
        border: {
          top: { style: 'thin', color: { rgb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
          left: { style: 'thin', color: { rgb: 'CCCCCC' } },
          right: { style: 'thin', color: { rgb: 'CCCCCC' } },
        },
      };
    }
  }

  // Auto-fit column widths (cap between 10 and 50)
  const maxLengths = headers.map((header, idx) => {
    let maxLen = header.length;
    data.forEach((r) => {
      const val = r[keys[idx]];
      const valStr = val === null || val === undefined ? '' : String(val);
      if (valStr.length > maxLen) {
        maxLen = valStr.length;
      }
    });
    // Add Vietnamese accent adjustment padding
    return { wch: Math.min(Math.max(maxLen + 4, 11), 50) };
  });
  ws['!cols'] = maxLengths;

  const wb = XLSX.utils.book_new();
  const safeSheetName = sheetName.substring(0, 30).replace(/[\\/?*:[\]]/g, '') || 'Sheet1';
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);

  const safeFilename = filename.endsWith('.csv')
    ? filename.replace(/\.csv$/, '.xlsx')
    : filename.endsWith('.xlsx')
    ? filename
    : `${filename}.xlsx`;

  XLSX.writeFile(wb, safeFilename);
};
