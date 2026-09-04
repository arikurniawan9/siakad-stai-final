/**
 * OFFICIAL DOCUMENT PRINT / PDF PREVIEW MODAL
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { useState } from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ExportConfig, OfficialDocumentHeader, OfficialSignature } from '../../types/exportImport';
import { 
  DEFAULT_OFFICIAL_HEADER, 
  DEFAULT_OFFICIAL_SIGNATURE, 
  formatCellValue, 
  printOfficialDocument
} from '../../utils/exportUtils';
import { exportToXlsxWorkbook } from '../../utils/excelUtils';

export interface PrintDocumentModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  config: ExportConfig<T>;
}

export function PrintDocumentModal<T = any>({
  isOpen,
  onClose,
  config
}: PrintDocumentModalProps<T>) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    config.orientation || 'portrait'
  );
  const [showSignature, setShowSignature] = useState<boolean>(true);

  const activeCols = config.columns.filter((c) => !c.excludeFromExport);
  const header: OfficialDocumentHeader = config.officialHeader || DEFAULT_OFFICIAL_HEADER;
  const signature: OfficialSignature = config.signature || DEFAULT_OFFICIAL_SIGNATURE;

  const currentConfig: ExportConfig<T> = {
    ...config,
    orientation,
    signature: showSignature ? signature : undefined
  };

  const handlePrint = () => {
    printOfficialDocument(currentConfig);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pratinjau Dokumen Cetak & PDF Resmi"
      maxWidth="900px"
    >
      <div className="flex flex-col gap-4">
        {/* Controls Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: 'var(--color-slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)'
          }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                Orientasi:
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.6875rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: orientation === 'portrait' ? 'var(--color-primary-700)' : 'var(--bg-surface)',
                    color: orientation === 'portrait' ? 'white' : 'var(--text-primary)',
                    fontWeight: orientation === 'portrait' ? 'bold' : 'normal'
                  }}
                >
                  Potret (A4)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.6875rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: orientation === 'landscape' ? 'var(--color-primary-700)' : 'var(--bg-surface)',
                    color: orientation === 'landscape' ? 'white' : 'var(--text-primary)',
                    fontWeight: orientation === 'landscape' ? 'bold' : 'normal'
                  }}
                >
                  Lanskap (A4)
                </button>
              </div>
            </div>

            <label className="flex items-center gap-1.5" style={{ fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showSignature}
                onChange={(e) => setShowSignature(e.target.checked)}
              />
              <span>Sertakan Kolom Pengesahan</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
            >
              Cetak / Simpan PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Tutup
            </Button>
          </div>
        </div>

        {/* Paper Sheet Document Preview */}
        <div
          style={{
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: 'var(--space-2)',
            backgroundColor: 'var(--color-slate-200)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              padding: '24px 30px',
              borderRadius: '2px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontFamily: "'Times New Roman', Times, serif",
              lineHeight: 1.35,
              fontSize: '11px',
              minWidth: orientation === 'landscape' ? '750px' : '580px'
            }}
          >
            {/* KOP SURAT RESMI */}
            <div
              style={{
                textAlign: 'center',
                borderBottom: '2.5px solid #000000',
                paddingBottom: '8px',
                marginBottom: '14px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                {header.institutionSubName || 'YAYASAN AL-ITTIHAD CIANJUR'}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '2px 0' }}>
                {header.institutionName || 'SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD'}
              </div>
              <div style={{ fontSize: '9.5px', fontStyle: 'italic', color: '#333' }}>
                {header.skNumber || 'SK Pendirian Kemenag RI No. Dj.I/257/2010 • Terakreditasi BAN-PT'}
              </div>
              <div style={{ fontSize: '9px', color: '#444', marginTop: '2px' }}>
                {header.address || ''} • {header.contact || ''}
              </div>
            </div>

            {/* JUDUL DOKUMEN */}
            <div style={{ textAlign: 'center', margin: '14px 0' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase' }}>
                {config.title}
              </div>
              {config.subtitle && (
                <div style={{ fontSize: '10px', marginTop: '3px', color: '#333' }}>
                  {config.subtitle}
                </div>
              )}
            </div>

            {/* METADATA INFORMASI */}
            {config.metadata && Object.keys(config.metadata).length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '4px 12px',
                  fontSize: '9.5px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: '6px 10px',
                  marginBottom: '12px'
                }}
              >
                {Object.entries(config.metadata).map(([k, v]) => (
                  <div key={k}>
                    <strong>{k}:</strong> {String(v)}
                  </div>
                ))}
              </div>
            )}

            {/* TABEL DATA RESMI */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '9.5px',
                marginBottom: '16px'
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #333', padding: '5px', width: '30px', textAlign: 'center' }}>No</th>
                  {activeCols.map((col) => (
                    <th
                      key={String(col.key)}
                      style={{
                        border: '1px solid #333',
                        padding: '5px 8px',
                        textAlign: col.align || 'left',
                        fontWeight: 'bold'
                      }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.data.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center' }}>
                      {idx + 1}
                    </td>
                    {activeCols.map((col) => {
                      const val = formatCellValue(col, row);
                      return (
                        <td
                          key={String(col.key)}
                          style={{
                            border: '1px solid #333',
                            padding: '4px 8px',
                            textAlign: col.align || 'left',
                            verticalAlign: 'middle'
                          }}
                        >
                          {String(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* CATATAN RESMI */}
            {config.notes && config.notes.length > 0 && (
              <div
                style={{
                  fontSize: '8.5px',
                  color: '#444',
                  fontStyle: 'italic',
                  borderTop: '1px dashed #94a3b8',
                  paddingTop: '6px',
                  marginBottom: '16px'
                }}
              >
                <strong>Catatan Penting:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '2px' }}>
                  {config.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* KOLOM PENGESAHAN & TANDA TANGAN */}
            {showSignature && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '20px'
                }}
              >
                <div style={{ textAlign: 'center', minWidth: '220px', fontSize: '10px' }}>
                  <div>{signature.city || 'Cianjur'}, {signature.dateText || ''}</div>
                  <div style={{ marginTop: '2px' }}>{signature.title}</div>
                  <div style={{ height: '55px' }} />
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{signature.name}</div>
                  {signature.identifier && <div style={{ fontSize: '9px', marginTop: '1px' }}>{signature.identifier}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info and extra export options */}
        <div className="flex justify-between items-center text-xs text-muted">
          <span>Total Baris Terlampir: <strong>{config.data.length} baris</strong></span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={() => exportToXlsxWorkbook(currentConfig)}>
              Unduh Excel (.xlsx)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
