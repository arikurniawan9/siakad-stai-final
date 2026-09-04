/**
 * MODULAR EXPORT & IMPORT SYSTEM TYPES
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

export type ExportFormat = 'csv' | 'excel' | 'xlsx' | 'json' | 'pdf' | 'print' | 'pdf_print';

export interface ExportColumn<T = any> {
  key: keyof T | string;
  header: string;
  width?: string | number;
  format?: (value: any, row: T, index?: number) => string | number;
  align?: 'left' | 'center' | 'right';
  excludeFromExport?: boolean;
  hidden?: boolean;
}

export interface OfficialDocumentHeader {
  institutionName?: string;
  institutionSubName?: string;
  skNumber?: string;
  address?: string;
  contact?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  foundationName?: string;
}

export interface OfficialSignature {
  title: string;
  name: string;
  identifier?: string; // NIDN / NIP / NIM
  nidn?: string;
  nip?: string;
  dateText?: string;
  date?: string;
  city?: string;
  location?: string;
}

export interface ExportConfig<T = any> {
  filename?: string;
  title: string;
  subtitle?: string;
  columns: ExportColumn<T>[];
  data: T[];
  metadata?: Record<string, string | number | boolean>;
  orientation?: 'portrait' | 'landscape';
  officialHeader?: OfficialDocumentHeader;
  signature?: OfficialSignature;
  officialSignature?: OfficialSignature;
  notes?: string[];
  department?: string;
}

export type FieldDataType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'email' 
  | 'enum'
  | 'array'
  | 'array_string';

export interface ImportFieldDefinition<T = any> {
  key: keyof T | string;
  label: string;
  type: FieldDataType;
  required?: boolean;
  allowedValues?: (string | number)[];
  enumValues?: string[];
  min?: number;
  max?: number;
  regex?: RegExp;
  aliases?: string[];
  defaultValue?: any;
  description?: string;
  sampleValue?: string | number;
  transform?: (rawVal: any) => any;
  validate?: (val: any, row: Record<string, any>) => string | true;
}

export interface ImportSchema<T = any> {
  id?: string;
  name?: string;
  entityName: string;
  fields: ImportFieldDefinition<T>[];
  sampleRows?: Record<string, any>[];
  instructions?: string[];
}

export interface RowValidationError {
  field: string;
  message: string;
}

export interface RowValidationWarning {
  field: string;
  message: string;
}

export interface ValidatedRow<T = any> {
  index: number;
  rawData: Record<string, any>;
  data: Partial<T>;
  isValid: boolean;
  hasWarnings: boolean;
  errors: RowValidationError[];
  warnings: RowValidationWarning[];
  isSkipped?: boolean;
}

export interface ImportParseResult<T = any> {
  totalParsed: number;
  validCount: number;
  invalidCount: number;
  warningCount: number;
  rows: ValidatedRow<T>[];
  detectedColumns: string[];
  mapping: Record<string, string>;
  rawText?: string;
}

export interface BulkImportResult {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}
