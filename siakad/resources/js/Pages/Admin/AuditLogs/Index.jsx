import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    ShieldAlert, ShieldCheck, Search, Filter, Calendar, 
    Clock, Activity, User, Eye, ArrowRight, RefreshCw, 
    AlertTriangle, CheckCircle2, Lock, Terminal, KeyRound
} from 'lucide-react';

export default function AuditLogsIndex({ logs, stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [actionFilter, setActionFilter] = useState(filters.action || '');
    const [dateFilter, setDateFilter] = useState(filters.date || '');
    const [selectedLog, setSelectedLog] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/audit-logs', { search, action: actionFilter, date: dateFilter }, { preserveState: true });
    };

    const getActionBadge = (action) => {
        if (action.includes('IMPERSONATE')) {
            return { bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: '🎭' };
        }
        if (action.includes('GRADE')) {
            return { bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', icon: '📝' };
        }
        if (action.includes('PAYMENT') || action.includes('BSI')) {
            return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: '💳' };
        }
        if (action.includes('KRS')) {
            return { bg: 'bg-blue-100 text-blue-900 border-blue-300', icon: '📋' };
        }
        if (action.includes('LOGIN')) {
            return { bg: 'bg-purple-100 text-purple-900 border-purple-300', icon: '🔑' };
        }
        return { bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: '⚡' };
    };

    return (
        <AppLayout title="Visual Audit Log & Security Activity Tracker">
            <Head title="Audit Log — SIAKAD" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Audit Log Viewer & Security Tracker</h2>
                        <p className="text-xs text-slate-500">
                            Pencatatan real-time seluruh aktivitas otentikasi, impersonasi, approval KRS, perubahan nilai, dan transaksi perbankan.
                        </p>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-500">Total Log Tercatat</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stats.total || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-amber-600">Sesi Menyamar (Impersonate)</span>
                        <p className="text-2xl font-black text-amber-700 mt-1">{stats.impersonate || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-indigo-600">Perubahan Nilai DPNA</span>
                        <p className="text-2xl font-black text-indigo-700 mt-1">{stats.grade || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-emerald-600">Callback Pembayaran BSI</span>
                        <p className="text-2xl font-black text-emerald-700 mt-1">{stats.payment || 0}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
                    <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama aktor, IP address, entitas, atau kata kunci..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <select
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value);
                                router.get('/admin/audit-logs', { search, action: e.target.value, date: dateFilter }, { preserveState: true });
                            }}
                            className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                        >
                            <option value="">Semua Aksi Event</option>
                            <option value="LOGIN">LOGIN</option>
                            <option value="IMPERSONATE_START">IMPERSONATE_START</option>
                            <option value="GRADE_UPDATE">GRADE_UPDATE</option>
                            <option value="KRS_APPROVE">KRS_APPROVE</option>
                            <option value="BSI_PAYMENT_CALLBACK">BSI_PAYMENT_CALLBACK</option>
                        </select>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                router.get('/admin/audit-logs', { search, action: actionFilter, date: e.target.value }, { preserveState: true });
                            }}
                            className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Waktu (Timestamp)</th>
                                    <th className="py-3 px-4">Aktor Pengguna</th>
                                    <th className="py-3 px-4">Aksi Event</th>
                                    <th className="py-3 px-4">Target Entitas</th>
                                    <th className="py-3 px-4">IP Address & Device</th>
                                    <th className="py-3 px-4 text-right">Rincian Payload</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                                            Tidak ada data log audit yang sesuai.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => {
                                        const badge = getActionBadge(log.action);
                                        const detailsObj = typeof log.details === 'string' ? JSON.parse(log.details) : (log.details || {});
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50 transition">
                                                <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                                    {log.created_at?.slice(0, 19).replace('T', ' ')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                                                            {(log.actor_name || detailsObj.user_name || 'S').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{log.actor_name || detailsObj.user_name || 'System Auto'}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono">{log.actor_role || detailsObj.user_role || 'system'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase inline-flex items-center space-x-1 ${badge.bg}`}>
                                                        <span>{badge.icon}</span>
                                                        <span>{log.action}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                                    {log.target_entity ? `${log.target_entity} #${log.target_id || ''}` : '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-mono text-[11px] font-bold text-slate-800 block">{log.ip_address}</span>
                                                    <span className="text-[10px] text-slate-400 truncate max-w-xs block">{log.user_agent}</span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold transition flex items-center space-x-1 ml-auto"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Inspeksi</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Menampilkan {logs.from || 0} - {logs.to || 0} dari {logs.total} log aktivitas
                        </span>
                        <div className="flex items-center space-x-1">
                            {logs.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                        link.active
                                            ? 'bg-emerald-600 text-white'
                                            : link.url
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            : 'text-slate-300 pointer-events-none'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* MODAL INSPEKSI LOG DETAIL */}
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-900 uppercase">Inspeksi Data Log #{selectedLog.id}</h3>
                                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Tutup</button>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Aksi:</span>
                                        <strong className="font-mono text-slate-900">{selectedLog.action}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Timestamp:</span>
                                        <strong className="font-mono text-slate-900">{selectedLog.created_at}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">IP Address:</span>
                                        <strong className="font-mono text-emerald-800">{selectedLog.ip_address}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Entitas Target:</span>
                                        <strong className="font-mono text-slate-900">{selectedLog.target_entity || '-'}</strong>
                                    </div>
                                </div>

                                <div>
                                    <span className="font-bold text-slate-700 block mb-1">Payload JSON Details:</span>
                                    <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48">
                                        {typeof selectedLog.details === 'string'
                                            ? JSON.stringify(JSON.parse(selectedLog.details), null, 2)
                                            : JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex justify-end pt-3 border-t border-slate-100">
                                <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold">Tutup</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
