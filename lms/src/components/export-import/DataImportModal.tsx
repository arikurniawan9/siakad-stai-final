/**
 * MODULAR DATA IMPORT WIZARD MODAL (4-STEP ENTERPRISE WORKFLOW)
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Clipboard,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../feedback/ToastContext';
import {
  ImportSchema,
  ImportParseResult,
  BulkImportResult
} from '../../types/exportImport';
import {
  parseDelimitedText,
  parseJsonImportText,
  autoMapColumns,
  validateImportDataset
} from '../../utils/importUtils';
import { generateExcelTemplate } from '../../utils/templateGenerator';
import { parseExcelFile, parseCsvWithPapa } from '../../utils/excelUtils';

export interface DataImportModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  schema: ImportSchema<T>;
  onImport: (validRows: T[], summary: BulkImportResult) => Promise<BulkImportResult | void> | BulkImportResult | void;
  customTitle?: string;
}

type WizardStep = 1 | 2 | 3 | 4;

export function DataImportModal<T = any>({
  isOpen,
  onClose,
  schema,
  onImport,
  customTitle
}: DataImportModalProps<T>) {
  const { success, warning, danger } = useToast();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [rawTextContent, setRawTextContent] = useState<string>('');

  // Parsed and mapped state
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [parseResult, setParseResult] = useState<ImportParseResult<T> | null>(null);

  // Review & validation filter
  const [reviewFilter, setReviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [skipInvalidRows, setSkipInvalidRows] = useState(true);
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Processing & progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [finalSummary, setFinalSummary] = useState<BulkImportResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset all state
  const resetWizard = () => {
    setCurrentStep(1);
    setPastedText('');
    setFileName('');
    setFileSize('');
    setRawTextContent('');
    setRawHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setParseResult(null);
    setReviewFilter('all');
    setSkipInvalidRows(true);
    setEditingRowIdx(null);
    setIsProcessing(false);
    setProgressPercent(0);
    setFinalSummary(null);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  // STEP 1: Process File Content
  const processRawText = (text: string, name: string, sizeStr?: string) => {
    if (!text.trim()) {
      danger('Berkas Kosong', 'Konten berkas yang diunggah tidak memiliki isi data.');
      return;
    }

    try {
      let parsed: { headers: string[]; rows: Record<string, any>[] };
      const trimmed = text.trim();

      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        parsed = parseJsonImportText(trimmed);
      } else {
        parsed = parseDelimitedText(trimmed);
      }

      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        warning('Format Tidak Dikenali', 'Tidak dapat mengekstrak baris data dari berkas yang diberikan.');
        return;
      }

      setFileName(name);
      setFileSize(sizeStr || `${(text.length / 1024).toFixed(1)} KB`);
      setRawTextContent(text);
      setRawHeaders(parsed.headers);
      setRawRows(parsed.rows);

      // Auto map columns
      const autoMap = autoMapColumns(parsed.headers, schema);
      setColumnMapping(autoMap);

      // Validate dataset
      const validation = validateImportDataset(parsed.rows, schema, autoMap, parsed.headers, text);
      setParseResult(validation);

      setCurrentStep(2);
      success('Berkas Berhasil Dimuat', `Terdeteksi ${parsed.rows.length} baris data dan ${parsed.headers.length} kolom.`);
    } catch (err: any) {
      danger('Gagal Membaca Berkas', err.message || 'Terjadi kesalahan format data.');
    }
  };

  // File Upload Handler (.xlsx, .xls, .csv, .json)
  const handleFileUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;

    try {
      if (ext === 'xlsx' || ext === 'xls') {
        const rawGrid = await parseExcelFile(file);
        if (!rawGrid || rawGrid.length < 2) {
          throw new Error('Berkas Excel kosong atau tidak memiliki baris data.');
        }
        const headers = rawGrid[0].map((h) => h.trim());
        const rows = rawGrid.slice(1).map((row) => {
          const rowObj: Record<string, any> = {};
          headers.forEach((h, colIdx) => {
            rowObj[h] = row[colIdx] ?? '';
          });
          return rowObj;
        });

        setFileName(file.name);
        setFileSize(sizeStr);
        setRawTextContent('Excel Binary Worksheet');
        setRawHeaders(headers);
        setRawRows(rows);

        const autoMap = autoMapColumns(headers, schema);
        setColumnMapping(autoMap);

        const validation = validateImportDataset(rows, schema, autoMap, headers);
        setParseResult(validation);

        setCurrentStep(2);
        success('Berkas Excel Dimuat', `Terdeteksi ${rows.length} baris data dan ${headers.length} kolom.`);
      } else if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
        const rawGrid = await parseCsvWithPapa(file);
        if (!rawGrid || rawGrid.length < 2) {
          throw new Error('Berkas CSV kosong atau tidak memiliki baris data.');
        }
        const headers = rawGrid[0].map((h) => h.trim());
        const rows = rawGrid.slice(1).map((row) => {
          const rowObj: Record<string, any> = {};
          headers.forEach((h, colIdx) => {
            rowObj[h] = row[colIdx] ?? '';
          });
          return rowObj;
        });

        setFileName(file.name);
        setFileSize(sizeStr);
        setRawTextContent('CSV Delimited Dataset');
        setRawHeaders(headers);
        setRawRows(rows);

        const autoMap = autoMapColumns(headers, schema);
        setColumnMapping(autoMap);

        const validation = validateImportDataset(rows, schema, autoMap, headers);
        setParseResult(validation);

        setCurrentStep(2);
        success('Berkas CSV Dimuat', `Terdeteksi ${rows.length} baris data dan ${headers.length} kolom.`);
      } else {
        // Fallback text reader (JSON / Plain)
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          processRawText(text, file.name, sizeStr);
        };
        reader.readAsText(file, 'UTF-8');
      }
    } catch (err: any) {
      danger('Gagal Membaca Berkas', err.message || 'Terjadi kesalahan saat memproses berkas.');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // STEP 2: Update Mapping
  const handleMappingChange = (fieldKey: string, header: string) => {
    const updated = { ...columnMapping, [fieldKey]: header };
    if (!header) {
      delete updated[fieldKey];
    }
    setColumnMapping(updated);

    // Re-validate
    if (rawRows.length > 0) {
      const revalidated = validateImportDataset(rawRows, schema, updated, rawHeaders, rawTextContent);
      setParseResult(revalidated);
    }
  };

  // STEP 3: Inline Cell Edit Fix
  const startCellEdit = (rowIdx: number, fieldKey: string, currentVal: any) => {
    setEditingRowIdx(rowIdx);
    setEditingFieldKey(fieldKey);
    setEditingValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '');
  };

  const saveCellEdit = () => {
    if (editingRowIdx === null || !editingFieldKey || !parseResult) return;

    const updatedRawRows = [...rawRows];
    const mappedHeader = columnMapping[editingFieldKey] || editingFieldKey;
    const targetIdx = editingRowIdx - 1;

    if (updatedRawRows[targetIdx]) {
      updatedRawRows[targetIdx] = {
        ...updatedRawRows[targetIdx],
        [mappedHeader]: editingValue
      };
      setRawRows(updatedRawRows);

      const revalidated = validateImportDataset(updatedRawRows, schema, columnMapping, rawHeaders, rawTextContent);
      setParseResult(revalidated);
      success('Perbaikan Disimpan', 'Nilai kolom berhasil diperbarui dan divalidasi ulang.');
    }

    setEditingRowIdx(null);
    setEditingFieldKey(null);
    setEditingValue('');
  };

  const cancelCellEdit = () => {
    setEditingRowIdx(null);
    setEditingFieldKey(null);
    setEditingValue('');
  };

  // STEP 4: Execute Import
  const handleExecuteImport = async () => {
    if (!parseResult) return;

    // Filter valid rows according to skip settings
    const rowsToImport = parseResult.rows.filter((r) => {
      if (skipInvalidRows) {
        return r.isValid && !r.isSkipped;
      }
      return !r.isSkipped;
    });

    if (rowsToImport.length === 0) {
      warning('Tidak Ada Data Valid', 'Tidak ada data valid untuk diimpor. Perbaiki baris bermasalah terlebih dahulu.');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(4);
    setProgressPercent(15);

    try {
      const typedData: T[] = rowsToImport.map((r) => r.data as T);
      const summaryPayload: BulkImportResult = {
        total: parseResult.totalParsed,
        inserted: rowsToImport.length,
        updated: 0,
        skipped: parseResult.totalParsed - rowsToImport.length,
        errors: parseResult.rows.filter((r) => !r.isValid).map((r) => `Baris #${r.index}: ${r.errors.map((e) => e.message).join(', ')}`)
      };

      // Simulated smooth progress animation
      setProgressPercent(45);
      await new Promise((res) => setTimeout(res, 300));
      setProgressPercent(80);

      const result = await onImport(typedData, summaryPayload);
      setProgressPercent(100);

      const finalRes: BulkImportResult = (result as BulkImportResult) || summaryPayload;
      setFinalSummary(finalRes);
      success('Impor Selesai!', `Berhasil mengimpor ${finalRes.inserted} data ke sistem SALAM.`);
    } catch (err: any) {
      danger('Gagal Memproses Impor', err.message || 'Terjadi kesalahan saat menyimpan data ke server.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered rows for step 3 review
  const displayRows = (parseResult?.rows || []).filter((r) => {
    if (reviewFilter === 'valid') return r.isValid;
    if (reviewFilter === 'invalid') return !r.isValid;
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={customTitle || `Pusat Impor & Unggah Massal — ${schema.entityName}`}
      maxWidth="950px"
    >
      <div className="flex flex-col gap-5">
        {/* Wizard Steps Stepper */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-default)',
            paddingBottom: 'var(--space-3)'
          }}
        >
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: currentStep >= 1 ? 'var(--color-primary-700)' : 'var(--color-slate-200)',
                color: currentStep >= 1 ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 'var(--text-xs)'
              }}
            >
              1
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: currentStep === 1 ? 'bold' : 'medium', color: currentStep === 1 ? 'var(--color-primary-900)' : 'var(--text-secondary)' }}>
              Pilih Berkas
            </span>
          </div>

          <div style={{ height: '2px', flex: 1, backgroundColor: currentStep >= 2 ? 'var(--color-primary-600)' : 'var(--border-default)', margin: '0 8px' }} />

          <div className="flex items-center gap-2">
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: currentStep >= 2 ? 'var(--color-primary-700)' : 'var(--color-slate-200)',
                color: currentStep >= 2 ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 'var(--text-xs)'
              }}
            >
              2
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: currentStep === 2 ? 'bold' : 'medium', color: currentStep === 2 ? 'var(--color-primary-900)' : 'var(--text-secondary)' }}>
              Pemetaan Kolom
            </span>
          </div>

          <div style={{ height: '2px', flex: 1, backgroundColor: currentStep >= 3 ? 'var(--color-primary-600)' : 'var(--border-default)', margin: '0 8px' }} />

          <div className="flex items-center gap-2">
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: currentStep >= 3 ? 'var(--color-primary-700)' : 'var(--color-slate-200)',
                color: currentStep >= 3 ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 'var(--text-xs)'
              }}
            >
              3
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: currentStep === 3 ? 'bold' : 'medium', color: currentStep === 3 ? 'var(--color-primary-900)' : 'var(--text-secondary)' }}>
              Validasi & Pratinjau
            </span>
          </div>

          <div style={{ height: '2px', flex: 1, backgroundColor: currentStep >= 4 ? 'var(--color-primary-700)' : 'var(--border-default)', margin: '0 8px' }} />

          <div className="flex items-center gap-2">
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: currentStep === 4 ? 'var(--color-primary-700)' : 'var(--color-slate-200)',
                color: currentStep === 4 ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 'var(--text-xs)'
              }}
            >
              4
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: currentStep === 4 ? 'bold' : 'medium', color: currentStep === 4 ? 'var(--color-primary-900)' : 'var(--text-secondary)' }}>
              Hasil Impor
            </span>
          </div>
        </div>

        {/* ====================================================================
            STEP 1: UPLOAD & FORMAT SELECTION
            ==================================================================== */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-4">
            {/* Download Sample Templates Banner */}
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-primary-50)',
                border: '1px solid var(--color-primary-200)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-2)'
              }}
            >
              <div>
                <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)' }}>
                  Gunakan Format Standar Excel SALAM LMS
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-primary-800)' }}>
                  Unduh template lembar kerja Excel (.xlsx) resmi dengan lembar Data Impor & Petunjuk Pengisian.
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => generateExcelTemplate(schema)}
                >
                  Unduh Template Excel (.xlsx)
                </Button>
              </div>
            </div>

            {/* Toggle Input Mode: File vs Paste */}
            <div className="flex gap-2" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
              <button
                type="button"
                className={`btn btn-sm ${uploadMethod === 'file' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setUploadMethod('file')}
              >
                <UploadCloud size={14} />
                <span>Unggah Berkas Excel (.xlsx / .xls)</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${uploadMethod === 'paste' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setUploadMethod('paste')}
              >
                <Clipboard size={14} />
                <span>Salin-Tempel dari Spreadsheet</span>
              </button>
            </div>

            {uploadMethod === 'file' ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--color-primary-600)' : 'var(--border-strong)'}`,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isDragging ? 'var(--color-primary-50)' : 'var(--bg-surface-muted)',
                  padding: 'var(--space-8) var(--space-4)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  accept=".xlsx,.xls,.csv,.json,.tsv,.txt"
                  style={{ display: 'none' }}
                />
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary-100)',
                    color: 'var(--color-primary-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-3) auto'
                  }}
                >
                  <UploadCloud size={28} />
                </div>
                <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Klik untuk Memilih Berkas Excel atau Tarik ke Sini
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Format standar: Microsoft Excel (.xlsx / .xls). Otomatis memvalidasi kolom dan tipe data (Maks. 10 MB).
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  Tempel Data Tabel (Salin langsung dari Microsoft Excel atau Google Sheets):
                </label>
                <textarea
                  rows={8}
                  className="form-textarea"
                  style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}
                  placeholder={`Contoh baris tabel yang disalin dari Excel:\nNIM\tNama Lengkap\tEmail\tProgram Studi\n21.01.0042\tAhmad Fauzi\tahmad@stai-alittihad.ac.id\tPAI`}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    disabled={!pastedText.trim()}
                    onClick={() => processRawText(pastedText, 'Data_Salinan_Clipboard.tsv')}
                  >
                    Proses Teks & Lanjut
                  </Button>
                </div>
              </div>
            )}

            {/* Field Requirement Guide Accordion */}
            <div
              style={{
                backgroundColor: 'var(--color-slate-50)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)'
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>
                Definisi Kolom & Skema Data ({schema.fields.length} Kolom):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '6px' }}>
                {schema.fields.map((f) => (
                  <div
                    key={String(f.key)}
                    style={{
                      fontSize: '0.6875rem',
                      padding: '4px 6px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{f.label}</span>
                      {f.required && <Badge variant="danger" style={{ fontSize: '0.55rem', padding: '1px 3px' }}>Wajib</Badge>}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem' }}>
                      Tipe: {f.type} {f.allowedValues ? `(${f.allowedValues.join('/')})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            STEP 2: COLUMN MAPPING & PRE-FLIGHT
            ==================================================================== */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-slate-50)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)'
              }}
            >
              <div>
                <strong>Berkas:</strong> {fileName} ({fileSize}) • <strong>{rawRows.length}</strong> baris data terdeteksi
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                Ganti Berkas
              </Button>
            </div>

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Petakan kolom dari berkas Anda ke kolom sistem SALAM. Kolom dengan nama serupa telah dipetakan secara otomatis.
            </div>

            <div
              style={{
                maxHeight: '320px',
                overflowY: 'auto',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Kolom Sistem SALAM</th>
                    <th style={{ width: '40%' }}>Kolom dari Berkas Anda</th>
                    <th style={{ width: '25%' }}>Contoh Nilai (Baris #1)</th>
                  </tr>
                </thead>
                <tbody>
                  {schema.fields.map((field) => {
                    const mappedHdr = columnMapping[String(field.key)] || '';
                    const sampleVal = rawRows[0] && mappedHdr ? rawRows[0][mappedHdr] : '-';

                    return (
                      <tr key={String(field.key)}>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span style={{ fontWeight: 'bold' }}>{field.label}</span>
                            {field.required && (
                              <Badge variant="danger" style={{ fontSize: '0.55rem', padding: '1px 3px' }}>
                                Wajib
                              </Badge>
                            )}
                          </div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                            Key: {String(field.key)} • Tipe: {field.type}
                          </div>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }}
                            value={mappedHdr}
                            onChange={(e) => handleMappingChange(String(field.key), e.target.value)}
                          >
                            <option value="">-- Jangan Impor Kolom Ini --</option>
                            {rawHeaders.map((hdr) => (
                              <option key={hdr} value={hdr}>
                                {hdr}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sampleVal !== undefined && sampleVal !== null ? String(sampleVal) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentStep(1)}>
                Kembali
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => setCurrentStep(3)}
              >
                Lanjut ke Validasi Data ({parseResult?.validCount || 0}/{rawRows.length} Valid)
              </Button>
            </div>
          </div>
        )}

        {/* ====================================================================
            STEP 3: INTERACTIVE VALIDATION & REVIEW GRID
            ==================================================================== */}
        {currentStep === 3 && parseResult && (
          <div className="flex flex-col gap-4">
            {/* Validation Metrics Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>TOTAL BARIS</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>{parseResult.totalParsed}</div>
                </div>
              </div>

              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-success-bg)',
                  border: '1px solid var(--color-success-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success-surface)', color: 'var(--color-success-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', fontWeight: 'bold' }}>BARIS VALID</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-success-text)' }}>
                    {parseResult.validCount} ({Math.round((parseResult.validCount / (parseResult.totalParsed || 1)) * 100)}%)
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: parseResult.invalidCount > 0 ? 'var(--color-danger-bg)' : 'var(--bg-surface)',
                  border: `1px solid ${parseResult.invalidCount > 0 ? 'var(--color-danger-border)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-danger-surface)', color: 'var(--color-danger-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: parseResult.invalidCount > 0 ? 'var(--color-danger-dark)' : 'var(--text-muted)', fontWeight: 'bold' }}>BARIS BERMASALAH</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: parseResult.invalidCount > 0 ? 'var(--color-danger-text)' : 'var(--text-primary)' }}>
                    {parseResult.invalidCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Options */}
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  className={`btn btn-xs ${reviewFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  Semua ({parseResult.totalParsed})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('valid')}
                  className={`btn btn-xs ${reviewFilter === 'valid' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  Hanya Valid ({parseResult.validCount})
                </button>
                {parseResult.invalidCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setReviewFilter('invalid')}
                    className={`btn btn-xs ${reviewFilter === 'invalid' ? 'btn-danger' : 'btn-ghost'}`}
                  >
                    Hanya Bermasalah ({parseResult.invalidCount})
                  </button>
                )}
              </div>

              <label className="flex items-center gap-1.5" style={{ fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={skipInvalidRows}
                  onChange={(e) => setSkipInvalidRows(e.target.checked)}
                />
                <span>Otomatis lewati baris bermasalah saat mengeksekusi impor</span>
              </label>
            </div>

            {/* Inline Editing Modal/Dialog if active */}
            {editingRowIdx !== null && editingFieldKey && (
              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-warning-surface)',
                  border: '1px solid var(--color-warning-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                <span>Edit Baris #{editingRowIdx} — <strong>{schema.fields.find((f) => f.key === editingFieldKey)?.label}:</strong></span>
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="form-input"
                  style={{ width: '220px', padding: '2px 6px', height: '28px', fontSize: 'var(--text-xs)' }}
                  autoFocus
                />
                <Button variant="primary" size="sm" onClick={saveCellEdit}>Simpan</Button>
                <Button variant="ghost" size="sm" onClick={cancelCellEdit}>Batal</Button>
              </div>
            )}

            {/* Data Grid Table */}
            <div
              style={{
                maxHeight: '340px',
                overflowY: 'auto',
                overflowX: 'auto',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <table className="table" style={{ margin: 0, minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                    <th style={{ width: '90px' }}>Status</th>
                    {schema.fields.map((f) => (
                      <th key={String(f.key)} style={{ minWidth: '130px' }}>
                        {f.label}
                      </th>
                    ))}
                    <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row) => {
                    const rowErrors = row.errors;
                    const isRowValid = row.isValid;

                    return (
                      <tr
                        key={row.index}
                        style={{
                          backgroundColor: !isRowValid ? 'rgba(254, 242, 242, 0.6)' : undefined
                        }}
                      >
                        <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>
                          {row.index}
                        </td>
                        <td>
                          {isRowValid ? (
                            <Badge variant="success">Siap Impor</Badge>
                          ) : (
                            <Badge variant="danger" title={rowErrors.map((e) => e.message).join(' | ')}>
                              Galat
                            </Badge>
                          )}
                        </td>
                        {schema.fields.map((f) => {
                          const val = (row.data as any)[f.key];
                          const fieldErr = rowErrors.find((e) => e.field === String(f.key));

                          return (
                            <td
                              key={String(f.key)}
                              style={{
                                backgroundColor: fieldErr ? 'rgba(239, 68, 68, 0.1)' : undefined,
                                fontSize: 'var(--text-xs)'
                              }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span style={{ color: fieldErr ? 'var(--color-danger-main)' : 'inherit' }}>
                                  {val !== undefined && val !== null ? String(val) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => startCellEdit(row.index, String(f.key), val)}
                                  title="Edit nilai kolom ini"
                                  style={{ opacity: 0.5, cursor: 'pointer' }}
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                              {fieldErr && (
                                <div style={{ fontSize: '0.625rem', color: 'var(--color-danger-main)', marginTop: '2px' }}>
                                  {fieldErr.message}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'center' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Toggle skipped state
                              row.isSkipped = !row.isSkipped;
                              setParseResult({ ...parseResult });
                            }}
                            title={row.isSkipped ? 'Batalkan lewati' : 'Lewati baris ini'}
                          >
                            {row.isSkipped ? 'Gunakan' : 'Lewati'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentStep(2)}>
                Kembali ke Pemetaan
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                disabled={parseResult.validCount === 0 && skipInvalidRows}
                onClick={handleExecuteImport}
              >
                Eksekusi Impor {skipInvalidRows ? `(${parseResult.validCount} Baris Valid)` : `(${parseResult.totalParsed} Baris)`}
              </Button>
            </div>
          </div>
        )}

        {/* ====================================================================
            STEP 4: EXECUTION PROGRESS & RESULT SUMMARY
            ==================================================================== */}
        {currentStep === 4 && (
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-md">
                <RefreshCw size={36} className="animate-spin text-brand" />
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 'bold' }}>
                  Memproses Impor Data ke Sistem SALAM...
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-slate-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      backgroundColor: 'var(--color-primary-600)',
                      transition: 'width 300ms ease'
                    }}
                  />
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Sinkronisasi validasi basis data ({progressPercent}%)
                </div>
              </div>
            ) : finalSummary ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-lg text-center">
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-success-bg)',
                    color: 'var(--color-success-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-2)'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                  Impor Data Berhasil Selesai!
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Seluruh data valid telah terintegrasi ke dalam basis data SALAM LMS STAI AL-ITTIHAD.
                </p>

                <div
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-slate-50)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                    marginTop: 'var(--space-2)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--space-2)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>TOTAL BARIS</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>{finalSummary.total}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', fontWeight: 'bold' }}>BERHASIL DIMASUKKAN</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-success-text)' }}>{finalSummary.inserted}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>DILEWATI</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>{finalSummary.skipped}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="primary" size="md" onClick={handleClose}>
                    Selesai & Lihat Data
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Modal>
  );
}
