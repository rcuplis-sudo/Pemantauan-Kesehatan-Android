import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  FileJson, 
  X, 
  AlertCircle,
  Calendar,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { HealthEntry, ParamKey, ParamGroupKey } from '../types';
import { paramConfig, groupConfigs, cekDiagnosa } from '../utils/healthCalculations';

interface DataTableSectionProps {
  entries: HealthEntry[];
  activeFilter: 'semua' | ParamGroupKey;
  onEditEntry: (id: string) => void;
  onDeleteParam: (id: string, key: ParamKey) => void;
  onDeleteEntry: (id: string) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
}

export const DataTableSection: React.FC<DataTableSectionProps> = ({
  entries,
  activeFilter,
  onEditEntry,
  onDeleteParam,
  onDeleteEntry,
  onExportCsv,
  onExportJson
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (entries.length === 0) return null;

  // Newest first for table
  const reversedEntries = [...entries].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // Filter entries
  const filteredEntries = reversedEntries.filter(entry => {
    // Search query match on date, note, or param label
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    if (entry.tanggal.toLowerCase().includes(query)) return true;
    if (entry.catatan && entry.catatan.toLowerCase().includes(query)) return true;

    // Check if any param name matches query
    for (const key of Object.keys(paramConfig) as ParamKey[]) {
      if (entry[key] !== undefined && entry[key] !== null) {
        const config = paramConfig[key];
        if (config.label.toLowerCase().includes(query) || config.shortLabel?.toLowerCase().includes(query)) {
          return true;
        }
      }
    }
    return false;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Riwayat & Log Rekam Medis</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {entries.length} rekam data tersimpan di memori perangkat
          </p>
        </div>

        {/* Action Controls: Search & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tanggal / parameter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="Unduh data riwayat dalam format spreadsheet CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Ekspor</span> CSV
          </button>

          {/* Export JSON Backup */}
          <button
            onClick={onExportJson}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="Cadangkan data ke file JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Backup</span> JSON
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3.5">Tanggal & Catatan</th>
              <th scope="col" className="px-5 py-3.5">Kategori</th>
              <th scope="col" className="px-5 py-3.5">Parameter Medis</th>
              <th scope="col" className="px-5 py-3.5">Nilai & Analisis</th>
              <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 text-xs">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Tidak ada catatan yang sesuai dengan filter atau pencarian Anda.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const dateObj = new Date(entry.tanggal);
                const formattedDate = dateObj.toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                // Get all valid params for this entry
                const paramKeys = (Object.keys(paramConfig) as ParamKey[]).filter(key => {
                  const val = entry[key];
                  if (val === undefined || val === null || isNaN(val as number)) return false;
                  
                  if (activeFilter !== 'semua') {
                    return paramConfig[key].group === activeFilter;
                  }
                  return true;
                });

                if (paramKeys.length === 0) return null;

                return paramKeys.map((key, pIdx) => {
                  const config = paramConfig[key];
                  const value = entry[key] as number;
                  const diagnosis = cekDiagnosa(value, key);
                  const isFirstRowOfEntry = pIdx === 0;

                  return (
                    <tr 
                      key={`${entry.id}-${key}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Date & Note Cell (spans visual grouping) */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-900">
                        {isFirstRowOfEntry ? (
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              {formattedDate}
                            </div>
                            {entry.catatan && (
                              <p className="text-[11px] text-slate-500 mt-0.5 italic">
                                📝 {entry.catatan}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px] pl-5">•</span>
                        )}
                      </td>

                      {/* Group Cell */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${groupConfigs[config.group]?.badgeBg}`}>
                          {groupConfigs[config.group]?.label}
                        </span>
                      </td>

                      {/* Parameter Name */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-800 font-semibold">
                        {config.label}
                      </td>

                      {/* Value and Diagnosis Badge */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">
                            {value} <span className="text-[11px] font-normal text-slate-400">{config.unit}</span>
                          </span>
                          {diagnosis && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${diagnosis.kelas}`}>
                              {diagnosis.teks}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Cell */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-slate-500">
                        <div className="flex items-center justify-end gap-1.5">
                          {isFirstRowOfEntry && (
                            <button
                              onClick={() => onEditEntry(entry.id)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Seluruh Catatan Tanggal Ini"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => onDeleteParam(entry.id, key)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title={`Hapus parameter ${config.label} ini`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
