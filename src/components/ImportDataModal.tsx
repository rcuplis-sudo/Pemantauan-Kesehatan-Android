import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileJson, 
  FileSpreadsheet, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  ShieldCheck,
  Download
} from 'lucide-react';
import { HealthEntry } from '../types';
import { GoogleDriveService } from '../services/googleDriveService';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (entries: HealthEntry[], mode: 'replace' | 'merge') => void;
  onOpenGoogleDriveModal: () => void;
  currentEntriesCount: number;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onOpenGoogleDriveModal,
  currentEntriesCount
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<HealthEntry[] | null>(null);
  const [fileType, setFileType] = useState<'json' | 'csv' | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = (file: File) => {
    setErrorMessage(null);
    setSelectedFile(file);
    setIsLoading(true);
    setLoadingText('Menganalisis isi berkas...');

    const isJson = file.name.toLowerCase().endsWith('.json');
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt');

    if (!isJson && !isCsv) {
      setErrorMessage('Format berkas tidak didukung. Harap pilih berkas .json atau .csv.');
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (isJson) {
          setFileType('json');
          const raw = JSON.parse(text);
          let parsed: HealthEntry[] = [];
          if (Array.isArray(raw)) {
            parsed = raw;
          } else if (raw && Array.isArray(raw.data)) {
            parsed = raw.data;
          } else {
            throw new Error('Format JSON tidak sesuai dengan struktur data rekam medis.');
          }

          if (parsed.length === 0) {
            throw new Error('Berkas JSON tidak memuat data riwayat medis.');
          }
          setParsedPreview(parsed);
        } else if (isCsv) {
          setFileType('csv');
          const parsed = GoogleDriveService.parseCsv(text);
          setParsedPreview(parsed);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Gagal memproses berkas. Pastikan format berkas valid.');
        setParsedPreview(null);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Gagal membaca berkas dari perangkat Anda.');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleApplyImport = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    onImportSuccess(parsedPreview, importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedPreview(null);
    setFileType(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick pull from Google Drive
  const handleQuickDriveImport = async () => {
    setIsLoading(true);
    setLoadingText('Menghubungkan ke Google Drive Anda...');
    setErrorMessage(null);

    try {
      const latest = await GoogleDriveService.checkLatestCloudBackup();
      if (!latest || !latest.entries || latest.entries.length === 0) {
        setErrorMessage('Tidak ditemukan file cadangan di Google Drive akun ini.');
        return;
      }
      setFileType('json');
      setSelectedFile(new File([JSON.stringify(latest.entries)], latest.file.name, { type: 'application/json' }));
      setParsedPreview(latest.entries);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengambil cadangan dari Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Impor Rekam Medis</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/25">
                  JSON / CSV / Cloud
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Pulihkan atau masukkan data catatan kesehatan dari berkas lokal & Google Drive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-700">

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Google Drive Import Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Sinkronisasi Otomatis Google Drive</h4>
                <p className="text-[11px] text-slate-600">
                  Ambil cadangan terbaru yang tersimpan di Google Drive akun Anda
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleQuickDriveImport}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Tarik dari Drive
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone if no preview */}
          {!parsedPreview && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-blue-600 bg-blue-50/70 scale-[0.99]'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Pilih atau Tarik Berkas Cadangan ke Sini
                </h4>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  Mendukung berkas <strong>.JSON</strong> (cadangan HealthTrack) dan <strong>.CSV</strong> (tabel excel/spreadsheet)
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Jelajahi Berkas di Perangkat
                </button>
              </div>
            </div>
          )}

          {/* Preview Section if File Parsed */}
          {parsedPreview && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Berkas Berhasil Dibaca!</h4>
                    <p className="text-[11px] text-emerald-800">
                      Ditemukan <strong>{parsedPreview.length} catatan medis</strong> siap diimpor.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-rose-600 underline font-medium cursor-pointer"
                >
                  Ganti berkas
                </button>
              </div>

              {/* Import Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Pilih Metode Impor:
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label
                    onClick={() => setImportMode('replace')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col gap-1 ${
                      importMode === 'replace'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-blue-600"
                      />
                      Gantikan Semua
                    </div>
                    <span className="text-[11px] text-slate-500 pl-5 leading-tight">
                      Hapus data saat ini dan gantikan seluruhnya dengan data impor ({parsedPreview.length} data).
                    </span>
                  </label>

                  <label
                    onClick={() => setImportMode('merge')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col gap-1 ${
                      importMode === 'merge'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-blue-600"
                      />
                      Gabungkan Data
                    </div>
                    <span className="text-[11px] text-slate-500 pl-5 leading-tight">
                      Tambahkan data impor ke riwayat yang sudah ada saat ini ({currentEntriesCount} + {parsedPreview.length} data).
                    </span>
                  </label>
                </div>
              </div>

              {/* Sample preview items */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Pratinjau Tanggal Catatan:</span>
                  <span className="text-[10px] text-slate-500">Menampilkan hingga 3 terbaru</span>
                </div>
                <div className="space-y-1.5">
                  {parsedPreview.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">{item.tanggal}</span>
                      <span className="text-slate-500 truncate max-w-xs">{item.catatan || 'Tanpa catatan'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleApplyImport}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Terapkan & Muat {parsedPreview.length} Data Sekarang
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Format berkas diproses secara lokal di browser Anda</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
