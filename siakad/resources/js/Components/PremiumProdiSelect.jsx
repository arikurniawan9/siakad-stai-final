import React from 'react';
import { GraduationCap, BookOpen, ChevronDown, Award, Building2, AlertCircle } from 'lucide-react';

/**
 * Mapping gelar akademik resmi STAI Al-Ittihad Cianjur
 */
const DEGREE_TITLES = {
    PIAUD: 'S.Pd (Sarjana Pendidikan)',
    MPI: 'S.Pd (Sarjana Pendidikan)',
    ES: 'S.E (Sarjana Ekonomi)',
    BKI: 'S.Sos (Sarjana Sosial)',
    PAI: 'S.Pd (Sarjana Pendidikan)',
    HES: 'S.H (Sarjana Hukum)',
    PGMI: 'S.Pd (Sarjana Pendidikan)',
};

export default function PremiumProdiSelect({
    label,
    badge,
    value,
    onChange,
    options = [],
    placeholder = 'Pilih Program Studi...',
    isOptional = false,
    disabledIds = [],
    error = null,
    required = false,
    helperText = null,
    icon: IconComponent = GraduationCap,
}) {
    const selectedProdi = options.find(p => String(p.id) === String(value));
    const degreeTitle = selectedProdi ? (DEGREE_TITLES[selectedProdi.code] || `Sarjana (${selectedProdi.degree || 'S1'})`) : '';

    return (
        <div className={`p-4 rounded-2xl border-2 transition-all duration-200 bg-white shadow-xs ${
            error 
                ? 'border-rose-400 ring-2 ring-rose-500/20 bg-rose-50/10' 
                : 'border-slate-200 hover:border-emerald-400 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/15'
        }`}>
            {/* Header label & badge */}
            <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                    <span>{label}</span>
                    {required && <span className="text-rose-500 font-black">*</span>}
                </label>
                {badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        required 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                        {badge}
                    </span>
                )}
            </div>

            {/* Select Input Container */}
            <div className="relative flex items-center">
                <div className={`absolute left-3 w-9 h-9 rounded-xl flex items-center justify-center pointer-events-none shadow-xs transition-colors ${
                    selectedProdi ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                    <IconComponent className="w-4 h-4" />
                </div>

                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-14 pr-10 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs sm:text-sm appearance-none cursor-pointer focus:outline-none transition-all"
                >
                    {isOptional ? (
                        <option value="">{placeholder}</option>
                    ) : (
                        <option value="" disabled>{placeholder}</option>
                    )}
                    {options.map((prodi) => {
                        const isDisabled = disabledIds.includes(String(prodi.id)) || disabledIds.includes(Number(prodi.id));
                        return (
                            <option key={prodi.id} value={prodi.id} disabled={isDisabled}>
                                [{prodi.degree || 'S1'}] {prodi.code} - {prodi.name} (Akreditasi {prodi.accreditation || 'Baik Sekali'}){isDisabled ? ' [Sudah Dipilih di Pilihan 1]' : ''}
                            </option>
                        );
                    })}
                </select>

                <div className="absolute right-3.5 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            {/* Micro Info Chips: Muncul langsung di bawah select saat prodi dipilih */}
            {selectedProdi && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-slate-900 text-white rounded shadow-xs">
                        {selectedProdi.code}
                    </span>
                    <span className="font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        Gelar: {degreeTitle}
                    </span>
                    <span className="font-bold px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full flex items-center space-x-1">
                        <Award className="w-3 h-3 text-teal-600" />
                        <span>Akreditasi {selectedProdi.accreditation || 'Baik Sekali'}</span>
                    </span>
                    {selectedProdi.faculty_name && (
                        <span className="text-slate-500 font-medium px-1 flex items-center space-x-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{selectedProdi.faculty_name}</span>
                        </span>
                    )}
                </div>
            )}

            {helperText && !selectedProdi && !error && (
                <p className="text-slate-400 text-[10px] mt-2">{helperText}</p>
            )}

            {error && (
                <p className="text-rose-600 font-bold text-[11px] mt-1.5 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
}
