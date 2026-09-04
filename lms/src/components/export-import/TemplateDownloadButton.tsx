/**
 * REUSABLE TEMPLATE DOWNLOAD BUTTON COMPONENT
 * Focused on Official Excel (.xlsx) Format with Rules & Guide Sheets
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { FileSpreadsheet } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImportSchema } from '../../types/exportImport';
import { generateExcelTemplate } from '../../utils/templateGenerator';
import { useToast } from '../feedback/ToastContext';

export interface TemplateDownloadButtonProps<T = any> {
  schema: ImportSchema<T>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function TemplateDownloadButton<T = any>({
  schema,
  variant = 'outline',
  size = 'sm',
  label = 'Unduh Template Excel'
}: TemplateDownloadButtonProps<T>) {
  const toast = useToast();

  const handleDownloadExcel = () => {
    try {
      generateExcelTemplate(schema);
      toast.success(
        'Template Excel Diunduh',
        `Template resmi .xlsx untuk ${schema.name || schema.entityName} siap digunakan dengan panduan pengisian.`
      );
    } catch (err: any) {
      toast.danger('Gagal Mengunduh', err.message || 'Gagal membuat berkas template Excel.');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      icon={FileSpreadsheet}
      onClick={handleDownloadExcel}
      title="Unduh Lembar Kerja Excel (.xlsx) dengan Lembar Data & Panduan"
    >
      {label}
    </Button>
  );
}
