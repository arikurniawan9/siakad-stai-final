/**
 * CUSTOM REACT HOOK: useExportData
 * Multi-Format Professional Export (XLSX, CSV, PDF, JSON, Print)
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { useState, useCallback, useMemo } from 'react';
import { ExportConfig, ExportFormat, ExportColumn } from '../types/exportImport';
import { exportToCsv, exportToJson, printOfficialDocument } from '../utils/exportUtils';
import { exportToXlsxWorkbook } from '../utils/excelUtils';
import { exportToPdfDocument } from '../utils/pdfUtils';
import { useToast } from '../components/feedback/ToastContext';

export interface UseExportDataOptions<T = any> {
  data: T[];
  columns: ExportColumn<T>[];
  filename?: string;
  title: string;
  subtitle?: string;
  metadata?: Record<string, string | number | boolean>;
  orientation?: 'portrait' | 'landscape';
  officialHeader?: ExportConfig<T>['officialHeader'];
  officialSignature?: ExportConfig<T>['officialSignature'];
  selectedRowIds?: (string | number)[];
  idExtractor?: (item: T) => string | number;
}

export function useExportData<T = any>(options: UseExportDataOptions<T>) {
  const toast = useToast();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null);

  // Column selection state (all enabled by default)
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(() =>
    options.columns.filter((c) => !c.excludeFromExport && !c.hidden).map((c) => String(c.key))
  );

  // Filtered dataset (supporting selected row checkboxes subsetting)
  const exportDataset = useMemo(() => {
    if (options.selectedRowIds && options.selectedRowIds.length > 0 && options.idExtractor) {
      const idSet = new Set(options.selectedRowIds);
      return options.data.filter((item) => idSet.has(options.idExtractor!(item)));
    }
    return options.data;
  }, [options.data, options.selectedRowIds, options.idExtractor]);

  // Configured Export Columns based on user column selection
  const exportColumns = useMemo(() => {
    return options.columns.map((col) => ({
      ...col,
      excludeFromExport: !selectedColumnKeys.includes(String(col.key))
    }));
  }, [options.columns, selectedColumnKeys]);

  // Combined Active Config
  const activeConfig: ExportConfig<T> = useMemo(() => ({
    filename: options.filename || 'SALAM_Ekspor_Data',
    title: options.title,
    subtitle: options.subtitle,
    columns: exportColumns,
    data: exportDataset,
    metadata: {
      ...options.metadata,
      'Total Baris': `${exportDataset.length} Baris Data`,
      'Waktu Ekspor': new Date().toLocaleString('id-ID')
    },
    orientation: options.orientation,
    officialHeader: options.officialHeader,
    officialSignature: options.officialSignature
  }), [options, exportColumns, exportDataset]);

  // Generic Export Execution Handler
  const exportData = useCallback(async (format: ExportFormat, overrideConfig?: Partial<ExportConfig<T>>) => {
    const configToUse: ExportConfig<T> = {
      ...activeConfig,
      ...overrideConfig
    };

    if (!configToUse.data || configToUse.data.length === 0) {
      toast.warning('Data Kosong', 'Tidak ada data untuk diekspor pada pilihan saat ini.');
      return;
    }

    setIsExporting(true);
    setActiveFormat(format);

    try {
      switch (format) {
        case 'xlsx':
        case 'excel':
          exportToXlsxWorkbook(configToUse);
          toast.success('Unduhan Dimulai', `Berkas Excel (.xlsx) "${configToUse.filename}" berhasil dibuat.`);
          break;

        case 'csv':
          exportToCsv(configToUse);
          toast.success('Unduhan Dimulai', `Berkas CSV "${configToUse.filename}" berhasil dibuat.`);
          break;

        case 'pdf':
          exportToPdfDocument(configToUse);
          toast.success('Unduhan Dimulai', `Dokumen PDF "${configToUse.filename}" berhasil dibuat.`);
          break;

        case 'json':
          exportToJson(configToUse);
          toast.success('Unduhan Dimulai', `Berkas JSON "${configToUse.filename}" berhasil dibuat.`);
          break;

        case 'print':
        case 'pdf_print':
          printOfficialDocument(configToUse);
          break;

        default:
          exportToXlsxWorkbook(configToUse);
          toast.success('Unduhan Dimulai', `Berkas Excel (.xlsx) "${configToUse.filename}" berhasil dibuat.`);
      }
    } catch (err: any) {
      toast.danger('Gagal Ekspor Data', err.message || 'Terjadi kesalahan saat memproses ekspor berkas.');
    } finally {
      setIsExporting(false);
      setActiveFormat(null);
    }
  }, [activeConfig, toast]);

  return {
    exportData: (format: ExportFormat = 'xlsx', override?: Partial<ExportConfig<T>>) => exportData(format, override),
    exportExcel: (override?: Partial<ExportConfig<T>>) => exportData('xlsx', override),
    exportXlsx: (override?: Partial<ExportConfig<T>>) => exportData('xlsx', override),
    exportPdf: (override?: Partial<ExportConfig<T>>) => exportData('pdf', override),
    exportCsv: (override?: Partial<ExportConfig<T>>) => exportData('csv', override),
    exportJson: (override?: Partial<ExportConfig<T>>) => exportData('json', override),
    printDocument: (override?: Partial<ExportConfig<T>>) => exportData('print', override),
    isExporting,
    activeFormat,
    selectedColumnKeys,
    setSelectedColumnKeys,
    activeConfig,
    totalRecordsToExport: exportDataset.length
  };
}
