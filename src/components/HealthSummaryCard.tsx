import React from 'react';
import { 
  Heart, 
  Activity, 
  Droplets, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  Scale,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { HealthEntry } from '../types';
import { cekDiagnosa, hitungBMI } from '../utils/healthCalculations';

interface HealthSummaryCardProps {
  entries: HealthEntry[];
}

export const HealthSummaryCard: React.FC<HealthSummaryCardProps> = ({ entries }) => {
  if (entries.length === 0) return null;

  // Get most recent entry
  const sortedEntries = [...entries].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  const latest = sortedEntries[0];

  const bpDiagSistolik = cekDiagnosa(latest.sistolik, 'sistolik');
  const bpDiagDiastolik = cekDiagnosa(latest.diastolik, 'diastolik');
  const gulaDiag = cekDiagnosa(latest.gula, 'gula');
  const lsmDiag = cekDiagnosa(latest.lsm, 'lsm');
  const capDiag = cekDiagnosa(latest.cap, 'cap');
  const egfrDiag = cekDiagnosa(latest.egfr, 'egfr');
  const bmiInfo = hitungBMI(latest.beratBadan, latest.tinggiBadan);

  const formattedDate = new Date(latest.tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700/50 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">Ringkasan Status Kesehatan Terkini</h3>
            <p className="text-xs text-slate-400">Hasil rekam medis terakhir pada: <strong className="text-slate-200">{formattedDate}</strong></p>
          </div>
        </div>

        {latest.catatan && (
          <span className="text-xs px-3 py-1 bg-white/10 rounded-full text-slate-300 border border-white/10 max-w-xs truncate">
            📝 {latest.catatan}
          </span>
        )}
      </div>

      {/* Grid of Key Summary Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-4">
        
        {/* 1. Tekanan Darah */}
        <div className="bg-white/5 hover:bg-white/10 transition backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Tekanan Darah
            </span>
          </div>
          <div className="my-1.5">
            {latest.sistolik && latest.diastolik ? (
              <div className="text-xl font-black text-white">
                {latest.sistolik}/{latest.diastolik} <span className="text-xs font-normal text-slate-400">mmHg</span>
              </div>
            ) : (
              <div className="text-sm font-medium text-slate-400">-</div>
            )}
          </div>
          {bpDiagSistolik && (
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border w-fit ${bpDiagSistolik.kelas}`}>
              {bpDiagSistolik.teks}
            </span>
          )}
        </div>

        {/* 2. Gula Darah */}
        <div className="bg-white/5 hover:bg-white/10 transition backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Gula Darah
            </span>
          </div>
          <div className="my-1.5">
            {latest.gula ? (
              <div className="text-xl font-black text-white">
                {latest.gula} <span className="text-xs font-normal text-slate-400">mg/dL</span>
              </div>
            ) : (
              <div className="text-sm font-medium text-slate-400">-</div>
            )}
          </div>
          {gulaDiag && (
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border w-fit ${gulaDiag.kelas}`}>
              {gulaDiag.teks}
            </span>
          )}
        </div>

        {/* 3. FibroScan & Hati */}
        <div className="bg-white/5 hover:bg-white/10 transition backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              FibroScan Hati
            </span>
          </div>
          <div className="my-1.5">
            {latest.lsm !== undefined || latest.cap !== undefined ? (
              <div className="text-sm font-bold text-white flex items-baseline gap-2">
                <span>LSM: <strong>{latest.lsm ?? '-'}</strong> <small className="text-slate-400 font-normal">kPa</small></span>
                <span>CAP: <strong>{latest.cap ?? '-'}</strong> <small className="text-slate-400 font-normal">dB/m</small></span>
              </div>
            ) : (
              <div className="text-sm font-medium text-slate-400">-</div>
            )}
          </div>
          {lsmDiag && (
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border w-fit ${lsmDiag.kelas}`}>
              {lsmDiag.teks}
            </span>
          )}
        </div>

        {/* 4. Fungsi Ginjal (eGFR) / BMI */}
        <div className="bg-white/5 hover:bg-white/10 transition backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
              Fungsi Ginjal (eGFR)
            </span>
          </div>
          <div className="my-1.5">
            {latest.egfr ? (
              <div className="text-xl font-black text-white">
                {latest.egfr} <span className="text-xs font-normal text-slate-400">mL/min</span>
              </div>
            ) : latest.kreatinin ? (
              <div className="text-lg font-bold text-white">
                Kreatinin {latest.kreatinin} <span className="text-xs font-normal text-slate-400">mg/dL</span>
              </div>
            ) : (
              <div className="text-sm font-medium text-slate-400">-</div>
            )}
          </div>
          {egfrDiag && (
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border w-fit ${egfrDiag.kelas}`}>
              {egfrDiag.teks}
            </span>
          )}
        </div>

      </div>

    </div>
  );
};
