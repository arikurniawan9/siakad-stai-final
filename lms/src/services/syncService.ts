import { 
  AcademicClass, 
  SyncRunLog, 
  SyncItemLog 
} from '../types/academic';
import { academicService } from './academicService';
import { auditService } from './auditService';

export interface RawSiakadPayload {
  academicPeriod: {
    externalId: string;
    code: string;
    name: string;
    year: string;
    semesterType: 'GANJIL' | 'GENAP' | 'PENDEK';
    startDate: string;
    endDate: string;
  };
  programs: {
    externalId: string;
    code: string;
    name: string;
    degree: 'S1' | 'S2' | 'D3';
    faculty: string;
  }[];
  courses: {
    externalId: string;
    code: string;
    name: string;
    credits: number;
    semesterLevel: number;
    studyProgramCode: string;
    description?: string;
  }[];
  classes: {
    externalId: string;
    code: string;
    name: string;
    courseExternalId: string;
    lecturerId: string;
    lecturerName: string;
    lecturerNidn: string;
    studentCount: number;
    status?: 'AKTIF' | 'NONAKTIF' | 'DIARSIPKAN';
    schedules: {
      dayOfWeek: 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU';
      startTime: string;
      endTime: string;
      room: string;
      isOnline: boolean;
    }[];
  }[];
  members?: {
    externalId: string;
    classExternalId: string;
    studentId: string;
    studentNim: string;
    studentName: string;
    status: 'TERDAFTAR' | 'NONAKTIF' | 'LULUS';
  }[];
}

const SYNC_LOGS_KEY = 'salam_sync_run_logs';

class SyncService {
  public getSyncRunLogs(): SyncRunLog[] {
    try {
      const data = localStorage.getItem(SYNC_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * EKSEKUSI SINKRONISASI IDEMPOTENT
   * Dijalankan berulang kali dengan payload yang sama tidak akan menggandakan data.
   */
  public async executeSync(
    payload: RawSiakadPayload,
    actorId = 'usr-adm-01',
    actorName = 'Admin Akademik'
  ): Promise<SyncRunLog> {
    const startedAt = new Date().toISOString();
    const itemLogs: SyncItemLog[] = [];

    const stats = {
      periodsProcessed: 0,
      programsProcessed: 0,
      coursesProcessed: 0,
      classesCreated: 0,
      classesUpdated: 0,
      classesDeactivated: 0,
      studentsEnrolled: 0,
      totalSkipped: 0,
      totalFailed: 0,
    };

    // Ambil data eksisting
    const periods = academicService.getPeriods();
    const programs = academicService.getStudyPrograms();
    const courses = academicService.getCourses();
    const classes = academicService.getClasses();
    const members = academicService.getClassMembers('');

    // 1. Sinkronisasi Periode Akademik
    let currentPeriod = periods.find((p) => p.externalId === payload.academicPeriod.externalId);
    if (!currentPeriod) {
      currentPeriod = {
        id: `prd-${payload.academicPeriod.code}`,
        externalId: payload.academicPeriod.externalId,
        code: payload.academicPeriod.code,
        name: payload.academicPeriod.name,
        year: payload.academicPeriod.year,
        semesterType: payload.academicPeriod.semesterType,
        startDate: payload.academicPeriod.startDate,
        endDate: payload.academicPeriod.endDate,
        isActive: true,
        sourceSystem: 'SIAKAD_STAI',
        createdAt: startedAt,
        updatedAt: startedAt,
      };
      periods.push(currentPeriod);
      itemLogs.push({
        id: `log-prd-${Date.now()}`,
        entityType: 'PERIODE',
        externalId: payload.academicPeriod.externalId,
        identifier: payload.academicPeriod.name,
        action: 'DIBUAT',
        message: 'Periode akademik baru berhasil didaftarkan.',
        status: 'SUKSES',
      });
    } else {
      currentPeriod.name = payload.academicPeriod.name;
      currentPeriod.updatedAt = startedAt;
      itemLogs.push({
        id: `log-prd-${Date.now()}`,
        entityType: 'PERIODE',
        externalId: payload.academicPeriod.externalId,
        identifier: payload.academicPeriod.name,
        action: 'DIPERBARUI',
        message: 'Periode akademik diperbarui secara idempotent.',
        status: 'SUKSES',
      });
    }
    stats.periodsProcessed = 1;

    // 2. Sinkronisasi Program Studi
    for (const progData of payload.programs) {
      const existingProg = programs.find((p) => p.externalId === progData.externalId || p.code === progData.code);
      if (!existingProg) {
        programs.push({
          id: `prodi-${progData.code.toLowerCase()}`,
          externalId: progData.externalId,
          code: progData.code,
          name: progData.name,
          degree: progData.degree,
          faculty: progData.faculty,
          isActive: true,
          sourceSystem: 'SIAKAD_STAI',
        });
        itemLogs.push({
          id: `log-prg-${progData.code}`,
          entityType: 'PRODI',
          externalId: progData.externalId,
          identifier: `${progData.code} - ${progData.name}`,
          action: 'DIBUAT',
          message: 'Program studi baru berhasil disinkronkan.',
          status: 'SUKSES',
        });
      } else {
        existingProg.name = progData.name;
        existingProg.faculty = progData.faculty;
        itemLogs.push({
          id: `log-prg-${progData.code}`,
          entityType: 'PRODI',
          externalId: progData.externalId,
          identifier: `${progData.code} - ${progData.name}`,
          action: 'DIPERBARUI',
          message: 'Program studi diverifikasi tanpa duplikasi.',
          status: 'SUKSES',
        });
      }
      stats.programsProcessed++;
    }

    // 3. Sinkronisasi Mata Kuliah
    for (const crsData of payload.courses) {
      const existingCrs = courses.find((c) => c.externalId === crsData.externalId || c.code === crsData.code);
      if (!existingCrs) {
        courses.push({
          id: `crs-${crsData.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          externalId: crsData.externalId,
          code: crsData.code,
          name: crsData.name,
          credits: crsData.credits,
          semesterLevel: crsData.semesterLevel,
          studyProgramId: `prodi-${crsData.studyProgramCode.toLowerCase()}`,
          studyProgramCode: crsData.studyProgramCode,
          description: crsData.description,
          isActive: true,
          sourceSystem: 'SIAKAD_STAI',
        });
        itemLogs.push({
          id: `log-crs-${crsData.code}`,
          entityType: 'MATA_KULIAH',
          externalId: crsData.externalId,
          identifier: `${crsData.code} ${crsData.name}`,
          action: 'DIBUAT',
          message: 'Mata kuliah kurikulum baru berhasil dibuat.',
          status: 'SUKSES',
        });
      } else {
        existingCrs.name = crsData.name;
        existingCrs.credits = crsData.credits;
        itemLogs.push({
          id: `log-crs-${crsData.code}`,
          entityType: 'MATA_KULIAH',
          externalId: crsData.externalId,
          identifier: `${crsData.code} ${crsData.name}`,
          action: 'DIPERBARUI',
          message: 'Mata kuliah diperbarui.',
          status: 'SUKSES',
        });
      }
      stats.coursesProcessed++;
    }

    // 4. Sinkronisasi Kelas Perkuliahan (Upsert Idempotent)
    for (const clsData of payload.classes) {
      const matchedCourse = courses.find((c) => c.externalId === clsData.courseExternalId || c.code === clsData.code.split('-').slice(0, 2).join('-'));
      const existingCls = classes.find((c) => c.externalId === clsData.externalId);

      if (!existingCls) {
        const newClass: AcademicClass = {
          id: `cls-${clsData.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          externalId: clsData.externalId,
          code: clsData.code,
          name: clsData.name,
          academicPeriodId: currentPeriod.id,
          academicPeriodName: currentPeriod.name,
          courseId: matchedCourse ? matchedCourse.id : 'crs-unknown',
          courseCode: matchedCourse ? matchedCourse.code : clsData.code,
          courseName: matchedCourse ? matchedCourse.name : clsData.name,
          credits: matchedCourse ? matchedCourse.credits : 2,
          studyProgramCode: matchedCourse ? matchedCourse.studyProgramCode : 'PAI',
          lecturerId: clsData.lecturerId,
          lecturerName: clsData.lecturerName,
          lecturerNidn: clsData.lecturerNidn,
          studentCount: clsData.studentCount,
          schedules: clsData.schedules.map((sch, i) => ({ id: `sch-${Date.now()}-${i}`, ...sch })),
          status: clsData.status || 'AKTIF',
          sourceSystem: 'SIAKAD_STAI',
          createdAt: startedAt,
          updatedAt: startedAt,
        };
        classes.push(newClass);
        stats.classesCreated++;
        itemLogs.push({
          id: `log-cls-${clsData.code}`,
          entityType: 'KELAS',
          externalId: clsData.externalId,
          identifier: `${clsData.code} (${clsData.name})`,
          action: 'DIBUAT',
          message: 'Ruang kelas pembelajaran SALAM berhasil dibentuk.',
          status: 'SUKSES',
        });
      } else {
        // Mode Update / Deactivate / Archive (Non-destructive)
        if (clsData.status === 'NONAKTIF' || clsData.status === 'DIARSIPKAN') {
          existingCls.status = clsData.status;
          stats.classesDeactivated++;
          itemLogs.push({
            id: `log-cls-${clsData.code}`,
            entityType: 'KELAS',
            externalId: clsData.externalId,
            identifier: clsData.code,
            action: 'DIARSIPKAN',
            message: `Kelas berstatus ${clsData.status}. Histori tetap dipertahankan (soft archive).`,
            status: 'PERINGATAN',
          });
        } else {
          existingCls.name = clsData.name;
          existingCls.studentCount = clsData.studentCount;
          existingCls.lecturerName = clsData.lecturerName;
          existingCls.updatedAt = startedAt;
          stats.classesUpdated++;
          itemLogs.push({
            id: `log-cls-${clsData.code}`,
            entityType: 'KELAS',
            externalId: clsData.externalId,
            identifier: clsData.code,
            action: 'DIPERBARUI',
            message: 'Informasi kelas diperbarui secara idempotent.',
            status: 'SUKSES',
          });
        }
      }
    }

    // 5. Sinkronisasi Anggota / Mahasiswa Kelas bila ada
    if (payload.members) {
      for (const mbrData of payload.members) {
        const existingMbr = members.find((m) => m.externalId === mbrData.externalId);
        if (!existingMbr) {
          members.push({
            id: `mbr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            externalId: mbrData.externalId,
            classId: `cls-${mbrData.classExternalId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            studentId: mbrData.studentId,
            studentNim: mbrData.studentNim,
            studentName: mbrData.studentName,
            enrollmentDate: startedAt.split('T')[0],
            status: mbrData.status,
            sourceSystem: 'SIAKAD_STAI',
          });
          stats.studentsEnrolled++;
        }
      }
    }

    // Simpan semua pembaruan ke storage
    academicService.savePeriods(periods);
    academicService.savePrograms(programs);
    academicService.saveCourses(courses);
    academicService.saveClasses(classes);
    academicService.saveMembers(members);

    const finishedAt = new Date().toISOString();
    const syncRunLog: SyncRunLog = {
      id: `sync-run-${Date.now()}`,
      startedAt,
      finishedAt,
      status: stats.totalFailed > 0 ? 'BERHASIL_SEBAGIAN' : 'BERHASIL',
      sourceSystem: 'SIAKAD_STAI',
      academicPeriodCode: payload.academicPeriod.code,
      stats,
      itemLogs,
    };

    // Simpan log sinkronisasi
    const existingLogs = this.getSyncRunLogs();
    localStorage.setItem(SYNC_LOGS_KEY, JSON.stringify([syncRunLog, ...existingLogs].slice(0, 50)));

    // Catat ke audit trail global
    auditService.record(
      actorId,
      actorName,
      'admin_akademik',
      'SINKRONISASI_AKADEMIK',
      'INTEGRASI_AKADEMIK',
      `Sinkronisasi periode ${payload.academicPeriod.name}: ${stats.classesCreated} dibuat, ${stats.classesUpdated} diperbarui, ${stats.classesDeactivated} dinonaktifkan.`,
      'SUKSES'
    );

    return syncRunLog;
  }
}

export const syncService = new SyncService();
