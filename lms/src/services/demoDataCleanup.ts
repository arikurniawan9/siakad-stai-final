/**
 * Menghapus cache data contoh lama dari browser. Master dan aktivitas LMS
 * sekarang harus dibaca dari API/database SIAKAD bersama.
 */
const CLEANUP_MARKER = 'salam_demo_data_cleanup_v2';

const DEMO_KEYS = new Set([
  'salam_academic_periods', 'salam_academic_years_v1', 'salam_semesters_v1',
  'salam_study_programs', 'salam_courses', 'salam_classes', 'salam_class_members',
  'salam_students_admin_v1', 'salam_assignments', 'salam_assignment_submissions',
  'salam_quizzes', 'salam_bank_questions', 'salam_quiz_attempts',
  'salam_interactive_videos', 'salam_video_progress', 'salam_discussion_threads',
  'salam_discussion_posts', 'salam_forum_participations', 'salam_in_app_notifications',
  'salam_announcements_student_state', 'salam_krs_students_v1', 'salam_krs_catalog_v1',
  'salam_krs_consultations_v1', 'salam_student_security_settings', 'salam_rps_v1',
  'salam_course_meetings', 'salam_course_rps', 'salam_learning_service_v5_real_data'
]);

export function purgeLegacyDemoData(): void {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(CLEANUP_MARKER) === 'true') return;
    for (const key of Object.keys(localStorage)) {
      if (DEMO_KEYS.has(key) || key.startsWith('salam_student_full_profile_') || key.startsWith('salam_lecturer_full_profile_') || key.startsWith('salam_announcements_student_state_') || key.startsWith('salam_student_security_settings_')) {
        localStorage.removeItem(key);
      }
    }
    localStorage.setItem(CLEANUP_MARKER, 'true');
  } catch {
    // Browser storage may be unavailable; API access remains the source of truth.
  }
}
