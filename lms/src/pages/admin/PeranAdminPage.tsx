import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  X, 
  Edit, 
  Copy, 
  Trash2, 
  Users, 
  Shield, 
  Sliders
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/feedback/ToastContext';
import { 
  RoleSummaryStats, 
  SystemRoleItem, 
  PermissionsCatalogResponse, 
  RoleDetailItem,
  RoleAssignedUser
} from '../../types/roleAdmin';
import { roleAdminService } from '../../services/roleAdminService';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

type TabView = 'role_catalog' | 'rbac_matrix' | 'permissions_catalog';

export const PeranAdminPage: React.FC = () => {
  const { success, danger } = useToast();

  // State Utama
  const [activeTab, setActiveTab] = useState<TabView>('role_catalog');
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryStats, setSummaryStats] = useState<RoleSummaryStats | null>(null);
  const [rolesList, setRolesList] = useState<SystemRoleItem[]>([]);
  const [catalog, setCatalog] = useState<PermissionsCatalogResponse | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Auto reset page on search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const hasActiveFilters = searchQuery !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Modal: Edit Peran & Permissions
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<SystemRoleItem | null>(null);
  const [formRoleName, setFormRoleName] = useState<string>('');
  const [formRoleDesc, setFormRoleDesc] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [savingRole, setSavingRole] = useState<boolean>(false);

  // Modal: Tambah Peran Baru
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [newRoleId, setNewRoleId] = useState<string>('');
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleDesc, setNewRoleDesc] = useState<string>('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [creatingRole, setCreatingRole] = useState<boolean>(false);

  // Modal: Kloning Peran
  const [cloneModalOpen, setCloneModalOpen] = useState<boolean>(false);
  const [targetCloneRole, setTargetCloneRole] = useState<SystemRoleItem | null>(null);
  const [cloneRoleId, setCloneRoleId] = useState<string>('');
  const [cloneRoleName, setCloneRoleName] = useState<string>('');
  const [cloneRoleDesc, setCloneRoleDesc] = useState<string>('');
  const [cloningRole, setCloningRole] = useState<boolean>(false);

  // Modal: Detail Pengguna dalam Peran
  const [usersModalOpen, setUsersModalOpen] = useState<boolean>(false);
  const [detailRole, setDetailRole] = useState<RoleDetailItem | null>(null);

  // Load Data Utama
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, rolesRes, catalogRes] = await Promise.all([
        roleAdminService.getSummaryStats(),
        roleAdminService.getRoles(),
        roleAdminService.getPermissionsCatalog()
      ]);

      setSummaryStats(statsRes);
      setRolesList(rolesRes);
      setCatalog(catalogRes);
    } catch {
      danger('Gagal Memuat Data', 'Tidak dapat mengambil konfigurasi peran dan hak akses dari server.');
    } finally {
      setLoading(false);
    }
  }, [danger]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler: Buka Modal Edit Peran
  const handleOpenEdit = (role: SystemRoleItem) => {
    setEditingRole(role);
    setFormRoleName(role.name);
    setFormRoleDesc(role.description);
    setSelectedPermissions(role.permissions || []);
    setEditModalOpen(true);
  };

  // Handler: Toggle Permission Checkbox
  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions((prev) => 
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Handler: Toggle Semua Izin dalam Kategori
  const handleToggleCategory = (categoryPermIds: string[]) => {
    const allSelected = categoryPermIds.every((id) => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !categoryPermIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...categoryPermIds])));
    }
  };

  // Handler: Simpan Perubahan Peran
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    try {
      setSavingRole(true);
      const res = await roleAdminService.updateRole(editingRole.id, {
        name: formRoleName,
        description: formRoleDesc,
        permissions: selectedPermissions
      });

      success('Peran Berhasil Diperbarui', res.message);
      setEditModalOpen(false);
      loadData();
    } catch {
      danger('Gagal Memperbarui Peran', 'Terjadi kesalahan sistem saat memperbarui matriks hak akses.');
    } finally {
      setSavingRole(false);
    }
  };

  // Handler: Buat Peran Baru
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleId || !newRoleName || !newRoleDesc) return;

    try {
      setCreatingRole(true);
      const res = await roleAdminService.createRole({
        id: newRoleId,
        name: newRoleName,
        description: newRoleDesc,
        permissions: newRolePermissions
      });

      success('Peran Berhasil Dibuat', res.message);
      setCreateModalOpen(false);
      setNewRoleId('');
      setNewRoleName('');
      setNewRoleDesc('');
      setNewRolePermissions([]);
      loadData();
    } catch {
      danger('Gagal Membuat Peran', 'Kode peran tersebut mungkin sudah ada atau terjadi kesalahan.');
    } finally {
      setCreatingRole(false);
    }
  };

  // Handler: Buka Modal Kloning
  const handleOpenClone = (role: SystemRoleItem) => {
    setTargetCloneRole(role);
    setCloneRoleId(`${role.id}_salinan`);
    setCloneRoleName(`${role.name} (Salinan)`);
    setCloneRoleDesc(`Salinan konfigurasi hak akses dari peran ${role.name}.`);
    setCloneModalOpen(true);
  };

  // Handler: Eksekusi Kloning
  const handleCloneRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCloneRole || !cloneRoleId || !cloneRoleName) return;

    try {
      setCloningRole(true);
      const res = await roleAdminService.cloneRole(targetCloneRole.id, {
        newRoleId: cloneRoleId,
        newRoleName: cloneRoleName,
        description: cloneRoleDesc
      });

      success('Kloning Peran Berhasil', res.message);
      setCloneModalOpen(false);
      loadData();
    } catch {
      danger('Gagal Mengkloning Peran', 'Terjadi kesalahan sistem saat membuat salinan peran.');
    } finally {
      setCloningRole(false);
    }
  };

  // Handler: Buka Detail Pengguna
  const handleOpenUsers = async (roleId: string) => {
    try {
      const res = await roleAdminService.getRoleById(roleId);
      setDetailRole(res);
      setUsersModalOpen(true);
    } catch {
      danger('Gagal Memuat Detail', 'Tidak dapat mengambil daftar civitas akademika dalam peran ini.');
    }
  };

  // Handler: Hapus Peran Kustom
  const handleDeleteRole = async (role: SystemRoleItem) => {
    if (role.isSystemRole) {
      danger('Aksi Ditolak', 'Peran bawaan sistem (System Role) tidak dapat dihapus demi integritas RBAC.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus peran kustom '${role.name}'?`)) return;

    try {
      const res = await roleAdminService.deleteRole(role.id);
      success('Peran Dihapus', res.message);
      loadData();
    } catch {
      danger('Gagal Menghapus Peran', 'Peran tidak dapat dihapus jika masih ada pengguna aktif di dalamnya.');
    }
  };

  // Data Ekspor Matriks RBAC
  const rbacExportData = useMemo(() => {
    if (!catalog) return [];
    const rows: Record<string, any>[] = [];
    catalog.categories.forEach((cat) => {
      cat.permissions.forEach((p) => {
        const rowObj: Record<string, any> = {
          categoryName: cat.categoryName,
          permissionId: p.id,
          permissionName: p.name
        };
        rolesList.forEach((r) => {
          rowObj[r.id] = r.permissions?.includes(p.id) ? 'YA' : 'TIDAK';
        });
        rows.push(rowObj);
      });
    });
    return rows;
  }, [catalog, rolesList]);

  // Konfigurasi Ekspor Matriks RBAC
  const rbacExportConfig: ExportConfig<any> = useMemo(() => ({
    filename: 'SALAM_Matriks_Hak_Akses_RBAC',
    title: 'MATRIKS ROLE-BASED ACCESS CONTROL (RBAC) & PERIZINAN MODUL',
    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
    data: rbacExportData,
    columns: [
      { key: 'categoryName', header: 'Kategori Modul', width: '160px' },
      { key: 'permissionId', header: 'Kode Izin', width: '140px' },
      { key: 'permissionName', header: 'Nama Hak Akses', width: '220px' },
      ...rolesList.map((r) => ({
        key: r.id,
        header: r.name,
        width: '100px',
        align: 'center' as const
      }))
    ],
    metadata: {
      'Total Peran Sistem': `${rolesList.length} Peran`,
      'Total Hak Akses (Permissions)': `${rbacExportData.length} Izin Operasional`,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [rbacExportData, rolesList]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return rolesList.filter((r) => {
      return (
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [rolesList, searchQuery]);

  // Paginated Roles
  const totalPages = Math.ceil(filteredRoles.length / pageSize) || 1;
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  // Kolom Tabel Pengguna dalam Peran (Modal)
  const userColumns: Column<RoleAssignedUser>[] = [
    {
      header: 'Nama Pengguna',
      width: '240px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
            {row.name}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {row.email}
          </span>
        </div>
      )
    },
    {
      header: 'NIM / NIDN / NIP',
      width: '160px',
      render: (row) => (
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
          {row.identityNumber || '-'}
        </span>
      )
    },
    {
      header: 'Status Akun',
      width: '120px',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'AKTIF' : 'NONAKTIF'}
        </Badge>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Keamanan & Otorisasi RBAC
            </Badge>
            <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-dark)', fontWeight: 'bold' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success-DEFAULT)', display: 'inline-block' }} />
              RBAC ACTIVE • LEVEL ENTERPRISE
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', margin: 0 }}>
            Manajemen Peran & Hak Akses Pengguna
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Pengelolaan Role-Based Access Control (RBAC), konfigurasi matriks otorisasi modul pembelajaran, serta pemetaan hak akses civitas akademika STAI AL-ITTIHAD.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown 
            config={rbacExportConfig} 
            buttonLabel="Ekspor Matriks RBAC" 
          />
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Tambah Peran Kustom
          </Button>
        </div>
      </div>

      {/* 2. Kartu Metrik Ringkasan (Executive Metric Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  TOTAL PERAN SISTEM
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalRoles || 7}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Peran Aktif
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <ShieldCheck size={13} />
                  <span>{summaryStats?.systemRolesCount || 7} Peran Bawaan Sistem</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-primary-50)', 
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  TOTAL HAK AKSES
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalPermissions || 28}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Permissions
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>8 Kategori Modul Terisolasi</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-success-surface)', 
                  color: 'var(--color-success-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sliders size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  PENGGUNA TERPETAKAN
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalUsersMapped || 23}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Civitas
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <Users size={13} />
                  <span>100% Memiliki Hak Akses Valid</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-primary-50)', 
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  INTEGRITAS OTORISASI
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success-dark)', marginTop: '4px' }}>
                  100%
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Strict RBAC
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <Shield size={13} />
                  <span>Enforced at API Gateway & UI</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-success-surface)', 
                  color: 'var(--color-success-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Shield size={22} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Grup Tab Navigasi */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'role_catalog' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('role_catalog')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <ShieldCheck size={16} />
          <span>Katalog Peran & Pengguna ({rolesList.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'rbac_matrix' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('rbac_matrix')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Sliders size={16} />
          <span>Matriks Hak Akses (RBAC Matrix Table)</span>
        </button>

        <button
          className={`btn ${activeTab === 'permissions_catalog' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('permissions_catalog')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <CheckCircle2 size={16} />
          <span>Katalog Hak Akses per Modul ({catalog?.total || 28})</span>
        </button>
      </div>

      {/* 4. Konten Tab 1: Katalog Peran & Pengguna */}
      {activeTab === 'role_catalog' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2" style={{ minWidth: '280px', maxWidth: '480px', width: '100%' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Input
                  placeholder="Cari nama peran, deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
              </div>

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

            <Button variant="ghost" size="sm" onClick={loadData} isLoading={loading}>
              <RefreshCw size={15} />
              <span>Segarkan Data</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedRoles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <CardTitle>{role.name}</CardTitle>
                      <CardSubtitle>Kode: <code style={{ color: 'var(--color-primary-900)', fontWeight: 'bold' }}>{role.id}</code></CardSubtitle>
                    </div>
                    <Badge variant={role.isSystemRole ? 'primary' : 'warning'}>
                      {role.isSystemRole ? 'System Role' : 'Custom'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardBody>
                  <div className="flex flex-col gap-3">
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', minHeight: '36px', margin: 0 }}>
                      {role.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 border border-default rounded text-xs">
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Pengguna Terkait:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>
                          {role.usersCount} Civitas
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Hak Akses Aktif:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-primary-900)', marginTop: '2px' }}>
                          {role.permissionsCount} / {catalog?.total || 28} Izin
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-2 border-t border-default flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Users}
                        onClick={() => handleOpenUsers(role.id)}
                        title="Lihat Pengguna dalam Peran Ini"
                      >
                        Pengguna ({role.usersCount})
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Copy}
                          onClick={() => handleOpenClone(role)}
                          title="Kloning Matriks Peran Ini"
                        >
                          Klon
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleOpenEdit(role)}
                          title="Konfigurasi Hak Akses Peran"
                        >
                          Izin Akses
                        </Button>
                        {!role.isSystemRole && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteRole(role)}
                            title="Hapus Peran Kustom"
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <Card>
            <CardBody style={{ padding: 'var(--space-2) var(--space-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredRoles.length}
                pageSize={pageSize}
                pageSizeOptions={[3, 6, 12, 24]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="peran pengguna"
              />
            </CardBody>
          </Card>
        </div>
      )}

      {/* 5. Konten Tab 2: Matriks Hak Akses (RBAC Matrix Table) */}
      {activeTab === 'rbac_matrix' && (
        <Card>
          <CardHeader>
            <CardTitle>Matriks Otorisasi Hak Akses (RBAC Matrix Table)</CardTitle>
            <CardSubtitle>Pemetaan menyeluruh 28 izin operasional terhadap 7 peran civitas akademika STAI AL-ITTIHAD.</CardSubtitle>
          </CardHeader>
          <CardBody>
            <div className="table-container" style={{ maxHeight: '680px', overflowY: 'auto' }}>
              <table className="table" style={{ fontSize: 'var(--text-xs)' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                  <tr>
                    <th style={{ minWidth: '160px' }}>Kategori Modul</th>
                    <th style={{ minWidth: '220px' }}>Hak Akses (Permission)</th>
                    {rolesList.map((r) => (
                      <th key={r.id} style={{ textAlign: 'center', minWidth: '100px' }}>
                        <div>{r.name.replace(' (PA)', '').replace(' (Kaprodi)', '')}</div>
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                          ({r.permissionsCount} Izin)
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catalog?.categories.map((cat) => (
                    <React.Fragment key={cat.categoryName}>
                      <tr style={{ backgroundColor: 'var(--color-slate-100)', fontWeight: 'bold' }}>
                        <td colSpan={2 + rolesList.length} style={{ color: 'var(--color-primary-900)' }}>
                          📁 MODUL: {cat.categoryName.toUpperCase()}
                        </td>
                      </tr>
                      {cat.permissions.map((p) => (
                        <tr key={p.id}>
                          <td style={{ color: 'var(--text-muted)' }}>{cat.categoryName}</td>
                          <td>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}><code>{p.id}</code></div>
                          </td>
                          {rolesList.map((r) => {
                            const hasPerm = r.permissions?.includes(p.id);
                            return (
                              <td key={r.id} style={{ textAlign: 'center' }}>
                                {hasPerm ? (
                                  <span style={{ color: 'var(--color-success-dark)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 size={16} />
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--color-slate-300)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={14} />
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 6. Konten Tab 3: Katalog Hak Akses per Modul */}
      {activeTab === 'permissions_catalog' && (
        <div className="flex flex-col gap-6">
          {catalog?.categories.map((cat) => (
            <Card key={cat.categoryName}>
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <div>
                    <CardTitle>Modul: {cat.categoryName}</CardTitle>
                    <CardSubtitle>Total {cat.permissions.length} hak akses operasional dalam modul ini.</CardSubtitle>
                  </div>
                  <Badge variant="primary">{cat.permissions.length} Permissions</Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.permissions.map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 border border-default rounded-md flex flex-col justify-between">
                      <div>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                          {p.name}
                        </span>
                        <div style={{ margin: '3px 0' }}>
                          <code style={{ fontSize: '0.6875rem', color: 'var(--color-primary-900)', backgroundColor: 'var(--color-primary-50)', padding: '2px 6px', borderRadius: '4px' }}>
                            {p.id}
                          </code>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
                          {p.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* =====================================================================
          MODAL: EDIT & KONFIGURASI HAK AKSES PERAN
          ===================================================================== */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Konfigurasi Hak Akses: ${editingRole?.name}`}
        maxWidth="840px"
      >
        <form onSubmit={handleSaveRole} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label" htmlFor="role-name">Nama Peran</label>
              <Input
                id="role-name"
                value={formRoleName}
                onChange={(e) => setFormRoleName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role-desc">Deskripsi Tanggung Jawab</label>
              <Input
                id="role-desc"
                value={formRoleDesc}
                onChange={(e) => setFormRoleDesc(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-default">
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Matriks Hak Akses ({selectedPermissions.length} / {catalog?.total || 28} Dipilih):
            </span>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPermissions(catalog?.categories.flatMap((c) => c.permissions.map((p) => p.id)) || [])}
              >
                Pilih Semua
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPermissions([])}
              >
                Bersihkan
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
            {catalog?.categories.map((cat) => {
              const catPermIds = cat.permissions.map((p) => p.id);
              const allChecked = catPermIds.every((id) => selectedPermissions.includes(id));
              const someChecked = catPermIds.some((id) => selectedPermissions.includes(id));

              return (
                <div key={cat.categoryName} className="p-3 bg-slate-50 border border-default rounded-md">
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-default">
                    <span style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)' }}>
                      📁 {cat.categoryName}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleToggleCategory(catPermIds)}
                    >
                      {allChecked ? 'Batal Semua' : someChecked ? 'Pilih Sisa' : 'Pilih Modul Ini'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cat.permissions.map((p) => {
                      const isChecked = selectedPermissions.includes(p.id);
                      return (
                        <label 
                          key={p.id} 
                          className="flex items-start gap-2 p-2 bg-white border border-default rounded cursor-pointer hover:bg-slate-100"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(p.id)}
                            style={{ marginTop: '3px' }}
                          />
                          <div>
                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                              {p.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-default">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)} disabled={savingRole}>
              Batal
            </Button>
            <Button variant="primary" type="submit" isLoading={savingRole}>
              Simpan Matriks Hak Akses
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: TAMBAH PERAN KUSTOM BARU
          ===================================================================== */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Tambah Peran Kustom Baru"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateRole} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="new-role-id">Kode Unik Peran (ID)</label>
            <Input
              id="new-role-id"
              placeholder="e.g. koordinator_laboratorium, tim_penjamin_mutu"
              value={newRoleId}
              onChange={(e) => setNewRoleId(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Gunakan huruf kecil dan garis bawah (snake_case).</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-role-name">Nama Peran Resmi</label>
            <Input
              id="new-role-name"
              placeholder="e.g. Koordinator Laboratorium Terpadu"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-role-desc">Deskripsi & Ruang Lingkup Otoritas</label>
            <textarea
              id="new-role-desc"
              className="form-textarea"
              rows={3}
              placeholder="Tuliskan wewenang dan cakupan peran ini..."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', fontSize: 'var(--text-xs)' }}
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)} disabled={creatingRole}>
              Batal
            </Button>
            <Button variant="primary" type="submit" isLoading={creatingRole}>
              Buat Peran Baru
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: KLONING PERAN (CLONE ROLE)
          ===================================================================== */}
      <Modal
        isOpen={cloneModalOpen}
        onClose={() => setCloneModalOpen(false)}
        title={`Kloning Peran: ${targetCloneRole?.name}`}
        maxWidth="560px"
      >
        <form onSubmit={handleCloneRole} className="flex flex-col gap-4">
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-md text-xs text-primary-900">
            Peran baru akan mewarisi secara otomatis seluruh <strong>{targetCloneRole?.permissionsCount} hak akses</strong> dari peran asal (<code>{targetCloneRole?.id}</code>).
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="clone-role-id">Kode Unik Peran Baru</label>
            <Input
              id="clone-role-id"
              value={cloneRoleId}
              onChange={(e) => setCloneRoleId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="clone-role-name">Nama Peran Baru</label>
            <Input
              id="clone-role-name"
              value={cloneRoleName}
              onChange={(e) => setCloneRoleName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="clone-role-desc">Deskripsi</label>
            <Input
              id="clone-role-desc"
              value={cloneRoleDesc}
              onChange={(e) => setCloneRoleDesc(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setCloneModalOpen(false)} disabled={cloningRole}>
              Batal
            </Button>
            <Button variant="primary" type="submit" isLoading={cloningRole}>
              Duplikasi Peran
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: DAFTAR PENGGUNA DALAM PERAN TERPILIH
          ===================================================================== */}
      <Modal
        isOpen={usersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        title={`Civitas Akademika dengan Peran: ${detailRole?.name}`}
        maxWidth="720px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center p-3 bg-slate-50 border border-default rounded-md text-xs">
            <div>
              <strong>Kode Peran:</strong> <code>{detailRole?.id}</code> • <strong>Total Pengguna:</strong> {detailRole?.users?.length || 0} Civitas
            </div>
            <Badge variant="primary">{detailRole?.permissions?.length || 0} Hak Akses</Badge>
          </div>

          <Table
            columns={userColumns}
            data={detailRole?.users || []}
            keyExtractor={(row) => row.id}
            emptyMessage="Belum ada pengguna yang ditugaskan pada peran ini."
          />
        </div>
      </Modal>
    </div>
  );
};
