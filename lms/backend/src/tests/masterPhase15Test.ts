/**
 * SALAM LMS - MASTER PHASE 15 AUTOMATED TEST RUNNER
 * 
 * Menyatukan seluruh rangkaian validasi Fase 15:
 * 1. Backend Core & Security Suite (runBackendMasterTests)
 * 2. Simulasi 1 Semester Penuh (runSemesterSimulation)
 * 3. Concurrency & Race Condition Suite (runConcurrencyTests)
 * 4. Load & Performance Benchmark (runLoadPerformanceBenchmark)
 */

import { runBackendMasterTests } from './runAllTests.js';
import { runSemesterSimulation } from './semesterSimulationTest.js';
import { runConcurrencyTests } from './concurrencyTest.js';
import { runLoadPerformanceBenchmark } from './loadPerformanceTest.js';

export async function runMasterPhase15Validation() {
  console.log('\n================================================================');
  console.log(' SALAM LMS (STAI AL-ITTIHAD) — FASE 15 MASTER VALIDATION SUITE ');
  console.log('================================================================\n');

  // 1. CORE BACKEND & SECURITY
  console.log('>>> [1/4] Menjalankan Pengujian Backend & Keamanan...');
  const backend = await runBackendMasterTests();

  // 2. SEMESTER SIMULATION
  console.log('>>> [2/4] Menjalankan Simulasi Siklus 1 Semester Penuh...');
  const semester = runSemesterSimulation();
  semester.results.forEach((r, i) => {
    console.log(`[${r.passed ? 'LULUS' : 'GAGAL'}] ${i + 1}. ${r.scenario}`);
  });

  // 3. CONCURRENCY & RACE CONDITIONS
  console.log('\n>>> [3/4] Menjalankan Pengujian Concurrency & Race Conditions...');
  const concurrency = runConcurrencyTests();
  concurrency.results.forEach((r, i) => {
    console.log(`[${r.passed ? 'LULUS' : 'GAGAL'}] ${i + 1}. ${r.scenario}`);
  });

  // 4. LOAD & PERFORMANCE BENCHMARK
  console.log('\n>>> [4/4] Menjalankan Benchmark Beban & Throughput (100 - 200 Pengguna Serentak)...');
  const load = runLoadPerformanceBenchmark();
  load.scenarios.forEach(s => {
    console.log(`[${s.status}] ${s.scenarioId}: ${s.name} | p95: ${s.p95Ms}ms | Error: ${s.errorRatePercentage}%`);
  });

  const allPassed = backend.allPassed && semester.allPassed && concurrency.allPassed && load.allPassed;

  console.log('\n================================================================');
  console.log(` HASIL AKHIR FASE 15: ${allPassed ? '✅ 100% LULUS (GO-LIVE READY)' : '⚠️ GAGAL'}`);
  console.log('================================================================\n');

  return allPassed;
}

if (process.argv[1] && process.argv[1].endsWith('masterPhase15Test.ts')) {
  runMasterPhase15Validation()
    .then((passed) => process.exit(passed ? 0 : 1))
    .catch((err) => {
      console.error('Fatal error during Phase 15 validation:', err);
      process.exit(1);
    });
}
