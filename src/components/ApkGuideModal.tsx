import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Layers, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'pwabuilder' | 'capacitor' | 'features'>('pwa');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Panduan Membuat & Memasang File APK</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                  Android Ready
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Cara menjadikan HealthTrack sebagai aplikasi mobile Android mandiri (.APK)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            1. Pasang Langsung (PWA Instant)
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pwabuilder'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            2. Generator APK Online (PWABuilder)
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'capacitor'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            3. Build APK Native (Capacitor)
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Fitur Offline & Data
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm text-slate-700">
          
          {/* Tab 1: PWA Instant */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900">
                <h4 className="font-bold flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Cara Paling Cepat & Praktis (Tanpa Perlu Compile APK)
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Aplikasi ini sudah mendukung standar PWA (Progressive Web App). Anda dapat langsung memasangnya di layar utama HP Android Anda seperti aplikasi asli dari Play Store!
                </p>
              </div>

              <h5 className="font-bold text-slate-900">Langkah Memasang di HP Android:</h5>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h6 className="font-bold text-slate-800 text-xs">Buka di Browser HP</h6>
                  <p className="text-xs text-slate-600">
                    Buka link aplikasi ini di <strong>Google Chrome</strong> atau <strong>Samsung Internet</strong> pada HP Android Anda.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h6 className="font-bold text-slate-800 text-xs">Klik Menu Titik Tiga (⋮)</h6>
                  <p className="text-xs text-slate-600">
                    Pilih menu <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama" (Add to Home screen)</strong>.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h6 className="font-bold text-slate-800 text-xs">Aplikasi Terpasang</h6>
                  <p className="text-xs text-slate-600">
                    Ikon <strong>HealthTrack</strong> akan langsung muncul di menu HP Anda dan berjalan full-screen tanpa address bar browser.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Kelebihan PWA:</strong> Tidak memakan memori besar, selalu otomatis terupdate saat online, dan seluruh data tersimpan aman di HP Anda secara lokal.
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: PWABuilder Online */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-indigo-900">
                <h4 className="font-bold flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  Buat File .APK / .AAB Siap Pasang via PWABuilder (Gratis)
                </h4>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  PWABuilder (dikelola oleh Microsoft & Google Chrome) memungkinkan Anda mengonversi link web ini menjadi paket APK Android siap install dalam 2 menit.
                </p>
              </div>

              <ol className="space-y-3 list-decimal list-inside text-xs leading-relaxed text-slate-700">
                <li className="pl-1">
                  <strong>Salin URL Aplikasi</strong> yang sedang aktif di bilah alamat browser.
                </li>
                <li className="pl-1">
                  Buka website resmi <strong>pwabuilder.com</strong> di tab baru.
                </li>
                <li className="pl-1">
                  Tempelkan URL aplikasi Anda, lalu klik <strong>"Start"</strong>.
                </li>
                <li className="pl-1">
                  Pilih tab <strong>"Android"</strong> &gt; Klik tombol <strong>"Package For Stores / APK"</strong>.
                </li>
                <li className="pl-1">
                  Unduh file zip hasil build. Di dalamnya terdapat file <strong>.apk</strong> yang bisa langsung Anda kirim ke HP dan diinstal!
                </li>
              </ol>

              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-600 font-medium">Buka PWABuilder resmi di tab baru:</span>
                <a 
                  href="https://www.pwabuilder.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition"
                >
                  Buka PWABuilder <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Tab 3: Capacitor Native */}
          {activeTab === 'capacitor' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-900 text-white rounded-xl p-4">
                <h4 className="font-bold flex items-center gap-2 mb-1 text-blue-400">
                  <Terminal className="w-4 h-4" />
                  Build APK Menggunakan Capacitor & Android Studio (Developer)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Jika Anda ingin menghasilkan APK signed binary untuk publikasi Google Play Store atau Android Studio:
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>1. Install Capacitor di Folder Proyek:</span>
                    <button 
                      onClick={() => handleCopy('npm install @capacitor/core @capacitor/cli @capacitor/android', 'cap1')}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {copiedCode === 'cap1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      Salin
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    npm install @capacitor/core @capacitor/cli @capacitor/android
                  </pre>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>2. Inisialisasi & Tambahkan Platform Android:</span>
                    <button 
                      onClick={() => handleCopy('npx cap init "HealthTrack" "com.healthtrack.app" --web-dir dist\nnpx cap add android', 'cap2')}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {copiedCode === 'cap2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      Salin
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    npx cap init "HealthTrack" "com.healthtrack.app" --web-dir dist{'\n'}npx cap add android
                  </pre>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>3. Build Web & Buka di Android Studio untuk Generate APK:</span>
                    <button 
                      onClick={() => handleCopy('npm run build\nnpx cap sync android\nnpx cap open android', 'cap3')}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {copiedCode === 'cap3' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      Salin
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    npm run build{'\n'}npx cap sync android{'\n'}npx cap open android
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Fitur */}
          {activeTab === 'features' && (
            <div className="space-y-3 animate-in fade-in">
              <h5 className="font-bold text-slate-900">Spesifikasi & Keunggulan HealthTrack:</h5>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Penyimpanan Lokal (Offline First)
                  </div>
                  <p className="text-slate-600">
                    Data kesehatan tersimpan langsung di memori browser HP (LocalStorage / SQLite). Privasi medis terjaga tanpa kirim data ke server pihak ketiga.
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Kategori Medis Lengkap
                  </div>
                  <p className="text-slate-600">
                    Mencakup Tensi, Gula Darah, Profil Lipid, Asam Urat, Fungsi Hati (SGOT/SGPT/FibroScan LSM & CAP), dan Fungsi Ginjal (Kreatinin/eGFR/Ureum).
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-purple-600" />
                    Ekspor & Cadangkan Data
                  </div>
                  <p className="text-slate-600">
                    Dapat mengekspor riwayat kesehatan ke format JSON atau CSV untuk ditunjukkan kepada dokter atau dicadangkan ke Google Drive.
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Grafik Tren Interaktif
                  </div>
                  <p className="text-slate-600">
                    Visualisasi grafik kurva yang responsif di layar ponsel untuk memantau kemajuan terapi dan gaya hidup Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
};
