export type CalendarEventType = 
  | 'JADWAL_KULIAH' 
  | 'BATAS_TUGAS' 
  | 'KUIS_DARING' 
  | 'AGENDA_AKADEMIK';

export interface CalendarEvent {
  id: string;
  title: string;
  courseName?: string;
  type: CalendarEventType;
  date: string; // Format YYYY-MM-DD
  startTime?: string; // Format HH:mm
  endTime?: string;
  location?: string;
  description?: string;
  deepLinkPath?: string;
  isUrgent?: boolean;
}
