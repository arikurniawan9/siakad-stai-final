<?php

use App\Http\Controllers\Admin\AcademicPeriodController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\CourseCurriculumController;
use App\Http\Controllers\Admin\CurriculumController;
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
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\YudisiumController;
use App\Http\Controllers\Api\BsiVirtualAccountController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CaptchaController;
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
    return redirect()->route('login');
});

// Captcha Generator
Route::get('/captcha/generate', [CaptchaController::class, 'generate'])->name('captcha.generate');

// Authentication Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
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
// 2. AUTHENTICATED ROUTES
// =========================================================================
Route::middleware('auth')->group(function () {
    // Dashboard Utama
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Impersonation Engine (Mode Menyamar)
    Route::post('/impersonate/stop', [ImpersonationController::class, 'stopImpersonating'])->name('impersonate.stop');
    Route::post('/impersonate/{user}', [ImpersonationController::class, 'impersonate'])->whereNumber('user')->name('impersonate.start');

    // =====================================================================
    // 3. ADMIN & SUPERADMIN MODULES
    // =====================================================================
    Route::prefix('admin')->name('admin.')->group(function () {
        // Visual Audit Log Viewer & Activity Security Tracker
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit_logs.index');

        // Pusat Siaran Pengumuman & Broadcast Civitas
        Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
        Route::post('/announcements/{id}/toggle-pin', [AnnouncementController::class, 'togglePin'])->name('announcements.toggle_pin');
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

        // Skrining Yudisium & Kelulusan Mahasiswa
        Route::get('/yudisium', [YudisiumController::class, 'index'])->name('yudisium.index');
        Route::post('/yudisium/periods', [YudisiumController::class, 'storePeriod'])->name('yudisium.periods.store');
        Route::put('/yudisium/applicants/{id}/status', [YudisiumController::class, 'updateStatus'])->name('yudisium.applicants.status.update');

        // Data Mahasiswa (Berdasarkan Angkatan / Tahun Akademik)
        Route::get('/students', [StudentAdminController::class, 'index'])->name('students.index');
        Route::post('/students', [StudentAdminController::class, 'store'])->name('students.store');
        Route::put('/students/{id}', [StudentAdminController::class, 'update'])->name('students.update');
        Route::post('/students/import-batch', [StudentAdminController::class, 'importBatch'])->name('students.import_batch');

        // Data Dosen & Tenaga Pengajar
        Route::get('/lecturers', [LecturerAdminController::class, 'index'])->name('lecturers.index');
        Route::post('/lecturers', [LecturerAdminController::class, 'store'])->name('lecturers.store');
        Route::put('/lecturers/{id}', [LecturerAdminController::class, 'update'])->name('lecturers.update');
        Route::post('/lecturers/import-batch', [LecturerAdminController::class, 'importBatch'])->name('lecturers.import_batch');

        // Master Pengguna & Impersonation Portal (Superadmin Full Directory)
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset_password');
        Route::post('/users/{id}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle_status');
        Route::post('/users/import-batch', [UserController::class, 'importBatch'])->name('users.import_batch');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');

        // Monitoring & Approval KRS Mahasiswa (Bulk Approval)
        Route::get('/krs-approval', [KrsApprovalController::class, 'index'])->name('krs_approval.index');
        Route::post('/krs-approval/{id}/approve', [KrsApprovalController::class, 'approve'])->name('krs_approval.approve');
        Route::post('/krs-approval/{id}/reject', [KrsApprovalController::class, 'reject'])->name('krs_approval.reject');
        Route::post('/krs-approval/bulk-approve', [KrsApprovalController::class, 'bulkApprove'])->name('krs_approval.bulk_approve');

        // Gradebook, Grade Lock & Cetak Lembar Nilai DPNA
        Route::get('/grades', [GradeAdminController::class, 'index'])->name('grades.index');
        Route::get('/grades/{id}', [GradeAdminController::class, 'show'])->name('grades.show');
        Route::post('/grades/{id}/update', [GradeAdminController::class, 'updateGrades'])->name('grades.update');
        Route::post('/grades/{id}/toggle-lock', [GradeAdminController::class, 'toggleLock'])->name('grades.toggle_lock');

        // Analitik Mutu Dosen & Evaluasi EDOM 4 Kompetensi
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
        Route::post('/facilities/buildings', [FacilityController::class, 'storeBuilding'])->name('facilities.buildings.store');
        Route::post('/facilities/rooms', [FacilityController::class, 'storeRoom'])->name('facilities.rooms.store');

        // Master Akademik: Tahun & Periode
        Route::get('/academic-periods', [AcademicPeriodController::class, 'index'])->name('academic_periods.index');
        Route::post('/academic-periods/years', [AcademicPeriodController::class, 'storeYear'])->name('academic_periods.years.store');
        Route::post('/academic-periods/periods', [AcademicPeriodController::class, 'storePeriod'])->name('academic_periods.periods.store');
        Route::post('/academic-periods/{id}/activate', [AcademicPeriodController::class, 'activate'])->name('academic_periods.activate');

        // 1. Data Kurikulum
        Route::get('/curricula', [CurriculumController::class, 'index'])->name('curricula.index');
        Route::post('/curricula', [CurriculumController::class, 'store'])->name('curricula.store');
        Route::delete('/curricula/{id}', [CurriculumController::class, 'destroy'])->name('curricula.destroy');

        // 2. Data Matakuliah
        Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
        Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
        Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->name('courses.destroy');

        // 3. Data Matakuliah - Kurikulum
        Route::get('/course-curriculum', [CourseCurriculumController::class, 'index'])->name('course_curriculum.index');
        Route::post('/course-curriculum', [CourseCurriculumController::class, 'store'])->name('course_curriculum.store');
        Route::delete('/course-curriculum/{id}', [CourseCurriculumController::class, 'destroy'])->name('course_curriculum.destroy');

        // Penjadwalan Kuliah Lanjutan & Anti-Clash Matrix
        Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
        Route::post('/schedules', [ScheduleController::class, 'store'])->name('schedules.store');
        Route::post('/schedules/check-conflict', [ScheduleController::class, 'checkConflict'])->name('schedules.check_conflict');
        Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');

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

        // Pengaturan & Pemeliharaan
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
        Route::post('/settings/maintenance', [SettingController::class, 'toggleMaintenance'])->name('settings.maintenance');
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
