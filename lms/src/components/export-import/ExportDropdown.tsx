/**
 * ENHANCED MODULAR EXPORT DROPDOWN COMPONENT
 * Multi-Format Enterprise Export: XLSX, PDF, CSV, JSON, and Official Print
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  Code, 
  Printer, 
  ChevronDown, 
  SlidersHorizontal,
  FileCheck
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../feedback/ToastContext';
import { ExportConfig, ExportFormat } from '../../types/exportImport';
import { exportToCsv, exportToJson, printOfficialDocument } from '../../utils/exportUtils';
import { exportToXlsxWorkbook } from '../../utils/excelUtils';
import { exportToPdfDocument } from '../../utils/pdfUtils';
import { Modal } from '../ui/Modal';
import { PrintDocumentModal } from './PrintDocumentModal';

export interface ExportDropdownProps<T = any> {
  config: ExportConfig<T>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  buttonLabel?: string;
  allowColumnSelection?: boolean;
  showPrintPreview?: boolean;
  disabled?: boolean;
  className?: string;
  selectedRowIds?: (string | number)[];
  idExtractor?: (item: T) => string | number;
}

export function ExportDropdown<T = any>({
  config,
  variant = 'secondary',
  size = 'sm',
  buttonLabel = 'Ekspor Data',
  allowColumnSelection = true,
  showPrintPreview = true,
  disabled = false,
  className = '',
  selectedRowIds,
  idExtractor
}: ExportDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'selected'>('all');

  const [selectedColKeys, setSelectedColKeys] = useState<string[]>(() =>
    config.columns.filter((c) => !c.excludeFromExport && !c.hidden).map((c) => String(c.key))
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { success, warning, danger } = useToast();

  const hasSelectedRows = Boolean(
    selectedRowIds && selectedRowIds.length > 0 && idExtractor
  );

  const [alignRight, setAlignRight] = useState(false);

  // Close dropdown on outside click and adjust alignment
  useEffect(() => {
    if (!isOpen) return;

    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      if (window.innerWidth - rect.left < 310) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    const timer = setTimeout(() => {
      window.addEventListener('pointerdown', handlePointerDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  // Compute effective dataset
  const effectiveData = useMemo(() => {
    if (exportScope === 'selected' && hasSelectedRows) {
      const idSet = new Set(selectedRowIds);
      return config.data.filter((item) => idSet.has(idExtractor!(item)));
    }
    return config.data;
  }, [config.data, exportScope, hasSelectedRows, selectedRowIds, idExtractor]);

  // Compute active export config based on selected columns & scope
  const activeConfig: ExportConfig<T> = useMemo(() => ({
    ...config,
    data: effectiveData,
    columns: config.columns.map((c) => ({
      ...c,
      excludeFromExport: !selectedColKeys.includes(String(c.key))
    })),
    metadata: {
      ...config.metadata,
      'Cakupan Ekspor': exportScope === 'selected' ? `${effectiveData.length} Baris Terpilih` : `Semua (${effectiveData.length} Baris)`
    }
  }), [config, effectiveData, selectedColKeys, exportScope]);

  const handleExport = (format: ExportFormat) => {
    setIsOpen(false);
    if (!effectiveData || effectiveData.length === 0) {
      warning('Data Kosong', 'Tidak ada data untuk diekspor.');
      return;
    }

    try {
      switch (format) {
        case 'xlsx':
        case 'excel':
          exportToXlsxWorkbook(activeConfig);
          success('Ekspor Berhasil', `Data berhasil diekspor ke format Excel .xlsx (${effectiveData.length} baris).`);
          break;

        case 'pdf':
          exportToPdfDocument(activeConfig);
          success('Ekspor Berhasil', `Dokumen PDF resmi berhasil diunduh (${effectiveData.length} baris).`);
          break;

        case 'csv':
          exportToCsv(activeConfig, ',');
          success('Ekspor Berhasil', `Data berhasil diekspor ke berkas CSV (${effectiveData.length} baris).`);
          break;

        case 'json':
          exportToJson(activeConfig);
          success('Ekspor Berhasil', `Data berhasil diekspor ke berkas JSON (${effectiveData.length} objek).`);
          break;

        case 'print':
        case 'pdf_print':
          if (showPrintPreview) {
            setIsPrintModalOpen(true);
          } else {
            printOfficialDocument(activeConfig);
          }
          break;
      }
    } catch (err: any) {
      danger('Galat Ekspor', err.message || 'Terjadi kesalahan saat memproses ekspor data.');
    }
  };

  const toggleColumn = (key: string) => {
    setSelectedColKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAllColumns = () => {
    setSelectedColKeys(config.columns.map((c) => String(c.key)));
  };

  const deselectAllColumns = () => {
    setSelectedColKeys([]);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title="Klik untuk memilih format ekspor data"
        className={`btn btn-${variant} btn-${size}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          cursor: 'pointer'
        }}
      >
        <Download size={size === 'sm' ? 14 : 16} />
        <span>{buttonLabel}</span>
        <ChevronDown
          size={14}
          style={{
            marginLeft: '4px',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            opacity: 0.85
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: alignRight ? 'auto' : 0,
            right: alignRight ? 0 : 'auto',
            width: '280px',
            maxWidth: 'calc(100vw - 24px)',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 99999,
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Info */}
          <div
            style={{
              padding: '6px 10px',
              fontSize: '0.6875rem',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid #e2e8f0'
            }}
          >
            Pilihan Format Ekspor ({effectiveData.length} Baris)
          </div>

          {/* Scope Selector if selected rows exist */}
          {hasSelectedRows && (
            <div
              className="flex gap-1 p-1 bg-slate-50 dark:bg-slate-800/50 rounded"
              style={{ margin: '2px var(--space-2)' }}
            >
              <button
                type="button"
                className={`flex-1 py-1 px-2 text-xs rounded font-medium transition ${
                  exportScope === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setExportScope('all')}
              >
                Semua ({config.data.length})
              </button>
              <button
                type="button"
                className={`flex-1 py-1 px-2 text-xs rounded font-medium transition ${
                  exportScope === 'selected'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setExportScope('selected')}
              >
                Terpilih ({selectedRowIds?.length || 0})
              </button>
            </div>
          )}

          {/* 1. Excel (.xlsx) */}
          <button
            type="button"
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-2.5 w-full text-left p-2.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileSpreadsheet size={17} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                  Buku Kerja Excel (.xlsx)
                </span>
                <span 
                  style={{ 
                    fontSize: '9px', 
                    fontWeight: 700, 
                    backgroundColor: 'var(--color-primary-100)', 
                    color: 'var(--color-primary-800)',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  Direkomendasikan
                </span>
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Format lembar kerja terstruktur Microsoft Excel
              </div>
            </div>
          </button>

          {/* 2. PDF Dokumen Resmi (.pdf) */}
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2.5 w-full text-left p-2.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-danger-50)',
                color: 'var(--color-danger-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileCheck size={17} />
            </div>
            <div className="flex-1">
              <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                Dokumen PDF Resmi (.pdf)
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Format dokumen PDF dengan kop resmi
              </div>
            </div>
          </button>

          {/* 3. CSV Data File (.csv) */}
          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2.5 w-full text-left p-2.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileSpreadsheet size={17} />
            </div>
            <div className="flex-1">
              <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                Berkas CSV (.csv)
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Format teks terpisah koma / spreadsheet
              </div>
            </div>
          </button>

          {/* 4. Cetak / PDF Preview */}
          <button
            type="button"
            onClick={() => handleExport('print')}
            className="flex items-center gap-2.5 w-full text-left p-2.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-info-surface)',
                color: 'var(--color-info-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Printer size={17} />
            </div>
            <div className="flex-1">
              <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                Pratinjau Cetak / Fisik
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Dialog cetak berkop surat STAI AL-ITTIHAD
              </div>
            </div>
          </button>

          {/* 5. Format JSON Data */}
          <button
            type="button"
            onClick={() => handleExport('json')}
            className="flex items-center gap-2.5 w-full text-left p-2.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-warning-surface)',
                color: 'var(--color-warning-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Code size={17} />
            </div>
            <div className="flex-1">
              <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                Format JSON (.json)
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Struktur data API lengkap
              </div>
            </div>
          </button>

          {/* Column Customizer Toggle */}
          {allowColumnSelection && config.columns.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsColModalOpen(true);
                }}
                className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-primary-700)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                <SlidersHorizontal size={14} />
                <span>Pilih Kolom ({selectedColKeys.length}/{config.columns.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Column Selection Modal */}
      {isColModalOpen && (
        <Modal
          isOpen={isColModalOpen}
          onClose={() => setIsColModalOpen(false)}
          title="Kustomisasi Kolom Ekspor"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsColModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" onClick={() => setIsColModalOpen(false)}>
                Terapkan Kolom
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Pilih kolom yang ingin disertakan ke dalam berkas unduhan.
            </p>

            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
                {selectedColKeys.length} dari {config.columns.length} kolom aktif
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAllColumns}>Pilih Semua</Button>
                <Button variant="ghost" size="sm" onClick={deselectAllColumns}>Batal Semua</Button>
              </div>
            </div>

            <div
              style={{
                maxHeight: '260px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingRight: '4px'
              }}
            >
              {config.columns.map((col) => {
                const keyStr = String(col.key);
                const isChecked = selectedColKeys.includes(keyStr);
                return (
                  <label
                    key={keyStr}
                    className="flex items-center gap-2.5 p-2 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    style={{
                      backgroundColor: isChecked ? 'var(--color-primary-50)' : 'transparent',
                      border: '1px solid',
                      borderColor: isChecked ? 'var(--color-primary-200)' : 'var(--border-subtle)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleColumn(keyStr)}
                      className="form-checkbox"
                    />
                    <div className="flex-1">
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: isChecked ? 600 : 400 }}>
                        {col.header}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                        Kunci: {keyStr}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* Print / PDF Document Live Preview Modal */}
      {isPrintModalOpen && (
        <PrintDocumentModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          config={activeConfig}
        />
      )}
    </div>
  );
}
