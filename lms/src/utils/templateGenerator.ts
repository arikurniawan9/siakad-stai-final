/**
 * DYNAMIC IMPORT TEMPLATE GENERATOR (.XLSX & .CSV)
 * Powered by XLSX
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import * as XLSX from 'xlsx';
import { ImportSchema, ImportFieldDefinition } from '../types/exportImport';
import { downloadFile, sanitizeFilename } from './exportUtils';

/**
 * Generate formatted .xlsx template workbook with instructions and sample rows
 */
export function generateExcelTemplate<T = any>(schema: ImportSchema<T>): void {
  const wb = XLSX.utils.book_new();

  // 1. DATA SHEET
  // Headers with asterisks for required fields
  const headers = schema.fields.map((f) => (f.required ? `${f.label} *` : f.label));

  // Generate 2-3 rows of valid sample data
  const sampleRows: any[][] = [];
  sampleRows.push(headers);

  const sampleCount = Math.max(schema.sampleRows?.length || 0, 3);
  for (let i = 0; i < sampleCount; i++) {
    const rowObj = schema.sampleRows?.[i] as any;
    const rowValues = schema.fields.map((field) => {
      if (rowObj && rowObj[field.key] !== undefined) {
        const val = rowObj[field.key];
        return Array.isArray(val) ? val.join(', ') : val;
      }
      return getDefaultSampleValue(field, i);
    });
    sampleRows.push(rowValues);
  }

  const wsData = XLSX.utils.aoa_to_sheet(sampleRows);

  // Auto-width for data sheet
  wsData['!cols'] = schema.fields.map((f) => ({
    wch: Math.max(f.label.length + 6, 16)
  }));

  XLSX.utils.book_append_sheet(wb, wsData, 'Data_Impor');

  // 2. INSTRUCTIONS SHEET (Petunjuk_Pengisian)
  const instructionRows: any[][] = [];
  instructionRows.push(['PANDUAN PENGISIAN TEMPLATE IMPOR DATA SALAM LMS']);
  instructionRows.push([`Modul: ${schema.name}`]);
  instructionRows.push(['STAI AL-ITTIHAD CIANJUR']);
  instructionRows.push([]);
  instructionRows.push(['PETUNJUK UMUM:']);
  instructionRows.push(['1.', 'Kolom dengan tanda bintang (*) adalah KOLOM WAJIB DIISI.']);
  instructionRows.push(['2.', 'Jangan mengubah susunan kolom atau menghapus baris header pada lembar kerja "Data_Impor".']);
  instructionRows.push(['3.', 'Pastikan format tanggal menggunakan format: YYYY-MM-DD (Contoh: 2026-09-01).']);
  instructionRows.push(['4.', 'Untuk kolom berformat Angka, jangan gunakan titik pemisah ribuan (gunakan format murni: e.g. 3.75).']);
  instructionRows.push([]);

  // Field details table
  instructionRows.push(['TABEL SPESIFIKASI & ATURAN VALIDASI KOLOM:']);
  instructionRows.push(['No', 'Nama Kolom', 'Wajib', 'Tipe Data', 'Keterangan & Pilihan Nilai']);

  schema.fields.forEach((f, idx) => {
    let typeDesc = f.type;
    let ruleDesc = f.description || '-';

    if (f.type === 'enum' && f.enumValues) {
      ruleDesc = `Pilihan yang valid: [ ${f.enumValues.join(' | ')} ]`;
    } else if (f.type === 'email') {
      ruleDesc = 'Format email valid (e.g. nama@staialittihad.ac.id)';
    } else if (f.type === 'date') {
      ruleDesc = 'Format tanggal: YYYY-MM-DD (e.g. 2026-08-20)';
    } else if (f.type === 'number') {
      ruleDesc = `Angka numeric ${f.min !== undefined ? `(Min: ${f.min})` : ''} ${f.max !== undefined ? `(Max: ${f.max})` : ''}`;
    }

    instructionRows.push([
      idx + 1,
      f.label + (f.required ? ' *' : ''),
      f.required ? 'YA (Wajib)' : 'TIDAK (Opsional)',
      typeDesc.toUpperCase(),
      ruleDesc
    ]);
  });

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionRows);
  wsInstructions['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 18 },
    { wch: 15 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Petunjuk_Pengisian');

  // Trigger download safely via Blob
  const baseName = `Template_Impor_${schema.id || schema.name || schema.entityName || 'Data'}`;
  const filename = sanitizeFilename(baseName, 'xlsx');

  try {
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } catch {
    XLSX.writeFile(wb, filename);
  }
}

/**
 * Generate formatted .csv template with UTF-8 BOM
 */
export function generateCsvTemplate<T = any>(schema: ImportSchema<T>): void {
  const headers = schema.fields.map((f) => (f.required ? `${f.label} *` : f.label));
  const sampleCount = Math.max(schema.sampleRows?.length || 0, 3);
  const rows: string[][] = [headers];

  for (let i = 0; i < sampleCount; i++) {
    const rowObj = schema.sampleRows?.[i] as any;
    const rowValues = schema.fields.map((field) => {
      if (rowObj && rowObj[field.key] !== undefined) {
        const val = rowObj[field.key];
        return Array.isArray(val) ? val.join(', ') : String(val);
      }
      return String(getDefaultSampleValue(field, i));
    });
    rows.push(rowValues);
  }

  // Format as CSV text with quotes
  const csvContent = rows
    .map((r) =>
      r
        .map((cell) => {
          const str = cell ?? '';
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\r\n');

  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Template_Impor_${schema.id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate sensible dummy values for sample rows based on field rules
 */
function getDefaultSampleValue(field: ImportFieldDefinition, index: number): string | number {
  if (field.type === 'enum' && field.enumValues && field.enumValues.length > 0) {
    return field.enumValues[index % field.enumValues.length];
  }
  if (field.type === 'email') {
    return `pengguna${index + 1}@staialittihad.ac.id`;
  }
  if (field.type === 'date') {
    return '2026-09-01';
  }
  if (field.type === 'number') {
    return field.min !== undefined ? field.min + index : index + 1;
  }
  if (field.type === 'boolean') {
    return 'Ya';
  }
  return `Contoh ${field.label} ${index + 1}`;
}
