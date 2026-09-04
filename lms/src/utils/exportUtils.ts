/**
 * PROFESSIONAL EXPORT UTILITIES
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { ExportConfig, ExportColumn, OfficialDocumentHeader, OfficialSignature } from '../types/exportImport';

export const DEFAULT_OFFICIAL_HEADER: OfficialDocumentHeader = {
  institutionName: 'SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD',
  institutionSubName: 'YAYASAN AL-ITTIHAD CIANJUR',
  skNumber: 'SK Pendirian Kemenag RI No. Dj.I/257/2010 • Terakreditasi BAN-PT',
  address: 'Jl. Raya Bandung Km. 03, Rawabango, Bojong, Karangtengah, Cianjur, Jawa Barat 43281',
  contact: 'Telp: (0263) 261877 • Web: stai-alittihad.ac.id • Email: akademik@stai-alittihad.ac.id'
};

export const DEFAULT_OFFICIAL_SIGNATURE: OfficialSignature = {
  title: 'Ketua Bagian Administrasi Akademik & Kemahasiswaan (BAAK)',
  name: 'Dr. H. M. Ridwan, M.Ag',
  identifier: 'NIDN: 2108198501',
  city: 'Cianjur',
  dateText: new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
};

/**
 * Format a single cell value for display or export
 */
export function formatCellValue<T>(column: ExportColumn<T>, row: T): string {
  if (column.format) {
    const res = column.format((row as any)[column.key], row);
    return res !== undefined && res !== null ? String(res) : '';
  }
  const val = (row as any)[column.key];
  if (val === undefined || val === null) return '';
  if (typeof val === 'boolean') return val ? 'Ya' : 'Tidak';
  if (val instanceof Date) return val.toLocaleDateString('id-ID');
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

/**
 * Helper to download Blob data as a file in the browser
 */
export function downloadFile(content: BlobPart | Blob, filename: string, mimeType: string = 'application/octet-stream') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // ignore cleanup errors
    }
  }, 500);
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string, ext: string): string {
  const clean = filename.replace(/[/\\?%*:|"<>]/g, '_').trim();
  const dateStr = new Date().toISOString().substring(0, 10);
  return `${clean || 'SALAM_Export'}_${dateStr}.${ext}`;
}

/**
 * Export data to CSV with UTF-8 BOM
 */
export function exportToCsv<T>(config: ExportConfig<T>, delimiter: ',' | ';' = ','): void {
  const activeCols = config.columns.filter((c) => !c.excludeFromExport);
  const headers = activeCols.map((c) => `"${c.header.replace(/"/g, '""')}"`);

  const rows = config.data.map((row) => {
    return activeCols.map((col) => {
      const val = formatCellValue(col, row);
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(delimiter);
  });

  const metadataRows: string[] = [];
  if (config.title) {
    metadataRows.push(`"# SALAM LMS - ${config.title}"`);
  }
  if (config.subtitle) {
    metadataRows.push(`"# ${config.subtitle}"`);
  }
  metadataRows.push(`"# Diekspor pada: ${new Date().toLocaleString('id-ID')}"`);
  metadataRows.push(''); // Empty line before table headers

  const csvBody = [
    ...metadataRows,
    headers.join(delimiter),
    ...rows
  ].join('\r\n');

  // UTF-8 BOM (\uFEFF) ensures Excel and text editors render Indonesian/Arabic accents correctly
  const csvContent = '\uFEFF' + csvBody;
  const filename = sanitizeFilename(config.filename || config.title, 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export to Excel (Spreadsheet HTML XML with styling)
 */
export function exportToExcelSpreadsheet<T>(config: ExportConfig<T>): void {
  const activeCols = config.columns.filter((c) => !c.excludeFromExport);
  const header = config.officialHeader || DEFAULT_OFFICIAL_HEADER;

  const headerHtml = `
    <tr style="background-color: #065f46; color: #ffffff; font-weight: bold; font-size: 14px;">
      <th colspan="${activeCols.length}" style="padding: 12px; text-align: center; font-size: 16px;">
        ${header.institutionName || 'STAI AL-ITTIHAD CIANJUR'}
      </th>
    </tr>
    <tr style="background-color: #ecfdf5; color: #064e3b; font-size: 11px;">
      <th colspan="${activeCols.length}" style="padding: 6px; text-align: center;">
        ${config.title} ${config.subtitle ? `— ${config.subtitle}` : ''} | Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}
      </th>
    </tr>
    <tr><td colspan="${activeCols.length}"></td></tr>
    <tr style="background-color: #047857; color: #ffffff; font-weight: bold; font-size: 12px;">
      ${activeCols.map((c) => `<th style="border: 1px solid #064e3b; padding: 8px; text-align: ${c.align || 'left'};">${c.header}</th>`).join('')}
    </tr>
  `;

  const rowsHtml = config.data.map((row, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const cells = activeCols.map((col) => {
      const val = formatCellValue(col, row);
      const align = col.align || 'left';
      return `<td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: ${align}; vertical-align: middle;">${escapeHtml(String(val))}</td>`;
    }).join('');
    return `<tr style="background-color: ${bg}; font-size: 11px;">${cells}</tr>`;
  }).join('');

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${(config.title || 'Data').substring(0, 31)}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
      </style>
    </head>
    <body>
      <table>
        ${headerHtml}
        ${rowsHtml}
      </table>
    </body>
    </html>
  `;

  const filename = sanitizeFilename(config.filename || config.title, 'xls');
  downloadFile(excelTemplate, filename, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * Export data to JSON
 */
export function exportToJson<T>(config: ExportConfig<T>): void {
  const payload = {
    metadata: {
      application: 'SALAM LMS — STAI AL-ITTIHAD',
      title: config.title,
      subtitle: config.subtitle,
      exportedAt: new Date().toISOString(),
      totalRecords: config.data.length,
      ...config.metadata
    },
    data: config.data
  };

  const jsonContent = JSON.stringify(payload, null, 2);
  const filename = sanitizeFilename(config.filename || config.title, 'json');
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Print / Save-as-PDF Official Campus Document
 */
export function printOfficialDocument<T>(config: ExportConfig<T>): void {
  const activeCols = config.columns.filter((c) => !c.excludeFromExport);
  const header = config.officialHeader || DEFAULT_OFFICIAL_HEADER;
  const signature = config.signature || DEFAULT_OFFICIAL_SIGNATURE;
  const isLandscape = config.orientation === 'landscape';

  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    alert('Pop-up terblokir oleh peramban. Izinkan pop-up untuk mencetak dokumen resmi.');
    return;
  }

  const rowsHtml = config.data.map((row, idx) => {
    const cells = activeCols.map((col) => {
      const val = formatCellValue(col, row);
      const align = col.align || 'left';
      return `<td style="text-align: ${align};">${escapeHtml(String(val))}</td>`;
    }).join('');
    return `<tr><td class="row-num">${idx + 1}</td>${cells}</tr>`;
  }).join('');

  const metadataHtml = config.metadata
    ? `<div class="meta-box">
        ${Object.entries(config.metadata).map(([k, v]) => `<div><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</div>`).join('')}
       </div>`
    : '';

  const docHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(config.title)} — STAI AL-ITTIHAD</title>
      <style>
        @page {
          size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
          margin: 15mm 15mm 15mm 15mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 10.5pt;
          line-height: 1.35;
          color: #000000;
          background: #ffffff;
          padding: 20px;
        }
        .header-kop {
          text-align: center;
          border-bottom: 2.5px solid #000000;
          padding-bottom: 8px;
          margin-bottom: 14px;
          position: relative;
        }
        .header-kop .inst-sub {
          font-size: 11pt;
          font-weight: bold;
          letter-spacing: 0.5px;
        }
        .header-kop .inst-main {
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 2px 0;
        }
        .header-kop .inst-sk {
          font-size: 8.5pt;
          font-style: italic;
        }
        .header-kop .inst-addr {
          font-size: 8pt;
          color: #222;
          margin-top: 2px;
        }
        .doc-title-block {
          text-align: center;
          margin: 12px 0 16px 0;
        }
        .doc-title {
          font-size: 13pt;
          font-weight: bold;
          text-decoration: underline;
          text-transform: uppercase;
        }
        .doc-subtitle {
          font-size: 9.5pt;
          margin-top: 3px;
        }
        .meta-box {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 6px;
          font-size: 9pt;
          margin-bottom: 12px;
          padding: 6px 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9pt;
          margin-bottom: 16px;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #333333;
          padding: 5px 6px;
          vertical-align: middle;
        }
        table.data-table th {
          background-color: #f1f5f9;
          font-weight: bold;
          text-align: center;
        }
        table.data-table td.row-num {
          text-align: center;
          width: 30px;
        }
        .footer-sign {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
          page-break-inside: avoid;
        }
        .sign-box {
          text-align: center;
          min-width: 240px;
          font-size: 9.5pt;
        }
        .sign-space {
          height: 60px;
        }
        .sign-name {
          font-weight: bold;
          text-decoration: underline;
        }
        .notes-box {
          margin-top: 14px;
          font-size: 8pt;
          color: #444;
          font-style: italic;
          border-top: 1px dashed #cbd5e1;
          padding-top: 6px;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="header-kop">
        <div class="inst-sub">${escapeHtml(header.institutionSubName || 'YAYASAN AL-ITTIHAD CIANJUR')}</div>
        <div class="inst-main">${escapeHtml(header.institutionName || 'SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD')}</div>
        <div class="inst-sk">${escapeHtml(header.skNumber || '')}</div>
        <div class="inst-addr">${escapeHtml(header.address || '')} • ${escapeHtml(header.contact || '')}</div>
      </div>

      <div class="doc-title-block">
        <div class="doc-title">${escapeHtml(config.title)}</div>
        ${config.subtitle ? `<div class="doc-subtitle">${escapeHtml(config.subtitle)}</div>` : ''}
      </div>

      ${metadataHtml}

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            ${activeCols.map((c) => `<th style="text-align: ${c.align || 'left'};">${escapeHtml(c.header)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      ${config.notes && config.notes.length > 0 ? `
        <div class="notes-box">
          <strong>Catatan:</strong>
          <ul>
            ${config.notes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="footer-sign">
        <div class="sign-box">
          <div>${escapeHtml(signature.city || 'Cianjur')}, ${escapeHtml(signature.dateText || '')}</div>
          <div>${escapeHtml(signature.title)}</div>
          <div class="sign-space"></div>
          <div class="sign-name">${escapeHtml(signature.name)}</div>
          ${signature.identifier ? `<div>${escapeHtml(signature.identifier)}</div>` : ''}
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(docHtml);
  printWindow.document.close();
}
