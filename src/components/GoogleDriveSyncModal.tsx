import React, { useState, useEffect } from 'react';
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
  HelpCircle
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
  const [activeTab, setActiveTab] = useState<'sync' | 'backup' | 'restore'>('sync');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string>('');
  const [backups, setBackups] = useState<GoogleDriveBackupFile[]>([]);
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState<boolean>(() => GoogleDriveService.isAutoSyncEnabled());
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => GoogleDriveService.getLastSyncTime());

  // Clear states when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setAutoSync(GoogleDriveService.isAutoSyncEnabled());
      setLastSyncTime(GoogleDriveService.getLastSyncTime());
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

  const handleToggleAutoSync = async () => {
    const nextState = !autoSync;
    setAutoSync(nextState);
    GoogleDriveService.setAutoSyncEnabled(nextState);

    if (nextState) {
      setIsLoading(true);
      setLoadingAction('Menghubungkan akun Google untuk sinkronisasi otomatis...');
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
        setErrorMsg(err.message || 'Gagal mengaktifkan sinkronisasi otomatis.');
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
                <h3 className="text-lg sm:text-xl font-bold">Sinkronisasi Google Drive</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/25">
                  Multi-Device Sync
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Sinkron otomatis & cadangkan data ke akun Google Drive pribadi Anda
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
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('sync');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Sinkronisasi Otomatis
          </button>

          <button
            onClick={() => {
              setActiveTab('backup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CloudUpload className="w-4 h-4" />
            Cadangkan Manual
          </button>

          <button
            onClick={() => {
              setActiveTab('restore');
              loadBackupList();
            }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'restore'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CloudDownload className="w-4 h-4" />
            Pulihkan dari Drive
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-700">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
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

          {/* Tab: Sync Otomatis */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-purple-50/40 border border-blue-200/90 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Sinkronisasi Antar-Perangkat Otomatis
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Saat fitur ini aktif, setiap Anda menambahkan atau mengedit catatan rekam medis di HP atau laptop, data akan <strong>otomatis tersimpan ke Google Drive Anda</strong>. Ketika Anda membuka aplikasi di perangkat lain dengan email Google yang sama, data langsung tersinkronisasi!
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
                  <span>Status: <strong>{autoSync ? 'Aktif (Auto-Sync ON)' : 'Non-Aktif'}</strong></span>
                  {lastSyncTime && (
                    <span className="text-[11px] text-slate-500">
                      Terakhir disinkronkan: {new Date(lastSyncTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-User explanation card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  Bagaimana jika diinstal di perangkat lain dengan email yang sama?
                </h5>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Buka aplikasi di HP, tablet, atau laptop baru Anda.</li>
                  <li>Klik tombol <strong>"Google Drive"</strong> dan pilih akun Google yang sama.</li>
                  <li>Aplikasi akan otomatis mendeteksi cadangan terbaru Anda dan menyelaraskan seluruh riwayat kesehatan Anda dalam hitungan detik!</li>
                </ol>
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
                    Sinkronkan Seluruh Data ({entries.length} Catatan) Sekarang
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab: Backup Manual */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <CloudUpload className="w-4 h-4 text-blue-600" />
                  Pencadangan Manual ke Folder Google Drive
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  File cadangan akan disimpan di folder <strong>"HealthTrack_Backups"</strong> di Google Drive Anda. Setiap file dilengkapi stempel tanggal & waktu lengkap.
                </p>
              </div>

              {/* Status Data Saat Ini */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ringkasan Data Saat Ini</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block mb-1">Total Rekam Medis:</span>
                    <span className="text-lg font-black text-slate-800">{entries.length} data</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block mb-1">Pemeriksaan Terakhir:</span>
                    <span className="text-sm font-bold text-slate-800">
                      {entries.length > 0 ? entries[entries.length - 1].tanggal : 'Belum ada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleBackupNow}
                disabled={isLoading || entries.length === 0}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loadingAction || 'Memproses...'}</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    Cadangkan ke Google Drive Sekarang
                  </>
                )}
              </button>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Setiap pengguna memiliki ruang penyimpanan terpisah di Google Drive masing-masing.</span>
              </div>
            </div>
          )}

          {/* Tab: Restore View */}
          {activeTab === 'restore' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Pilih File Cadangan untuk Dipulihkan</h4>
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
                  <p className="text-xs font-semibold text-slate-700">Belum Ada File Cadangan di Google Drive Akun Ini</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Buat cadangan pertama Anda pada tab <strong>"Sinkronisasi Otomatis"</strong> atau <strong>"Cadangkan Manual"</strong>.
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

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Izin Google Drive Terverifikasi</span>
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
