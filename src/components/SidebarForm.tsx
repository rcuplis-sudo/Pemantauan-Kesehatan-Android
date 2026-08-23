import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Boxes, 
  Activity, 
  Droplets, 
  Scale, 
  ChevronDown, 
  Save, 
  RotateCcw, 
  Calendar, 
  FileText,
  Sparkles,
  Info,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import { HealthEntry, ParamKey, ParamGroupKey } from '../types';
import { paramConfig, hitungBMI } from '../utils/healthCalculations';

interface SidebarFormProps {
  onSave: (entry: Omit<HealthEntry, 'id'>, editId?: string | null) => void;
  editingEntry: HealthEntry | null;
  onCancelEdit: () => void;
  onLoadSampleData: () => void;
  hasData: boolean;
  onCloseMobileDrawer?: () => void;
}

export const SidebarForm: React.FC<SidebarFormProps> = ({
  onSave,
  editingEntry,
  onCancelEdit,
  onLoadSampleData,
  hasData,
  onCloseMobileDrawer
}) => {
  const [tanggal, setTanggal] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [catatan, setCatatan] = useState<string>('');
  
  // Parameter state
  const [formData, setFormData] = useState<Record<ParamKey, string>>({
    sistolik: '',
    diastolik: '',
    hr: '',
    gula: '',
    kolesterol: '',
    trigliserida: '',
    asamurat: '',
    sgot: '',
    sgpt: '',
    lsm: '',
    cap: '',
    kreatinin: '',
    egfr: '',
    ureum: '',
    beratBadan: '',
    tinggiBadan: ''
  });

  // Accordion open states
  const [openAccordions, setOpenAccordions] = useState<Record<ParamGroupKey, boolean>>({
    kardio: true,
    metabolik: false,
    hati: false,
    ginjal: false,
    antropometri: false
  });

  // If editingEntry changes, populate formData
  useEffect(() => {
    if (editingEntry) {
      setTanggal(editingEntry.tanggal);
      setCatatan(editingEntry.catatan || '');
      
      const newFormValues: Record<ParamKey, string> = {
        sistolik: editingEntry.sistolik !== undefined ? String(editingEntry.sistolik) : '',
        diastolik: editingEntry.diastolik !== undefined ? String(editingEntry.diastolik) : '',
        hr: editingEntry.hr !== undefined ? String(editingEntry.hr) : '',
        gula: editingEntry.gula !== undefined ? String(editingEntry.gula) : '',
        kolesterol: editingEntry.kolesterol !== undefined ? String(editingEntry.kolesterol) : '',
        trigliserida: editingEntry.trigliserida !== undefined ? String(editingEntry.trigliserida) : '',
        asamurat: editingEntry.asamurat !== undefined ? String(editingEntry.asamurat) : '',
        sgot: editingEntry.sgot !== undefined ? String(editingEntry.sgot) : '',
        sgpt: editingEntry.sgpt !== undefined ? String(editingEntry.sgpt) : '',
        lsm: editingEntry.lsm !== undefined ? String(editingEntry.lsm) : '',
        cap: editingEntry.cap !== undefined ? String(editingEntry.cap) : '',
        kreatinin: editingEntry.kreatinin !== undefined ? String(editingEntry.kreatinin) : '',
        egfr: editingEntry.egfr !== undefined ? String(editingEntry.egfr) : '',
        ureum: editingEntry.ureum !== undefined ? String(editingEntry.ureum) : '',
        beratBadan: editingEntry.beratBadan !== undefined ? String(editingEntry.beratBadan) : '',
        tinggiBadan: editingEntry.tinggiBadan !== undefined ? String(editingEntry.tinggiBadan) : ''
      };

      setFormData(newFormValues);

      // Auto expand accordions that have data
      const newOpenState = { ...openAccordions };
      if (editingEntry.sistolik || editingEntry.diastolik || editingEntry.hr) newOpenState.kardio = true;
      if (editingEntry.gula || editingEntry.kolesterol || editingEntry.trigliserida || editingEntry.asamurat) newOpenState.metabolik = true;
      if (editingEntry.sgot || editingEntry.sgpt || editingEntry.lsm || editingEntry.cap) newOpenState.hati = true;
      if (editingEntry.kreatinin || editingEntry.egfr || editingEntry.ureum) newOpenState.ginjal = true;
      if (editingEntry.beratBadan || editingEntry.tinggiBadan) newOpenState.antropometri = true;
      
      setOpenAccordions(newOpenState);
    }
  }, [editingEntry]);

  const toggleAccordion = (group: ParamGroupKey) => {
    setOpenAccordions(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const handleInputChange = (key: ParamKey, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const setTodayDate = () => {
    setTanggal(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanggal) {
      alert('Silakan pilih tanggal pemeriksaan.');
      return;
    }

    const numericValues: Partial<Record<ParamKey, number>> = {};
    let hasAnyMetric = false;

    (Object.keys(formData) as ParamKey[]).forEach(key => {
      const val = formData[key].trim();
      if (val !== '') {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          numericValues[key] = num;
          hasAnyMetric = true;
        }
      }
    });

    if (!hasAnyMetric && !catatan.trim()) {
      alert('Mohon isi minimal satu nilai parameter kesehatan.');
      return;
    }

    const payload: Omit<HealthEntry, 'id'> = {
      tanggal,
      catatan: catatan.trim() || undefined,
      ...numericValues
    };

    onSave(payload, editingEntry ? editingEntry.id : null);

    // If adding new, reset form fields
    if (!editingEntry) {
      setFormData({
        sistolik: '',
        diastolik: '',
        hr: '',
        gula: '',
        kolesterol: '',
        trigliserida: '',
        asamurat: '',
        sgot: '',
        sgpt: '',
        lsm: '',
        cap: '',
        kreatinin: '',
        egfr: '',
        ureum: '',
        beratBadan: '',
        tinggiBadan: ''
      });
      setCatatan('');
    }
  };

  // Hitung BMI real-time jika ada berat & tinggi badan
  const beratNum = formData.beratBadan ? parseFloat(formData.beratBadan) : undefined;
  const tinggiNum = formData.tinggiBadan ? parseFloat(formData.tinggiBadan) : undefined;
  const bmiInfo = hitungBMI(beratNum, tinggiNum);

  return (
    <aside className="w-full bg-white border-r border-slate-200 h-full flex flex-col shadow-2xl md:shadow-lg relative z-10 shrink-0 overflow-hidden">
      
      {/* Sidebar Header */}
      <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Heart className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5">
              HealthTrack
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-white/20 border border-white/25">
                v2.0
              </span>
            </h1>
            <p className="text-xs text-blue-100/90 font-medium">Rekam Medis & Metrik Kesehatan</p>
          </div>
        </div>

        {onCloseMobileDrawer && (
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Tutup Form Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Editing State Alert */}
      {editingEntry && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between text-amber-900 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mode Edit: <strong>{editingEntry.tanggal}</strong></span>
          </div>
          <button 
            type="button" 
            onClick={onCancelEdit}
            className="text-xs font-bold text-amber-800 hover:underline px-2 py-0.5 rounded-md bg-amber-100"
          >
            Batal
          </button>
        </div>
      )}

      {/* Scrollable Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
        
        {/* Date and Quick Notes */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Tanggal Pemeriksaan
              </label>
              <button
                type="button"
                onClick={setTodayDate}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Hari Ini
              </button>
            </div>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 shadow-2xs font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Catatan / Kondisi (Opsional)
            </label>
            <input
              type="text"
              placeholder="Misal: Puasa 10 jam, pagi hari"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
            />
          </div>
        </div>

        {/* Section Accordions */}
        <div className="space-y-2.5">
          
          {/* 1. Kardiovaskular */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => toggleAccordion('kardio')}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-red-50/60 transition-colors"
            >
              <div className="flex items-center gap-2.5 text-red-600 font-bold text-xs">
                <Heart className="w-4 h-4" />
                <span>Kardiovaskular</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordions.kardio ? 'rotate-180 text-red-600' : ''}`} />
            </button>
            
            {openAccordions.kardio && (
              <div className="p-3.5 bg-white space-y-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Sistolik <span className="text-slate-400 font-normal">(mmHg)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="120"
                      value={formData.sistolik}
                      onChange={(e) => handleInputChange('sistolik', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-red-400 p-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Diastolik <span className="text-slate-400 font-normal">(mmHg)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="80"
                      value={formData.diastolik}
                      onChange={(e) => handleInputChange('diastolik', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-400 p-2 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Denyut Nadi / Heart Rate <span className="text-slate-400 font-normal">(bpm)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="72"
                    value={formData.hr}
                    onChange={(e) => handleInputChange('hr', e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-400 p-2 font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Metabolik & Lipid */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => toggleAccordion('metabolik')}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-purple-50/60 transition-colors"
            >
              <div className="flex items-center gap-2.5 text-purple-600 font-bold text-xs">
                <Boxes className="w-4 h-4" />
                <span>Metabolik & Profil Lipid</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordions.metabolik ? 'rotate-180 text-purple-600' : ''}`} />
            </button>
            
            {openAccordions.metabolik && (
              <div className="p-3.5 bg-white space-y-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Gula Darah <span className="text-slate-400 font-normal">(mg/dL)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="95"
                      value={formData.gula}
                      onChange={(e) => handleInputChange('gula', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-400 p-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Asam Urat <span className="text-slate-400 font-normal">(mg/dL)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="5.4"
                      value={formData.asamurat}
                      onChange={(e) => handleInputChange('asamurat', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-400 p-2 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Kolesterol Total <span className="text-slate-400 font-normal">(mg/dL)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="180"
                      value={formData.kolesterol}
                      onChange={(e) => handleInputChange('kolesterol', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-yellow-400 p-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Trigliserida <span className="text-slate-400 font-normal">(mg/dL)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="130"
                      value={formData.trigliserida}
                      onChange={(e) => handleInputChange('trigliserida', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-yellow-400 p-2 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Fungsi Hati & FibroScan */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => toggleAccordion('hati')}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-emerald-50/60 transition-colors"
            >
              <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-xs">
                <Activity className="w-4 h-4" />
                <span>Fungsi Hati & FibroScan</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordions.hati ? 'rotate-180 text-emerald-600' : ''}`} />
            </button>
            
            {openAccordions.hati && (
              <div className="p-3.5 bg-white space-y-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      SGOT / AST <span className="text-slate-400 font-normal">(U/L)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="24"
                      value={formData.sgot}
                      onChange={(e) => handleInputChange('sgot', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-400 p-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      SGPT / ALT <span className="text-slate-400 font-normal">(U/L)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="28"
                      value={formData.sgpt}
                      onChange={(e) => handleInputChange('sgpt', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-400 p-2 font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-emerald-700 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Hasil Uji FibroScan
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        LSM (Kekakuan) <span className="text-slate-400 font-normal">(kPa)</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="5.2"
                        value={formData.lsm}
                        onChange={(e) => handleInputChange('lsm', e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-400 p-2 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        CAP (Lemak) <span className="text-slate-400 font-normal">(dB/m)</span>
                      </label>
                      <input
                        type="number"
                        placeholder="210"
                        value={formData.cap}
                        onChange={(e) => handleInputChange('cap', e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-cyan-400 p-2 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Fungsi Ginjal */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => toggleAccordion('ginjal')}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-amber-50/60 transition-colors"
            >
              <div className="flex items-center gap-2.5 text-amber-600 font-bold text-xs">
                <Droplets className="w-4 h-4" />
                <span>Fungsi Ginjal</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordions.ginjal ? 'rotate-180 text-amber-600' : ''}`} />
            </button>
            
            {openAccordions.ginjal && (
              <div className="p-3.5 bg-white space-y-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Kreatinin <span className="text-slate-400 font-normal">(mg/dL)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.95"
                      value={formData.kreatinin}
                      onChange={(e) => handleInputChange('kreatinin', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-400 p-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      eGFR <span className="text-slate-400 font-normal">(mL/min)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="98"
                      value={formData.egfr}
                      onChange={(e) => handleInputChange('egfr', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-400 p-2 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Ureum <span className="text-slate-400 font-normal">(mg/dL)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="28"
                    value={formData.ureum}
                    onChange={(e) => handleInputChange('ureum', e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-400 p-2 font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Antropometri & BMI */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => toggleAccordion('antropometri')}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-sky-50/60 transition-colors"
            >
              <div className="flex items-center gap-2.5 text-sky-600 font-bold text-xs">
                <Scale className="w-4 h-4" />
                <span>Antropometri & BMI</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordions.antropometri ? 'rotate-180 text-sky-600' : ''}`} />
            </button>
            
            {openAccordions.antropometri && (
              <div className="p-3.5 bg-white space-y-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Berat Badan <span className="text-slate-400 font-normal">(kg)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="65"
                      value={formData.beratBadan}
                      onChange={(e) => handleInputChange('beratBadan', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-400 p-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tinggi Badan <span className="text-slate-400 font-normal">(cm)</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="170"
                      value={formData.tinggiBadan}
                      onChange={(e) => handleInputChange('tinggiBadan', e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-400 p-2 font-medium"
                    />
                  </div>
                </div>

                {/* Live BMI result */}
                {bmiInfo && (
                  <div className={`p-2.5 rounded-lg border text-xs ${bmiInfo.kelas} flex items-center justify-between`}>
                    <div>
                      <div className="font-bold">BMI: {bmiInfo.bmi} kg/m²</div>
                      <div className="text-[11px] opacity-90">{bmiInfo.kategori}</div>
                    </div>
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Load Sample Data button if no records */}
        {!hasData && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onLoadSampleData}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Muat Contoh Data Riwayat
            </button>
          </div>
        )}

      </form>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-2">
        <button
          type="button"
          onClick={handleSubmit}
          className={`w-full font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-98 text-sm ${
            editingEntry
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
          }`}
        >
          {editingEntry ? (
            <>
              <Save className="w-4 h-4" />
              Perbarui Catatan Medis
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Simpan Catatan Baru
            </>
          )}
        </button>

        {editingEntry && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Batal Ubah
          </button>
        )}
      </div>

    </aside>
  );
};
