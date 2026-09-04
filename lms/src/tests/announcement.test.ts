import { announcementService } from '../services/announcementService';

export interface AnnouncementTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runAnnouncementTests(): { results: AnnouncementTestResult[]; allPassed: boolean } {
  const results: AnnouncementTestResult[] = [];
  const testStudentId = `usr-test-ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // 1. Uji Ketersediaan Dataset Pengumuman Resmi Kampus
  const initialList = announcementService.getAnnouncements(testStudentId);
  results.push({
    scenario: 'Integritas & Ketersediaan Pengumuman Kampus STAI Al-Ittihad',
    expected: 'Memiliki minimal 5 pengumuman resmi dengan kategori terstruktur',
    actual: `${initialList.length} Pengumuman Terdaftar`,
    passed: initialList.length >= 5
  });

  // 2. Uji Pengumuman Prioritas / Disematkan (Pinned)
  const pinnedItems = initialList.filter((a) => a.isPinned);
  results.push({
    scenario: 'Pemisahan & Prioritas Pengumuman Disematkan (Pinned)',
    expected: 'Memiliki pengumuman berstatus disematkan (Surat Edaran BAAK/Rektorat)',
    actual: `${pinnedItems.length} Pengumuman Disematkan Ditemukan`,
    passed: pinnedItems.length >= 1
  });

  // 3. Uji Fungsi Tandai Satu Pengumuman Telah Dibaca
  const targetItem = initialList[0];
  announcementService.markAsRead(targetItem.id, testStudentId);
  const itemAfterRead = announcementService.getAnnouncementById(targetItem.id, testStudentId);
  results.push({
    scenario: 'Pelacakan Status Baca Perorangan Mahasiswa (Mark As Read)',
    expected: 'Status isRead berubah menjadi true setelah dibuka',
    actual: `isRead: ${itemAfterRead?.isRead}`,
    passed: itemAfterRead?.isRead === true
  });

  // 4. Uji Simpan / Bookmark Pengumuman Favorit
  const isBookmarked = announcementService.toggleBookmark(targetItem.id, testStudentId);
  const itemAfterBookmark = announcementService.getAnnouncementById(targetItem.id, testStudentId);
  results.push({
    scenario: 'Pengelolaan Arsip & Simpanan Pengumuman Favorit Mahasiswa',
    expected: 'Status isBookmarked tersimpan secara persisten',
    actual: `isBookmarked: ${itemAfterBookmark?.isBookmarked}`,
    passed: isBookmarked === true && itemAfterBookmark?.isBookmarked === true
  });

  // 5. Uji Tandai Semua Pengumuman Telah Dibaca
  announcementService.markAllAsRead(testStudentId);
  const allListAfterMarkAll = announcementService.getAnnouncements(testStudentId);
  const allRead = allListAfterMarkAll.every((a) => a.isRead);
  results.push({
    scenario: 'Aksi Cepat: Tandai Seluruh Pengumuman Telah Dibaca',
    expected: 'Seluruh pengumuman memiliki status isRead = true',
    actual: `Semua Dibaca: ${allRead} (Sisa Unread: ${allListAfterMarkAll.filter((a) => !a.isRead).length})`,
    passed: allRead
  });

  // 6. Uji Kelengkapan Lampiran Dokumen Resmi (PDF)
  const itemsWithAttachments = initialList.filter((a) => a.attachments && a.attachments.length > 0);
  results.push({
    scenario: 'Kelengkapan Dokumen Lampiran Resmi (Surat Edaran & Panduan PDF)',
    expected: 'Pengumuman penting memuat berkas lampiran resmi untuk diunduh',
    actual: `${itemsWithAttachments.length} Pengumuman Memiliki Lampiran PDF`,
    passed: itemsWithAttachments.length >= 2
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
