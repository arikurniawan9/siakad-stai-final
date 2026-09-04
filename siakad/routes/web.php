<?php

use App\Http\Controllers\Admin\AcademicPeriodController;
use App\Http\Controllers\Admin\AcademicSettingController;
use App\Http\Controllers\Admin\CampusOfficialController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\BsiGatewayController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\CourseCurriculumController;
use App\Http\Controllers\Admin\CurriculumController;
use App\Http\Controllers\Admin\DatabaseController;
use App\Http\Controllers\Admin\EdomAdminController;
use App\Http\Controllers\Admin\FacilityController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\GradeAdminController;
use App\Http\Controllers\Admin\KrsApprovalController;
use App\Http\Controllers\Admin\LecturerAdminController;
use App\Http\Controllers\Admin\LetterController;
use App\Http\Controllers\Admin\LmsSyncController;
use App\Http\Controllers\Admin\PddiktiController;
use App\Http\Controllers\Admin\PmbAdminController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StudentAdminController;
use App\Http\Controllers\Admin\StudentCurriculumController;
use App\Http\Controllers\Admin\AcademicAdvisingController;
use App\Http\Controllers\Admin\StudentPortalController;
use App\Http\Controllers\Admin\KhsAdminController;
use App\Http\Controllers\Admin\TranscriptAdminController;
use App\Http\Controllers\Admin\GraduationAdminController;
use App\Http\Controllers\Admin\StudentActivityController;
use App\Http\Controllers\Admin\StudentStatusController;
use App\Http\Controllers\Admin\StudyProgramController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\YudisiumController;
use App\Http\Controllers\Api\BsiVirtualAccountController;
use App\Http\Controllers\Api\OAuthController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CaptchaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImpersonationController;
use App\Http\Controllers\PmbController;
use App\Http\Controllers\PublicVerificationController;
use App\Http\Controllers\Student\KhsController;
use App\Http\Controllers\Student\KrsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// =========================================================================
// 1. PUBLIC ROUTES, PMB & DOCUMENT QR VERIFICATION
// =========================================================================
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

// Captcha Generator
Route::get('/captcha/generate', [CaptchaController::class, 'generate'])->name('captcha.generate');

// Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Public Document QR Verification Portal
Route::get('/verify/{hash}', [PublicVerificationController::class, 'verify'])->name('document.verify');

// PMB Online Public Portal
Route::get('/pmb', [PmbController::class, 'showRegistrationForm'])->name('pmb.register');
Route::post('/pmb/register', [PmbController::class, 'register']);
Route::get('/pmb/status', [PmbController::class, 'checkStatus'])->name('pmb.status');

// BSI Host-to-Host VA Open API & Sandbox Routes
Route::prefix('api/v1/bsi/va')->group(function () {
    Route::post('/inquiry', [BsiVirtualAccountController::class, 'inquiry']);
    Route::post('/payment', [BsiVirtualAccountController::class, 'paymentCallback']);
    Route::post('/simulate-payment', [BsiVirtualAccountController::class, 'simulatePayment']);
});


// LMS Inbound Webhook API
Route::post('/api/v1/lms/webhook', [LmsSyncController::class, 'receiveLmsWebhook']);

// =========================================================================
// SINGLE SIGN-ON (SSO) OAUTH2 / OIDC PROVIDER (SIAKAD ⇄ SALAM LMS)
// =========================================================================
Route::get('/oauth/authorize', [OAuthController::class, 'authorizeClient'])->name('oauth.authorize');
Route::get('/sso/lms', [OAuthController::class, 'launchLms'])->name('sso.lms');

Route::prefix('api/v1/oauth')->group(function () {
    Route::post('/token', [OAuthController::class, 'issueToken'])->name('oauth.token');
    Route::get('/userinfo', [OAuthController::class, 'userInfo'])->name('oauth.userinfo');
});

// =========================================================================
// 2. AUTHENTICATED ROUTES
// =========================================================================
Route::middleware('auth')->group(function () {
    // Dashboard Utama
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Impersonation Engine (Mode Menyamar)
    Route::post('/impersonate/stop', [ImpersonationController::class, 'stopImpersonating'])->name('impersonate.stop');
    Route::post('/impersonate/{user}', [ImpersonationController::class, 'impersonate'])->whereNumber('user')->name('impersonate.start');

    // =====================================================================
    // 3. ADMIN & SUPERADMIN MODULES
    // =====================================================================
    Route::prefix('admin')->name('admin.')->group(function () {
        // Visual Audit Log Viewer & Activity Security Tracker
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit_logs.index');
        Route::get('/audit-logs/export-csv', [AuditLogController::class, 'exportCsv'])->name('audit_logs.export_csv');
        Route::post('/audit-logs/prune', [AuditLogController::class, 'pruneLogs'])->name('audit_logs.prune');

        // Pusat Siaran Pengumuman & Broadcast Civitas
        Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
        Route::post('/announcements/{id}/toggle-pin', [AnnouncementController::class, 'togglePin'])->name('announcements.toggle_pin');
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

        // Skrining Yudisium & Kelulusan Mahasiswa
        Route::get('/yudisium', [YudisiumController::class, 'index'])->name('yudisium.index');
        Route::post('/yudisium/periods', [YudisiumController::class, 'storePeriod'])->name('yudisium.periods.store');
        Route::put('/yudisium/applicants/{id}/status', [YudisiumController::class, 'updateStatus'])->name('yudisium.applicants.status.update');

        // =====================================================================
        // MODUL KEMAHASISWAAN (Sesuai Standar SIAKAD & Referensi)
        // =====================================================================
        // 1. Data Mahasiswa (Berdasarkan Angkatan / Tahun Akademik)
        Route::get('/students', [StudentAdminController::class, 'index'])->name('students.index');
        Route::get('/students/export-excel', [StudentAdminController::class, 'exportExcel'])->name('students.export_excel');
        Route::get('/students/template-excel', [StudentAdminController::class, 'templateExcel'])->name('students.template_excel');
        Route::get('/students/print-pdf', [StudentAdminController::class, 'printPdf'])->name('students.print_pdf');
        Route::post('/students/check-import', [StudentAdminController::class, 'checkImport'])->name('students.check_import');
        Route::post('/students/process-import', [StudentAdminController::class, 'processImport'])->name('students.process_import');
        Route::post('/students', [StudentAdminController::class, 'store'])->name('students.store');
        Route::put('/students/{id}', [StudentAdminController::class, 'update'])->name('students.update');
        Route::post('/students/bulk-delete', [StudentAdminController::class, 'bulkDestroy'])->name('students.bulk_delete');
        Route::delete('/students/{id}', [StudentAdminController::class, 'destroy'])->name('students.destroy');

        // 2. Kurikulum Mahasiswa (Penetapan Kurikulum per Mahasiswa / Angkatan)
        Route::get('/student-curricula', [StudentCurriculumController::class, 'index'])->name('student_curricula.index');
        Route::post('/student-curricula/assign', [StudentCurriculumController::class, 'assignCurriculum'])->name('student_curricula.assign');

        // 3. Bimbingan Akademik (Plotting Dosen PA & Catatan Sesi Bimbingan)
        Route::get('/academic-advising', [AcademicAdvisingController::class, 'index'])->name('academic_advising.index');
        Route::post('/academic-advising/assign', [AcademicAdvisingController::class, 'assignAdvisor'])->name('academic_advising.assign');
        Route::post('/academic-advising/notes', [AcademicAdvisingController::class, 'storeNote'])->name('academic_advising.notes.store');

        // 4. User Portal Mahasiswa (Manajemen Kredensial & Reset Password)
        Route::get('/student-portal', [StudentPortalController::class, 'index'])->name('student_portal.index');
        Route::post('/student-portal/reset-password', [StudentPortalController::class, 'resetPassword'])->name('student_portal.reset_password');

        // Data Dosen & Tenaga Pengajar
        Route::get('/lecturers', [LecturerAdminController::class, 'index'])->name('lecturers.index');
        Route::get('/lecturers/export/excel', [LecturerAdminController::class, 'exportExcel'])->name('lecturers.export_excel');
        Route::get('/lecturers/export/pdf', [LecturerAdminController::class, 'exportPdf'])->name('lecturers.export_pdf');
        Route::get('/lecturers/template-xlsx', [LecturerAdminController::class, 'downloadTemplate'])->name('lecturers.template_xlsx');
        Route::get('/lecturers/template-csv', [LecturerAdminController::class, 'downloadTemplate'])->name('lecturers.template_csv');
        Route::post('/lecturers', [LecturerAdminController::class, 'store'])->name('lecturers.store');
        Route::put('/lecturers/{id}', [LecturerAdminController::class, 'update'])->name('lecturers.update');
        Route::delete('/lecturers/{id}', [LecturerAdminController::class, 'destroy'])->name('lecturers.destroy');
        Route::post('/lecturers/import-batch', [LecturerAdminController::class, 'importBatch'])->name('lecturers.import_batch');

        // Master Pengguna & Impersonation Portal (Superadmin Full Directory)
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset_password');
        Route::post('/users/{id}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle_status');
        Route::post('/users/import-batch', [UserController::class, 'importBatch'])->name('users.import_batch');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');

        // 1. Rencana Studi (KRS)
        Route::get('/krs-approval', [KrsApprovalController::class, 'index'])->name('krs_approval.index');
        Route::post('/krs-approval/{id}/approve', [KrsApprovalController::class, 'approve'])->name('krs_approval.approve');
        Route::post('/krs-approval/{id}/reject', [KrsApprovalController::class, 'reject'])->name('krs_approval.reject');
        Route::post('/krs-approval/bulk-approve', [KrsApprovalController::class, 'bulkApprove'])->name('krs_approval.bulk_approve');
        Route::get('/krs-approval/{id}/print-pdf', [KrsApprovalController::class, 'printPdf'])->name('krs_approval.print_pdf');
        Route::get('/krs-approval/{student_id}/courses', [KrsApprovalController::class, 'getStudentKrsDetails'])->name('krs_approval.courses');
        Route::post('/krs-approval/{student_id}/add-course', [KrsApprovalController::class, 'addCourseToStudent'])->name('krs_approval.add_course');
        Route::post('/krs-approval/{student_id}/batch-add-selected', [KrsApprovalController::class, 'batchAddSelected'])->name('krs_approval.batch_add_selected');
        Route::post('/krs-approval/{student_id}/remove-course', [KrsApprovalController::class, 'removeCourseFromStudent'])->name('krs_approval.remove_course');
        Route::post('/krs-approval/{student_id}/batch-add-package', [KrsApprovalController::class, 'batchAddPackage'])->name('krs_approval.batch_add_package');
        Route::post('/krs-approval/{student_id}/update-status', [KrsApprovalController::class, 'updateKrsStatus'])->name('krs_approval.update_status');

        // 2. Penilaian Mahasiswa (Persentase, Per Kelas DPNA, Per Mahasiswa)
        Route::get('/grades', [GradeAdminController::class, 'index'])->name('grades.index');
        Route::get('/grades/{id}', [GradeAdminController::class, 'show'])->name('grades.show');
        Route::post('/grades/{id}/update', [GradeAdminController::class, 'updateGrades'])->name('grades.update');
        Route::post('/grades/{id}/toggle-lock', [GradeAdminController::class, 'toggleLock'])->name('grades.toggle_lock');

        // 3. Hasil Studi (KHS)
        Route::get('/khs', [KhsAdminController::class, 'index'])->name('khs.index');
        Route::get('/khs/{studentId}/{periodId}/print-pdf', [KhsAdminController::class, 'printPdf'])->name('khs.print_pdf');

        // 4. Transkrip Nilai Akademik Kumulatif
        Route::get('/transcripts', [TranscriptAdminController::class, 'index'])->name('transcripts.index');
        Route::get('/transcripts/{studentId}/print-pdf', [TranscriptAdminController::class, 'printPdf'])->name('transcripts.print_pdf');

        // 5. Kelulusan (Tugas Akhir, Wisuda, Surat Keterangan Lulus)
        Route::get('/graduations', [GraduationAdminController::class, 'index'])->name('graduations.index');
        Route::post('/graduations/thesis', [GraduationAdminController::class, 'storeThesis'])->name('graduations.thesis.store');
        Route::get('/graduations/skl/{id}/print-pdf', [GraduationAdminController::class, 'printSkl'])->name('graduations.skl.print_pdf');

        // 6. Aktivitas Mahasiswa (MBKM, Prestasi, Organisasi)
        Route::get('/activities', [StudentActivityController::class, 'index'])->name('activities.index');
        Route::post('/activities', [StudentActivityController::class, 'store'])->name('activities.store');
        Route::delete('/activities/{id}', [StudentActivityController::class, 'destroy'])->name('activities.destroy');

        // 7. Status Kuliah Mahasiswa & Pengajuan Cuti
        Route::get('/student-statuses', [StudentStatusController::class, 'index'])->name('student_statuses.index');
        Route::post('/student-statuses/update', [StudentStatusController::class, 'updateStatus'])->name('student_statuses.update');

        // 8. Analitik Mutu Dosen & Data Kuisioner (EDOM)
        Route::get('/edom', [EdomAdminController::class, 'index'])->name('edom.index');
        Route::get('/edom/{id}', [EdomAdminController::class, 'show'])->name('edom.show');

        // Generator Surat Keterangan Aktif Kuliah Ber-QR Code
        Route::get('/letters', [LetterController::class, 'index'])->name('letters.index');
        Route::post('/letters', [LetterController::class, 'store'])->name('letters.store');
        Route::get('/letters/{id}', [LetterController::class, 'show'])->name('letters.show');

        // Penerimaan Mahasiswa Baru (PMB) Admin Portal
        Route::get('/pmb', [PmbAdminController::class, 'index'])->name('pmb.index');
        Route::post('/pmb/periods', [PmbAdminController::class, 'storePeriod'])->name('pmb.periods.store');
        Route::put('/pmb/applicants/{id}/status', [PmbAdminController::class, 'updateStatus'])->name('pmb.applicants.status.update');
        Route::post('/pmb/applicants/{id}/enroll', [PmbAdminController::class, 'enrollStudent'])->name('pmb.applicants.enroll');

        // Master Infrastruktur: Gedung & Ruang
        Route::get('/facilities', [FacilityController::class, 'index'])->name('facilities.index');
        Route::get('/facilities/export-excel', [FacilityController::class, 'exportExcel'])->name('facilities.export_excel');
        Route::get('/facilities/print-pdf', [FacilityController::class, 'printPdf'])->name('facilities.print_pdf');
        Route::post('/facilities/buildings', [FacilityController::class, 'storeBuilding'])->name('facilities.buildings.store');
        Route::put('/facilities/buildings/{id}', [FacilityController::class, 'updateBuilding'])->name('facilities.buildings.update');
        Route::delete('/facilities/buildings/{id}', [FacilityController::class, 'destroyBuilding'])->name('facilities.buildings.destroy');
        Route::post('/facilities/rooms', [FacilityController::class, 'storeRoom'])->name('facilities.rooms.store');
        Route::put('/facilities/rooms/{id}', [FacilityController::class, 'updateRoom'])->name('facilities.rooms.update');
        Route::delete('/facilities/rooms/{id}', [FacilityController::class, 'destroyRoom'])->name('facilities.rooms.destroy');
        Route::patch('/facilities/rooms/{id}/toggle-status', [FacilityController::class, 'toggleRoomStatus'])->name('facilities.rooms.toggle_status');

        // Master Akademik: Tahun & Periode
        Route::get('/academic-periods', [AcademicPeriodController::class, 'index'])->name('academic_periods.index');
        Route::post('/academic-periods/years', [AcademicPeriodController::class, 'storeYear'])->name('academic_periods.years.store');
        Route::post('/academic-periods/periods', [AcademicPeriodController::class, 'storePeriod'])->name('academic_periods.periods.store');
        Route::post('/academic-periods/{id}/activate', [AcademicPeriodController::class, 'activate'])->name('academic_periods.activate');

        // Master Program Studi & Fakultas
        Route::get('/study-programs', [StudyProgramController::class, 'index'])->name('study_programs.index');
        Route::post('/study-programs', [StudyProgramController::class, 'store'])->name('study_programs.store');
        Route::put('/study-programs/{id}', [StudyProgramController::class, 'update'])->name('study_programs.update');
        Route::delete('/study-programs/{id}', [StudyProgramController::class, 'destroy'])->name('study_programs.destroy');
        Route::post('/faculties', [StudyProgramController::class, 'storeFaculty'])->name('faculties.store');
        Route::put('/faculties/{id}', [StudyProgramController::class, 'updateFaculty'])->name('faculties.update');
        Route::delete('/faculties/{id}', [StudyProgramController::class, 'destroyFaculty'])->name('faculties.destroy');

        // 1. Data Kurikulum
        Route::get('/curricula', [CurriculumController::class, 'index'])->name('curricula.index');
        Route::post('/curricula', [CurriculumController::class, 'store'])->name('curricula.store');
        Route::put('/curricula/{id}', [CurriculumController::class, 'update'])->name('curricula.update');
        Route::delete('/curricula/{id}', [CurriculumController::class, 'destroy'])->name('curricula.destroy');

        // 2. Data Matakuliah
        Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
        Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
        Route::put('/courses/{id}', [CourseController::class, 'update'])->name('courses.update');
        Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->name('courses.destroy');

        // 3. Data Matakuliah - Kurikulum
        Route::get('/course-curriculum', [CourseCurriculumController::class, 'index'])->name('course_curriculum.index');
        Route::post('/course-curriculum', [CourseCurriculumController::class, 'store'])->name('course_curriculum.store');
        Route::put('/course-curriculum/{id}', [CourseCurriculumController::class, 'update'])->name('course_curriculum.update');
        Route::delete('/course-curriculum/{id}', [CourseCurriculumController::class, 'destroy'])->name('course_curriculum.destroy');

        // Penjadwalan Kuliah Lanjutan & Anti-Clash Matrix
        Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
        Route::post('/schedules', [ScheduleController::class, 'store'])->name('schedules.store');
        Route::post('/schedules/quick', [ScheduleController::class, 'storeQuick'])->name('schedules.quick');
        Route::put('/schedules/{id}', [ScheduleController::class, 'update'])->name('schedules.update');
        Route::post('/schedules/check-conflict', [ScheduleController::class, 'checkConflict'])->name('schedules.check_conflict');
        Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');

        // Jadwal Ujian (UTS / UAS)
        Route::post('/schedules/exams', [ScheduleController::class, 'storeExam'])->name('schedules.exams.store');
        Route::delete('/schedules/exams/{id}', [ScheduleController::class, 'destroyExam'])->name('schedules.exams.destroy');

        // Presensi Kelas & Mahasiswa (Tab 3)
        Route::get('/schedules/attendance/{classId}', [ScheduleController::class, 'getAttendanceData'])->name('schedules.attendance.get');
        Route::post('/schedules/attendance', [ScheduleController::class, 'storeAttendance'])->name('schedules.attendance.store');
        Route::post('/schedules/attendance/matrix', [ScheduleController::class, 'storeAttendanceMatrix'])->name('schedules.attendance.matrix');

        // Neo Feeder PDDIKTI Sync Connector
        Route::get('/pddikti', [PddiktiController::class, 'index'])->name('pddikti.index');
        Route::post('/pddikti/validate-dryrun', [PddiktiController::class, 'validateDryRun'])->name('pddikti.validate_dryrun');
        Route::post('/pddikti/sync-simulate', [PddiktiController::class, 'syncSimulate'])->name('pddikti.sync_simulate');
        Route::get('/pddikti/export', [PddiktiController::class, 'exportJson'])->name('pddikti.export');
        Route::post('/pddikti/config', [PddiktiController::class, 'updateConfig'])->name('pddikti.config.update');

        // Aliases to avoid 404
        Route::get('/positions', [CurriculumController::class, 'index'])->name('positions.index');
        Route::get('/classes', [ScheduleController::class, 'index'])->name('classes.index');

        // Keuangan, Setup Tarif Biaya & Mass VA BSI Billing
        Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
        Route::post('/finance/fee-types', [FinanceController::class, 'storeFeeType'])->name('finance.fee_types.store');
        Route::post('/finance/tariffs', [FinanceController::class, 'storeTariff'])->name('finance.tariffs.store');
        Route::delete('/finance/tariffs/{id}', [FinanceController::class, 'destroyTariff'])->name('finance.tariffs.destroy');
        Route::post('/finance/mass-generate', [FinanceController::class, 'generateMassInvoices'])->name('finance.mass_generate');

        // Gateway Sinkronisasi SALAM LMS
        Route::get('/lms-sync', [LmsSyncController::class, 'index'])->name('lms_sync.index');
        Route::get('/lms-sync/test-connection', [LmsSyncController::class, 'testConnection'])->name('lms_sync.test_connection');
        Route::post('/lms-sync/push', [LmsSyncController::class, 'pushMasterToLms'])->name('lms_sync.push');
        Route::post('/lms-sync/pull-grades', [LmsSyncController::class, 'pullGradesFromLms'])->name('lms_sync.pull_grades');

        // Gateway BSI Smart Billing H2H Direct (Khusus Superadmin)
        Route::get('/bsi-gateway', [BsiGatewayController::class, 'index'])->name('bsi_gateway.index');
        Route::post('/bsi-gateway/config', [BsiGatewayController::class, 'updateConfig'])->name('bsi_gateway.config.update');
        Route::post('/bsi-gateway/test-connection', [BsiGatewayController::class, 'testConnection'])->name('bsi_gateway.test_connection');
        Route::post('/bsi-gateway/simulate-inquiry', [BsiGatewayController::class, 'simulateInquiry'])->name('bsi_gateway.simulate_inquiry');
        Route::post('/bsi-gateway/simulate-payment', [BsiGatewayController::class, 'simulatePayment'])->name('bsi_gateway.simulate_payment');
        Route::get('/bsi-gateway/export-reconciliation', [BsiGatewayController::class, 'exportReconciliation'])->name('bsi_gateway.export_reconciliation');

        // Manajemen Database, Backup, Restore & Seeder (Khusus Superadmin)
        Route::get('/database', [DatabaseController::class, 'index'])->name('database.index');
        Route::post('/database/backup', [DatabaseController::class, 'createBackup'])->name('database.backup.create');
        Route::get('/database/download/{filename}', [DatabaseController::class, 'downloadBackup'])->name('database.backup.download');
        Route::delete('/database/backup/{filename}', [DatabaseController::class, 'deleteBackup'])->name('database.backup.delete');
        Route::post('/database/restore', [DatabaseController::class, 'restoreBackup'])->name('database.restore');
        Route::post('/database/seeder', [DatabaseController::class, 'runSeeder'])->name('database.seeder');

        // 1. Kebijakan Akademik (Bobot Nilai, SKS Maksimum, Predikat Kelulusan, Gelar Kelulusan)
        Route::get('/academic-settings', [AcademicSettingController::class, 'index'])->name('academic_settings.index');
        Route::get('/setting/{section?}', function () {
            return redirect()->route('academic_settings.index');
        })->name('academic_settings.section');

        Route::post('/academic-settings/grading', [AcademicSettingController::class, 'updateGrading'])->name('academic_settings.update_grading');
        Route::post('/academic-settings/scales', [AcademicSettingController::class, 'storeScale'])->name('academic_settings.store_scale');
        Route::post('/academic-settings/scales/{id}', [AcademicSettingController::class, 'updateScale'])->name('academic_settings.update_scale');
        Route::delete('/academic-settings/scales/{id}', [AcademicSettingController::class, 'destroyScale'])->name('academic_settings.destroy_scale');
        Route::post('/academic-settings/copy-standard-scales', [AcademicSettingController::class, 'copyStandardScales'])->name('academic_settings.copy_standard_scales');
        Route::post('/academic-settings/sks-limits', [AcademicSettingController::class, 'updateSksLimits'])->name('academic_settings.update_sks_limits');
        Route::post('/academic-settings/sks-limit', [AcademicSettingController::class, 'storeSksLimit'])->name('academic_settings.store_sks_limit');
        Route::post('/academic-settings/sks-limit/{id}', [AcademicSettingController::class, 'updateSksLimit'])->name('academic_settings.update_sks_limit');
        Route::delete('/academic-settings/sks-limit/{id}', [AcademicSettingController::class, 'destroySksLimit'])->name('academic_settings.destroy_sks_limit');
        Route::post('/academic-settings/copy-standard-sks-limits', [AcademicSettingController::class, 'copyStandardSksLimits'])->name('academic_settings.copy_standard_sks_limits');
        Route::post('/academic-settings/predicates', [AcademicSettingController::class, 'updatePredicates'])->name('academic_settings.update_predicates');
        Route::post('/academic-settings/degrees', [AcademicSettingController::class, 'updateDegrees'])->name('academic_settings.update_degrees');

        // Aliases for backwards compatibility
        Route::post('/setting/grading', [AcademicSettingController::class, 'updateGrading']);
        Route::post('/setting/scales', [AcademicSettingController::class, 'storeScale']);
        Route::post('/setting/scales/{id}', [AcademicSettingController::class, 'updateScale']);
        Route::delete('/setting/scales/{id}', [AcademicSettingController::class, 'destroyScale']);
        Route::post('/setting/copy-standard-scales', [AcademicSettingController::class, 'copyStandardScales']);
        Route::post('/setting/sks-limits', [AcademicSettingController::class, 'updateSksLimits']);
        Route::post('/setting/sks-limit', [AcademicSettingController::class, 'storeSksLimit']);
        Route::post('/setting/sks-limit/{id}', [AcademicSettingController::class, 'updateSksLimit']);
        Route::delete('/setting/sks-limit/{id}', [AcademicSettingController::class, 'destroySksLimit']);
        Route::post('/setting/copy-standard-sks-limits', [AcademicSettingController::class, 'copyStandardSksLimits']);
        Route::post('/setting/predicates', [AcademicSettingController::class, 'updatePredicates']);
        Route::post('/setting/degrees', [AcademicSettingController::class, 'updateDegrees']);

        // 2. Data Pejabat Kampus & Penugasan Pengesah
        Route::get('/officials', [CampusOfficialController::class, 'index'])->name('officials.index');
        Route::post('/officials', [CampusOfficialController::class, 'storeOfficial'])->name('officials.store');
        Route::post('/officials/{id}', [CampusOfficialController::class, 'updateOfficial'])->name('officials.update');
        Route::delete('/officials/{id}', [CampusOfficialController::class, 'destroyOfficial'])->name('officials.destroy');
        Route::post('/officials/signatories', [CampusOfficialController::class, 'storeSignatory'])->name('officials.signatories.store');
        Route::post('/officials/signatories/{id}', [CampusOfficialController::class, 'updateSignatory'])->name('officials.signatories.update');
        Route::delete('/officials/signatories/{id}', [CampusOfficialController::class, 'destroySignatory'])->name('officials.signatories.destroy');

        // Aliases for pejabat routes
        Route::post('/setting/officials', [CampusOfficialController::class, 'storeOfficial']);
        Route::post('/setting/officials/{id}', [CampusOfficialController::class, 'updateOfficial']);
        Route::delete('/setting/officials/{id}', [CampusOfficialController::class, 'destroyOfficial']);
        Route::post('/setting/signatories/{id}', [CampusOfficialController::class, 'updateSignatory']);
        Route::post('/setting/signatories', [CampusOfficialController::class, 'storeSignatory']);
        Route::delete('/setting/signatories/{id}', [CampusOfficialController::class, 'destroySignatory']);

        // Pengaturan & Pemeliharaan
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
        Route::post('/settings/maintenance', [SettingController::class, 'toggleMaintenance'])->name('settings.maintenance');
        Route::post('/settings/clear-cache', [SettingController::class, 'clearCache'])->name('settings.clear_cache');
        Route::post('/settings/retry-jobs', [SettingController::class, 'retryJobs'])->name('settings.retry_jobs');
        Route::post('/settings/flush-jobs', [SettingController::class, 'flushJobs'])->name('settings.flush_jobs');
    });

    // =====================================================================
    // 4. STUDENT (MAHASISWA) MODULES
    // =====================================================================
    Route::prefix('student')->name('student.')->group(function () {
        // KRS Online
        Route::get('/krs', [KrsController::class, 'index'])->name('krs.index');
        Route::post('/krs/submit', [KrsController::class, 'submit'])->name('krs.submit');

        // KHS & Transkrip
        Route::get('/khs', [KhsController::class, 'index'])->name('khs.index');

        // Tagihan Mahasiswa (Redirect ke Dashboard)
        Route::get('/bills', function () {
            return redirect()->route('dashboard');
        })->name('bills.index');
    });
});
