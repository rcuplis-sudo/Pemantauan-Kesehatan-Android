import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileJson, 
  Calendar, 
  HardDrive,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Layers,
  ArrowRight,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Download,
  Share2,
  FileSpreadsheet,
  Settings,
  Info,
  Key,
  FolderDown,
  Upload
} from 'lucide-react';
import { HealthEntry } from '../types';
import { GoogleDriveService, GoogleDriveBackupFile, GoogleUserInfo } from '../services/googleDriveService';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: HealthEntry[];
  onRestoreSuccess: (restoredEntries: HealthEntry[]) => void;
  onBackupSuccess: () => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  entries,
  onRestoreSuccess,
  onBackupSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'sync' | 'backup' | 'restore' | 'settings'>('quick');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string>('');
  const [backups, setBackups] = useState<GoogleDriveBackupFile[]>([]);
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState<boolean>(() => GoogleDriveService.isAutoSyncEnabled());
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => GoogleDriveService.getLastSyncTime());
  const [customClientId, setCustomClientId] = useState<string>(() => GoogleDriveService.getCustomClientId());
  const [isSavedClientId, setIsSavedClientId] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear states when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setAutoSync(GoogleDriveService.isAutoSyncEnabled());
      setLastSyncTime(GoogleDriveService.getLastSyncTime());
      setCustomClientId(GoogleDriveService.getCustomClientId());
      loadAccountInfo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const loadAccountInfo = async () => {
    try {
      const email = GoogleDriveService.getSavedUserEmail();
      if (email) {
        setUserInfo({ email });
      }
    } catch {}
  };

  // Quick Direct Download JSON (100% Offline & Free from Google Blocks)
  const handleDownloadJson = () => {
    if (entries.length === 0) {
      setErrorMsg('Belum ada data rekam medis untuk dicadangkan.');
      return;
    }
    const fileName = GoogleDriveService.downloadLocalJsonBackup(entries);
    setSuccessMsg(`Berkas cadangan "${fileName}" berhasil diunduh ke perangkat Anda! Simpan ke Google Drive atau folder aman.`);
    onBackupSuccess();
  };

  // Quick Share to HP Google Drive app or WhatsApp
  const handleShareToDrive = async () => {
    if (entries.length === 0) {
      setErrorMsg('Belum ada data rekam medis untuk dicadangkan.');
      return;
    }
    setIsLoading(true);
    setLoadingAction('Menyiapkan berkas cadangan...');
    try {
      const shared = await GoogleDriveService.shareBackupFile(entries);
      if (shared) {
        setSuccessMsg('Berkas cadangan berhasil disiapkan / dibagikan ke Google Drive.');
        onBackupSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membagikan berkas.');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  // Quick Download CSV for Excel
  const handleDownloadCsv = () => {
    if (entries.length === 0) {
      setErrorMsg('Belum ada data rekam medis untuk diunduh.');
      return;
    }
    const fileName = GoogleDriveService.downloadLocalCsvBackup(entries);
    setSuccessMsg(`Berkas Excel/CSV "${fileName}" berhasil diunduh!`);
  };

  // Direct Restore from local file picked from phone/Google Drive
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingAction('Membaca berkas cadangan...');
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        let parsed: HealthEntry[] = [];

        if (file.name.toLowerCase().endsWith('.json')) {
          const raw = JSON.parse(text);
          if (Array.isArray(raw)) {
            parsed = raw;
          } else if (raw && Array.isArray(raw.data)) {
            parsed = raw.data;
          } else {
            throw new Error('Format JSON berkas cadangan tidak dikenali.');
          }
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          parsed = GoogleDriveService.parseCsv(text);
        } else {
          throw new Error('Harap pilih berkas dengan format .json atau .csv.');
        }

        if (parsed.length === 0) {
          throw new Error('Berkas tidak memuat catatan riwayat medis.');
        }

        onRestoreSuccess(parsed);
        setSuccessMsg(`Berhasil memulihkan ${parsed.length} catatan riwayat medis dari berkas!`);
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memulihkan data dari berkas.');
      } finally {
        setIsLoading(false);
        setLoadingAction('');
      }
    };

    reader.onerror = () => {
      setErrorMsg('Gagal membaca berkas dari penyimpanan.');
      setIsLoading(false);
      setLoadingAction('');
    };

    reader.readAsText(file);
  };

  const handleToggleAutoSync = async () => {
    const nextState = !autoSync;
    setAutoSync(nextState);
    GoogleDriveService.setAutoSyncEnabled(nextState);

    if (nextState) {
      setIsLoading(true);
      setLoadingAction('Menghubungkan akun Google untuk sinkronisasi otomatis...');
      setErrorMsg(null);
      setSuccessMsg(null);
      try {
        const token = await GoogleDriveService.requestAccessToken();
        const profile = await GoogleDriveService.getUserProfile(token);
        if (profile) setUserInfo(profile);
        
        // Buat backup pertama jika ada entri
        if (entries.length > 0) {
          await GoogleDriveService.backupToGoogleDrive(entries);
          setLastSyncTime(new Date().toISOString());
        }
        setSuccessMsg('Sinkronisasi otomatis berhasil diaktifkan! Data akan otomatis tersimpan ke Google Drive akun Anda.');
      } catch (err: any) {
        setAutoSync(false);
        GoogleDriveService.setAutoSyncEnabled(false);
        setErrorMsg(err.message || 'Akses Google Drive dibatasi oleh kebijakan keamanan Google.');
      } finally {
        setIsLoading(false);
        setLoadingAction('');
      }
    } else {
      setSuccessMsg('Sinkronisasi otomatis dinonaktifkan.');
    }
  };

  const loadBackupList = async () => {
    setIsLoading(true);
    setLoadingAction('Memuat daftar cadangan dari Google Drive...');
    setErrorMsg(null);
    try {
      const token = await GoogleDriveService.requestAccessToken();
      const [list, profile] = await Promise.all([
        GoogleDriveService.listBackups(),
        GoogleDriveService.getUserProfile(token)
      ]);
      setBackups(list);
      if (profile) setUserInfo(profile);
      if (list.length > 0 && !selectedFileId) {
        setSelectedFileId(list[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal terhubung dengan Google Drive.');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  const handleBackupNow = async () => {
    if (entries.length === 0) {
      setErrorMsg('Belum ada data rekam medis untuk dicadangkan.');
      return;
    }

    setIsLoading(true);
    setLoadingAction('Mengunggah cadangan data ke Google Drive Anda...');
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await GoogleDriveService.backupToGoogleDrive(entries);
      setLastSyncTime(new Date().toISOString());
      setSuccessMsg(`Berhasil mencadangkan ${entries.length} data catatan ke Google Drive (${result.fileName})`);
      onBackupSuccess();
      loadBackupList();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal melakukan pencadangan ke Google Drive.');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  const handleRestoreNow = async (fileId: string) => {
    if (!fileId) return;

    if (!window.confirm('Apakah Anda ingin memulihkan data dari cadangan ini? Data saat ini di aplikasi akan digantikan dengan data yang dipulihkan.')) {
      return;
    }

    setIsLoading(true);
    setLoadingAction('Mengunduh dan memulihkan data dari Google Drive...');
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const restored = await GoogleDriveService.restoreFromGoogleDrive(fileId);
      if (restored && restored.length > 0) {
        onRestoreSuccess(restored);
        setSuccessMsg(`Berhasil memulihkan ${restored.length} rekam data kesehatan!`);
        setTimeout(() => {
          onClose();
        }, 1400);
      } else {
        setErrorMsg('Data pada file cadangan kosong.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memulihkan data dari Google Drive.');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  const handleDeleteBackup = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Hapus file cadangan "${fileName}" dari Google Drive?`)) return;

    setIsLoading(true);
    setLoadingAction('Menghapus file cadangan...');
    try {
      await GoogleDriveService.deleteBackup(fileId);
      setBackups(prev => prev.filter(f => f.id !== fileId));
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
      }
      setSuccessMsg('File cadangan berhasil dihapus.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus file.');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  const handleSaveCustomClientId = (e: React.FormEvent) => {
    e.preventDefault();
    GoogleDriveService.setCustomClientId(customClientId);
    setIsSavedClientId(true);
    setSuccessMsg('Pengaturan Google Client ID berhasil disimpan!');
    setTimeout(() => setIsSavedClientId(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold">Cadangan & Sinkronisasi Drive</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/25">
                  100% Aman & Terlindungi
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Simpan, cadangkan, dan pulihkan riwayat kesehatan Anda kapan pun
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

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('quick');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'quick'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderDown className="w-4 h-4 text-blue-600" />
            Cadangan Cepat (Bebas Blokir)
          </button>

          <button
            onClick={() => {
              setActiveTab('sync');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Drive Auto-Sync
          </button>

          <button
            onClick={() => {
              setActiveTab('restore');
              loadBackupList();
            }}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'restore'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CloudDownload className="w-4 h-4" />
            Riwayat Cloud
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Pengaturan & Bantuan
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-700">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Pemberitahuan Sistem:</span>
              </div>
              <p className="leading-relaxed pl-6.5 text-rose-700">{errorMsg}</p>
              
              {/* Helpful quick action when Google blocks */}
              {(errorMsg.includes('Google') || errorMsg.includes('diblokir') || errorMsg.includes('OAuth')) && (
                <div className="pl-6.5 pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={handleDownloadJson}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh File Cadangan Sekarang (Bebas Blokir)
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100/60 rounded-xl font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Lihat Solusi Google OAuth
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* User Profile Tag if connected */}
          {userInfo && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs">
              <div className="flex items-center gap-2.5">
                {userInfo.picture ? (
                  <img src={userInfo.picture} alt="Google Avatar" className="w-7 h-7 rounded-full border border-blue-300" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                )}
                <div>
                  <span className="text-blue-600 font-medium block text-[11px]">Akun Google Terhubung:</span>
                  <strong className="text-slate-900 font-bold">{userInfo.email || userInfo.name}</strong>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Terhubung
              </span>
            </div>
          )}

          {/* Tab 1: Cadangan Cepat & Berkas Lokal (Paling Handal & Bebas Blokir) */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              
              {/* Highlight Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-blue-50/40 border border-emerald-200/90 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Cadangan Berkas Mandiri (100% Aman & Tanpa Blokir)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Cara paling praktis dan bebas masalah untuk mengamankan data kesehatan Anda. Anda dapat <strong>mengunduh berkas</strong> atau langsung <strong>membagikannya ke aplikasi Google Drive di HP</strong> tanpa perlu login OAuth browser yang sering diblokir Google.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Unduh Berkas JSON */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 transition shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                      <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <span>Unduh File Cadangan (.JSON)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Format lengkap HealthTrack ({entries.length} data). Simpan di HP, laptop, atau Google Drive Anda.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadJson}
                    disabled={entries.length === 0}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Berkas (.JSON)
                  </button>
                </div>

                {/* 2. Bagikan ke Google Drive HP */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 transition shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                      <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span>Simpan ke Google Drive HP</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Buka menu Share di HP dan pilih ikon Google Drive / WhatsApp untuk menyimpan berkas.
                    </p>
                  </div>

                  <button
                    onClick={handleShareToDrive}
                    disabled={entries.length === 0}
                    className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Bagi / Simpan ke Drive
                  </button>
                </div>

                {/* 3. Unduh CSV Excel */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 transition shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <span>Ekspor Tabel Excel (.CSV)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Buka riwayat tensi, gula darah, dan kolesterol dalam bentuk tabel Microsoft Excel / Google Spreadsheet.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadCsv}
                    disabled={entries.length === 0}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Tabel Excel (.CSV)
                  </button>
                </div>

                {/* 4. Pulihkan dari Berkas */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 transition shadow-2xs space-y-3 flex flex-col justify-between">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span>Pulihkan dari Berkas Cadangan</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Pilih berkas JSON atau CSV yang tersimpan di HP atau Google Drive untuk mengembalikan seluruh data.
                    </p>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Pilih File & Pulihkan
                  </button>
                </div>

              </div>

              {/* Status Ringkasan */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Total Data Tersedia: <strong>{entries.length} catatan medis</strong></span>
                {lastSyncTime && (
                  <span className="text-[11px] text-slate-500">
                    Aktivitas terakhir: {new Date(lastSyncTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

            </div>
          )}

          {/* Tab 2: Sync Otomatis Google Drive */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-purple-50/40 border border-blue-200/90 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Sinkronisasi API Google Drive Langsung
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Menyinkronkan data secara otomatis ke folder khusus <strong>"HealthTrack_Backups"</strong> di akun Google Drive pribadi Anda.
                    </p>
                  </div>

                  <button
                    onClick={handleToggleAutoSync}
                    disabled={isLoading}
                    className="shrink-0 p-1 cursor-pointer transition focus:outline-none"
                    aria-label="Toggle Sinkronisasi Otomatis"
                  >
                    {autoSync ? (
                      <div className="w-13 h-7 bg-blue-600 rounded-full p-0.5 flex items-center justify-end transition-colors shadow-inner">
                        <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                      </div>
                    ) : (
                      <div className="w-13 h-7 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition-colors">
                        <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                      </div>
                    )}
                  </button>
                </div>

                <div className="pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span>Status Auto-Sync: <strong>{autoSync ? 'Aktif (ON)' : 'Non-Aktif'}</strong></span>
                  {lastSyncTime && (
                    <span className="text-[11px] text-slate-500">
                      Terakhir disinkronkan: {new Date(lastSyncTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Penjelasan jika diblokir Google */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Mengapa Muncul Notifikasi "Diblokir oleh Google"?</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Google memblokir login otomatis pada aplikasi web/APK yang domainnya belum didaftarkan di <em>Google Cloud Console OAuth Screen</em>. Jika Anda mengalami kendala ini, silakan gunakan tab <strong>"Cadangan Cepat (Bebas Blokir)"</strong> untuk mengunduh dan menyimpan berkas cadangan langsung ke Google Drive di HP Anda!
                </p>
              </div>

              <button
                onClick={handleBackupNow}
                disabled={isLoading || entries.length === 0}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loadingAction || 'Menyinkronkan...'}</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    Sinkronkan Seluruh Data ({entries.length} Catatan) ke Google Drive
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 3: Riwayat Cadangan Cloud */}
          {activeTab === 'restore' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Pilih File Cadangan Cloud</h4>
                  <p className="text-xs text-slate-500">Ditemukan {backups.length} file cadangan di Google Drive</p>
                </div>
                <button
                  onClick={loadBackupList}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Segarkan
                </button>
              </div>

              {isLoading && backups.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p className="text-xs">{loadingAction || 'Membuka Google Drive...'}</p>
                </div>
              ) : backups.length === 0 ? (
                <div className="py-8 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <FileJson className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Belum Ada File Cadangan Cloud Terdeteksi</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Jika Anda memiliki file cadangan (.json) di HP atau komputer, Anda dapat langsung mengembalikannya melalui tab <strong>"Cadangan Cepat (Bebas Blokir)"</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {backups.map(file => {
                    const isSelected = selectedFileId === file.id;
                    const dateFormatted = new Date(file.createdTime).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFileId(file.id)}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <HardDrive className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {file.name}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{dateFormatted}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreNow(file.id);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                            title="Pulihkan data ini"
                          >
                            <CloudDownload className="w-3.5 h-3.5" />
                            Pulihkan
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBackup(file.id, file.name);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus file cadangan ini dari Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedFileId && (
                <button
                  onClick={() => handleRestoreNow(selectedFileId)}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <CloudDownload className="w-4 h-4" />
                  Pulihkan File Cadangan Terpilih
                </button>
              )}
            </div>
          )}

          {/* Tab 4: Pengaturan Client ID & Panduan Bantuan */}
          {activeTab === 'settings' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Key className="w-4 h-4 text-blue-600" />
                  Kustomisasi Google OAuth Client ID (Opsional)
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Jika Anda ingin menggunakan sinkronisasi API Google Drive tanpa peringatan keamanan, Anda dapat membuat <strong>OAuth Client ID</strong> gratis di Google Cloud Console dan menempelkannya di sini:
                </p>

                <form onSubmit={handleSaveCustomClientId} className="pt-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="contoh: 123456789-abc.apps.googleusercontent.com"
                      value={customClientId}
                      onChange={(e) => setCustomClientId(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition cursor-pointer whitespace-nowrap"
                    >
                      {isSavedClientId ? 'Tersimpan!' : 'Simpan ID'}
                    </button>
                  </div>
                  {customClientId && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomClientId('');
                        GoogleDriveService.setCustomClientId('');
                        setSuccessMsg('Google Client ID kustom telah direset ke default.');
                      }}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Reset ke Client ID bawaan
                    </button>
                  )}
                </form>
              </div>

              {/* Panduan Ringkas */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h5 className="font-bold text-slate-900">Solusi Rekomendasi Tercepat:</h5>
                <div className="space-y-2 text-slate-600 leading-relaxed">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Gunakan Cadangan Cepat:</strong> Cukup klik <em>"Unduh Berkas (.JSON)"</em> atau <em>"Simpan ke Drive lewat HP"</em> di tab pertama. Berkas dapat disimpan langsung ke Google Drive Anda melalui aplikasi Drive bawaan HP Anda.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>100% Bebas Blokir:</strong> Metode berkas lokal dan share HP tidak bergantung pada otorisasi browser, sehingga dijamin selalu berhasil di perangkat mana pun.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pencadangan Berkas Terenkripsi Lokal</span>
          </div>
          <button
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
