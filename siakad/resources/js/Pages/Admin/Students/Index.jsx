import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import AppLayout from '../../../Layouts/AppLayout';
import ImpersonationModal from '../../../Components/ImpersonationModal';
import DeleteConfirmationModal from '../../../Components/DeleteConfirmationModal';
import { 
    Users, Search, UserPlus, Upload, Download, Filter, 
    Edit2, KeyRound, Trash2, CheckCircle2, ChevronRight,
    GraduationCap, Calendar, BookOpen, CreditCard, ShieldCheck,
    AlertCircle, X, FileSpreadsheet, Phone, Mail, Copy, Check,
    Printer, RefreshCw, AlertTriangle, Layers, Clock, Sparkles,
    Plus, MoreVertical, ChevronDown, CheckSquare, Square,
    ArrowUpDown, UserCheck, ShieldAlert, Eye, FileUp, FileDown,
    Play, Loader2, Settings2, MessageSquare, Send, Save, Lock, LockOpen, Info
} from 'lucide-react';

export default function StudentsIndex({ 
    students, 
    academicYears = [], 
    studyPrograms = [], 
    batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    activePeriod, 
    curricula = [],
    lecturers = [],
    initialTab = 'students',
    isSelectionComplete = false,
    selectedProdiObj = null,
    stats = {}, 
    filters = {} 
}) {
    // Active Tab State (students | curricula | advising | portal)
    const [activeTab, setActiveTab] = useState(initialTab || 'students');

    // Primary Filter States
    const [prodi, setProdi] = useState(filters.study_program || '');
    const [year, setYear] = useState(filters.academic_year || '');
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [krsStatus, setKrsStatus] = useState(filters.krs_status || '');
    const [invoiceStatus, setInvoiceStatus] = useState(filters.invoice_status || '');
    const [advisorFilter, setAdvisorFilter] = useState(filters.advisor_id || '');
    const [curriculumFilter, setCurriculumFilter] = useState('');
    const [perPage, setPerPage] = useState(filters.per_page || 15);

    // Asynchronous In-Place Data States (URL browser tetap bersih di /admin/students)
    const [studentsData, setStudentsData] = useState(students);
    const [isSelectionActive, setIsSelectionActive] = useState(isSelectionComplete);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Dropdown Popover States
    const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false);
    const [prodiSearch, setProdiSearch] = useState('');
    const prodiDropdownRef = useRef(null);

    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const yearDropdownRef = useRef(null);

    // Multi Selection State
    const [selectedIds, setSelectedIds] = useState([]);

    // Curricula Tab States & Modals
    const [isAssignCurriculumModalOpen, setIsAssignCurriculumModalOpen] = useState(false);
    const [selectedCurriculumId, setSelectedCurriculumId] = useState('');
    const [isAssigningCurriculum, setIsAssigningCurriculum] = useState(false);
    const [curriculumSuccessMsg, setCurriculumSuccessMsg] = useState('');

    // Advising Tab States & Modals
    const [isAssignAdvisorModalOpen, setIsAssignAdvisorModalOpen] = useState(false);
    const [selectedAdvisorId, setSelectedAdvisorId] = useState('');
    const [isAssigningAdvisor, setIsAssigningAdvisor] = useState(false);
    const [advisorSuccessMsg, setAdvisorSuccessMsg] = useState('');

    // Note Modal
    const [selectedStudentForNote, setSelectedStudentForNote] = useState(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [noteSuccessMsg, setNoteSuccessMsg] = useState('');
    const [noteForm, setNoteForm] = useState({
        topic: 'Bimbingan Rencana Studi Semester',
        discussion_notes: '',
        recommendations: '',
    });

    // Portal Tab States
    const [resetPasswordMsg, setResetPasswordMsg] = useState('');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [impersonateUser, setImpersonateUser] = useState(null);
    const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);
    const [copiedNim, setCopiedNim] = useState(null);

    // Delete Modal State (Single or Bulk)
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        isBulk: false,
        ids: [],
        title: '',
        message: '',
        itemName: '',
        itemType: '',
        isLoading: false
    });

    const isFirstRender = useRef(true);

    // Helper to build clean query parameters without empty strings or defaults
    const buildCleanQuery = (overrides = {}) => {
        const raw = {
            study_program: prodi,
            academic_year: year,
            search,
            status,
            krs_status: krsStatus,
            invoice_status: invoiceStatus,
            per_page: Number(perPage) !== 15 ? perPage : undefined,
            ...overrides,
        };

        const clean = {};
        for (const [k, v] of Object.entries(raw)) {
            if (v !== undefined && v !== null && v !== '') {
                clean[k] = v;
            }
        }
        return clean;
    };

    // Asynchronous In-Place Fetcher (Memuat data secara instan tanpa merubah URL browser)
    const fetchStudentsData = async (newProdi = prodi, newYear = year, newSearch = search, newStatus = status, newKrs = krsStatus, newInvoice = invoiceStatus, page = 1) => {
        if (!newProdi || !newYear) {
            setIsSelectionActive(false);
            setStudentsData(null);
            return;
        }

        setIsLoadingData(true);
        setSelectedIds([]);

        const cleanParams = buildCleanQuery({
            study_program: newProdi,
            academic_year: newYear,
            search: newSearch,
            status: newStatus,
            krs_status: newKrs,
            invoice_status: newInvoice,
            page: page > 1 ? page : undefined,
            format: 'json'
        });

        const queryString = new URLSearchParams(cleanParams).toString();

        try {
            const response = await fetch(`/admin/students?${queryString}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });
            const res = await response.json();
            if (res.success) {
                setStudentsData(res.students);
                setIsSelectionActive(res.isSelectionComplete);
            }
        } catch (err) {
            console.error('Error fetching students data:', err);
        } finally {
            setIsLoadingData(false);
        }
    };

    // Live search debounce otomatis
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (prodi && year) {
                fetchStudentsData(prodi, year, search, status, krsStatus, invoiceStatus);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    // Close active modals and dropdowns on ESC key press & Click Outside
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                setIsProdiDropdownOpen(false);
                setIsYearDropdownOpen(false);
                if (deleteModal.isOpen && !deleteModal.isLoading) setDeleteModal(prev => ({ ...prev, isOpen: false }));
                if (isCreateOpen) setIsCreateOpen(false);
                if (isEditOpen) setIsEditOpen(false);
                if (isImportOpen) setIsImportOpen(false);
            }
        };

        const handleClickOutside = (e) => {
            if (prodiDropdownRef.current && !prodiDropdownRef.current.contains(e.target)) {
                setIsProdiDropdownOpen(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
                setIsYearDropdownOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [deleteModal.isOpen, isCreateOpen, isEditOpen, isImportOpen]);

    // Filtered prodi list inside popover search
    const filteredStudyPrograms = useMemo(() => {
        if (!prodiSearch) return studyPrograms;
        const q = prodiSearch.toLowerCase();
        return studyPrograms.filter(p => 
            p.name?.toLowerCase().includes(q) ||
            p.code?.toLowerCase().includes(q) ||
            p.national_code?.toLowerCase().includes(q) ||
            p.degree?.toLowerCase().includes(q) ||
            p.faculty_name?.toLowerCase().includes(q)
        );
    }, [studyPrograms, prodiSearch]);

    // Active Selected Prodi Object
    const currentProdi = useMemo(() => {
        if (!prodi) return null;
        return studyPrograms.find(p => String(p.id) === String(prodi) || p.code === prodi || p.name === prodi) || selectedProdiObj;
    }, [prodi, studyPrograms, selectedProdiObj]);

    // Handle Tampilkan / Trigger Filter Change
    const handleTriggerFilter = (newProdi = prodi, newYear = year, newStatus = status, newKrs = krsStatus, newInvoice = invoiceStatus) => {
        fetchStudentsData(newProdi, newYear, search, newStatus, newKrs, newInvoice);
    };

    const handleResetFilter = () => {
        setSearch('');
        setProdi('');
        setYear('');
        setStatus('');
        setKrsStatus('');
        setInvoiceStatus('');
        setSelectedIds([]);
        setSelectedUploadFile(null);
        setIsSelectionActive(false);
        setStudentsData(null);
    };

    // Pagination Click Handler
    const handlePaginationClick = (e, url) => {
        e.preventDefault();
        if (!url) return;
        try {
            const parsedUrl = new URL(url, window.location.origin);
            const pageNumber = parsedUrl.searchParams.get('page') || 1;
            fetchStudentsData(prodi, year, search, status, krsStatus, invoiceStatus, pageNumber);
        } catch (err) {
            // fallback
        }
    };

    // Multi Select Checkbox logic
    const studentList = studentsData?.data || [];
    const allPageIds = useMemo(() => studentList.map(s => s.id), [studentList]);
    const isAllSelected = allPageIds.length > 0 && allPageIds.every(id => selectedIds.includes(id));

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(prev => prev.filter(id => !allPageIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...allPageIds])));
        }
    };

    const handleToggleSelectOne = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Single Delete Trigger
    const handleOpenDeleteSingle = (stu) => {
        setDeleteModal({
            isOpen: true,
            isBulk: false,
            ids: [stu.id],
            title: 'Hapus Data Mahasiswa',
            message: `Apakah Anda yakin ingin menghapus data mahasiswa ini dari pangkalan data?`,
            itemName: `${stu.name} (NIM: ${stu.identity_number || stu.username})`,
            itemType: 'Mahasiswa',
            isLoading: false
        });
    };

    // Bulk Delete Trigger
    const handleOpenDeleteBulk = () => {
        if (selectedIds.length === 0) return;
        setDeleteModal({
            isOpen: true,
            isBulk: true,
            ids: selectedIds,
            title: `Hapus ${selectedIds.length} Mahasiswa Terpilih`,
            message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} data mahasiswa yang dipilih secara massal? Tindakan ini tidak dapat dibatalkan.`,
            itemName: `${selectedIds.length} Mahasiswa Terpilih`,
            itemType: 'Hapus Massal (Bulk Delete)',
            isLoading: false
        });
    };

    // Confirm Delete Action
    const handleConfirmDelete = () => {
        setDeleteModal(prev => ({ ...prev, isLoading: true }));

        if (deleteModal.isBulk) {
            router.post('/admin/students/bulk-delete', { ids: deleteModal.ids }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setDeleteModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
                    fetchStudentsData();
                },
                onError: () => setDeleteModal(prev => ({ ...prev, isLoading: false }))
            });
        } else {
            const singleId = deleteModal.ids[0];
            router.delete(`/admin/students/${singleId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
                    fetchStudentsData();
                },
                onError: () => setDeleteModal(prev => ({ ...prev, isLoading: false }))
            });
        }
    };

    // Copy NIM Helper
    const handleCopyNim = (nim) => {
        navigator.clipboard.writeText(nim);
        setCopiedNim(nim);
        setTimeout(() => setCopiedNim(null), 2000);
    };

    // Forms
    const createForm = useForm({
        name: '',
        identity_number: '',
        nik: '',
        email: '',
        study_program: currentProdi ? `${currentProdi.name} (${currentProdi.degree})` : (studyPrograms[0]?.name || 'Pendidikan Agama Islam (S1)'),
        gender: 'L',
        phone_number: '',
    });

    const editForm = useForm({
        name: '',
        identity_number: '',
        nik: '',
        email: '',
        study_program: '',
        gender: 'L',
        phone_number: '',
        is_active: true,
    });

    const handleOpenCreate = () => {
        const defaultProdiStr = currentProdi 
            ? `${currentProdi.name} (${currentProdi.degree || 'S1'})` 
            : (studyPrograms[0]?.name ? `${studyPrograms[0].name} (${studyPrograms[0].degree || 'S1'})` : 'Pendidikan Agama Islam (S1)');
        
        // Auto suggested NIM prefix based on Angkatan (year) & Prodi
        const yearPrefix = year ? String(year).slice(-2) : new Date().getFullYear().toString().slice(-2);
        const prodiNum = currentProdi?.national_code?.slice(-2) || currentProdi?.code?.replace(/\D/g, '').slice(0, 2) || '01';
        const suggestedNimPrefix = `${yearPrefix}${prodiNum.padStart(2, '0')}`;

        createForm.reset();
        createForm.setData({
            name: '',
            identity_number: suggestedNimPrefix,
            nik: '',
            email: '',
            study_program: defaultProdiStr,
            gender: 'L',
            phone_number: '',
        });
        setIsCreateOpen(true);
    };

    const handleOpenEdit = (stu) => {
        setSelectedStudent(stu);
        editForm.setData({
            name: stu.name,
            identity_number: stu.identity_number || stu.username || '',
            nik: stu.nik || '',
            email: stu.email || '',
            study_program: stu.study_program || (currentProdi ? currentProdi.name : ''),
            gender: stu.gender || 'L',
            phone_number: stu.phone_number || '',
            is_active: Boolean(stu.is_active),
        });
        setIsEditOpen(true);
    };

    const handleSaveCreate = (e) => {
        e.preventDefault();
        createForm.post('/admin/students', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                fetchStudentsData();
            }
        });
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!selectedStudent) return;
        editForm.put(`/admin/students/${selectedStudent.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedStudent(null);
                fetchStudentsData();
            }
        });
    };

    // Advanced Import State
    const [importRecords, setImportRecords] = useState([]);
    const [importSummary, setImportSummary] = useState(null);
    const [importFileName, setImportFileName] = useState('');
    const [importError, setImportError] = useState('');
    const [conflictMode, setConflictMode] = useState('skip'); // 'skip' atau 'overwrite'
    const [isCheckingImport, setIsCheckingImport] = useState(false);
    const [isProcessingImport, setIsProcessingImport] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    // Send parsed records to backend for validation and conflict checking
    const sendToCheckImport = async (parsed) => {
        setIsCheckingImport(true);
        try {
            const res = await fetch('/admin/students/check-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ records: parsed })
            });
            const result = await res.json();
            if (result.success) {
                setImportRecords(result.analyzed);
                setImportSummary(result.summary);
            } else {
                setImportError(result.message || 'Gagal memvalidasi data impor.');
            }
        } catch (err) {
            setImportError('Terjadi kesalahan jaringan saat memvalidasi data.');
        } finally {
            setIsCheckingImport(false);
        }
    };

    // Process file parsing for Excel (.xlsx/.xls) and CSV
    const processFileForImport = (file) => {
        if (!file) return;

        setImportFileName(file.name);
        setImportError('');
        setImportRecords([]);
        setImportSummary(null);
        setImportResult(null);

        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

        if (isExcel) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    if (!rawRows || rawRows.length === 0) {
                        setImportError('File Excel kosong.');
                        return;
                    }

                    // Deteksi baris header (mendukung template resmi dengan kop/banner maupun file biasa)
                    let headerRowIndex = 0;
                    for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
                        const r = rawRows[i] || [];
                        const joined = r.map(c => String(c).toLowerCase()).join(' ');
                        if (joined.includes('nim') || (joined.includes('nama') && (joined.includes('ktp') || joined.includes('nik') || joined.includes('prodi')))) {
                            headerRowIndex = i;
                            break;
                        }
                    }

                    const headers = (rawRows[headerRowIndex] || []).map(h => 
                        String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '')
                    );

                    const parsed = [];
                    for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
                        const row = rawRows[i];
                        if (!row || row.length === 0) continue;

                        const cleanRow = {};
                        headers.forEach((h, idx) => {
                            if (h) cleanRow[h] = String(row[idx] ?? '').trim();
                        });

                        const name = cleanRow.nama_lengkap_mahasiswa || cleanRow.nama_lengkap || cleanRow.nama || cleanRow.name || '';
                        const identity_number = cleanRow.nim || cleanRow.identity_number || cleanRow.nomor_induk || '';
                        const nik = cleanRow.no_ktp_nik || cleanRow.nik || cleanRow.no_ktp || cleanRow.ktp || '';
                        const gender = (cleanRow.jenis_kelamin_l_p || cleanRow.jenis_kelamin || cleanRow.gender || cleanRow.jk || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
                        const study_program = cleanRow.program_studi || cleanRow.prodi || cleanRow.study_program || (currentProdi ? `${currentProdi.name} (${currentProdi.degree || 'S1'})` : 'Pendidikan Agama Islam (S1)');
                        let email = cleanRow.email_mahasiswa || cleanRow.email || cleanRow.email_institusi || '';
                        const phone_number = cleanRow.no_hp_whatsapp || cleanRow.no_hp || cleanRow.hp || cleanRow.telepon || cleanRow.phone || '';

                        if (name && identity_number) {
                            if (!email) email = `${identity_number}@staialittihad.ac.id`;
                            parsed.push({
                                name,
                                identity_number,
                                nik,
                                gender,
                                study_program,
                                email,
                                phone_number
                            });
                        }
                    }

                    if (parsed.length === 0) {
                        setImportError('Tidak ditemukan baris data mahasiswa yang valid. Pastikan kolom NIM dan Nama Lengkap terisi.');
                        return;
                    }

                    await sendToCheckImport(parsed);
                } catch (err) {
                    console.error('Gagal membaca file Excel:', err);
                    setImportError('Gagal membaca file Excel. Pastikan file berformat .xlsx atau .xls yang valid.');
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            // Fallback teks / CSV
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const content = event.target.result;
                    const parsed = parseExcelOrCsv(content);

                    if (parsed.length === 0) {
                        setImportError('File kosong atau format tidak sesuai. Silakan gunakan template resmi.');
                        return;
                    }

                    await sendToCheckImport(parsed);
                } catch (err) {
                    console.error('Gagal membaca file CSV:', err);
                    setImportError('Gagal membaca file CSV.');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) processFileForImport(file);
    };

    // Open Import Modal directly
    const handleOpenImportModal = () => {
        setImportFileName('');
        setImportRecords([]);
        setImportSummary(null);
        setImportError('');
        setImportResult(null);
        setIsImportOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const parseExcelOrCsv = (content) => {
        const rows = [];
        const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        let delimiter = ',';
        if (lines.length > 0 && lines[0].includes(';') && !lines[0].includes(',')) delimiter = ';';
        if (lines.length > 0 && lines[0].includes('\t')) delimiter = '\t';

        lines.forEach((line, index) => {
            if (index === 0 && (line.toLowerCase().includes('nim') || line.toLowerCase().includes('nama'))) return;
            const cells = line.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
            if (cells.length >= 2) {
                const name = cells[0] || '';
                const nim = cells[1] || '';
                if (name && nim) {
                    rows.push({
                        name: name,
                        identity_number: nim,
                        nik: cells[2] || '',
                        gender: (cells[3] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
                        study_program: cells[4] || (currentProdi ? `${currentProdi.name} (${currentProdi.degree || 'S1'})` : 'Pendidikan Agama Islam (S1)'),
                        email: cells[5] || `${nim}@staialittihad.ac.id`,
                        phone_number: cells[6] || '',
                    });
                }
            }
        });
        return rows;
    };

    const handleExecuteImport = async () => {
        if (importRecords.length === 0) return;

        setIsProcessingImport(true);
        setImportProgress(25);

        try {
            const res = await fetch('/admin/students/process-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    records: importRecords,
                    conflict_mode: conflictMode,
                })
            });

            setImportProgress(85);
            const result = await res.json();
            setImportProgress(100);

            if (result.success) {
                setImportResult(result);
                fetchStudentsData();
            } else {
                setImportError(result.message || 'Gagal memproses impor mahasiswa.');
            }
        } catch (err) {
            setImportError('Terjadi kesalahan jaringan saat mengeksekusi impor.');
        } finally {
            setIsProcessingImport(false);
        }
    };

    // Curricula Handlers
    const handleOpenAssignCurriculum = (singleStu = null) => {
        if (singleStu) {
            setSelectedIds([singleStu.id]);
            setSelectedCurriculumId(singleStu.curriculum_id || '');
        } else {
            if (selectedIds.length === 0) return;
            setSelectedCurriculumId(curricula[0]?.id || '');
        }
        setCurriculumSuccessMsg('');
        setIsAssignCurriculumModalOpen(true);
    };

    const handleExecuteAssignCurriculum = async (e) => {
        e.preventDefault();
        if (!selectedCurriculumId || selectedIds.length === 0) return;

        setIsAssigningCurriculum(true);
        try {
            const res = await fetch('/admin/student-curricula/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    student_ids: selectedIds,
                    curriculum_id: selectedCurriculumId,
                })
            });
            const data = await res.json();
            if (data.success) {
                setCurriculumSuccessMsg(data.message);
                setTimeout(() => {
                    setIsAssignCurriculumModalOpen(false);
                    setSelectedIds([]);
                    setCurriculumSuccessMsg('');
                    fetchStudentsData();
                }, 1200);
            }
        } catch (err) {
            console.error('Error assigning curriculum:', err);
        } finally {
            setIsAssigningCurriculum(false);
        }
    };

    // Advising Handlers
    const handleOpenAssignAdvisor = (singleStu = null) => {
        if (singleStu) {
            setSelectedIds([singleStu.id]);
            setSelectedAdvisorId(singleStu.academic_advisor_id || '');
        } else {
            if (selectedIds.length === 0) return;
            setSelectedAdvisorId(lecturers[0]?.id || '');
        }
        setAdvisorSuccessMsg('');
        setIsAssignAdvisorModalOpen(true);
    };

    const handleExecuteAssignAdvisor = async (e) => {
        e.preventDefault();
        if (!selectedAdvisorId || selectedIds.length === 0) return;

        setIsAssigningAdvisor(true);
        try {
            const res = await fetch('/admin/academic-advising/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    student_ids: selectedIds,
                    advisor_id: selectedAdvisorId,
                })
            });
            const data = await res.json();
            if (data.success) {
                setAdvisorSuccessMsg(data.message);
                setTimeout(() => {
                    setIsAssignAdvisorModalOpen(false);
                    setSelectedIds([]);
                    setAdvisorSuccessMsg('');
                    fetchStudentsData();
                }, 1200);
            }
        } catch (err) {
            console.error('Error assigning advisor:', err);
        } finally {
            setIsAssigningAdvisor(false);
        }
    };

    // Note Handlers
    const handleOpenNoteModal = (stu) => {
        setSelectedStudentForNote(stu);
        setNoteForm({
            topic: 'Bimbingan Rencana Studi Semester',
            discussion_notes: '',
            recommendations: '',
        });
        setNoteSuccessMsg('');
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = async (e) => {
        e.preventDefault();
        if (!selectedStudentForNote || !selectedStudentForNote.academic_advisor_id) return;

        setIsSavingNote(true);
        try {
            const res = await fetch('/admin/academic-advising/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    student_id: selectedStudentForNote.id,
                    advisor_id: selectedStudentForNote.academic_advisor_id,
                    topic: noteForm.topic,
                    discussion_notes: noteForm.discussion_notes,
                    recommendations: noteForm.recommendations,
                })
            });
            const data = await res.json();
            if (data.success) {
                setNoteSuccessMsg(data.message);
                setTimeout(() => {
                    setIsNoteModalOpen(false);
                    setSelectedStudentForNote(null);
                    setNoteSuccessMsg('');
                    fetchStudentsData();
                }, 1200);
            }
        } catch (err) {
            console.error('Error saving advising note:', err);
        } finally {
            setIsSavingNote(false);
        }
    };

    // Portal Handlers
    const handleResetPassword = async (stu) => {
        if (!confirm(`Reset kata sandi default 'salam123' untuk akun mahasiswa ${stu.name}?`)) return;

        try {
            const res = await fetch('/admin/student-portal/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ user_id: stu.id })
            });
            const data = await res.json();
            if (data.success) {
                setResetPasswordMsg(data.message);
                setTimeout(() => setResetPasswordMsg(''), 4000);
            }
        } catch (err) {
            console.error('Error resetting password:', err);
        }
    };

    return (
        <AppLayout title="Kemahasiswaan">
            <Head title="Data Mahasiswa" />

            <div className="space-y-3.5">
                {/* 1. COMPACT HERO HEADER DENGAN INTEGRATED SUB-BAR PILIH PRODI & ANGKATAN (Gaya /admin/study-programs) */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative border border-slate-700/50 z-20">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black mb-1">
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <span>KEMAHASISWAAN & AKADEMIK</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                {activeTab === 'students' && 'Data Induk Mahasiswa'}
                                {activeTab === 'curricula' && 'Kurikulum Mahasiswa'}
                                {activeTab === 'advising' && 'Bimbingan & Konseling Akademik'}
                                {activeTab === 'portal' && 'User Portal & Akses Mahasiswa'}
                            </h2>
                        </div>

                        {/* Action Buttons Toolbar (Sesuai Tab Aktif & Kondisi Pilihan) */}
                        {isSelectionActive ? (
                            <div className="flex items-center gap-1.5 self-start md:self-auto animate-fadeIn">
                                {activeTab === 'students' && (
                                    <>
                                        {/* 1. Tambah Mahasiswa */}
                                        <div className="relative group">
                                            <button
                                                type="button"
                                                onClick={handleOpenCreate}
                                                className="w-9 h-9 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                aria-label="Tambah Mahasiswa Baru"
                                            >
                                                <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                                            </button>
                                            <div className="absolute top-full right-0 mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50 animate-fadeIn">
                                                <div className="bg-slate-900 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center space-x-1.5">
                                                    <Plus className="w-3 h-3 text-emerald-400" />
                                                    <span>Tambah Mahasiswa Baru ({currentProdi?.code || 'Prodi'})</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Upload / Import Excel */}
                                        <div className="relative group">
                                            <button
                                                type="button"
                                                onClick={handleOpenImportModal}
                                                className="w-9 h-9 bg-teal-600 hover:bg-teal-500 text-white rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                aria-label="Upload Data Excel"
                                            >
                                                <Upload className="w-4 h-4" />
                                            </button>
                                            <div className="absolute top-full right-0 mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50 animate-fadeIn">
                                                <div className="bg-slate-900 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center space-x-1.5">
                                                    <Upload className="w-3 h-3 text-teal-400" />
                                                    <span>Upload & Impor Data (Excel)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Template Format */}
                                        <div className="relative group">
                                            <a
                                                href="/admin/students/template-excel"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-9 h-9 bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-700/60 rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                aria-label="Unduh Template Excel"
                                            >
                                                <FileSpreadsheet className="w-4 h-4" />
                                            </a>
                                            <div className="absolute top-full right-0 mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50 animate-fadeIn">
                                                <div className="bg-slate-900 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center space-x-1.5">
                                                    <FileSpreadsheet className="w-3 h-3 text-purple-400" />
                                                    <span>Unduh Template Format Excel (.xlsx)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 4. Export Excel */}
                                        <div className="relative group">
                                            <a
                                                href={`/admin/students/export-excel?${new URLSearchParams(buildCleanQuery()).toString()}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-9 h-9 bg-amber-900/70 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                aria-label="Export Data Mahasiswa"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                            <div className="absolute top-full right-0 mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50 animate-fadeIn">
                                                <div className="bg-slate-900 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center space-x-1.5">
                                                    <Download className="w-3 h-3 text-amber-400" />
                                                    <span>Export Rekap Data Mahasiswa (.xls)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 5. Cetak PDF */}
                                        <div className="relative group">
                                            <a
                                                href={`/admin/students/print-pdf?${new URLSearchParams(buildCleanQuery()).toString()}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                aria-label="Cetak PDF Resmi"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </a>
                                            <div className="absolute top-full right-0 mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50 animate-fadeIn">
                                                <div className="bg-slate-900 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center space-x-1.5">
                                                    <Printer className="w-3 h-3 text-teal-400" />
                                                    <span>Cetak Dokumen PDF Resmi Kop Surat</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'curricula' && (
                                    <div className="flex items-center space-x-2">
                                        <div className="relative group">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenAssignCurriculum()}
                                                disabled={selectedIds.length === 0}
                                                className="w-9 h-9 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                aria-label="Set Kurikulum Massal"
                                            >
                                                <Settings2 className="w-4 h-4" />
                                            </button>
                                            <div className="absolute top-full right-0 mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50 animate-fadeIn">
                                                <div className="bg-slate-900 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center space-x-1.5">
                                                    <Settings2 className="w-3 h-3 text-purple-400" />
                                                    <span>Set Kurikulum Massal ({selectedIds.length} Mahasiswa Terpilih)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                                            {curricula.length} Paket Kurikulum
                                        </span>
                                    </div>
                                )}

                                {activeTab === 'advising' && (
                                    <div className="flex items-center space-x-2">
                                        <div className="relative group">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenAssignAdvisor()}
                                                disabled={selectedIds.length === 0}
                                                className="w-9 h-9 bg-teal-600 hover:bg-teal-500 text-white rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                aria-label="Plot Dosen Wali"
                                            >
                                                <Users className="w-4 h-4" />
                                            </button>
                                            <div className="absolute top-full right-0 mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50 animate-fadeIn">
                                                <div className="bg-slate-900 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center space-x-1.5">
                                                    <Users className="w-3 h-3 text-teal-400" />
                                                    <span>Plot Dosen Wali ({selectedIds.length} Mahasiswa Terpilih)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                                            {lecturers.length} Dosen Pembimbing
                                        </span>
                                    </div>
                                )}

                                {activeTab === 'portal' && (
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                                            Default Password: <strong className="text-indigo-400 font-mono">salam123</strong>
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 text-xs">
                                <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 font-bold border border-slate-700">
                                    Periode Aktif: <strong className="text-teal-400">{activePeriod?.name || '2024/2025 Ganjil'}</strong>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Integrated Sub-bar: Pilih Program Studi & Angkatan (Gaya /admin/study-programs) */}
                    <div className="relative z-30 mt-3 pt-3 border-t border-slate-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30 shrink-0">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap text-xs">
                                <span className="font-bold text-slate-300">Filter Mahasiswa:</span>
                                {currentProdi ? (
                                    <div className="inline-flex items-center space-x-1.5">
                                        <span className="font-black text-white">{currentProdi.name}</span>
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-500/30 text-teal-300 border border-teal-500/40">
                                            {currentProdi.national_code || currentProdi.code}
                                        </span>
                                        <span className="text-[11px] text-slate-300 font-medium">
                                            ({currentProdi.degree || 'S1'})
                                        </span>
                                        {year && (
                                            <span className="text-[11px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-600/40">
                                                Angkatan {year}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-slate-400 italic">Pilih Program Studi & Angkatan di samping</span>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Selectors on Header (Auto-triggers data fetch upon selection) */}
                        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto">
                            {/* Dropdown Prodi Popover */}
                            <div ref={prodiDropdownRef} className="relative w-full sm:w-64">
                                <button
                                    type="button"
                                    onClick={() => setIsProdiDropdownOpen(prev => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                        isProdiDropdownOpen 
                                            ? 'border-teal-400 ring-2 ring-teal-500/30 bg-slate-800 text-white' 
                                            : currentProdi 
                                                ? 'border-teal-500/50 bg-teal-950/50 hover:bg-teal-900/50 text-teal-200 font-bold' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2 truncate">
                                        <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${currentProdi ? 'text-teal-400' : 'text-slate-400'}`} />
                                        <span className="truncate">
                                            {currentProdi ? currentProdi.name : 'Pilih Program Studi...'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                        {prodi && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProdi('');
                                                    setIsProdiDropdownOpen(false);
                                                    handleTriggerFilter('', year);
                                                }}
                                                className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                                title="Reset Prodi"
                                            >
                                                <X className="w-3 h-3" />
                                            </span>
                                        )}
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            isProdiDropdownOpen ? 'rotate-180 text-teal-400' : ''
                                        }`} />
                                    </div>
                                </button>

                                {/* Popover Menu Prodi */}
                                {isProdiDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-80 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-2 space-y-1.5">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={prodiSearch}
                                                onChange={(e) => setProdiSearch(e.target.value)}
                                                placeholder="Cari program studi..."
                                                className="w-full text-[11px] pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100">
                                            <div
                                                onClick={() => {
                                                    setProdi('');
                                                    setIsProdiDropdownOpen(false);
                                                    handleTriggerFilter('', year);
                                                }}
                                                className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                    !prodi ? 'bg-teal-50 border border-teal-200 text-teal-950 font-bold' : 'hover:bg-slate-50 text-slate-600'
                                                }`}
                                            >
                                                <span>-- Semua / Belum Dipilih --</span>
                                                {!prodi && <Check className="w-3.5 h-3.5 text-teal-600" />}
                                            </div>

                                            {filteredStudyPrograms.map((p) => {
                                                const isSelected = String(p.id) === String(prodi) || p.code === prodi || p.name === prodi;
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => {
                                                            setProdi(String(p.id));
                                                            setIsProdiDropdownOpen(false);
                                                            handleTriggerFilter(String(p.id), year);
                                                        }}
                                                        className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between ${
                                                            isSelected 
                                                                ? 'bg-teal-50 border border-teal-200 font-bold text-teal-950' 
                                                                : 'hover:bg-slate-50 text-slate-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2 min-w-0">
                                                            <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold shrink-0">
                                                                {p.national_code || p.code}
                                                            </span>
                                                            <span className="text-[11px] truncate">{p.name} ({p.degree || 'S1'})</span>
                                                        </div>
                                                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-2" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Angkatan Popover */}
                            <div ref={yearDropdownRef} className="relative w-full sm:w-44">
                                <button
                                    type="button"
                                    onClick={() => setIsYearDropdownOpen(prev => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition shadow-2xs cursor-pointer text-left border ${
                                        isYearDropdownOpen 
                                            ? 'border-teal-400 ring-2 ring-teal-500/30 bg-slate-800 text-white' 
                                            : year 
                                                ? 'border-teal-500/50 bg-teal-950/50 hover:bg-teal-900/50 text-teal-200 font-bold' 
                                                : 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2 truncate">
                                        <Calendar className={`w-3.5 h-3.5 shrink-0 ${year ? 'text-teal-400' : 'text-slate-400'}`} />
                                        <span className="truncate">
                                            {year ? `Angkatan ${year}` : 'Pilih Angkatan...'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                                        {year && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setYear('');
                                                    setIsYearDropdownOpen(false);
                                                    handleTriggerFilter(prodi, '');
                                                }}
                                                className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                                                title="Reset Angkatan"
                                            >
                                                <X className="w-3 h-3" />
                                            </span>
                                        )}
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            isYearDropdownOpen ? 'rotate-180 text-teal-400' : ''
                                        }`} />
                                    </div>
                                </button>

                                {/* Popover Menu Angkatan */}
                                {isYearDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-48 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn p-2 space-y-1">
                                        <div
                                            onClick={() => {
                                                setYear('');
                                                setIsYearDropdownOpen(false);
                                                handleTriggerFilter(prodi, '');
                                            }}
                                            className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                !year ? 'bg-teal-50 border border-teal-200 text-teal-950 font-bold' : 'hover:bg-slate-50 text-slate-600'
                                            }`}
                                        >
                                            <span>-- Semua --</span>
                                            {!year && <Check className="w-3.5 h-3.5 text-teal-600" />}
                                        </div>

                                        {batchYears.map((y) => {
                                            const isSelected = String(y) === String(year);
                                            return (
                                                <div
                                                    key={y}
                                                    onClick={() => {
                                                        setYear(String(y));
                                                        setIsYearDropdownOpen(false);
                                                        handleTriggerFilter(prodi, String(y));
                                                    }}
                                                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-[11px] ${
                                                        isSelected 
                                                            ? 'bg-teal-50 border border-teal-200 font-bold text-teal-950' 
                                                            : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                                                        <span className="font-bold">{y}</span>
                                                    </div>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Tombol Reset */}
                            {(prodi || year) && (
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer shrink-0"
                                    title="Reset Pilihan"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. COMPACT STATS CARDS (4-GRID STATS) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Mahasiswa</span>
                            <span className="p-1 bg-teal-100 text-teal-800 rounded-md"><Users className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{stats.total || studentsData?.total || 0} Orang</p>
                            <p className="text-[10px] text-slate-500">Terdaftar di Sistem</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-teal-600 font-bold">
                            Direktori Mahasiswa
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Mahasiswa Aktif</span>
                            <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md"><UserCheck className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{stats.active || 0} Orang</p>
                            <p className="text-[10px] text-slate-500">Status Aktif Kuliah</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-emerald-600 font-bold">
                            Kuliah Berjalan
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">KRS Disetujui</span>
                            <span className="p-1 bg-blue-100 text-blue-800 rounded-md"><BookOpen className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{stats.krs_completed || 0} Mahasiswa</p>
                            <p className="text-[10px] text-slate-500">Disetujui Dosen PA</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-blue-600 font-bold">
                            KRS Terverifikasi
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Tagihan Lunas</span>
                            <span className="p-1 bg-purple-100 text-purple-800 rounded-md"><CreditCard className="w-3.5 h-3.5" /></span>
                        </div>
                        <div className="mt-1.5">
                            <p className="text-base font-black text-slate-900">{stats.paid_invoices || 0} Mahasiswa</p>
                            <p className="text-[10px] text-slate-500">SPP Terbayar</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-purple-600 font-bold">
                            Bebas Tunggakan
                        </div>
                    </div>
                </div>

                {/* 3. TABS SWITCHER KEMAHASISWAAN (Sistem Tab Tetap di Halaman Seperti /admin/study-programs) */}
                <div className="flex border-b border-slate-200 space-x-2 sm:space-x-6 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('students');
                            setSelectedIds([]);
                        }}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'students'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Data Mahasiswa</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'students' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {currentProdi && year ? `${studentsData?.total || studentList.length} Mhs` : 'Data Induk'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('curricula');
                            setSelectedIds([]);
                        }}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'curricula'
                                ? 'border-purple-600 text-purple-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Kurikulum Mahasiswa</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'curricula' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {curricula.length} Paket
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('advising');
                            setSelectedIds([]);
                        }}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'advising'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <UserCheck className="w-4 h-4" />
                        <span>Bimbingan Akademik</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'advising' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {lecturers.length} Dosen PA
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('portal');
                            setSelectedIds([]);
                        }}
                        className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'portal'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <KeyRound className="w-4 h-4" />
                        <span>User Portal Mahasiswa</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'portal' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {studentsData?.total || studentList.length} Akun
                        </span>
                    </button>
                </div>

                {/* =========================================================================
                    CASE A: EMPTY STATE BANNER (JIKA PRODI / ANGKATAN BELUM DIPILIH)
                   ========================================================================= */}
                {!isSelectionActive ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-2xs">
                        <div className="max-w-md mx-auto space-y-3.5">
                            <div className="w-14 h-14 rounded-3xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mx-auto shadow-inner">
                                <GraduationCap className="w-7 h-7 stroke-[1.8]" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">
                                    Pilih Program Studi & Angkatan
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Silakan tentukan Program Studi dan Angkatan pada bar header di atas, kemudian klik tombol <strong>Tampilkan</strong> untuk memuat data mahasiswa.
                                </p>
                            </div>

                            {/* Quick Select Pills */}
                            <div className="pt-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                    Pilih Cepat Program Studi:
                                </span>
                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                    {studyPrograms.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                setProdi(String(p.id));
                                                if (year) handleTriggerFilter(String(p.id), year);
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition border cursor-pointer ${
                                                String(prodi) === String(p.id)
                                                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            {p.national_code ? `${p.national_code} - ` : ''}{p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* =========================================================================
                        CASE B: DATA MAHASISWA & TAB CONTENT
                       ========================================================================= */
                    <div className="space-y-4 animate-fadeIn">
                        {/* Toast Alert for Reset Password */}
                        {resetPasswordMsg && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold animate-fadeIn">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>{resetPasswordMsg}</span>
                                </div>
                                <button type="button" onClick={() => setResetPasswordMsg('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* TABLE CONTAINER & FILTER TOOLBAR */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden relative">
                            
                            {/* Loading Overlay */}
                            {isLoadingData && (
                                <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-2xs flex items-center justify-center">
                                    <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
                                        <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                                        <span>Memuat data...</span>
                                    </div>
                                </div>
                            )}

                            {/* TOOLBAR SEARCH & SUB-FILTERS (CONTEXT-AWARE PER TAB) */}
                            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/60 to-white">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={
                                            activeTab === 'students' ? "Cari nama mahasiswa, NIM, email, atau no. telepon..." :
                                            activeTab === 'curricula' ? "Cari nama mahasiswa atau NIM untuk plotting kurikulum..." :
                                            activeTab === 'advising' ? "Cari nama mahasiswa atau NIM untuk bimbingan akademik..." :
                                            "Cari nama mahasiswa atau NIM akun portal..."
                                        }
                                        className="w-full text-[11px] pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Status Filters according to Active Tab */}
                                <div className="flex items-center flex-wrap gap-2 text-xs">
                                    {activeTab === 'students' && (
                                        <>
                                            <select
                                                value={status}
                                                onChange={(e) => {
                                                    setStatus(e.target.value);
                                                    handleTriggerFilter(prodi, year, e.target.value, krsStatus, invoiceStatus);
                                                }}
                                                className="text-[11px] px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                                            >
                                                <option value="">Status Akun: Semua</option>
                                                <option value="active">Aktif</option>
                                                <option value="inactive">Nonaktif</option>
                                            </select>

                                            <select
                                                value={krsStatus}
                                                onChange={(e) => {
                                                    setKrsStatus(e.target.value);
                                                    handleTriggerFilter(prodi, year, status, e.target.value, invoiceStatus);
                                                }}
                                                className="text-[11px] px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                                            >
                                                <option value="">KRS: Semua Status</option>
                                                <option value="DISETUJUI">KRS Disetujui</option>
                                                <option value="DIAJUKAN">KRS Diajukan</option>
                                                <option value="BELUM_KRS">Belum KRS</option>
                                            </select>

                                            <select
                                                value={invoiceStatus}
                                                onChange={(e) => {
                                                    setInvoiceStatus(e.target.value);
                                                    handleTriggerFilter(prodi, year, status, krsStatus, e.target.value);
                                                }}
                                                className="text-[11px] px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                                            >
                                                <option value="">Tagihan: Semua</option>
                                                <option value="LUNAS">Lunas</option>
                                                <option value="BELUM_LUNAS">Belum Lunas</option>
                                            </select>
                                        </>
                                    )}

                                    {activeTab === 'curricula' && (
                                        <select
                                            value={curriculumFilter}
                                            onChange={(e) => setCurriculumFilter(e.target.value)}
                                            className="text-[11px] px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                                        >
                                            <option value="">Semua Paket Kurikulum</option>
                                            {curricula.map(c => (
                                                <option key={c.id} value={String(c.id)}>
                                                    {c.code} - {c.name} ({c.total_credits_required || 144} SKS)
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {activeTab === 'advising' && (
                                        <select
                                            value={advisorFilter}
                                            onChange={(e) => {
                                                setAdvisorFilter(e.target.value);
                                                handleTriggerFilter(prodi, year, status, krsStatus, invoiceStatus);
                                            }}
                                            className="text-[11px] px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                                        >
                                            <option value="">Semua Dosen Pembimbing</option>
                                            <option value="unassigned">Belum Diplot PA</option>
                                            {lecturers.map(l => (
                                                <option key={l.id} value={String(l.id)}>
                                                    {l.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {activeTab === 'portal' && (
                                        <select
                                            value={status}
                                            onChange={(e) => {
                                                setStatus(e.target.value);
                                                handleTriggerFilter(prodi, year, e.target.value);
                                            }}
                                            className="text-[11px] px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                        >
                                            <option value="">Status Akun: Semua</option>
                                            <option value="active">Aktif</option>
                                            <option value="inactive">Nonaktif</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* FLOATING BATCH ACTION BAR (KETIKA ADA CHECKBOX TERPILIH) */}
                            {selectedIds.length > 0 && (
                                <div className={`border-b px-5 py-2.5 flex items-center justify-between animate-fadeIn ${
                                    activeTab === 'curricula' ? 'bg-purple-50 border-purple-100' :
                                    activeTab === 'advising' ? 'bg-teal-50 border-teal-100' :
                                    'bg-rose-50 border-rose-100'
                                }`}>
                                    <div className="flex items-center space-x-2.5">
                                        <span className={`w-5 h-5 rounded-md text-white flex items-center justify-center text-[10px] font-black ${
                                            activeTab === 'curricula' ? 'bg-purple-600' :
                                            activeTab === 'advising' ? 'bg-teal-600' :
                                            'bg-rose-600'
                                        }`}>
                                            {selectedIds.length}
                                        </span>
                                        <span className={`text-[11px] font-bold ${
                                            activeTab === 'curricula' ? 'text-purple-950' :
                                            activeTab === 'advising' ? 'text-teal-950' :
                                            'text-rose-950'
                                        }`}>
                                            Mahasiswa Dipilih untuk Aksi Massal
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedIds([])}
                                            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-white rounded-lg transition cursor-pointer"
                                        >
                                            Batalkan Pilihan
                                        </button>

                                        {activeTab === 'students' && (
                                            <button
                                                type="button"
                                                onClick={handleOpenDeleteBulk}
                                                className="px-3.5 py-1 text-[11px] font-black bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm shadow-rose-600/20 transition flex items-center space-x-1 cursor-pointer"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Hapus {selectedIds.length} Terpilih</span>
                                            </button>
                                        )}

                                        {activeTab === 'curricula' && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenAssignCurriculum()}
                                                className="px-3.5 py-1 text-[11px] font-black bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm shadow-purple-600/20 transition flex items-center space-x-1 cursor-pointer"
                                            >
                                                <Settings2 className="w-3 h-3" />
                                                <span>Set Kurikulum Massal ({selectedIds.length})</span>
                                            </button>
                                        )}

                                        {activeTab === 'advising' && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenAssignAdvisor()}
                                                className="px-3.5 py-1 text-[11px] font-black bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm shadow-teal-600/20 transition flex items-center space-x-1 cursor-pointer"
                                            >
                                                <Users className="w-3 h-3" />
                                                <span>Plot Dosen Wali Massal ({selectedIds.length})</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* =============================================================
                                TAB CONTENT 1: DATA MAHASISWA
                               ============================================================= */}
                            {activeTab === 'students' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                                            <tr>
                                                <th className="py-3 px-3 w-10 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllSelected}
                                                        onChange={handleToggleSelectAll}
                                                        className="w-3.5 h-3.5 rounded border-slate-400 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                    />
                                                </th>
                                                <th className="py-3 px-2 w-10 text-center">No.</th>
                                                <th className="py-3 px-3 w-28 text-center">Aksi</th>
                                                <th className="py-3 px-3 text-center w-12">Foto</th>
                                                <th className="py-3 px-4 w-32 font-mono">NIM</th>
                                                <th className="py-3 px-4">Nama Mahasiswa</th>
                                                <th className="py-3 px-3 text-center">Angkatan</th>
                                                <th className="py-3 px-3 text-center">Kelas</th>
                                                <th className="py-3 px-3 text-center">Status KRS</th>
                                                <th className="py-3 px-3 text-center">Tagihan SPP</th>
                                                <th className="py-3 px-3 text-center">Status Akun</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px]">
                                            {studentList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={11} className="py-12 text-center text-slate-400 italic">
                                                        Tidak ada data mahasiswa yang sesuai dengan filter pencarian ini.
                                                    </td>
                                                </tr>
                                            ) : (
                                                studentList.map((stu, idx) => {
                                                    const isRowSelected = selectedIds.includes(stu.id);
                                                    return (
                                                        <tr 
                                                            key={stu.id} 
                                                            className={`transition ${
                                                                isRowSelected ? 'bg-teal-50/70 hover:bg-teal-50' : 'hover:bg-slate-50/80'
                                                            }`}
                                                        >
                                                            {/* Checkbox */}
                                                            <td className="py-3 px-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isRowSelected}
                                                                    onChange={() => handleToggleSelectOne(stu.id)}
                                                                    className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                                />
                                                            </td>

                                                            {/* Number */}
                                                            <td className="py-3 px-2 text-center font-bold text-slate-400 text-[10px]">
                                                                {(studentsData?.from || 1) + idx}
                                                            </td>

                                                            {/* Actions with Floating Tooltips */}
                                                            <td className="py-3 px-3 text-center">
                                                                <div className="flex items-center justify-center space-x-1.5">
                                                                    {/* Edit */}
                                                                    <div className="relative group">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenEdit(stu)}
                                                                            className="w-7 h-7 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                                                                        >
                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-fadeIn">
                                                                            <div className="bg-slate-900 text-white text-[9.5px] font-bold px-2 py-0.8 rounded-md shadow-lg whitespace-nowrap">
                                                                                Edit Profil
                                                                            </div>
                                                                            <div className="w-1 h-1 bg-slate-900 rotate-45 -mt-0.5"></div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Impersonate */}
                                                                    <div className="relative group">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setImpersonateUser(stu);
                                                                                setIsImpersonateOpen(true);
                                                                            }}
                                                                            className="w-7 h-7 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                                                                        >
                                                                            <KeyRound className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-fadeIn">
                                                                            <div className="bg-slate-900 text-white text-[9.5px] font-bold px-2 py-0.8 rounded-md shadow-lg whitespace-nowrap">
                                                                                Login Menyamar
                                                                            </div>
                                                                            <div className="w-1 h-1 bg-slate-900 rotate-45 -mt-0.5"></div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Delete */}
                                                                    <div className="relative group">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenDeleteSingle(stu)}
                                                                            className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-fadeIn">
                                                                            <div className="bg-rose-950 text-white text-[9.5px] font-bold px-2 py-0.8 rounded-md shadow-lg whitespace-nowrap border border-rose-800">
                                                                                Hapus Mahasiswa
                                                                            </div>
                                                                            <div className="w-1 h-1 bg-rose-950 rotate-45 -mt-0.5"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Foto Profile */}
                                                            <td className="py-3 px-3 text-center">
                                                                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center mx-auto text-[10px] border border-slate-200">
                                                                    {stu.name ? stu.name.charAt(0).toUpperCase() : '-'}
                                                                </div>
                                                            </td>

                                                            {/* NIM & NIK */}
                                                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                                <div className="flex flex-col space-y-1">
                                                                    <div className="flex items-center space-x-1.5">
                                                                        <span>{stu.identity_number || stu.username}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleCopyNim(stu.identity_number || stu.username)}
                                                                            title="Salin NIM"
                                                                            className="text-slate-400 hover:text-teal-600 transition cursor-pointer"
                                                                        >
                                                                            {copiedNim === (stu.identity_number || stu.username) ? (
                                                                                <Check className="w-3 h-3 text-emerald-600" />
                                                                            ) : (
                                                                                <Copy className="w-3 h-3" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                    {stu.nik && (
                                                                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 w-fit">
                                                                            NIK: {stu.nik}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* Nama Mahasiswa */}
                                                            <td className="py-3 px-4">
                                                                <p className="font-bold text-slate-900 truncate">{stu.name}</p>
                                                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                                                    {stu.email || '-'}
                                                                </p>
                                                            </td>

                                                            {/* Angkatan */}
                                                            <td className="py-3 px-3 text-center font-bold text-slate-700">
                                                                {stu.batch_year || year || '-'}
                                                            </td>

                                                            {/* Kelas */}
                                                            <td className="py-3 px-3 text-center">
                                                                <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                                    Reguler
                                                                </span>
                                                            </td>

                                                            {/* Status KRS */}
                                                            <td className="py-3 px-3 text-center">
                                                                {stu.krs_status === 'DISETUJUI' ? (
                                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                                                                        Disetujui
                                                                    </span>
                                                                ) : stu.krs_status === 'DIAJUKAN' ? (
                                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800">
                                                                        Diajukan
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-600">
                                                                        Belum KRS
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Status Tagihan */}
                                                            <td className="py-3 px-3 text-center">
                                                                {stu.invoice_status === 'LUNAS' ? (
                                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                                                                        Lunas
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800">
                                                                        Belum Lunas
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Status Akun */}
                                                            <td className="py-3 px-3 text-center">
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                                                    stu.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                    {stu.is_active ? 'Aktif' : 'Nonaktif'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* =============================================================
                                TAB CONTENT 2: KURIKULUM MAHASISWA
                               ============================================================= */}
                            {activeTab === 'curricula' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                                            <tr>
                                                <th className="py-3 px-3 w-10 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllSelected}
                                                        onChange={handleToggleSelectAll}
                                                        className="w-3.5 h-3.5 rounded border-slate-400 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                    />
                                                </th>
                                                <th className="py-3 px-2 w-10 text-center">No.</th>
                                                <th className="py-3 px-3 w-28 text-center">Aksi</th>
                                                <th className="py-3 px-3 text-center w-12">Foto</th>
                                                <th className="py-3 px-4 w-32 font-mono">NIM</th>
                                                <th className="py-3 px-4">Nama Mahasiswa</th>
                                                <th className="py-3 px-3 text-center">Angkatan</th>
                                                <th className="py-3 px-4">Kurikulum Terpilih</th>
                                                <th className="py-3 px-3 text-center">Total SKS</th>
                                                <th className="py-3 px-3 text-center">Status Plotting</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px]">
                                            {studentList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={10} className="py-12 text-center text-slate-400 italic">
                                                        Tidak ada data mahasiswa yang sesuai dengan filter pencarian ini.
                                                    </td>
                                                </tr>
                                            ) : (
                                                studentList
                                                    .filter(stu => !curriculumFilter || String(stu.curriculum_id) === String(curriculumFilter))
                                                    .map((stu, idx) => {
                                                        const isRowSelected = selectedIds.includes(stu.id);
                                                        const curr = stu.curriculum || (stu.curriculum_id ? curricula.find(c => c.id === stu.curriculum_id) : null);

                                                        return (
                                                            <tr 
                                                                key={stu.id} 
                                                                className={`transition ${
                                                                    isRowSelected ? 'bg-purple-50/70 hover:bg-purple-50' : 'hover:bg-slate-50/80'
                                                                }`}
                                                            >
                                                                {/* Checkbox */}
                                                                <td className="py-3 px-3 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isRowSelected}
                                                                        onChange={() => handleToggleSelectOne(stu.id)}
                                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                                    />
                                                                </td>

                                                                {/* Number */}
                                                                <td className="py-3 px-2 text-center font-bold text-slate-400 text-[10px]">
                                                                    {(studentsData?.from || 1) + idx}
                                                                </td>

                                                                {/* Action Set Kurikulum */}
                                                                <td className="py-3 px-3 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenAssignCurriculum(stu)}
                                                                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white rounded-lg text-[10.5px] font-bold transition flex items-center space-x-1 mx-auto shadow-2xs cursor-pointer"
                                                                    >
                                                                        <Settings2 className="w-3 h-3" />
                                                                        <span>Set Paket</span>
                                                                    </button>
                                                                </td>

                                                                {/* Foto Profile */}
                                                                <td className="py-3 px-3 text-center">
                                                                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center mx-auto text-[10px] border border-slate-200">
                                                                        {stu.name ? stu.name.charAt(0).toUpperCase() : '-'}
                                                                    </div>
                                                                </td>

                                                                {/* NIM */}
                                                                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                                    {stu.identity_number || stu.username}
                                                                </td>

                                                                {/* Nama Mahasiswa */}
                                                                <td className="py-3 px-4">
                                                                    <p className="font-bold text-slate-900 truncate">{stu.name}</p>
                                                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                                                        {stu.email || '-'}
                                                                    </p>
                                                                </td>

                                                                {/* Angkatan */}
                                                                <td className="py-3 px-3 text-center font-bold text-slate-700">
                                                                    {stu.batch_year || year || '-'}
                                                                </td>

                                                                {/* Kurikulum Terpilih */}
                                                                <td className="py-3 px-4">
                                                                    {curr ? (
                                                                        <div className="flex items-center space-x-1.5">
                                                                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold border border-purple-200">
                                                                                {curr.code}
                                                                            </span>
                                                                            <span className="font-bold text-slate-900 truncate">
                                                                                {curr.name}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-slate-400 italic text-[10.5px]">
                                                                            Belum Ditetapkan
                                                                        </span>
                                                                    )}
                                                                </td>

                                                                {/* Total SKS */}
                                                                <td className="py-3 px-3 text-center font-bold text-slate-700">
                                                                    {curr?.total_credits_required || 144} SKS
                                                                </td>

                                                                {/* Status Plotting */}
                                                                <td className="py-3 px-3 text-center">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                                                        curr ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                                    }`}>
                                                                        {curr ? 'Terplot' : 'Belum Ditentukan'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* =============================================================
                                TAB CONTENT 3: BIMBINGAN AKADEMIK
                               ============================================================= */}
                            {activeTab === 'advising' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                                            <tr>
                                                <th className="py-3 px-3 w-10 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllSelected}
                                                        onChange={handleToggleSelectAll}
                                                        className="w-3.5 h-3.5 rounded border-slate-400 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                    />
                                                </th>
                                                <th className="py-3 px-2 w-10 text-center">No.</th>
                                                <th className="py-3 px-3 w-36 text-center">Aksi</th>
                                                <th className="py-3 px-3 text-center w-12">Foto</th>
                                                <th className="py-3 px-4 w-32 font-mono">NIM</th>
                                                <th className="py-3 px-4">Nama Mahasiswa</th>
                                                <th className="py-3 px-3 text-center">Angkatan</th>
                                                <th className="py-3 px-4">Dosen Pembimbing (PA)</th>
                                                <th className="py-3 px-3 text-center">Status KRS</th>
                                                <th className="py-3 px-3 text-center">Status Bimbingan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px]">
                                            {studentList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={10} className="py-12 text-center text-slate-400 italic">
                                                        Tidak ada data mahasiswa yang sesuai dengan filter pencarian ini.
                                                    </td>
                                                </tr>
                                            ) : (
                                                studentList
                                                    .filter(stu => {
                                                        if (!advisorFilter) return true;
                                                        if (advisorFilter === 'unassigned') return !stu.academic_advisor_id;
                                                        return String(stu.academic_advisor_id) === String(advisorFilter);
                                                    })
                                                    .map((stu, idx) => {
                                                        const isRowSelected = selectedIds.includes(stu.id);
                                                        const advisor = stu.advisor || (stu.academic_advisor_id ? lecturers.find(l => l.id === stu.academic_advisor_id) : null);

                                                        return (
                                                            <tr 
                                                                key={stu.id} 
                                                                className={`transition ${
                                                                    isRowSelected ? 'bg-teal-50/70 hover:bg-teal-50' : 'hover:bg-slate-50/80'
                                                                }`}
                                                            >
                                                                {/* Checkbox */}
                                                                <td className="py-3 px-3 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isRowSelected}
                                                                        onChange={() => handleToggleSelectOne(stu.id)}
                                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                                    />
                                                                </td>

                                                                {/* Number */}
                                                                <td className="py-3 px-2 text-center font-bold text-slate-400 text-[10px]">
                                                                    {(studentsData?.from || 1) + idx}
                                                                </td>

                                                                {/* Actions */}
                                                                <td className="py-3 px-3 text-center">
                                                                    <div className="flex items-center justify-center space-x-1.5">
                                                                        {/* Catatan Sesi */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (!advisor) {
                                                                                    alert('Harap plotting Dosen Pembimbing terlebih dahulu sebelum membuat catatan bimbingan.');
                                                                                    handleOpenAssignAdvisor(stu);
                                                                                    return;
                                                                                }
                                                                                handleOpenNoteModal(stu);
                                                                            }}
                                                                            className="px-2 py-1 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white rounded-lg text-[10.5px] font-bold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
                                                                            title="Beri Catatan Bimbingan"
                                                                        >
                                                                            <MessageSquare className="w-3 h-3" />
                                                                            <span>Catatan</span>
                                                                        </button>

                                                                        {/* Plot PA */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenAssignAdvisor(stu)}
                                                                            className="px-2 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-[10.5px] font-bold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
                                                                            title="Plot Dosen Wali"
                                                                        >
                                                                            <Users className="w-3 h-3" />
                                                                            <span>Plot PA</span>
                                                                        </button>
                                                                    </div>
                                                                </td>

                                                                {/* Foto Profile */}
                                                                <td className="py-3 px-3 text-center">
                                                                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center mx-auto text-[10px] border border-slate-200">
                                                                        {stu.name ? stu.name.charAt(0).toUpperCase() : '-'}
                                                                    </div>
                                                                </td>

                                                                {/* NIM */}
                                                                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                                    {stu.identity_number || stu.username}
                                                                </td>

                                                                {/* Nama Mahasiswa */}
                                                                <td className="py-3 px-4">
                                                                    <p className="font-bold text-slate-900 truncate">{stu.name}</p>
                                                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                                                        {stu.email || '-'}
                                                                    </p>
                                                                </td>

                                                                {/* Angkatan */}
                                                                <td className="py-3 px-3 text-center font-bold text-slate-700">
                                                                    {stu.batch_year || year || '-'}
                                                                </td>

                                                                {/* Dosen PA */}
                                                                <td className="py-3 px-4">
                                                                    {advisor ? (
                                                                        <div className="flex items-center space-x-1.5">
                                                                            <span className="p-1 rounded-md bg-teal-100 text-teal-800">
                                                                                <UserCheck className="w-3 h-3" />
                                                                            </span>
                                                                            <span className="font-bold text-slate-900 truncate">
                                                                                {advisor.name}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-rose-500 italic text-[10.5px] font-bold">
                                                                            Belum Diplot PA
                                                                        </span>
                                                                    )}
                                                                </td>

                                                                {/* Status KRS */}
                                                                <td className="py-3 px-3 text-center">
                                                                    {stu.krs_status === 'DISETUJUI' ? (
                                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                                                                            Disetujui
                                                                        </span>
                                                                    ) : stu.krs_status === 'DIAJUKAN' ? (
                                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800">
                                                                            Diajukan
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-600">
                                                                            Belum KRS
                                                                        </span>
                                                                    )}
                                                                </td>

                                                                {/* Status Bimbingan */}
                                                                <td className="py-3 px-3 text-center">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                                                        advisor ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                        {advisor ? 'Aktif Terbimbing' : 'Perlu Plotting'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* =============================================================
                                TAB CONTENT 4: USER PORTAL MAHASISWA
                               ============================================================= */}
                            {activeTab === 'portal' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                                            <tr>
                                                <th className="py-3 px-2 w-10 text-center">No.</th>
                                                <th className="py-3 px-3 w-40 text-center">Aksi Portal</th>
                                                <th className="py-3 px-3 text-center w-12">Foto</th>
                                                <th className="py-3 px-4 w-36 font-mono">NIM / Username</th>
                                                <th className="py-3 px-4">Nama Mahasiswa</th>
                                                <th className="py-3 px-4">Email Terdaftar</th>
                                                <th className="py-3 px-3 text-center">Status Akun</th>
                                                <th className="py-3 px-3 text-center">Status Sandi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px]">
                                            {studentList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                                                        Tidak ada data mahasiswa yang sesuai dengan filter pencarian ini.
                                                    </td>
                                                </tr>
                                            ) : (
                                                studentList.map((stu, idx) => {
                                                    return (
                                                        <tr key={stu.id} className="hover:bg-slate-50/80 transition">
                                                            {/* Number */}
                                                            <td className="py-3 px-2 text-center font-bold text-slate-400 text-[10px]">
                                                                {(studentsData?.from || 1) + idx}
                                                            </td>

                                                            {/* Aksi Portal */}
                                                            <td className="py-3 px-3 text-center">
                                                                <div className="flex items-center justify-center space-x-1.5">
                                                                    {/* Reset Password */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleResetPassword(stu)}
                                                                        className="px-2 py-1 bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
                                                                        title="Reset Password default (salam123)"
                                                                    >
                                                                        <KeyRound className="w-3 h-3" />
                                                                        <span>Reset Sandi</span>
                                                                    </button>

                                                                    {/* Login Portal */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setImpersonateUser(stu);
                                                                            setIsImpersonateOpen(true);
                                                                        }}
                                                                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
                                                                        title="Login Menyamar ke Portal Mahasiswa"
                                                                    >
                                                                        <Eye className="w-3 h-3" />
                                                                        <span>Masuk</span>
                                                                    </button>
                                                                </div>
                                                            </td>

                                                            {/* Foto Profile */}
                                                            <td className="py-3 px-3 text-center">
                                                                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center mx-auto text-[10px] border border-slate-200">
                                                                    {stu.name ? stu.name.charAt(0).toUpperCase() : '-'}
                                                                </div>
                                                            </td>

                                                            {/* NIM */}
                                                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                                {stu.identity_number || stu.username}
                                                            </td>

                                                            {/* Nama Mahasiswa */}
                                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                                {stu.name}
                                                            </td>

                                                            {/* Email */}
                                                            <td className="py-3 px-4 text-slate-600">
                                                                {stu.email || '-'}
                                                            </td>

                                                            {/* Status Akun */}
                                                            <td className="py-3 px-3 text-center">
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                                                    stu.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                    {stu.is_active ? 'Aktif' : 'Nonaktif'}
                                                                </span>
                                                            </td>

                                                            {/* Status Sandi */}
                                                            <td className="py-3 px-3 text-center">
                                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                                    Tersedia
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* PAGINATION FOOTER */}
                            {studentsData && studentsData.total > 0 && (
                                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/50">
                                    <div className="text-slate-500 text-[11px]">
                                        Menampilkan <strong className="text-slate-800">{studentsData.from || 0}</strong> - <strong className="text-slate-800">{studentsData.to || 0}</strong> dari <strong className="text-slate-800">{studentsData.total}</strong> mahasiswa
                                    </div>

                                    {/* Pagination Links (Async click) */}
                                    <div className="flex items-center space-x-1">
                                        {studentsData.links?.map((link, index) => {
                                            if (!link.url && link.label.includes('Previous')) return null;
                                            if (!link.url && link.label.includes('Next')) return null;

                                            return (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={(e) => handlePaginationClick(e, link.url)}
                                                    disabled={!link.url || link.active}
                                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                                                        link.active 
                                                            ? 'bg-teal-600 text-white shadow-xs cursor-default' 
                                                            : link.url 
                                                            ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200' 
                                                            : 'text-slate-400 cursor-not-allowed opacity-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* =========================================================================
                MODAL 1: TAMBAH MAHASISWA BARU
               ========================================================================= */}
            {isCreateOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsCreateOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                                    <UserPlus className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">Tambah Mahasiswa Baru</h3>
                                    <p className="text-[11px] text-slate-300">Pendaftaran akun mahasiswa dan nomor induk</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsCreateOpen(false)} 
                                className="p-1.5 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCreate} className="p-5 space-y-3 text-xs">
                            {/* Active Context Banner */}
                            {currentProdi && (
                                <div className="p-2.5 bg-teal-50 border border-teal-200/90 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center space-x-2 min-w-0">
                                        <div className="p-1 bg-teal-600 text-white rounded-lg shrink-0">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="truncate">
                                            <p className="font-bold text-teal-950 truncate text-[11px]">{currentProdi.name} ({currentProdi.degree || 'S1'})</p>
                                            <p className="text-[10px] text-teal-700 font-semibold">Tahun Angkatan: <strong className="font-bold">{year || 'Tahun Berjalan'}</strong></p>
                                        </div>
                                    </div>
                                    <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
                                        {currentProdi.national_code || currentProdi.code}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap Mahasiswa:</label>
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Muhammad Farhan Al-Ghifari"
                                    className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Induk Mahasiswa (NIM):</label>
                                    <input
                                        type="text"
                                        value={createForm.data.identity_number}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            createForm.setData(prev => ({
                                                ...prev,
                                                identity_number: val,
                                                email: (!prev.email || prev.email.endsWith('@staialittihad.ac.id')) && val ? `${val}@staialittihad.ac.id` : prev.email
                                            }));
                                        }}
                                        placeholder="Contoh: 26010042"
                                        className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Jenis Kelamin:</label>
                                    <select
                                        value={createForm.data.gender}
                                        onChange={(e) => createForm.setData('gender', e.target.value)}
                                        className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                                    >
                                        <option value="L">Laki-laki (L)</option>
                                        <option value="P">Perempuan (P)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK - 16 Digit):</label>
                                <input
                                    type="text"
                                    maxLength={16}
                                    value={createForm.data.nik}
                                    onChange={(e) => createForm.setData('nik', e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="Contoh: 3203012101020042 (16 digit)"
                                    className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Program Studi:</label>
                                <select
                                    value={createForm.data.study_program}
                                    onChange={(e) => createForm.setData('study_program', e.target.value)}
                                    className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                                    required
                                >
                                    {studyPrograms.map(p => (
                                        <option key={p.id} value={`${p.name} (${p.degree})`}>
                                            {p.name} ({p.degree}) - {p.code}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Mahasiswa:</label>
                                    <input
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        placeholder="farhan@staialittihad.ac.id"
                                        className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">No. WhatsApp / HP:</label>
                                    <input
                                        type="text"
                                        value={createForm.data.phone_number}
                                        onChange={(e) => createForm.setData('phone_number', e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                🔒 Password default untuk login pertama mahasiswa adalah: <strong className="text-slate-800 font-mono">salam123</strong>
                            </p>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4.5 py-2 text-[11px] font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {createForm.processing ? 'Menyimpan...' : 'Daftarkan Mahasiswa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 2: EDIT DATA MAHASISWA
               ========================================================================= */}
            {isEditOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsEditOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                                    <Edit2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">Edit Profil Mahasiswa</h3>
                                    <p className="text-[11px] text-slate-300">Perbarui data induk dan status akun mahasiswa</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsEditOpen(false)} 
                                className="p-1.5 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap Mahasiswa:</label>
                                <input
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Induk Mahasiswa (NIM):</label>
                                    <input
                                        type="text"
                                        value={editForm.data.identity_number}
                                        onChange={(e) => editForm.setData('identity_number', e.target.value)}
                                        className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Jenis Kelamin:</label>
                                    <select
                                        value={editForm.data.gender}
                                        onChange={(e) => editForm.setData('gender', e.target.value)}
                                        className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                                    >
                                        <option value="L">Laki-laki (L)</option>
                                        <option value="P">Perempuan (P)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK - 16 Digit):</label>
                                <input
                                    type="text"
                                    maxLength={16}
                                    value={editForm.data.nik}
                                    onChange={(e) => editForm.setData('nik', e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="Contoh: 3203012101020042 (16 digit)"
                                    className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Program Studi:</label>
                                <select
                                    value={editForm.data.study_program}
                                    onChange={(e) => editForm.setData('study_program', e.target.value)}
                                    className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                                    required
                                >
                                    {studyPrograms.map(p => (
                                        <option key={p.id} value={`${p.name} (${p.degree})`}>
                                            {p.name} ({p.degree}) - {p.code}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Mahasiswa:</label>
                                    <input
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="w-full text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">No. WhatsApp / HP:</label>
                                    <input
                                        type="text"
                                        value={editForm.data.phone_number}
                                        onChange={(e) => editForm.setData('phone_number', e.target.value)}
                                        className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center space-x-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
                                />
                                <span className="text-[11px] font-bold text-slate-700">
                                    Akun Aktif (Dapat Login & Mengisi KRS)
                                </span>
                            </label>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4.5 py-2 text-[11px] font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 3: IMPORT DATA MAHASISWA DARI EXCEL
               ========================================================================= */}
            {isImportOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsImportOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30 flex items-center justify-center font-black">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">Import Data Mahasiswa (Excel)</h3>
                                    <p className="text-[11px] text-slate-300">Impor massal data induk mahasiswa baru secara instan</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsImportOpen(false)} 
                                className="p-1.5 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-xs">
                            {/* Step 1: Upload File & Download Template */}
                            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 flex items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-xs font-bold text-teal-950">Gunakan Template Resmi</h4>
                                    <p className="text-[11px] text-teal-700/80 mt-0.5">
                                        Unduh template spreadsheet resmi agar kolom dan format NIM sesuai standar SIAKAD.
                                    </p>
                                </div>
                                <a
                                    href="/admin/students/template-excel"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-1.5 bg-white text-teal-700 hover:bg-teal-600 hover:text-white border border-teal-200 font-bold rounded-xl text-[11px] transition shadow-2xs shrink-0 flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <Download className="w-3 h-3" />
                                    <span>Unduh Template</span>
                                </a>
                            </div>

                            {/* Dropzone File Upload */}
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".xls,.xlsx,.csv"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-6 border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl text-center cursor-pointer bg-slate-50 hover:bg-teal-50/30 transition group"
                                >
                                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-teal-600 mx-auto mb-2 transition" />
                                    <p className="text-xs font-bold text-slate-800">
                                        {importFileName ? `File Terpilih: ${importFileName}` : 'Klik untuk Pilih File Excel / CSV'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">Mendukung format .xlsx, .xls, dan .csv</p>
                                </div>
                            </div>

                            {/* Error Alert */}
                            {importError && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold flex items-center space-x-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>{importError}</span>
                                </div>
                            )}

                            {/* Live Analysis Preview */}
                            {isCheckingImport && (
                                <div className="py-6 text-center text-slate-500 text-xs">
                                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-600 mb-2" />
                                    <span>Menganalisis baris data dan memeriksa duplikasi NIM...</span>
                                </div>
                            )}

                            {importSummary && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Baris</span>
                                            <h5 className="text-base font-black text-slate-900 mt-0.5">{importSummary.total}</h5>
                                        </div>
                                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                                            <span className="text-[10px] font-bold text-emerald-700 uppercase">Data Baru</span>
                                            <h5 className="text-base font-black text-emerald-700 mt-0.5">{importSummary.new_count}</h5>
                                        </div>
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                                            <span className="text-[10px] font-bold text-amber-800 uppercase">Duplikat NIM</span>
                                            <h5 className="text-base font-black text-amber-800 mt-0.5">{importSummary.duplicate_count}</h5>
                                        </div>
                                    </div>

                                    {/* Conflict Resolution Mode */}
                                    {importSummary.duplicate_count > 0 && (
                                        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                                            <span className="text-[11px] font-black text-amber-900 block">
                                                Penanganan Data Duplikat / Sudah Ada:
                                            </span>
                                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                                <label className={`p-2.5 rounded-lg border cursor-pointer flex items-center space-x-2 transition ${
                                                    conflictMode === 'skip' ? 'bg-white border-amber-400 font-bold text-amber-950 shadow-2xs' : 'bg-white/50 border-amber-200 text-slate-600'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="conflictMode"
                                                        value="skip"
                                                        checked={conflictMode === 'skip'}
                                                        onChange={() => setConflictMode('skip')}
                                                        className="text-amber-600"
                                                    />
                                                    <span>Lewati Duplikat (Aman)</span>
                                                </label>

                                                <label className={`p-2.5 rounded-lg border cursor-pointer flex items-center space-x-2 transition ${
                                                    conflictMode === 'overwrite' ? 'bg-white border-amber-400 font-bold text-amber-950 shadow-2xs' : 'bg-white/50 border-amber-200 text-slate-600'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="conflictMode"
                                                        value="overwrite"
                                                        checked={conflictMode === 'overwrite'}
                                                        onChange={() => setConflictMode('overwrite')}
                                                        className="text-amber-600"
                                                    />
                                                    <span>Timpa / Perbarui Eksisting</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Success notification */}
                            {importResult && (
                                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
                                    <div className="flex items-center space-x-2 font-black text-xs">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>{importResult.message}</span>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsImportOpen(false)}
                                    className="px-4 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    {importResult ? 'Tutup' : 'Batal'}
                                </button>
                                {importSummary && !importResult && (
                                    <button
                                        type="button"
                                        onClick={handleExecuteImport}
                                        disabled={isProcessingImport}
                                        className="px-5 py-2 text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                                    >
                                        {isProcessingImport ? `Memproses (${importProgress}%)...` : `Eksekusi Impor (${importSummary.total} Data)`}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 4: KONFIRMASI HAPUS DATA (SINGLE & BULK DELETE)
               ========================================================================= */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmDelete}
                title={deleteModal.title}
                message={deleteModal.message}
                itemName={deleteModal.itemName}
                itemType={deleteModal.itemType}
                confirmText={deleteModal.isBulk ? `Ya, Hapus ${deleteModal.ids.length} Data` : 'Ya, Hapus Data'}
                cancelText="Batal"
                isLoading={deleteModal.isLoading}
                variant="danger"
            />

            {/* =========================================================================
                MODAL 5: IMPERSONATION ENGINE (LOGIN SEBAGAI MAHASISWA)
               ========================================================================= */}
            {impersonateUser && (
                <ImpersonationModal
                    isOpen={isImpersonateOpen}
                    onClose={() => {
                        setIsImpersonateOpen(false);
                        setImpersonateUser(null);
                    }}
                    user={impersonateUser}
                />
            )}

            {/* =========================================================================
                MODAL 6: SET KURIKULUM MAHASISWA (SINGLE & MASSAL)
               ========================================================================= */}
            {isAssignCurriculumModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsAssignCurriculumModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-purple-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                                    <Settings2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">Plotting Kurikulum Mahasiswa</h3>
                                    <p className="text-[11px] text-slate-300">Penetapan paket kurikulum & standar kelulusan</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAssignCurriculumModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleExecuteAssignCurriculum} className="p-6 space-y-4">
                            {/* Selected Info Banner */}
                            <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center space-x-3">
                                <BookOpen className="w-5 h-5 text-purple-600 shrink-0" />
                                <div className="text-xs">
                                    <p className="font-bold text-purple-950">
                                        Target: <span className="underline">{selectedIds.length} Mahasiswa Terpilih</span>
                                    </p>
                                    <p className="text-[11px] text-purple-800 mt-0.5">
                                        {currentProdi ? `${currentProdi.name} (${currentProdi.degree || 'S1'})` : 'Semua Program Studi'} • Angkatan {year || 'Semua'}
                                    </p>
                                </div>
                            </div>

                            {/* Select Kurikulum */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                                    Pilih Paket Kurikulum Aktif <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={selectedCurriculumId}
                                    onChange={(e) => setSelectedCurriculumId(e.target.value)}
                                    required
                                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-bold text-slate-800 cursor-pointer"
                                >
                                    <option value="">-- Pilih Kurikulum --</option>
                                    {curricula
                                        .filter(c => !currentProdi || !c.study_program_id || String(c.study_program_id) === String(currentProdi.id))
                                        .map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.code} - {c.name} ({c.total_credits_required || 144} SKS • Mulai: {c.start_year || '-'})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Success message */}
                            {curriculumSuccessMsg && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{curriculumSuccessMsg}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignCurriculumModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAssigningCurriculum || !selectedCurriculumId}
                                    className="px-5 py-2 text-xs font-black bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-600/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {isAssigningCurriculum ? 'Menetapkan...' : `Terapkan ke ${selectedIds.length} Mahasiswa`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 7: PLOT DOSEN PEMBIMBING AKADEMIK (DOSEN WALI)
               ========================================================================= */}
            {isAssignAdvisorModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsAssignAdvisorModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">Plotting Dosen Pembimbing (PA)</h3>
                                    <p className="text-[11px] text-slate-300">Penugasan Dosen Wali untuk bimbingan & persetujuan KRS</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAssignAdvisorModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleExecuteAssignAdvisor} className="p-6 space-y-4">
                            {/* Selected Info Banner */}
                            <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center space-x-3">
                                <UserCheck className="w-5 h-5 text-teal-600 shrink-0" />
                                <div className="text-xs">
                                    <p className="font-bold text-teal-950">
                                        Target: <span className="underline">{selectedIds.length} Mahasiswa Terpilih</span>
                                    </p>
                                    <p className="text-[11px] text-teal-800 mt-0.5">
                                        {currentProdi ? `${currentProdi.name} (${currentProdi.degree || 'S1'})` : 'Semua Program Studi'} • Angkatan {year || 'Semua'}
                                    </p>
                                </div>
                            </div>

                            {/* Select Dosen */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                                    Pilih Dosen Wali / Pembimbing <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={selectedAdvisorId}
                                    onChange={(e) => setSelectedAdvisorId(e.target.value)}
                                    required
                                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-slate-800 cursor-pointer"
                                >
                                    <option value="">-- Pilih Dosen PA --</option>
                                    {lecturers.map(l => (
                                        <option key={l.id} value={l.id}>
                                            {l.name} {l.identity_number ? `(NIP/NIDN: ${l.identity_number})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Success message */}
                            {advisorSuccessMsg && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{advisorSuccessMsg}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignAdvisorModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAssigningAdvisor || !selectedAdvisorId}
                                    className="px-5 py-2 text-xs font-black bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {isAssigningAdvisor ? 'Menugaskan...' : `Plot ke ${selectedIds.length} Mahasiswa`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 8: CATATAN SESI BIMBINGAN AKADEMIK
               ========================================================================= */}
            {isNoteModalOpen && selectedStudentForNote && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsNoteModalOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white">Catatan Bimbingan Akademik</h3>
                                    <p className="text-[11px] text-slate-300">Dokumentasi sesi konsultasi & rekomendasi studi</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsNoteModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNote} className="p-6 space-y-4">
                            {/* Student & Advisor Info Banner */}
                            <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-600">Mahasiswa:</span>
                                    <span className="font-black text-slate-900">{selectedStudentForNote.name} ({selectedStudentForNote.identity_number || selectedStudentForNote.username})</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-600">Dosen Pembimbing:</span>
                                    <span className="font-black text-teal-800">{selectedStudentForNote.advisor?.name || 'Dosen PA'}</span>
                                </div>
                            </div>

                            {/* Topik */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                                    Topik Pembahasan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={noteForm.topic}
                                    onChange={(e) => setNoteForm(prev => ({ ...prev, topic: e.target.value }))}
                                    required
                                    placeholder="Contoh: Konsultasi Rencana Studi Semester Genap"
                                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                                />
                            </div>

                            {/* Catatan Diskusi */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                                    Catatan Diskusi / Masalah Akademik
                                </label>
                                <textarea
                                    rows={3}
                                    value={noteForm.discussion_notes}
                                    onChange={(e) => setNoteForm(prev => ({ ...prev, discussion_notes: e.target.value }))}
                                    placeholder="Ringkasan poin-poin yang dibahas selama sesi bimbingan..."
                                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                                />
                            </div>

                            {/* Rekomendasi Solusi */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                                    Rekomendasi / Solusi Dosen Wali
                                </label>
                                <textarea
                                    rows={2}
                                    value={noteForm.recommendations}
                                    onChange={(e) => setNoteForm(prev => ({ ...prev, recommendations: e.target.value }))}
                                    placeholder="Saran perbaikan, mata kuliah yang disarankan, dll..."
                                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                                />
                            </div>

                            {/* Success message */}
                            {noteSuccessMsg && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{noteSuccessMsg}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsNoteModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingNote || !noteForm.topic}
                                    className="px-5 py-2 text-xs font-black bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{isSavingNote ? 'Menyimpan...' : 'Simpan Catatan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
