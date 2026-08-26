import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { Settings, ShieldAlert, Database, Server, Save, CheckCircle2, RefreshCw, CreditCard, Sliders, Landmark } from 'lucide-react';

export default function SettingsIndex({ settings, isMaintenance }) {
    const { auth } = usePage().props;
    const isSuperadmin = auth?.user?.role === 'superadmin';

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

    const handleToggleMaintenance = () => {
        if (confirm(`Apakah Anda yakin ingin ${isMaintenance ? 'MENONAKTIFKAN' : 'MENGAKTIFKAN'} Mode Pemeliharaan (Maintenance Mode)?`)) {
            router.post('/admin/settings/maintenance');
        }
    };

    return (
        <AppLayout title="Pengaturan & Pemeliharaan">
            <Head title="Pengaturan Sistem — SIAKAD" />

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
                        onClick={handleToggleMaintenance}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition shadow ${
                            isMaintenance
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                    >
                        {isMaintenance ? 'Kembalikan Sistem Online' : 'Aktifkan Mode Maintenance'}
                    </button>
                </div>

                {/* 2. GENERAL SETTINGS FORM */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                            1. Identitas Institusi Perguruan Tinggi
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Nama Perguruan Tinggi</label>
                                <input
                                    type="text"
                                    value={data.institution_name}
                                    onChange={(e) => setData('institution_name', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Kode PT (PDDIKTI / Kemenag)</label>
                                <input
                                    type="text"
                                    value={data.institution_code}
                                    onChange={(e) => setData('institution_code', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 pt-2">
                            2. Konfigurasi Bank Syariah Indonesia (BSI) VA Open API
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Prefix Institusi VA BSI (4 Digit)</label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={data.bsi_prefix}
                                    onChange={(e) => setData('bsi_prefix', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-black text-emerald-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">BSI Client / Merchant ID</label>
                                <input
                                    type="text"
                                    value={data.bsi_merchant_id}
                                    onChange={(e) => setData('bsi_merchant_id', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 pt-2">
                            3. Endpoint SALAM LMS Gateway
                        </h3>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">URL API Gateway SALAM LMS</label>
                            <input
                                type="url"
                                value={data.lms_gateway_url}
                                onChange={(e) => setData('lms_gateway_url', e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                                required
                            />
                        </div>

                        {/* 4. BSI SMART BILLING & VIRTUAL ACCOUNT H2H (KHUSUS SUPERADMIN) */}
                        {isSuperadmin && (
                            <>
                                <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider border-b border-emerald-100 pb-2 pt-2 flex items-center justify-between">
                                    <span className="flex items-center space-x-1.5">
                                        <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>4. Integrasi BSI Smart Billing H2H Direct (BI-SNAP)</span>
                                    </span>
                                    <span className="px-2 py-0.2 bg-amber-400 text-slate-950 rounded font-black text-[9px]">
                                        SUPERADMIN ONLY
                                    </span>
                                </h3>

                                <div className="p-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h4 className="font-black text-white text-xs">Pusat Kontrol BSI Smart Billing, SNAP Inquiry & Push Webhook</h4>
                                        <p className="text-[11px] text-emerald-200 mt-0.5 max-w-xl">
                                            Konfigurasi kode institusi biller (8891/9928), token otentikasi HTTP & H2H Service Code 73, URL inquiry & payment callback, simulator sandbox, serta saldo rekening giro penampung BSI.
                                        </p>
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
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow"
                            >
                                <Save className="w-4 h-4" />
                                <span>Simpan Perubahan Pengaturan</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
