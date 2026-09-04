/**
 * SUITE UJI NOTIFIKASI, KALENDER & BERANDA DINAMIS SALAM
 * 
 * Pengujian pusat notifikasi, unread count badge, deep link routing, dan agregasi kalender akademik bebas duplikasi.
 */

import { notificationService } from '../services/notificationService';
import { calendarService } from '../services/calendarService';

export interface NotificationCalendarTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runNotificationCalendarTests(): { results: NotificationCalendarTestResult[]; allPassed: boolean } {
  const results: NotificationCalendarTestResult[] = [];
  const testUserId = 'tester-user-notif';

  // 1. Uji Pembuatan Notifikasi Baru & Penghitungan Unread Count
  notificationService.createNotification({
    userId: testUserId,
    title: 'Umpan Balik Tugas Makalah',
    message: 'Dosen telah memberikan catatan revisi pada makalah Anda.',
    category: 'TUGAS',
    deepLinkPath: '/tugas',
    actionLabel: 'Lihat Catatan'
  });

  notificationService.createNotification({
    userId: testUserId,
    title: 'Pengingat Kuis Daring',
    message: 'Kuis Ushul Fiqih Sesi 2 segera ditutup.',
    category: 'PERKULIAHAN',
    deepLinkPath: '/kuis',
    actionLabel: 'Kerjakan'
  });

  const unreadCount = notificationService.getUnreadCount(testUserId);
  const unreadCorrect = unreadCount === 2;
  results.push({
    scenario: 'Pusat Notifikasi: Pembuatan 2 notifikasi baru & kalkulasi badge',
    expected: 'unreadCount = 2',
    actual: unreadCorrect ? `Tercatat ${unreadCount} notifikasi belum dibaca` : `Gagal: ${unreadCount}`,
    passed: unreadCorrect
  });

  // 2. Uji Tandai Satu Notifikasi Dibaca (Mark as Read)
  const notifs = notificationService.getNotifications(testUserId);
  notificationService.markAsRead(notifs[0].id);
  const remainingUnread = notificationService.getUnreadCount(testUserId);

  const markOneCorrect = remainingUnread === 1;
  results.push({
    scenario: 'Mutasi Status Notifikasi: Tandai 1 notifikasi dibaca (Mark as Read)',
    expected: 'unreadCount berkurang menjadi 1',
    actual: markOneCorrect ? `Sisa unread count: ${remainingUnread}` : `Gagal: ${remainingUnread}`,
    passed: markOneCorrect
  });

  // 3. Uji Tandai Semua Dibaca (Mark All as Read)
  notificationService.markAllAsRead(testUserId);
  const allReadCount = notificationService.getUnreadCount(testUserId);

  const markAllCorrect = allReadCount === 0;
  results.push({
    scenario: 'Tandai Semua Notifikasi Dibaca (Mark All as Read)',
    expected: 'unreadCount = 0',
    actual: markAllCorrect ? 'Seluruh notifikasi telah berstatus dibaca' : `Gagal: ${allReadCount}`,
    passed: markAllCorrect
  });

  // 4. Uji Deep Link Validity pada Notifikasi
  const hasValidDeepLinks = notifs.every((n) => n.deepLinkPath.startsWith('/'));
  results.push({
    scenario: 'Validitas Deep Link Notifikasi: Format rute tujuan valid',
    expected: 'Seluruh notifikasi memiliki rute awalan "/" valid untuk navigasi',
    actual: hasValidDeepLinks ? 'Deep link terverifikasi mengarah ke resource target' : 'Rute tidak valid',
    passed: hasValidDeepLinks
  });

  // 5. Uji Kalender Akademik Terpadu Tanpa Duplikasi
  const allEvents = calendarService.getAllEvents();
  const eventIds = allEvents.map((e) => e.id);
  const hasNoDuplicates = new Set(eventIds).size === eventIds.length;
  const hasMultipleTypes = allEvents.some((e) => e.type === 'JADWAL_KULIAH') &&
                           allEvents.some((e) => e.type === 'BATAS_TUGAS') &&
                           allEvents.some((e) => e.type === 'KUIS_DARING') &&
                           allEvents.some((e) => e.type === 'AGENDA_AKADEMIK');

  const calendarValid = hasNoDuplicates && hasMultipleTypes;
  results.push({
    scenario: 'Kalender Akademik Terpadu: Penggabungan multi-sumber tanpa duplikasi',
    expected: 'Tergabung jadwal kuliah, batas tugas, kuis, dan agenda kampus (bebas ID duplikat)',
    actual: calendarValid ? `Tersinkronisasi ${allEvents.length} event akademik bebas duplikasi` : 'Duplikasi terdeteksi',
    passed: calendarValid
  });

  // 6. Uji Pengurutan Tenggat Waktu Terdekat (Upcoming Deadlines)
  const deadlines = calendarService.getUpcomingDeadlines();
  const isChronological = deadlines.every((evt, idx) => {
    if (idx === 0) return true;
    return new Date(evt.date) >= new Date(deadlines[idx - 1].date);
  });

  results.push({
    scenario: 'Pengurutan Tenggat Waktu: Urutan kronologis tanggal paling mendesak',
    expected: 'Daftar batas waktu terurut dari yang paling dekat',
    actual: isChronological ? `Tersaring ${deadlines.length} tenggat waktu terurut kronologis` : 'Urutan tanggal salah',
    passed: isChronological
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
