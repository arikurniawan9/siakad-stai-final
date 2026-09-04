/**
 * TIPE DATA MODUL PENGATURAN SISTEM — SALAM LMS
 */

export interface InstitutionSettings {
  campusName: string;
  campusCode: string;
  motto: string;
  address: string;
  email: string;
  phone: string;
  helpdeskWhatsapp: string;
  timezone: string;
  academicYearActive: string;
  semesterActive: string;
}

export interface AcademicGradingSettings {
  presenceWeight: number;
  assignmentWeight: number;
  quizWeight: number;
  midtermWeight: number;
  finalExamWeight: number;
  minAttendancePercent: number;
  passingGradePoint: number;
  maxQuizDurationMinutes: number;
  allowRemedial: boolean;
}

export interface StorageSettings {
  driver: 'local' | 'minio' | 's3';
  endpoint: string;
  bucket: string;
  maxAssignmentSizeBytes: number;
  maxMaterialSizeBytes: number;
  allowedExtensions: string[];
}

export interface SecuritySettings {
  jwtExpirationDays: number;
  minPasswordLength: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  enforceStrongPassword: boolean;
  auditLoggingEnabled: boolean;
  sessionInactivityTimeoutMinutes: number;
}

export interface SiakadIntegrationSettings {
  gatewayUrl: string;
  autoSyncEnabled: boolean;
  syncIntervalHours: number;
  lastSyncAt: string;
  syncEntities: string[];
}

export interface NotificationSettings {
  assignmentReminderHours: number;
  atRiskAdvisorAlert: boolean;
  emailNotificationEnabled: boolean;
  systemAnnouncementEnabled: boolean;
}

export interface SystemStatusOverview {
  storageStatus: string;
  siakadStatus: string;
  securityLevel: string;
  databaseVersion: string;
  nodeEnv: string;
}

export interface AllSettingsResponse {
  raw: Array<{
    key: string;
    category: string;
    value: any;
    dataType: string;
    description: string;
    isPublic: boolean;
    updatedAt: string;
  }>;
  categories: {
    INSTITUSI?: { key: string; value: InstitutionSettings; description: string; updatedAt: string };
    AKADEMIK?: { key: string; value: AcademicGradingSettings; description: string; updatedAt: string };
    PENYIMPANAN?: { key: string; value: StorageSettings; description: string; updatedAt: string };
    KEAMANAN?: { key: string; value: SecuritySettings; description: string; updatedAt: string };
    SIAKAD?: { key: string; value: SiakadIntegrationSettings; description: string; updatedAt: string };
    NOTIFIKASI?: { key: string; value: NotificationSettings; description: string; updatedAt: string };
  };
  systemStatus: SystemStatusOverview;
}

export interface TestStorageResult {
  driver: string;
  endpoint: string;
  bucket: string;
  status: string;
  latencyMs: number;
  storageCapacity: string;
  usedCapacity: string;
}

export interface TestSiakadResult {
  gatewayUrl: string;
  status: string;
  latencyMs: number;
  protocolVersion: string;
  lastSyncStatus: string;
}
