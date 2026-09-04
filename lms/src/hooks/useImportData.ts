/**
 * CUSTOM REACT HOOK: useImportData
 * Multi-Format Enterprise File Reading, Pre-Validation & Import Engine
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { useState, useCallback, useMemo } from 'react';
import { ImportSchema, ImportParseResult, BulkImportResult } from '../types/exportImport';
import { parseExcelFile, parseCsvWithPapa } from '../utils/excelUtils';
import { autoMapColumns, validateImportDataset } from '../utils/importUtils';
import { generateExcelTemplate, generateCsvTemplate } from '../utils/templateGenerator';
import { useToast } from '../components/feedback/ToastContext';

export interface UseImportDataOptions<T = any> {
  schema: ImportSchema<T>;
  onImportSuccess?: (validRows: T[], summary: BulkImportResult) => Promise<void> | void;
  onImportError?: (err: Error) => void;
}

export function useImportData<T = any>({ schema, onImportSuccess, onImportError }: UseImportDataOptions<T>) {
  const toast = useToast();

  const [parseResult, setParseResult] = useState<ImportParseResult<T> | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // 1. Process raw rows with column mapping and schema validation
  const processRawRows = useCallback((rawRows: string[][], fileName?: string) => {
    if (!rawRows || rawRows.length < 2) {
      toast.danger('Berkas Tidak Valid', 'Berkas harus memiliki minimal 1 baris header dan 1 baris data.');
      return;
    }

    const detectedColumns = rawRows[0].map((h) => h.trim());
    const dataRowObjects = rawRows.slice(1).map((row) => {
      const obj: Record<string, any> = {};
      detectedColumns.forEach((col, idx) => {
        obj[col] = row[idx] ?? '';
      });
      return obj;
    });

    const mapping = autoMapColumns(detectedColumns, schema);
    const validationRes = validateImportDataset(dataRowObjects, schema, mapping, detectedColumns);

    setParseResult(validationRes);
    if (fileName) setUploadedFileName(fileName);
  }, [schema, toast]);

  // 2. Parse uploaded File (.xlsx, .xls, .csv, .json)
  const parseFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgressPercent(20);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (ext === 'xlsx' || ext === 'xls') {
        const rawRows = await parseExcelFile(file);
        setProgressPercent(60);
        processRawRows(rawRows, file.name);
      } else if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
        const rawRows = await parseCsvWithPapa(file);
        setProgressPercent(60);
        processRawRows(rawRows, file.name);
      } else if (ext === 'json') {
        const text = await file.text();
        const parsedJson = JSON.parse(text);
        const records = Array.isArray(parsedJson) ? parsedJson : parsedJson.data || [];
        if (!records.length) throw new Error('Array data pada berkas JSON kosong.');

        const keys = Object.keys(records[0]);
        const rows = [keys, ...records.map((r: any) => keys.map((k) => String(r[k] ?? '')))];
        processRawRows(rows, file.name);
      } else {
        throw new Error(`Format berkas .${ext} tidak didukung. Gunakan .xlsx, .csv, atau .json.`);
      }

      setProgressPercent(100);
      toast.success('Berkas Terbaca', `Berhasil memuat berkas "${file.name}".`);
    } catch (err: any) {
      toast.danger('Gagal Membaca Berkas', err.message || 'Terjadi kesalahan saat memproses berkas.');
      if (onImportError) onImportError(err);
    } finally {
      setIsProcessing(false);
    }
  }, [processRawRows, toast, onImportError]);

  // 3. Parse pasted text directly
  const parseRawText = useCallback(async (rawText: string) => {
    setIsProcessing(true);
    try {
      const trimmed = rawText.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        const records = Array.isArray(parsed) ? parsed : parsed.data || [];
        if (!records.length) throw new Error('Array JSON kosong.');
        const keys = Object.keys(records[0]);
        const rows = [keys, ...records.map((r: any) => keys.map((k) => String(r[k] ?? '')))];
        processRawRows(rows, 'Tempelan JSON');
      } else {
        const rows = await parseCsvWithPapa(rawText);
        processRawRows(rows, 'Tempelan Tabel CSV');
      }
      toast.success('Data Terbaca', 'Teks data berhasil diproses.');
    } catch (err: any) {
      toast.danger('Gagal Membaca Teks', err.message || 'Format teks tidak valid.');
    } finally {
      setIsProcessing(false);
    }
  }, [processRawRows, toast]);

  // 4. Update individual cell value (Inline fix)
  const updateCell = useCallback((rowIndex: number, fieldKey: string, newValue: any) => {
    if (!parseResult) return;

    const targetRow = parseResult.rows.find((r) => r.index === rowIndex);
    if (!targetRow) return;

    // Update raw & mapped data
    targetRow.data = { ...targetRow.data, [fieldKey]: newValue };
    targetRow.rawData = { ...targetRow.rawData, [fieldKey]: newValue };

    // Revalidate single field
    const fieldDef = schema.fields.find((f) => f.key === fieldKey);
    if (fieldDef) {
      const fieldErrorIdx = targetRow.errors.findIndex((e) => e.field === fieldKey);
      if (fieldErrorIdx >= 0) targetRow.errors.splice(fieldErrorIdx, 1);

      if (fieldDef.required && (newValue === undefined || newValue === null || String(newValue).trim() === '')) {
        targetRow.errors.push({ field: fieldKey, message: `Kolom ${fieldDef.label} wajib diisi` });
      }

      targetRow.isValid = targetRow.errors.length === 0;
    }

    // Recalculate metrics
    const validCount = parseResult.rows.filter((r) => r.isValid && !r.isSkipped).length;
    const invalidCount = parseResult.rows.filter((r) => !r.isValid && !r.isSkipped).length;
    const warningCount = parseResult.rows.filter((r) => r.hasWarnings).length;

    setParseResult({
      ...parseResult,
      validCount,
      invalidCount,
      warningCount
    });
  }, [parseResult, schema]);

  // 5. Toggle skip row
  const toggleSkipRow = useCallback((rowIndex: number) => {
    if (!parseResult) return;
    const row = parseResult.rows.find((r) => r.index === rowIndex);
    if (!row) return;

    row.isSkipped = !row.isSkipped;
    const validCount = parseResult.rows.filter((r) => r.isValid && !r.isSkipped).length;
    const invalidCount = parseResult.rows.filter((r) => !r.isValid && !r.isSkipped).length;

    setParseResult({
      ...parseResult,
      validCount,
      invalidCount
    });
  }, [parseResult]);

  // 6. Update Column Mapping
  const updateMapping = useCallback((sourceColumn: string, targetFieldKey: string) => {
    if (!parseResult) return;
    const newMapping = { ...parseResult.mapping, [sourceColumn]: targetFieldKey };
    const dataRows = parseResult.rows.map((r) => r.rawData);
    const revalidated = validateImportDataset(dataRows, schema, newMapping, parseResult.detectedColumns);
    setParseResult(revalidated);
  }, [parseResult, schema]);

  // 7. Execute Import Finalizer
  const executeImport = useCallback(async (): Promise<BulkImportResult> => {
    if (!parseResult) {
      throw new Error('Tidak ada data yang siap diimpor.');
    }

    const validRowsToImport = parseResult.rows
      .filter((r) => r.isValid && !r.isSkipped)
      .map((r) => r.data as T);

    if (validRowsToImport.length === 0) {
      toast.warning('Tidak Ada Data Valid', 'Semua baris memiliki galat atau dilewati.');
      return { total: 0, inserted: 0, updated: 0, skipped: 0, errors: ['Tidak ada data valid.'] };
    }

    setIsProcessing(true);
    setProgressPercent(30);

    const summary: BulkImportResult = {
      total: parseResult.totalParsed,
      inserted: validRowsToImport.length,
      updated: 0,
      skipped: parseResult.rows.filter((r) => r.isSkipped).length,
      errors: parseResult.rows.flatMap((r) => r.errors.map((e) => `Baris ${r.index + 1}: ${e.message}`))
    };

    try {
      setProgressPercent(70);
      if (onImportSuccess) {
        await onImportSuccess(validRowsToImport, summary);
      }
      setProgressPercent(100);
      toast.success('Impor Berhasil', `Sebanyak ${summary.inserted} baris data berhasil dimasukkan ke sistem.`);
      return summary;
    } catch (err: any) {
      toast.danger('Gagal Menyimpan Data', err.message || 'Terjadi kesalahan saat sinkronisasi ke server.');
      if (onImportError) onImportError(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [parseResult, onImportSuccess, onImportError, toast]);

  // Summary Metrics
  const metrics = useMemo(() => {
    if (!parseResult) return { total: 0, valid: 0, invalid: 0, skipped: 0 };
    return {
      total: parseResult.totalParsed,
      valid: parseResult.rows.filter((r) => r.isValid && !r.isSkipped).length,
      invalid: parseResult.rows.filter((r) => !r.isValid && !r.isSkipped).length,
      skipped: parseResult.rows.filter((r) => r.isSkipped).length
    };
  }, [parseResult]);

  // Reset state
  const reset = useCallback(() => {
    setParseResult(null);
    setIsProcessing(false);
    setProgressPercent(0);
    setUploadedFileName('');
  }, []);

  return {
    parseFile,
    parseRawText,
    parseResult,
    metrics,
    uploadedFileName,
    updateCell,
    toggleSkipRow,
    updateMapping,
    executeImport,
    isProcessing,
    progressPercent,
    downloadTemplate: () => generateExcelTemplate(schema),
    downloadExcelTemplate: () => generateExcelTemplate(schema),
    downloadCsvTemplate: () => generateCsvTemplate(schema),
    reset
  };
}
