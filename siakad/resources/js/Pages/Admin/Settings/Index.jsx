import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { Settings, ShieldAlert, Database, Server, Save, CheckCircle2, RefreshCw, CreditCard, Sliders, Landmark, Cpu } from 'lucide-react';

export default function SettingsIndex({ settings, isMaintenance, systemInfo = {} }) {
    const { auth } = usePage().props;
    const isSuperadmin = auth?.user?.role === 'superadmin';

    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
    const [isClearingCache, setIsClearingCache] = useState(false);

    const { data, setData, post, processing } = useForm({
        institution_name: settings?.institution_name?.value || 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
        institution_code: settings?.institution_code?.value || '213042',
        bsi_prefix: settings?.bsi_prefix?.value || '9928',
        bsi_merchant_id: settings?.bsi_merchant_id?.value || 'stai_alittihad_bsi_client_2026',
        lms_gateway_url: settings?.lms_gateway_url?.value || 'http://localhost:5000/api/v1',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/settings');
    };

    const handleConfirmToggleMaintenance = () => {
        setIsTogglingMaintenance(true);
        router.post('/admin/settings/maintenance', {}, {
            preserveScroll: true,
            onFinish: () => {
                setIsTogglingMaintenance(false);
                setIsMaintenanceModalOpen(false);
            }
        });
    };

    const handleClearCache = () => {
        setIsClearingCache(true);
        router.post('/admin/settings/clear-cache', {}, {
            preserveScroll: true,
            onFinish: () => setIsClearingCache(false)
        });
    };

    return (
        <AppLayout title="Pengaturan & Pemeliharaan">
            <Head title="Pengaturan Sistem" />

            <div className="space-y-6 max-w-4xl">
                {/* Header */}
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Pengaturan Sistem & Pemeliharaan</h2>
                    <p className="text-xs text-slate-500">Konfigurasi parameter institusi, API Host-to-Host BSI, LMS Gateway, dan mode darurat.</p>
                </div>

                {/* 1. EMERGENCY MAINTENANCE CARD */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                        <div className={`p-3 rounded-xl ${isMaintenance ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Mode Pemeliharaan (Maintenance Mode)</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Status Saat Ini:{' '}
                                <strong className={isMaintenance ? 'text-rose-600' : 'text-emerald-600'}>
                                    {isMaintenance ? 'AKTIF (Sistem Terkunci)' : 'ONLINE NORMAL'}
                                </strong>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Saat aktif, hanya Superadmin dengan secret bypass key yang dapat mengakses sistem.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMaintenanceModalOpen(true)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition shadow cursor-pointer ${
                            isMaintenance
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                    >
                        {isMaintenance ? 'Kembalikan Sistem Online' : 'Aktifkan Mode Maintenance'}
                    </button>
                </div>

                {/* 2. SYSTEM CACHE & OPTIMIZATION CARD (Khusus Superadmin) */}
                {isSuperadmin && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3">
                            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Optimasi Cache & Diagnostik Server</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-600 font-mono">
                                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">PHP {systemInfo.php_version || '8.3'}</span>
                                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Laravel {systemInfo.laravel_version || '13'}</span>
                                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">DB: {systemInfo.db_driver || 'pgsql'}</span>
                                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Env: {systemInfo.environment || 'local'}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Bersihkan cache framework, view, route, dan konfigurasi jika terjadi ketidaksesuaian data.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClearCache}
                            disabled={isClearingCache}
                            className="px-4 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition shadow cursor-pointer flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isClearingCache ? 'animate-spin' : ''}`} />
                            <span>{isClearingCache ? 'Membersihkan...' : 'Bersihkan Cache Sistem'}</span>
                        </button>
                    </div>
                )}

                {/* 2. GENERAL SETTINGS FORM */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                            1. Identitas Institusi Perguruan Tinggi
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Nama Perguruan Tinggi / Kampus:</label>
                                <input
                                    type="text"
                                    value={data.institution_name}
                                    onChange={(e) => setData('institution_name', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Kode Perguruan Tinggi (PDDIKTI):</label>
                                <input
                                    type="text"
                                    value={data.institution_code}
                                    onChange={(e) => setData('institution_code', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                                    required
                                />
                            </div>
                        </div>

                        {isSuperadmin && (
                            <>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 pt-4">
                                    2. Gateway Pembayaran & Integrasi Eksternal
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Prefix BSI Virtual Account (VA):</label>
                                        <input
                                            type="text"
                                            value={data.bsi_prefix}
                                            onChange={(e) => setData('bsi_prefix', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                                            placeholder="Contoh: 9928"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Merchant ID BSI H2H:</label>
                                        <input
                                            type="text"
                                            value={data.bsi_merchant_id}
                                            onChange={(e) => setData('bsi_merchant_id', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">URL Gateway Integrasi SALAM LMS:</label>
                                    <input
                                        type="url"
                                        value={data.lms_gateway_url}
                                        onChange={(e) => setData('lms_gateway_url', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                                        placeholder="https://lms.stai-alittihad.ac.id/api"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Digunakan untuk sinkronisasi otomatis data kelas dan nilai tugas/CBT secara real-time.
                                    </p>
                                </div>

                                {/* Link Banner ke Modul BSI Gateway Dedicated */}
                                <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2.5 bg-white/10 rounded-xl">
                                            <Landmark className="w-5 h-5 text-emerald-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-xs">Pusat Kontrol BSI Smart Billing, SNAP Inquiry & Push Webhook</h4>
                                            <p className="text-[11px] text-emerald-200 mt-0.5 max-w-xl">
                                                Konfigurasi kode institusi biller (8891/9928), token otentikasi HTTP & H2H Service Code 73, URL inquiry & payment callback, simulator sandbox, serta saldo rekening giro penampung BSI.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/admin/bsi-gateway"
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center space-x-1.5 cursor-pointer shrink-0"
                                    >
                                        <Sliders className="w-3.5 h-3.5" />
                                        <span>Pusat Kontrol BSI →</span>
                                    </Link>
                                </div>
                            </>
                        )}

                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>Simpan Perubahan Pengaturan</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL KONFIRMASI MODE PEMELIHARAAN */}
            <DeleteConfirmationModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                onConfirm={handleConfirmToggleMaintenance}
                title={isMaintenance ? 'Kembalikan Sistem ke Online?' : 'Aktifkan Mode Pemeliharaan?'}
                message={
                    isMaintenance
                        ? 'Sistem akan dibuka kembali untuk seluruh mahasiswa, dosen, dan staf kampus untuk mengakses perkuliahan.'
                        : 'Sistem akan dikunci ke Mode Pemeliharaan (Maintenance Mode). Hanya Superadmin yang dapat login dan mengakses SIAKAD.'
                }
                itemName="Maintenance Mode"
                itemType="Keamanan & Pemeliharaan Sistem"
                confirmText={isMaintenance ? 'Ya, Buka Sistem Online' : 'Ya, Aktifkan Maintenance'}
                cancelText="Batal"
                variant={isMaintenance ? 'info' : 'warning'}
                isLoading={isTogglingMaintenance}
            />
        </AppLayout>
    );
}
