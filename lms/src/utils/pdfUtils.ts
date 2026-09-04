/**
 * PDF GENERATION UTILITY
 * Powered by jsPDF & jsPDF-Autotable
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExportConfig } from '../types/exportImport';
import { DEFAULT_OFFICIAL_HEADER, DEFAULT_OFFICIAL_SIGNATURE, formatCellValue, downloadFile, sanitizeFilename } from './exportUtils';

/**
 * Generate and download a styled institutional PDF document
 */
export function exportToPdfDocument<T = any>(config: ExportConfig<T>): void {
  const activeCols = config.columns.filter((c) => !c.hidden);
  const orientation = config.orientation === 'landscape' || activeCols.length > 6 ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  const header = config.officialHeader || DEFAULT_OFFICIAL_HEADER;
  const signature = config.officialSignature || DEFAULT_OFFICIAL_SIGNATURE;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  let currentY = margin;

  // 1. KOP SURAT RESMI STAI AL-ITTIHAD CIANJUR
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text((header.foundationName || 'YAYASAN AL-ITTIHAD CIANJUR').toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFontSize(13);
  doc.setTextColor(4, 120, 87); // Emerald-700
  doc.text((header.institutionName || 'SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD').toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // Slate-600
  if (header.skNumber) {
    doc.text(header.skNumber, pageWidth / 2, currentY, { align: 'center' });
    currentY += 3.5;
  }
  doc.text(`${header.address} | Telp: ${header.phone} | Email: ${header.email}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 3.5;
  doc.text(`Website: ${header.website}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 3;

  // Kop Double Line Divider
  doc.setDrawColor(4, 120, 87);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 0.8;
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // 2. JUDUL DOKUMEN & SUBTITLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // Slate-900
  const titleText = (config.title || 'LAPORAN AKADEMIK').toUpperCase();
  doc.text(titleText, pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  if (config.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(config.subtitle, pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;
  }

  // 3. METADATA GRID (2 KOLOM)
  if (config.metadata && Object.keys(config.metadata).length > 0) {
    currentY += 1;
    doc.setFontSize(8);
    const metaEntries = Object.entries(config.metadata);
    const midPoint = pageWidth / 2;

    metaEntries.forEach(([key, val], idx) => {
      const isLeft = idx % 2 === 0;
      const xPos = isLeft ? margin : midPoint + 4;
      const yPos = currentY + Math.floor(idx / 2) * 4;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text(`${key}:`, xPos, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(String(val), xPos + 32, yPos);
    });

    currentY += Math.ceil(metaEntries.length / 2) * 4 + 3;
  } else {
    currentY += 2;
  }

  // 4. AUTOTABLE DATA GRID
  const tableHeaders = ['NO', ...activeCols.map((c) => c.header)];
  const tableRows = config.data.map((item, index) => {
    const rowCells = activeCols.map((col) => {
      return formatCellValue(col, item);
    });
    return [String(index + 1), ...rowCells];
  });

  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableRows,
    theme: 'striped',
    margin: { left: margin, right: margin, bottom: 25 },
    headStyles: {
      fillColor: [4, 120, 87], // Emerald-700 #047857
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      valign: 'middle',
      cellPadding: 2
    },
    styles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 1.8,
      overflow: 'linebreak'
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244] // Emerald-50
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 }
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const totalPages = doc.getNumberOfPages();
      const currentPage = data.pageNumber;
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(
        `SALAM LMS — STAI Al-Ittihad Cianjur | Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
        margin,
        pageHeight - 8
      );
      doc.text(
        `Halaman ${currentPage} dari ${totalPages}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: 'right' }
      );
    }
  });

  // 5. BLOK TANDA TANGAN RESMI
  const lastTableY = (doc as any).lastAutoTable?.finalY || currentY + 40;
  let signY = lastTableY + 10;

  // If signature block falls too close to bottom margin, add a new page
  if (signY + 35 > pageHeight - 15) {
    doc.addPage();
    signY = margin + 10;
  }

  const signX = pageWidth - margin - 55;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`${signature.city || signature.location || 'Cianjur'}, ${signature.dateText || signature.date || new Date().toLocaleDateString('id-ID')}`, signX, signY);
  signY += 4;
  doc.text(signature.title, signX, signY);
  signY += 18; // Signature blank space

  doc.setFont('helvetica', 'bold');
  doc.text(signature.name, signX, signY);
  signY += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.text(`NIDN/NIP: ${signature.identifier || signature.nidn || signature.nip || '-'}`, signX, signY);

  // 6. SAVE AND DOWNLOAD PDF SAFELY VIA BLOB
  const baseName = config.filename || config.title || 'SALAM_Dokumen_Resmi';
  const filename = sanitizeFilename(baseName, 'pdf');
  try {
    const pdfBlob = doc.output('blob');
    downloadFile(pdfBlob, filename, 'application/pdf');
  } catch {
    doc.save(filename);
  }
}
