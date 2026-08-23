import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  PlusCircle, 
  Sparkles, 
  Smartphone, 
  ClipboardList, 
  CheckCircle2, 
  UploadCloud,
  FileSpreadsheet, 
  Download, 
  AlertCircle,
  Cloud
} from 'lucide-react';
import { HealthEntry, ParamKey, ParamGroupKey } from './types';
import { SAMPLE_HEALTH_DATA, paramConfig } from './utils/healthCalculations';
import { GoogleDriveService } from './services/googleDriveService';
import { SidebarForm } from './components/SidebarForm';
import { Header } from './components/Header';
import { HealthSummaryCard } from './components/HealthSummaryCard';
import { ChartSection } from './components/ChartSection';
import { DataTableSection } from './components/DataTableSection';
import { ApkGuideModal } from './components/ApkGuideModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { ImportDataModal } from './components/ImportDataModal';

const STORAGE_KEY = 'healthTrackData_v2';

export default function App() {
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'semua' | ParamGroupKey>('semua');
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from localStorage on mount (start clean without forced dummy data)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as HealthEntry[];
        if (Array.isArray(parsed)) {
          setEntries(parsed);
        } else {
          setEntries([]);
        }
      } else {
        // Start completely clean for real health monitoring
        setEntries([]);
      }
    } catch (e) {
      console.error('Error loading health data:', e);
      setEntries([]);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when entries update & trigger auto-sync if active
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

      // Otomatis sinkronkan ke Google Drive di latar belakang jika fitur auto-sync diaktifkan
      if (GoogleDriveService.isAutoSyncEnabled() && entries.length > 0) {
        GoogleDriveService.autoBackupInBackground(entries);
      }
    }
  }, [entries, isInitialized]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger celebratory confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.85 }
      });
    } catch {
      // ignore
    }
  };

  // Save or Update Entry
  const handleSaveEntry = (data: Omit<HealthEntry, 'id'>, editId?: string | null) => {
    if (editId) {
      // Update existing
      setEntries(prev => prev.map(item => {
        if (item.id === editId) {
          return {
            ...item,
            ...data
          };
        }
        return item;
      }));
      setEditingId(null);
      showToast('Catatan medis berhasil diperbarui!');
    } else {
      // Add new
      const newEntry: HealthEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ...data
      };
      setEntries(prev => [...prev, newEntry]);
      showToast('Catatan kesehatan baru berhasil disimpan!');
      triggerConfetti();
    }

    // Close mobile drawer if open
    setIsMobileDrawerOpen(false);
  };

  // Delete specific parameter from an entry
  const handleDeleteParam = (id: string, key: ParamKey) => {
    setEntries(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const clone = { ...item };
          delete clone[key];
          return clone;
        }
        return item;
      });

      // Filter out entries that have no health parameters left
      return updated.filter(item => {
        const remainingKeys = Object.keys(item).filter(k => k !== 'id' && k !== 'tanggal' && k !== 'catatan');
        return remainingKeys.length > 0;
      });
    });
    showToast('Parameter berhasil dihapus');
  };

  // Delete entire entry date
  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(item => item.id !== id));
    showToast('Catatan tanggal berhasil dihapus');
  };

  // Reset all
  const handleResetAll = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus SEMUA data rekam medis? Data yang dihapus tidak dapat dipulihkan.')) {
      setEntries([]);
      setEditingId(null);
      localStorage.removeItem(STORAGE_KEY);
      showToast('Semua data riwayat telah dibersihkan');
    }
  };

  // Load sample dataset
  const handleLoadSample = () => {
    setEntries(SAMPLE_HEALTH_DATA);
    showToast('Contoh data riwayat medis berhasil dimuat!');
    triggerConfetti();
  };

  // Import Handler (JSON / CSV / Cloud)
  const handleImportSuccess = (importedEntries: HealthEntry[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setEntries(importedEntries);
      showToast(`Berhasil memulihkan ${importedEntries.length} rekam data kesehatan!`);
    } else {
      // Merge mode
      setEntries(prev => {
        const combined = [...prev, ...importedEntries];
        // Deduplikasi berdasarkan ID atau tanggal jika sama persis
        const uniqueMap = new Map<string, HealthEntry>();
        combined.forEach(item => {
          uniqueMap.set(item.id || `${item.tanggal}-${Math.random()}`, item);
        });
        return Array.from(uniqueMap.values());
      });
      showToast(`Berhasil menggabungkan ${importedEntries.length} rekam data kesehatan!`);
    }
    triggerConfetti();
  };

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `HealthTrack_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('File backup JSON berhasil diunduh');
  };

  // Export CSV
  const handleExportCsv = () => {
    if (entries.length === 0) return;

    const headers = ['Tanggal', 'Catatan', ...Object.values(paramConfig).map(p => `${p.label} (${p.unit})`)];
    const paramKeys = Object.keys(paramConfig) as ParamKey[];

    const rows = entries.map(entry => {
      const rowData = [
        `"${entry.tanggal}"`,
        `"${entry.catatan || ''}"`,
        ...paramKeys.map(k => entry[k] !== undefined && entry[k] !== null ? entry[k] : '')
      ];
      return rowData.join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `HealthTrack_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('File CSV riwayat kesehatan berhasil diunduh');
  };

  const editingEntry = editingId ? entries.find(e => e.id === editingId) || null : null;

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-slate-100 text-slate-900 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-4 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* APK & PWA Guide Modal */}
      <ApkGuideModal
        isOpen={isApkGuideOpen}
        onClose={() => setIsApkGuideOpen(false)}
      />

      {/* Google Drive Cloud Backup & Restore Modal */}
      <GoogleDriveSyncModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        entries={entries}
        onRestoreSuccess={(restored) => {
          setEntries(restored);
          showToast(`Berhasil menyinkronkan ${restored.length} catatan kesehatan dari Google Drive!`);
          triggerConfetti();
        }}
        onBackupSuccess={() => {
          showToast('Data berhasil dicadangkan ke Google Drive!');
        }}
      />

      {/* Import Data Modal (JSON / CSV / Cloud) */}
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        onOpenGoogleDriveModal={() => {
          setIsImportModalOpen(false);
          setIsGoogleDriveOpen(true);
        }}
        currentEntriesCount={entries.length}
      />

      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 transition-opacity md:hidden"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar Form (Desktop & Mobile Drawer) */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-[88vw] max-w-sm md:static md:z-auto md:w-88 lg:w-96 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <SidebarForm
          onSave={(entry, editId) => {
            handleSaveEntry(entry, editId);
            setIsMobileDrawerOpen(false);
          }}
          editingEntry={editingEntry}
          onCancelEdit={() => setEditingId(null)}
          onLoadSampleData={handleLoadSample}
          hasData={entries.length > 0}
          onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
        />
      </div>

      {/* Main Dashboard View */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        
        {/* Navigation / Header */}
        <Header
          onOpenApkGuide={() => setIsApkGuideOpen(true)}
          onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onResetAll={handleResetAll}
          onLoadSample={handleLoadSample}
          hasData={entries.length > 0}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onToggleMobileDrawer={() => setIsMobileDrawerOpen(prev => !prev)}
        />

        {/* Dashboard Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          
          {entries.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-dashed border-slate-300 max-w-2xl mx-auto my-8 shadow-xs">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                <ClipboardList className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Belum Ada Catatan Kesehatan
              </h3>
              <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                Mulai catat tekanan darah, gula darah, fungsi hati, atau fungsi ginjal melalui formulir, atau pulihkan data dari Google Drive & berkas cadangan.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Isi Catatan Pertama
                </button>
                <button
                  onClick={() => setIsGoogleDriveOpen(true)}
                  className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center gap-2 border border-blue-200 cursor-pointer"
                >
                  <Cloud className="w-4 h-4 text-blue-600" />
                  Sinkron Google Drive
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 border border-slate-200 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  Impor Berkas Cadangan
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Executive Summary Card */}
              <HealthSummaryCard entries={entries} />

              {/* Interactive Trend Charts */}
              <ChartSection
                entries={entries}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              {/* Data Table and History Section */}
              <DataTableSection
                entries={entries}
                activeFilter={activeFilter}
                onEditEntry={(id) => {
                  setEditingId(id);
                  setIsMobileDrawerOpen(true);
                }}
                onDeleteParam={handleDeleteParam}
                onDeleteEntry={handleDeleteEntry}
                onExportCsv={handleExportCsv}
                onExportJson={handleExportJson}
              />
            </>
          )}

          {/* Bottom Footer Info */}
          <footer className="pt-6 pb-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200">
            <div>
              <strong>HealthTrack</strong> &bull; Aplikasi Pemantauan Kesehatan Mandiri
            </div>
            <button
              onClick={() => setIsApkGuideOpen(true)}
              className="text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Ingin dijadikan file APK Android? Klik panduan di sini
            </button>
          </footer>

        </div>

      </main>

    </div>
  );
}
