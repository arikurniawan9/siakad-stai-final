/**
 * SUITE UJI LAPORAN, MONITORING & AUDIT SALAM
 * 
 * Pengujian agregasi institusional, deteksi mahasiswa tertinggal, kepatuhan dosen, dan ekspor CSV.
 */

import { reportingService } from '../services/reportingService';

export interface ReportingTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runReportingTests(): { results: ReportingTestResult[]; allPassed: boolean } {
  const results: ReportingTestResult[] = [];

  // 1. Uji Laporan Institusional & Ringkasan Metrik
  const report = reportingService.getInstitutionalReport(50);
  const reportValid = report.totalActiveClasses > 0 && report.totalEnrolledStudents > 0;

  results.push({
    scenario: 'Laporan Institusional: Agregasi metrik kelas aktif & mahasiswa terdaftar',
    expected: 'Total kelas aktif >= 1 dan mahasiswa terdaftar >= 1',
    actual: reportValid ? `Tercatat ${report.totalActiveClasses} kelas, ${report.totalEnrolledStudents} mahasiswa, rata-rata progres: ${report.averageStudentProgress}%` : 'Laporan kosong',
    passed: reportValid
  });

  // 2. Uji Deteksi Mahasiswa Berisiko Tertinggal Berbasis Ambang Batas
  const atRiskList = report.atRiskStudents;
  const isAtRiskFiltered = atRiskList.every((s) => s.progressPercentage < 50);

  results.push({
    scenario: 'Deteksi Mahasiswa Tertinggal: Filter progressPercentage < 50%',
    expected: 'Semua mahasiswa dalam daftar memiliki persentase < 50%',
    actual: isAtRiskFiltered ? `Terdeteksi ${atRiskList.length} mahasiswa berisiko memerlukan intervensi` : 'Filter ambang batas gagal',
    passed: isAtRiskFiltered
  });

  // 3. Uji Monitoring Kepatuhan Perkuliahan Dosen
  const compliance = report.lecturerCompliances;
  const hasComplianceData = compliance.length > 0 && compliance.some((c) => c.complianceRate > 0);

  results.push({
    scenario: 'Monitoring Kepatuhan Dosen: Keterlaksanaan RPS & antrean penilaian',
    expected: 'Data kepatuhan memuat persentase penerbitan materi dan beban koreksi',
    actual: hasComplianceData ? `Terpantau ${compliance.length} dosen pengampu dengan rincian kepatuhan RPS` : 'Kepatuhan kosong',
    passed: hasComplianceData
  });

  // 4. Uji Kesehatan Sinkronisasi SIAKAD
  const syncHealth = report.syncHealth;
  const isSyncHealthy = syncHealth.overallStatus === 'SEHAT' && syncHealth.successRate >= 95;

  results.push({
    scenario: 'Monitoring Sinkronisasi Akademik: Tingkat keberhasilan >= 95%',
    expected: 'Status SEHAT dengan successRate >= 95%',
    actual: isSyncHealthy ? `Status: ${syncHealth.overallStatus} (Tingkat keberhasilan: ${syncHealth.successRate}%)` : 'Sinkronisasi bermasalah',
    passed: isSyncHealthy
  });

  // 5. Uji Generasi Berkas Ekspor CSV
  const csvData = reportingService.generateProgressCsv('cls-pai301-a');
  const hasCsvHeaders = csvData.includes('NIM') && csvData.includes('Nama Mahasiswa') && csvData.includes('Persentase Ketercapaian');

  results.push({
    scenario: 'Ekspor Data Rekapitulasi: Struktur header CSV valid untuk pelaporan',
    expected: 'CSV memuat kolom NIM, Nama Mahasiswa, dan Persentase Ketercapaian',
    actual: hasCsvHeaders ? 'Format CSV valid dan siap diunduh' : 'Header CSV tidak sesuai standar',
    passed: hasCsvHeaders
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
