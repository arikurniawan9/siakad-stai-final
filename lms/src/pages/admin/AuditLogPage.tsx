import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Search, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { AuditLogEntry } from '../../types/auth';
import { auditService } from '../../services/auditService';
import { useToast } from '../../components/feedback/ToastContext';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

export const AuditLogPage: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const loadLogs = () => {
    setLogs(auditService.fetchAll());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Auto reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterAction, filterStatus]);

  const hasActiveFilters = searchQuery !== '' || filterAction !== 'SEMUA' || filterStatus !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterAction('SEMUA');
    setFilterStatus('SEMUA');
    setCurrentPage(1);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = 
        log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.actorRole && log.actorRole.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesAction = filterAction === 'SEMUA' || log.action === filterAction;
      const matchesStatus = filterStatus === 'SEMUA' || log.status === filterStatus;
      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [logs, searchQuery, filterAction, filterStatus]);

  // Paginated Logs
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Konfigurasi Ekspor Audit Log Keamanan
  const auditExportConfig: ExportConfig<AuditLogEntry> = useMemo(() => ({
    filename: 'SALAM_Jejak_Audit_Keamanan',
    title: 'LAPORAN JEJAK AUDIT AKTIVITAS & KEAMANAN SISTEM',
    subtitle: 'Sistem Aplikasi Layanan Akademik dan Mahasiswa (SALAM) — STAI Al-Ittihad',
    data: filteredLogs,
    columns: [
      { 
        key: 'timestamp', 
        header: 'Waktu (WIB)', 
        width: '160px',
        format: (val) => new Date(val).toLocaleString('id-ID')
      },
      { key: 'actorName', header: 'Pelaku (Aktor)', width: '180px' },
      { key: 'actorRole', header: 'Peran Aktor', width: '120px' },
      { key: 'action', header: 'Jenis Tindakan', width: '180px' },
      { key: 'details', header: 'Rincian & Keterangan', width: '250px', format: (val) => val || '-' },
      { key: 'status', header: 'Status Keamanan', width: '100px', align: 'center' }
    ],
    metadata: {
      'Total Catatan': `${filteredLogs.length} Baris Log`,
      'Filter Aksi': filterAction,
      'Filter Status': filterStatus,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredLogs, filterAction, filterStatus]);

  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'Waktu (WIB)',
      width: '180px',
      render: (row) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {new Date(row.timestamp).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      )
    },
    {
      header: 'Pelaku (Aktor)',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)' }}>
            {row.actorName}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Peran: {row.actorRole}
          </div>
        </div>
      )
    },
    {
      header: 'Tindakan',
      render: (row) => (
        <Badge variant="primary">
          {row.action}
        </Badge>
      )
    },
    {
      header: 'Detail Aktivitas',
      render: (row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          {row.details || '-'}
        </div>
      )
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => {
        const variant = row.status === 'SUKSES' ? 'success' : row.status === 'DITOLAK' ? 'danger' : 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>Audit Aktivitas & Keamanan</h1>
          <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
            Jejak audit seluruh aktivitas login, perubahan wewenang, dan aksi sensitif sistem STAI AL-ITTIHAD
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown 
            config={auditExportConfig} 
            buttonLabel="Ekspor Audit Log" 
          />
          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            onClick={() => {
              loadLogs();
              toast.info('Diperbarui', 'Data audit log berhasil dimuat ulang.');
            }}
          >
            Muat Ulang
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <CardTitle>Filter & Pencarian Audit Log</CardTitle>
            <Badge variant="primary">{filteredLogs.length} Catatan Ditemukan</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div style={{ position: 'relative' }}>
              <Input
                placeholder="Cari pelaku, aksi, atau detail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="SEMUA">Semua Jenis Tindakan</option>
              <option value="LOGIN_BERHASIL">LOGIN_BERHASIL</option>
              <option value="LOGIN_GAGAL">LOGIN_GAGAL</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="PERUBAHAN_PERAN_DEMO">PERUBAHAN_PERAN_DEMO</option>
              <option value="INISIALISASI_SISTEM">INISIALISASI_SISTEM</option>
            </select>

            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="SEMUA">Semua Status Keamanan</option>
              <option value="SUKSES">SUKSES</option>
              <option value="DITOLAK">DITOLAK</option>
              <option value="PERINGATAN">PERINGATAN</option>
            </select>

            {hasActiveFilters && (
              <Button 
                variant="secondary" 
                size="sm" 
                icon={X} 
                onClick={handleResetFilters}
                title="Reset Semua Filter"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Table
            columns={columns}
            data={paginatedLogs}
            keyExtractor={(row) => row.id}
            emptyMessage="Belum ada rekaman jejak audit yang sesuai dengan filter."
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="rekaman log"
          />
        </CardBody>
      </Card>
    </div>
  );
};
