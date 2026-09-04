import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole, requirePermission } from '../middleware/rbacMiddleware.js';

// Controllers
import * as authCtrl from '../modules/auth/authController.js';
import * as academicCtrl from '../modules/academic/academicController.js';
import * as periodCtrl from '../modules/academic/periodController.js';
import * as prodiCtrl from '../modules/academic/prodiController.js';
import * as courseAdminCtrl from '../modules/academic/courseAdminController.js';
import * as scheduleAdminCtrl from '../modules/academic/scheduleAdminController.js';
import * as studentAdminCtrl from '../modules/academic/studentAdminController.js';
import * as lecturerAdminCtrl from '../modules/academic/lecturerAdminController.js';
import * as gradeAdminCtrl from '../modules/academic/gradeAdminController.js';
import * as monitoringAdminCtrl from '../modules/monitoring/monitoringAdminController.js';
import * as roleAdminCtrl from '../modules/roles/roleAdminController.js';
import * as systemSettingsCtrl from '../modules/system/systemSettingsController.js';
import * as learningCtrl from '../modules/learning/learningController.js';
import * as videoCtrl from '../modules/video/videoController.js';
import * as assessmentCtrl from '../modules/assessment/assessmentController.js';
import * as discussionCtrl from '../modules/discussion/discussionController.js';
import * as progressCtrl from '../modules/progress/progressController.js';
import * as notifCtrl from '../modules/notifications/notificationController.js';
import * as reportCtrl from '../modules/reporting/reportingController.js';
import * as attendanceCtrl from '../modules/attendance/attendanceController.js';
import * as storageCtrl from '../storage/storageController.js';

export const apiRouter = Router();

// 1. AUTH ROUTES
apiRouter.post('/auth/login', authCtrl.login);
apiRouter.post('/auth/siakad/exchange', authCtrl.siakadSsoExchange);
apiRouter.get('/auth/me', requireAuth, authCtrl.getMe);
apiRouter.post('/auth/logout', requireAuth, authCtrl.logout);
apiRouter.post('/auth/switch-role', requireAuth, authCtrl.switchRole);

// 2. ACADEMIC & SIAKAD SYNC ROUTES
apiRouter.get('/academic/classes', requireAuth, academicCtrl.getClasses);
apiRouter.post('/academic/sync', requireAuth, requirePermission('sync:execute'), academicCtrl.syncAcademicData);
apiRouter.get('/academic/sync-logs', requireAuth, requirePermission('sync:view_logs'), academicCtrl.getSyncLogs);

// 2b. ACADEMIC PERIODS & SEMESTERS (ADMIN/PERIODE)
apiRouter.get('/academic/periods/summary', requireAuth, requirePermission('academic:view_periods'), periodCtrl.getPeriodSummaryStats);
apiRouter.get('/academic/periods/years', requireAuth, requirePermission('academic:view_periods'), periodCtrl.getAcademicYears);
apiRouter.post('/academic/periods/years', requireAuth, requirePermission('academic:manage_periods'), periodCtrl.createAcademicYear);
apiRouter.delete('/academic/periods/years/:id', requireAuth, requirePermission('academic:manage_periods'), periodCtrl.deleteAcademicYear);
apiRouter.get('/academic/periods/semesters', requireAuth, requirePermission('academic:view_periods'), periodCtrl.getSemesters);
apiRouter.post('/academic/periods/semesters', requireAuth, requirePermission('academic:manage_periods'), periodCtrl.createSemester);
apiRouter.put('/academic/periods/semesters/:semesterId', requireAuth, requirePermission('academic:manage_periods'), periodCtrl.updateSemester);
apiRouter.delete('/academic/periods/semesters/:semesterId', requireAuth, requirePermission('academic:manage_periods'), periodCtrl.deleteSemester);
apiRouter.post('/academic/periods/semesters/:semesterId/activate', requireAuth, requirePermission('academic:manage_periods'), periodCtrl.activateSemester);
apiRouter.post('/academic/periods/semesters/:semesterId/archive', requireAuth, requirePermission('academic:manage_periods'), periodCtrl.archiveSemester);

// 2c. STUDY PROGRAMS & CURRICULUMS (ADMIN/PRODI)
apiRouter.get('/academic/study-programs/summary', requireAuth, prodiCtrl.getStudyProgramsSummary);
apiRouter.get('/academic/study-programs', requireAuth, prodiCtrl.getStudyPrograms);
apiRouter.get('/academic/study-programs/:id', requireAuth, prodiCtrl.getStudyProgramById);
apiRouter.post('/academic/study-programs', requireAuth, requirePermission('academic:manage_periods'), prodiCtrl.createStudyProgram);
apiRouter.post('/academic/study-programs/bulk', requireAuth, requirePermission('academic:manage_periods'), prodiCtrl.bulkCreateStudyPrograms);
apiRouter.put('/academic/study-programs/:id', requireAuth, requirePermission('academic:manage_periods'), prodiCtrl.updateStudyProgram);
apiRouter.delete('/academic/study-programs/:id', requireAuth, requirePermission('academic:manage_periods'), prodiCtrl.deleteStudyProgram);
apiRouter.patch('/academic/study-programs/:id/toggle-status', requireAuth, requirePermission('academic:manage_periods'), prodiCtrl.toggleStudyProgramStatus);

apiRouter.get('/academic/curriculums', requireAuth, prodiCtrl.getCurriculums);
apiRouter.post('/academic/curriculums', requireAuth, requirePermission('academic:manage_periods'), prodiCtrl.createCurriculum);
apiRouter.get('/academic/cpl', requireAuth, prodiCtrl.getCPLList);
apiRouter.post('/academic/cpl', requireAuth, requirePermission('academic:manage_periods'), prodiCtrl.createCPL);

// 2d. MASTER COURSES & CLASSES (ADMIN/MATA-KULIAH)
apiRouter.get('/academic/courses/summary', requireAuth, courseAdminCtrl.getCoursesSummary);
apiRouter.get('/academic/courses', requireAuth, courseAdminCtrl.getCourses);
apiRouter.get('/academic/courses/:id', requireAuth, courseAdminCtrl.getCourseById);
apiRouter.post('/academic/courses', requireAuth, requirePermission('academic:manage_periods'), courseAdminCtrl.createCourse);
apiRouter.post('/academic/courses/bulk', requireAuth, requirePermission('academic:manage_periods'), courseAdminCtrl.bulkCreateCourses);
apiRouter.put('/academic/courses/:id', requireAuth, requirePermission('academic:manage_periods'), courseAdminCtrl.updateCourse);
apiRouter.delete('/academic/courses/:id', requireAuth, requirePermission('academic:manage_periods'), courseAdminCtrl.deleteCourse);
apiRouter.patch('/academic/courses/:id/toggle-status', requireAuth, requirePermission('academic:manage_periods'), courseAdminCtrl.toggleCourseStatus);

apiRouter.get('/academic/classes/all', requireAuth, courseAdminCtrl.getAllClasses);
apiRouter.post('/academic/classes', requireAuth, requirePermission('academic:manage_periods'), courseAdminCtrl.createClass);
apiRouter.put('/academic/classes/:id', requireAuth, requirePermission('academic:manage_periods'), courseAdminCtrl.updateClass);
apiRouter.delete('/academic/classes/:id', requireAuth, requirePermission('academic:manage_periods'), courseAdminCtrl.deleteClass);
apiRouter.patch('/academic/classes/:id/toggle-status', requireAuth, requirePermission('academic:manage_periods'), courseAdminCtrl.toggleClassStatus);

// 2e. MASTER SCHEDULES & ROOMS (ADMIN/JADWAL)
apiRouter.get('/academic/schedules/summary', requireAuth, scheduleAdminCtrl.getSchedulesSummary);
apiRouter.get('/academic/schedules', requireAuth, scheduleAdminCtrl.getSchedules);
apiRouter.get('/academic/schedules/matrix', requireAuth, scheduleAdminCtrl.getScheduleMatrix);
apiRouter.post('/academic/schedules', requireAuth, requirePermission('academic:manage_periods'), scheduleAdminCtrl.createSchedule);
apiRouter.post('/academic/schedules/bulk', requireAuth, requirePermission('academic:manage_periods'), scheduleAdminCtrl.bulkCreateSchedules);
apiRouter.put('/academic/schedules/:id', requireAuth, requirePermission('academic:manage_periods'), scheduleAdminCtrl.updateSchedule);
apiRouter.delete('/academic/schedules/:id', requireAuth, requirePermission('academic:manage_periods'), scheduleAdminCtrl.deleteSchedule);

apiRouter.get('/academic/rooms', requireAuth, scheduleAdminCtrl.getRooms);
apiRouter.post('/academic/rooms', requireAuth, requirePermission('academic:manage_periods'), scheduleAdminCtrl.createRoom);
apiRouter.put('/academic/rooms/:id', requireAuth, requirePermission('academic:manage_periods'), scheduleAdminCtrl.updateRoom);
apiRouter.patch('/academic/rooms/:id/toggle-status', requireAuth, requirePermission('academic:manage_periods'), scheduleAdminCtrl.toggleRoomStatus);

// 2f. STUDENT MANAGEMENT (ADMIN/MAHASISWA)
apiRouter.get('/academic/students/summary', requireAuth, studentAdminCtrl.getStudentsSummary);
apiRouter.get('/academic/students', requireAuth, studentAdminCtrl.getStudents);
apiRouter.get('/academic/students/:id', requireAuth, studentAdminCtrl.getStudentById);
apiRouter.post('/academic/students', requireAuth, requirePermission('users:manage'), studentAdminCtrl.createStudent);
apiRouter.post('/academic/students/bulk', requireAuth, requirePermission('users:manage'), studentAdminCtrl.bulkCreateStudents);
apiRouter.put('/academic/students/:id', requireAuth, requirePermission('users:manage'), studentAdminCtrl.updateStudent);
apiRouter.patch('/academic/students/:id/status', requireAuth, requirePermission('users:manage'), studentAdminCtrl.updateStudentStatus);
apiRouter.post('/academic/students/:id/reset-password', requireAuth, requirePermission('users:manage'), studentAdminCtrl.resetStudentPassword);
apiRouter.delete('/academic/students/:id', requireAuth, requirePermission('users:manage'), studentAdminCtrl.deleteStudent);

// 2g. LECTURER MANAGEMENT (ADMIN/DOSEN)
apiRouter.get('/academic/lecturers/summary', requireAuth, lecturerAdminCtrl.getLecturersSummary);
apiRouter.get('/academic/lecturers', requireAuth, lecturerAdminCtrl.getLecturers);
apiRouter.get('/academic/lecturers/:id', requireAuth, lecturerAdminCtrl.getLecturerById);
apiRouter.post('/academic/lecturers', requireAuth, requirePermission('users:manage'), lecturerAdminCtrl.createLecturer);
apiRouter.post('/academic/lecturers/bulk', requireAuth, requirePermission('users:manage'), lecturerAdminCtrl.bulkCreateLecturers);
apiRouter.put('/academic/lecturers/:id', requireAuth, requirePermission('users:manage'), lecturerAdminCtrl.updateLecturer);
apiRouter.patch('/academic/lecturers/:id/toggle-advisor', requireAuth, requirePermission('users:manage'), lecturerAdminCtrl.toggleAcademicAdvisor);
apiRouter.post('/academic/lecturers/:id/reset-password', requireAuth, requirePermission('users:manage'), lecturerAdminCtrl.resetLecturerPassword);
apiRouter.delete('/academic/lecturers/:id', requireAuth, requirePermission('users:manage'), lecturerAdminCtrl.deleteLecturer);

// 2h. MONITORING (ADMIN/MONITORING)
apiRouter.get('/monitoring/summary', requireAuth, monitoringAdminCtrl.getMonitoringSummary);
apiRouter.get('/monitoring/realtime-feed', requireAuth, monitoringAdminCtrl.getRealtimeActivityFeed);
apiRouter.get('/monitoring/classes-engagement', requireAuth, monitoringAdminCtrl.getClassEngagementMatrix);
apiRouter.get('/monitoring/at-risk-students', requireAuth, monitoringAdminCtrl.getAtRiskStudents);

// 2i. GRADES & TRANSCRIPTS (ADMIN/NILAI)
apiRouter.get('/academic/grades/summary', requireAuth, gradeAdminCtrl.getGradesSummary);
apiRouter.get('/academic/grades/classes', requireAuth, gradeAdminCtrl.getClassGradesSummary);
apiRouter.get('/academic/grades/classes/:classId/students', requireAuth, gradeAdminCtrl.getClassStudentGrades);
apiRouter.put('/academic/grades/classes/:classId/students/:studentId', requireAuth, requirePermission('academic:input_final_grades'), gradeAdminCtrl.updateStudentGrade);
apiRouter.post('/academic/grades/classes/:classId/publish', requireAuth, requirePermission('academic:input_final_grades'), gradeAdminCtrl.publishClassGrades);
apiRouter.post('/academic/grades/classes/:classId/unlock', requireAuth, requirePermission('academic:input_final_grades'), gradeAdminCtrl.unlockClassGrades);
apiRouter.get('/academic/grades/transcripts/students/:studentId', requireAuth, gradeAdminCtrl.getStudentTranscript);

// 2j. ROLES & RBAC (ADMIN/PERAN)
apiRouter.get('/roles/summary', requireAuth, roleAdminCtrl.getRolesSummary);
apiRouter.get('/roles', requireAuth, roleAdminCtrl.getRolesList);
apiRouter.get('/roles/permissions-catalog', requireAuth, roleAdminCtrl.getPermissionsCatalog);
apiRouter.get('/roles/:id', requireAuth, roleAdminCtrl.getRoleById);
apiRouter.post('/roles', requireAuth, requirePermission('roles:manage'), roleAdminCtrl.createRole);
apiRouter.put('/roles/:id', requireAuth, requirePermission('roles:manage'), roleAdminCtrl.updateRole);
apiRouter.delete('/roles/:id', requireAuth, requirePermission('roles:manage'), roleAdminCtrl.deleteRole);
apiRouter.post('/roles/:id/clone', requireAuth, requirePermission('roles:manage'), roleAdminCtrl.cloneRole);

// 2k. SYSTEM SETTINGS (ADMIN/PENGATURAN)
apiRouter.get('/system/settings', requireAuth, systemSettingsCtrl.getAllSettings);
apiRouter.get('/system/settings/public', systemSettingsCtrl.getPublicSettings);
apiRouter.put('/system/settings/:category', requireAuth, requirePermission('system:configure'), systemSettingsCtrl.updateCategorySettings);
apiRouter.post('/system/settings/test-storage', requireAuth, requirePermission('system:configure'), systemSettingsCtrl.testStorageConnection);
apiRouter.post('/system/settings/test-siakad', requireAuth, requirePermission('system:configure'), systemSettingsCtrl.testSiakadConnection);

// 3. LEARNING (RPS, MEETINGS, MATERIALS)
apiRouter.get('/classes/:classId/rps', requireAuth, learningCtrl.getRPS);
apiRouter.put('/classes/:classId/rps', requireAuth, requirePermission('materials:manage'), learningCtrl.updateRPS);
apiRouter.delete('/classes/:classId/rps', requireAuth, requirePermission('materials:manage'), learningCtrl.deleteRPS);

apiRouter.get('/classes/:classId/meetings', requireAuth, learningCtrl.getMeetings);
apiRouter.post('/classes/:classId/meetings', requireAuth, requirePermission('materials:manage'), learningCtrl.createMeeting);
apiRouter.put('/classes/:classId/meetings/:meetingId', requireAuth, requirePermission('materials:manage'), learningCtrl.updateMeeting);
apiRouter.delete('/classes/:classId/meetings/:meetingId', requireAuth, requirePermission('materials:manage'), learningCtrl.deleteMeeting);

apiRouter.post('/classes/:classId/meetings/:meetingId/materials', requireAuth, requirePermission('materials:manage'), learningCtrl.createMaterial);
apiRouter.put('/classes/:classId/meetings/:meetingId/materials/:materialId', requireAuth, requirePermission('materials:manage'), learningCtrl.updateMaterial);
apiRouter.delete('/classes/:classId/meetings/:meetingId/materials/:materialId', requireAuth, requirePermission('materials:manage'), learningCtrl.deleteMaterial);
apiRouter.post('/materials/:materialId/access-log', requireAuth, learningCtrl.logMaterialAccess);

// 4. INTERACTIVE VIDEO
apiRouter.get('/videos', requireAuth, videoCtrl.getVideos);
apiRouter.get('/videos/:videoId', requireAuth, videoCtrl.getVideoById);
apiRouter.get('/videos/:videoId/progress', requireAuth, videoCtrl.getStudentVideoProgress);
apiRouter.post('/videos/:videoId/progress', requireAuth, videoCtrl.updateVideoProgress);
apiRouter.post('/videos/:videoId/checkpoints/:checkpointId/answer', requireAuth, videoCtrl.submitCheckpointAnswer);

// 5. QUIZZES & ASSIGNMENTS (KUIS, TUGAS & RUBRIK)
apiRouter.get('/quizzes', requireAuth, assessmentCtrl.getQuizzes);
apiRouter.get('/quizzes/:quizId', requireAuth, assessmentCtrl.getQuizById);
apiRouter.post('/quizzes/:quizId/start', requireAuth, assessmentCtrl.startQuizAttempt);
apiRouter.post('/quizzes/attempts/:attemptId/autosave', requireAuth, assessmentCtrl.autosaveQuizAnswer);
apiRouter.post('/quizzes/attempts/:attemptId/submit', requireAuth, assessmentCtrl.submitQuizAttempt);

// Modul Tugas & Rubrik Penilaian
apiRouter.get('/assignments', requireAuth, assessmentCtrl.getAssignments);
apiRouter.get('/assignments/:assignmentId', requireAuth, assessmentCtrl.getAssignmentById);
apiRouter.post('/assignments', requireAuth, requirePermission('materials:manage'), assessmentCtrl.createAssignment);
apiRouter.put('/assignments/:assignmentId', requireAuth, requirePermission('materials:manage'), assessmentCtrl.updateAssignment);
apiRouter.delete('/assignments/:assignmentId', requireAuth, requirePermission('materials:manage'), assessmentCtrl.deleteAssignment);
apiRouter.get('/assignments/:assignmentId/submissions', requireAuth, requirePermission('assignments:grade'), assessmentCtrl.getClassAssignmentSubmissions);
apiRouter.get('/assignments/:assignmentId/submission', requireAuth, assessmentCtrl.getStudentSubmission);
apiRouter.post('/assignments/:assignmentId/submit', requireAuth, assessmentCtrl.submitAssignment);
apiRouter.post('/assignments/submissions/:submissionId/grade', requireAuth, requirePermission('assignments:grade'), assessmentCtrl.gradeSubmission);
apiRouter.post('/assignments/submissions/:submissionId/request-revision', requireAuth, requirePermission('assignments:grade'), assessmentCtrl.requestSubmissionRevision);

// 5b. OBJECT STORAGE & BERKAS PENGUMPULAN
apiRouter.post('/storage/upload', requireAuth, storageCtrl.uploadMiddleware.single('file'), storageCtrl.handleFileUpload);
apiRouter.get('/storage/files/:fileKey(*)', storageCtrl.handleGetFile);

// 6. FORUM & DISCUSSIONS
apiRouter.get('/forums/threads', requireAuth, discussionCtrl.getThreads);
apiRouter.get('/forums/threads/:threadId', requireAuth, discussionCtrl.getThreadById);
apiRouter.post('/forums/threads', requireAuth, discussionCtrl.createThread);
apiRouter.post('/forums/threads/:threadId/posts', requireAuth, discussionCtrl.createPost);

// 7. PROGRESS ENGINE
apiRouter.get('/progress/classes/:classId', requireAuth, progressCtrl.getCourseProgress);
apiRouter.get('/progress/classes/:classId/students', requireAuth, requireRole('dosen', 'dosen_pa', 'kaprodi', 'pimpinan', 'administrator_sistem'), progressCtrl.getClassProgressList);

// 8. NOTIFICATIONS & CALENDAR
apiRouter.get('/notifications', requireAuth, notifCtrl.getNotifications);
apiRouter.patch('/notifications/:notificationId/read', requireAuth, notifCtrl.markAsRead);
apiRouter.post('/notifications/mark-all-read', requireAuth, notifCtrl.markAllAsRead);
apiRouter.get('/calendar/events', requireAuth, notifCtrl.getCalendarEvents);

// 9. REPORTING & AUDIT
apiRouter.get('/reports/institutional', requireAuth, requireRole('kaprodi', 'pimpinan', 'admin_akademik', 'administrator_sistem'), reportCtrl.getInstitutionalReport);
apiRouter.get('/reports/progress-csv', requireAuth, requireRole('dosen', 'kaprodi', 'pimpinan', 'admin_akademik', 'administrator_sistem'), reportCtrl.exportProgressCsv);
apiRouter.get('/audit-logs', requireAuth, requirePermission('audit:view'), reportCtrl.getAuditLogs);

// 10. ATTENDANCE & DYNAMIC QR (PRESENSI KULIAH)
apiRouter.get('/attendance/meetings/:meetingId/session', requireAuth, attendanceCtrl.getMeetingAttendanceSession);
apiRouter.post('/attendance/meetings/:meetingId/open', requireAuth, requirePermission('materials:manage'), attendanceCtrl.openAttendanceSession);
apiRouter.post('/attendance/meetings/:meetingId/refresh-qr', requireAuth, requirePermission('materials:manage'), attendanceCtrl.refreshQrToken);
apiRouter.post('/attendance/meetings/:meetingId/close', requireAuth, requirePermission('materials:manage'), attendanceCtrl.closeAttendanceSession);
apiRouter.post('/attendance/meetings/:meetingId/record', requireAuth, attendanceCtrl.recordStudentAttendance);
apiRouter.put('/attendance/meetings/:meetingId/students/:studentId', requireAuth, requirePermission('materials:manage'), attendanceCtrl.updateStudentAttendanceManual);
apiRouter.get('/attendance/classes/:classId/summary', requireAuth, attendanceCtrl.getClassAttendanceSummary);
apiRouter.get('/attendance/students/history', requireAuth, attendanceCtrl.getStudentAttendanceHistory);
