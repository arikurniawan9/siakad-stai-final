import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Hapus Data',
    message = 'Apakah Anda yakin ingin menghapus data ini?',
    itemName = '',
    itemType = '',
    confirmText = 'Ya, Hapus Data',
    cancelText = 'Batal',
    isLoading = false,
    variant = 'danger' // 'danger' | 'warning' | 'info' | 'primary'
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (isOpen && !isLoading) onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    const isDanger = variant === 'danger';
    const isWarning = variant === 'warning';

    return (
        <div 
            onClick={(e) => {
                if (e.target === e.currentTarget && !isLoading) onClose();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
        >
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 relative">
                {/* Top Accent Header Bar */}
                <div className={`h-2.5 w-full ${
                    isDanger ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600' :
                    isWarning ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600' :
                    'bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600'
                }`} />

                <div className="p-6">
                    {/* Icon & Close */}
                    <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                            isDanger ? 'bg-rose-100/80 text-rose-600 shadow-rose-500/10' :
                            isWarning ? 'bg-amber-100/80 text-amber-600 shadow-amber-500/10' :
                            'bg-indigo-100/80 text-indigo-600 shadow-indigo-500/10'
                        }`}>
                            {isDanger ? (
                                <Trash2 className="w-6 h-6 stroke-[2.2]" />
                            ) : isWarning ? (
                                <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                            ) : (
                                <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mt-4">
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            {message}
                        </p>

                        {/* Item Card preview if provided */}
                        {(itemName || itemType) && (
                            <div className="mt-3.5 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                                <div className="min-w-0">
                                    {itemType && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                            {itemType}
                                        </span>
                                    )}
                                    <span className="text-xs font-black text-slate-800 truncate block">
                                        {itemName}
                                    </span>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ml-2 ${
                                    isDanger ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {isDanger ? 'Hapus' : 'Konfirmasi'}
                                </span>
                            </div>
                        )}

                        <div className="mt-4 flex items-center space-x-2 text-[11px] bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                            <span className="text-rose-500 font-bold shrink-0">⚠️ Catatan:</span>
                            <span className="text-rose-700 font-medium">Tindakan ini permanen dan data yang dihapus tidak dapat dipulihkan.</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center justify-end space-x-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-5 py-2 text-xs font-black text-white rounded-xl transition shadow-md cursor-pointer disabled:opacity-50 flex items-center space-x-1.5 ${
                                isDanger
                                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                                    : isWarning
                                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                            }`}
                        >
                            {isLoading ? (
                                <span>Memproses...</span>
                            ) : (
                                <>
                                    {isDanger ? <Trash2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                    <span>{confirmText}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
