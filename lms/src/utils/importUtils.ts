/**
 * MODULAR IMPORT & INGESTION UTILITIES
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import {
  ImportSchema,
  ImportFieldDefinition,
  ImportParseResult,
  ValidatedRow,
  RowValidationError,
  RowValidationWarning
} from '../types/exportImport';
import { downloadFile, sanitizeFilename } from './exportUtils';

/**
 * Auto-detect delimiter in text (comma, semicolon, or tab)
 */
export function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r\n|\n|\r/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  if (semicolonCount > commaCount) return ';';
  return ',';
}

/**
 * Robust CSV/TSV parser supporting quoted fields and embedded commas
 */
export function parseDelimitedText(text: string, delimiter?: string): { headers: string[]; rows: Record<string, any>[] } {
  const delim = delimiter || detectDelimiter(text);
  const lines: string[] = [];
  let currentRow = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentRow += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (currentRow.trim()) {
        lines.push(currentRow);
      }
      currentRow = '';
    } else {
      currentRow += char;
    }
  }
  if (currentRow.trim()) {
    lines.push(currentRow);
  }

  // Filter out comment lines starting with #
  const cleanLines = lines.filter((l) => !l.trim().startsWith('#'));

  if (cleanLines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse Header row
  const splitLine = (line: string): string[] => {
    const cells: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delim && !inQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());
    return cells;
  };

  const headers = splitLine(cleanLines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < cleanLines.length; i++) {
    const values = splitLine(cleanLines[i]);
    const rowObj: Record<string, any> = {};
    headers.forEach((header, colIdx) => {
      const rawVal = values[colIdx] !== undefined ? values[colIdx].replace(/^["']|["']$/g, '').trim() : '';
      rowObj[header] = rawVal;
    });
    // Ignore completely empty rows
    const hasValues = Object.values(rowObj).some((v) => v !== '' && v !== undefined && v !== null);
    if (hasValues) {
      rows.push(rowObj);
    }
  }

  return { headers, rows };
}

/**
 * Parse JSON text (single object or array of objects)
 */
export function parseJsonImportText(jsonText: string): { headers: string[]; rows: Record<string, any>[] } {
  const parsed = JSON.parse(jsonText);
  let rawItems: any[] = [];

  if (Array.isArray(parsed)) {
    rawItems = parsed;
  } else if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.data)) {
      rawItems = parsed.data;
    } else if (Array.isArray(parsed.items)) {
      rawItems = parsed.items;
    } else {
      rawItems = [parsed];
    }
  }

  if (rawItems.length === 0) {
    return { headers: [], rows: [] };
  }

  // Extract all unique headers across items
  const headerSet = new Set<string>();
  rawItems.forEach((item) => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach((k) => headerSet.add(k));
    }
  });

  const headers = Array.from(headerSet);
  return { headers, rows: rawItems };
}

/**
 * Suggest optimal column mapping between file headers and schema fields
 */
export function autoMapColumns<T>(fileHeaders: string[], schema: ImportSchema<T>): Record<string, string> {
  const mapping: Record<string, string> = {};

  schema.fields.forEach((field) => {
    const fieldKey = String(field.key).toLowerCase().replace(/[^a-z0-9]/g, '');
    const fieldLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
    const aliases = (field.aliases || []).map((a) => a.toLowerCase().replace(/[^a-z0-9]/g, ''));

    const match = fileHeaders.find((hdr) => {
      const cleanHdr = hdr.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanHdr === fieldKey) return true;
      if (cleanHdr === fieldLabel) return true;
      if (aliases.includes(cleanHdr)) return true;
      return false;
    });

    if (match) {
      mapping[String(field.key)] = match;
    }
  });

  return mapping;
}

/**
 * Validate a single value against a field definition
 */
function validateFieldValue(
  val: any,
  field: ImportFieldDefinition,
  row: Record<string, any>
): { isValid: boolean; sanitizedVal: any; error?: string; warning?: string } {
  let value = val;

  // Empty check
  const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

  if (isEmpty) {
    if (field.required) {
      return { isValid: false, sanitizedVal: field.defaultValue, error: `${field.label} wajib diisi.` };
    }
    return { isValid: true, sanitizedVal: field.defaultValue !== undefined ? field.defaultValue : null };
  }

  // Custom Transform
  if (field.transform) {
    try {
      value = field.transform(value);
    } catch {
      // ignore transform error
    }
  }

  // Type-specific parsing and validation
  switch (field.type) {
    case 'number': {
      const num = typeof value === 'number' ? value : Number(String(value).replace(/,/g, '.'));
      if (isNaN(num)) {
        return { isValid: false, sanitizedVal: value, error: `${field.label} harus berupa angka yang valid.` };
      }
      if (field.min !== undefined && num < field.min) {
        return { isValid: false, sanitizedVal: num, error: `${field.label} (${num}) tidak boleh kurang dari ${field.min}.` };
      }
      if (field.max !== undefined && num > field.max) {
        return { isValid: false, sanitizedVal: num, error: `⚠️ Peringatan: ${field.label} (${num}) melebihi batas standar maksimal ${field.max} poin.` };
      }
      value = num;
      break;
    }

    case 'boolean': {
      if (typeof value === 'boolean') break;
      const lower = String(value).toLowerCase().trim();
      if (['true', '1', 'ya', 'yes', 'aktif', 'benar', 't'].includes(lower)) {
        value = true;
      } else if (['false', '0', 'tidak', 'no', 'nonaktif', 'salah', 'f'].includes(lower)) {
        value = false;
      } else {
        return { isValid: false, sanitizedVal: value, error: `${field.label} harus berupa nilai Boolean (Ya/Tidak).` };
      }
      break;
    }

    case 'email': {
      const str = String(value).trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(str)) {
        return { isValid: false, sanitizedVal: str, error: `Format email "${str}" tidak valid.` };
      }
      value = str.toLowerCase();
      break;
    }

    case 'date': {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { isValid: false, sanitizedVal: value, error: `${field.label} harus berupa tanggal yang valid (YYYY-MM-DD).` };
      }
      value = date.toISOString().substring(0, 10);
      break;
    }

    case 'enum': {
      const strVal = String(value).trim();
      if (field.allowedValues && field.allowedValues.length > 0) {
        const match = field.allowedValues.find(
          (av) => String(av).toLowerCase() === strVal.toLowerCase()
        );
        if (!match) {
          return {
            isValid: false,
            sanitizedVal: strVal,
            error: `${field.label} "${strVal}" tidak valid. Pilihan yang diizinkan: ${field.allowedValues.join(', ')}`
          };
        }
        value = match;
      }
      break;
    }

    case 'array': {
      if (Array.isArray(value)) break;
      value = String(value)
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);
      break;
    }

    case 'string':
    default: {
      value = String(value).trim();
      break;
    }
  }

  // Custom Validator Function
  if (field.validate) {
    const customRes = field.validate(value, row);
    if (typeof customRes === 'string') {
      return { isValid: false, sanitizedVal: value, error: customRes };
    }
  }

  return { isValid: true, sanitizedVal: value };
}

/**
 * Validate parsed raw rows against an Import Schema & column mapping
 */
export function validateImportDataset<T>(
  rawRows: Record<string, any>[],
  schema: ImportSchema<T>,
  mapping: Record<string, string>,
  detectedColumns: string[],
  rawText?: string
): ImportParseResult<T> {
  const validatedRows: ValidatedRow<T>[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let warningCount = 0;

  rawRows.forEach((rawRow, idx) => {
    const errors: RowValidationError[] = [];
    const warnings: RowValidationWarning[] = [];
    const sanitizedData: Record<string, any> = {};

    schema.fields.forEach((field) => {
      const mappedHeader = mapping[String(field.key)];
      const rawVal = mappedHeader ? rawRow[mappedHeader] : undefined;

      const result = validateFieldValue(rawVal, field, rawRow);

      if (!result.isValid && result.error) {
        errors.push({ field: String(field.key), message: result.error });
      }
      if (result.warning) {
        warnings.push({ field: String(field.key), message: result.warning });
      }

      if (result.sanitizedVal !== undefined) {
        sanitizedData[String(field.key)] = result.sanitizedVal;
      }
    });

    const isValid = errors.length === 0;
    const hasWarnings = warnings.length > 0;

    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }
    if (hasWarnings) {
      warningCount++;
    }

    validatedRows.push({
      index: idx + 1,
      rawData: rawRow,
      data: sanitizedData as Partial<T>,
      isValid,
      hasWarnings,
      errors,
      warnings,
      isSkipped: false
    });
  });

  return {
    totalParsed: rawRows.length,
    validCount,
    invalidCount,
    warningCount,
    rows: validatedRows,
    detectedColumns,
    mapping,
    rawText
  };
}

/**
 * Download sample CSV template for an Import Schema
 */
export function downloadCsvTemplate<T>(schema: ImportSchema<T>): void {
  const headers = schema.fields.map((f) => `"${f.label} (${String(f.key)})"`);

  // Instruction header
  const infoLines = [
    `"# TEMPLAT IMPOR RESMI SALAM LMS — ${schema.entityName.toUpperCase()}"`,
    `"# Petunjuk: Isi kolom sesuai tipe data. Kolom bertanda (*) wajib diisi."`,
    `"# Kolom yang tersedia: ${schema.fields.map((f) => `${f.label}${f.required ? '*' : ''} [${f.type}]`).join(', ')}"`
  ];

  // Samples
  const sampleRows = schema.sampleRows || [];
  const rows = sampleRows.map((sample) => {
    return schema.fields.map((field) => {
      const val = sample[field.key as string] ?? field.sampleValue ?? (field.allowedValues ? field.allowedValues[0] : '');
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
  });

  // If no samples provided, create a dummy row based on schema
  if (rows.length === 0) {
    const dummy = schema.fields.map((f) => {
      if (f.sampleValue !== undefined) return `"${f.sampleValue}"`;
      if (f.allowedValues && f.allowedValues.length > 0) return `"${f.allowedValues[0]}"`;
      if (f.type === 'number') return '100';
      if (f.type === 'date') return '"2026-08-20"';
      if (f.type === 'email') return '"contoh@stai-alittihad.ac.id"';
      return '"Contoh Data"';
    }).join(',');
    rows.push(dummy);
  }

  const csvContent = '\uFEFF' + [
    ...infoLines,
    headers.join(','),
    ...rows
  ].join('\r\n');

  const filename = sanitizeFilename(`Templat_Impor_${schema.entityName}`, 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Download sample JSON template for an Import Schema
 */
export function downloadJsonTemplate<T>(schema: ImportSchema<T>): void {
  const sampleItems = schema.sampleRows && schema.sampleRows.length > 0
    ? schema.sampleRows
    : [
        schema.fields.reduce((acc, field) => {
          acc[field.key as string] = field.sampleValue ?? (field.allowedValues ? field.allowedValues[0] : (field.type === 'number' ? 100 : 'Contoh Data'));
          return acc;
        }, {} as Record<string, any>)
      ];

  const payload = {
    schemaVersion: '1.0',
    entityName: schema.entityName,
    instructions: schema.instructions || [
      'Isi data dalam array di bawah sesuai definisi skema.',
      'Kolom wajib harus terisi nilai valid.'
    ],
    fieldDefinitions: schema.fields.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      required: !!f.required,
      allowedValues: f.allowedValues
    })),
    data: sampleItems
  };

  const jsonContent = JSON.stringify(payload, null, 2);
  const filename = sanitizeFilename(`Templat_Impor_${schema.entityName}`, 'json');
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}
