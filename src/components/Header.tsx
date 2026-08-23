import React from 'react';
import { 
  Smartphone, 
  Trash2, 
  Sparkles, 
  UploadCloud, 
  Menu, 
  X, 
  Cloud
} from 'lucide-react';

interface HeaderProps {
  onOpenApkGuide: () => void;
  onOpenGoogleDrive: () => void;
  onOpenImportModal: () => void;
  onResetAll: () => void;
  onLoadSample: () => void;
  hasData: boolean;
  isMobileDrawerOpen: boolean;
  onToggleMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenApkGuide,
  onOpenGoogleDrive,
  onOpenImportModal,
  onResetAll,
  onLoadSample,
  hasData,
  isMobileDrawerOpen,
  onToggleMobileDrawer
}) => {
  return (
    <header className="bg-white border-b border-slate-200/90 py-3 px-4 sm:px-6 md:px-8 flex items-center justify-between shadow-2xs z-20 shrink-0">
      
      {/* Mobile Drawer Toggle & App Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileDrawer}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Menu Form"
        >
          {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            Dashboard Pemantauan
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            Pantau dan analisa tren indikator kesehatan Anda secara berkala
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        
        {/* APK & PWA Guide Button */}
        <button
          onClick={onOpenApkGuide}
          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 transform active:scale-95 cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">Pasang</span> APK / PWA
        </button>

        {/* Google Drive Cloud Backup & Sync */}
        <button
          onClick={onOpenGoogleDrive}
          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200/80 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Cadangkan dan sinkronkan data ke Google Drive Anda"
        >
          <Cloud className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Google</span> Drive
        </button>

        {/* Import Data (JSON/CSV/Cloud) */}
        <button
          onClick={onOpenImportModal}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          title="Impor data dari berkas JSON, CSV, atau Google Drive"
        >
          <UploadCloud className="w-4 h-4 text-slate-600" />
          <span>Impor Data</span>
        </button>

        {/* Load Demo Data if empty */}
        {!hasData && (
          <button
            onClick={onLoadSample}
            className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center gap-1.5"
            title="Muat contoh data pemeriksaan medis"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Contoh</span> Data
          </button>
        )}

        {/* Reset All Data Button */}
        {hasData && (
          <button
            onClick={onResetAll}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition text-xs font-semibold flex items-center gap-1"
            title="Hapus seluruh riwayat data"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">Hapus Semua</span>
          </button>
        )}

      </div>

    </header>
  );
};
