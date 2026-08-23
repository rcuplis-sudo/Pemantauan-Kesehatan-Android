import { ParamConfigItem, GroupConfig, DiagnosisResult, HealthEntry, ParamKey, ParamGroupKey } from '../types';

export const groupConfigs: Record<ParamGroupKey, GroupConfig> = {
  kardio: {
    id: 'kardio',
    label: 'Kardiovaskular',
    iconName: 'Heart',
    color: '#ef4444',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
    badgeText: 'text-red-600',
  },
  metabolik: {
    id: 'metabolik',
    label: 'Metabolik & Profil Lipid',
    iconName: 'Boxes',
    color: '#9333ea',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'text-purple-600',
  },
  hati: {
    id: 'hati',
    label: 'Fungsi Hati & FibroScan',
    iconName: 'Activity',
    color: '#16a34a',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-600',
  },
  ginjal: {
    id: 'ginjal',
    label: 'Fungsi Ginjal',
    iconName: 'Droplets',
    color: '#ea580c',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'text-amber-600',
  },
  antropometri: {
    id: 'antropometri',
    label: 'Antropometri & BMI',
    iconName: 'Scale',
    color: '#0284c7',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeText: 'text-sky-600',
  }
};

export const paramConfig: Record<ParamKey, ParamConfigItem> = {
  // Kardiovaskular
  sistolik: {
    key: 'sistolik',
    label: 'Tekanan Darah Sistolik',
    shortLabel: 'Sistolik',
    unit: 'mmHg',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    iconName: 'HeartPulse',
    group: 'kardio',
    min: 90,
    max: 120,
    step: '1',
    placeholder: 'Contoh: 120',
    description: 'Batas optimal: <120 mmHg'
  },
  diastolik: {
    key: 'diastolik',
    label: 'Tekanan Darah Diastolik',
    shortLabel: 'Diastolik',
    unit: 'mmHg',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    iconName: 'HeartHandshake',
    group: 'kardio',
    min: 60,
    max: 80,
    step: '1',
    placeholder: 'Contoh: 80',
    description: 'Batas optimal: <80 mmHg'
  },
  hr: {
    key: 'hr',
    label: 'Denyut Nadi (Heart Rate)',
    shortLabel: 'Heart Rate',
    unit: 'bpm',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    iconName: 'Flame',
    group: 'kardio',
    min: 60,
    max: 100,
    step: '1',
    placeholder: 'Contoh: 72',
    description: 'Normal saat istirahat: 60 - 100 bpm'
  },

  // Metabolik & Lipid
  gula: {
    key: 'gula',
    label: 'Gula Darah (Puasa/Sewaktu)',
    shortLabel: 'Gula Darah',
    unit: 'mg/dL',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.12)',
    iconName: 'Sparkles',
    group: 'metabolik',
    min: 70,
    max: 140,
    step: '1',
    placeholder: 'Contoh: 95',
    description: 'Normal puasa: 70-99, sewaktu: <140 mg/dL'
  },
  kolesterol: {
    key: 'kolesterol',
    label: 'Kolesterol Total',
    shortLabel: 'Kolesterol Total',
    unit: 'mg/dL',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.12)',
    iconName: 'CircleDot',
    group: 'metabolik',
    min: 0,
    max: 200,
    step: '1',
    placeholder: 'Contoh: 180',
    description: 'Kadar ideal: <200 mg/dL'
  },
  trigliserida: {
    key: 'trigliserida',
    label: 'Trigliserida',
    shortLabel: 'Trigliserida',
    unit: 'mg/dL',
    color: '#ca8a04',
    bgColor: 'rgba(202, 138, 4, 0.12)',
    iconName: 'FlaskConical',
    group: 'metabolik',
    min: 0,
    max: 150,
    step: '1',
    placeholder: 'Contoh: 130',
    description: 'Normal: <150 mg/dL'
  },
  asamurat: {
    key: 'asamurat',
    label: 'Asam Urat (Uric Acid)',
    shortLabel: 'Asam Urat',
    unit: 'mg/dL',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    iconName: 'Gem',
    group: 'metabolik',
    min: 2.5,
    max: 7.0,
    step: '0.1',
    placeholder: 'Contoh: 5.4',
    description: 'Pria: 3.5-7.2, Wanita: 2.6-6.0 mg/dL'
  },

  // Hati & FibroScan
  sgot: {
    key: 'sgot',
    label: 'SGOT / AST',
    shortLabel: 'SGOT',
    unit: 'U/L',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.12)',
    iconName: 'Dna',
    group: 'hati',
    min: 0,
    max: 45,
    step: '1',
    placeholder: 'Contoh: 24',
    description: 'Nilai rujukan normal: 0 - 45 U/L'
  },
  sgpt: {
    key: 'sgpt',
    label: 'SGPT / ALT',
    shortLabel: 'SGPT',
    unit: 'U/L',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    iconName: 'TestTube',
    group: 'hati',
    min: 0,
    max: 56,
    step: '1',
    placeholder: 'Contoh: 28',
    description: 'Nilai rujukan normal: 0 - 56 U/L'
  },
  lsm: {
    key: 'lsm',
    label: 'FibroScan LSM (Liver Stiffness)',
    shortLabel: 'LSM (Kekakuan)',
    unit: 'kPa',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.12)',
    iconName: 'Gauge',
    group: 'hati',
    min: 0,
    max: 7.0,
    step: '0.1',
    placeholder: 'Contoh: 5.2',
    description: 'Normal (F0-F1): < 7.0 kPa'
  },
  cap: {
    key: 'cap',
    label: 'FibroScan CAP (Steatosis / Lemak Hati)',
    shortLabel: 'CAP (Lemak Hati)',
    unit: 'dB/m',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    iconName: 'Layers',
    group: 'hati',
    min: 0,
    max: 238,
    step: '1',
    placeholder: 'Contoh: 210',
    description: 'Normal (S0 Tanpa Perlemakan): < 238 dB/m'
  },

  // Ginjal
  kreatinin: {
    key: 'kreatinin',
    label: 'Kreatinin Serum',
    shortLabel: 'Kreatinin',
    unit: 'mg/dL',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    iconName: 'Vial',
    group: 'ginjal',
    min: 0.6,
    max: 1.3,
    step: '0.01',
    placeholder: 'Contoh: 0.95',
    description: 'Pria: 0.7-1.3, Wanita: 0.6-1.1 mg/dL'
  },
  egfr: {
    key: 'egfr',
    label: 'eGFR (Laju Filtrasi Glomerulus)',
    shortLabel: 'eGFR',
    unit: 'mL/min/1.73m²',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.12)',
    iconName: 'Filter',
    group: 'ginjal',
    min: 90,
    max: 200,
    step: '0.1',
    placeholder: 'Contoh: 98',
    description: 'Fungsi Ginjal Normal / Tahap 1: >= 90 mL/min'
  },
  ureum: {
    key: 'ureum',
    label: 'Ureum / Blood Urea Nitrogen',
    shortLabel: 'Ureum',
    unit: 'mg/dL',
    color: '#fb923c',
    bgColor: 'rgba(251, 146, 60, 0.12)',
    iconName: 'ShieldAlert',
    group: 'ginjal',
    min: 15,
    max: 40,
    step: '1',
    placeholder: 'Contoh: 28',
    description: 'Nilai normal: 15 - 40 mg/dL'
  },

  // Antropometri
  beratBadan: {
    key: 'beratBadan',
    label: 'Berat Badan',
    shortLabel: 'Berat Badan',
    unit: 'kg',
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.12)',
    iconName: 'Weight',
    group: 'antropometri',
    min: 40,
    max: 120,
    step: '0.5',
    placeholder: 'Contoh: 65',
    description: 'Gunakan timbangan kalibrasi'
  },
  tinggiBadan: {
    key: 'tinggiBadan',
    label: 'Tinggi Badan',
    shortLabel: 'Tinggi Badan',
    unit: 'cm',
    color: '#0369a1',
    bgColor: 'rgba(3, 105, 161, 0.12)',
    iconName: 'Ruler',
    group: 'antropometri',
    min: 100,
    max: 220,
    step: '0.5',
    placeholder: 'Contoh: 170',
    description: 'Tinggi badan tanpa alas kaki'
  }
};

export function cekDiagnosa(nilai: number | undefined | null, key: ParamKey): DiagnosisResult | null {
  if (nilai === undefined || nilai === null || isNaN(nilai)) return null;

  switch (key) {
    case 'sistolik':
      if (nilai < 90) {
        return { teks: 'Hipotensi', kelas: 'bg-yellow-50 text-yellow-700 border-yellow-200', level: 'warning', saran: 'Cukupi cairan dan istirahat' };
      } else if (nilai <= 120) {
        return { teks: 'Optimal', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal', saran: 'Pertahankan gaya hidup sehat' };
      } else if (nilai <= 129) {
        return { teks: 'Normal Tinggi', kelas: 'bg-amber-50 text-amber-700 border-amber-200', level: 'info', saran: 'Batasi konsumsi garam berlebih' };
      } else if (nilai <= 139) {
        return { teks: 'Prahipertensi', kelas: 'bg-orange-50 text-orange-700 border-orange-200', level: 'warning', saran: 'Rutin olahraga dan kurangi stres' };
      } else if (nilai <= 159) {
        return { teks: 'Hipertensi Derajat 1', kelas: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold', level: 'danger', saran: 'Konsultasikan ke dokter spesialis' };
      } else {
        return { teks: 'Hipertensi Derajat 2', kelas: 'bg-red-100 text-red-800 border-red-300 font-bold', level: 'danger', saran: 'Perlu evaluasi medis segera' };
      }

    case 'diastolik':
      if (nilai < 60) {
        return { teks: 'Hipotensi', kelas: 'bg-yellow-50 text-yellow-700 border-yellow-200', level: 'warning' };
      } else if (nilai <= 80) {
        return { teks: 'Optimal', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else if (nilai <= 84) {
        return { teks: 'Normal Tinggi', kelas: 'bg-amber-50 text-amber-700 border-amber-200', level: 'info' };
      } else if (nilai <= 89) {
        return { teks: 'Prahipertensi', kelas: 'bg-orange-50 text-orange-700 border-orange-200', level: 'warning' };
      } else if (nilai <= 99) {
        return { teks: 'Hipertensi Derajat 1', kelas: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold', level: 'danger' };
      } else {
        return { teks: 'Hipertensi Derajat 2', kelas: 'bg-red-100 text-red-800 border-red-300 font-bold', level: 'danger' };
      }

    case 'hr':
      if (nilai < 60) {
        return { teks: 'Bradikardia (<60 bpm)', kelas: 'bg-sky-50 text-sky-700 border-sky-200', level: 'info' };
      } else if (nilai <= 100) {
        return { teks: 'Normal (60-100 bpm)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else {
        return { teks: 'Takikardia (>100 bpm)', kelas: 'bg-rose-50 text-rose-700 border-rose-200', level: 'warning' };
      }

    case 'gula':
      if (nilai < 70) {
        return { teks: 'Hipoglikemia (<70)', kelas: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold', level: 'danger', saran: 'Konsumsi sumber glukosa cepat serap' };
      } else if (nilai <= 100) {
        return { teks: 'Optimal Puasa', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else if (nilai <= 139) {
        return { teks: 'Normal Sewaktu', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else if (nilai <= 199) {
        return { teks: 'Pre-Diabetes', kelas: 'bg-orange-50 text-orange-700 border-orange-200 font-medium', level: 'warning', saran: 'Atur pola karbohidrat dan olahraga' };
      } else {
        return { teks: 'Diabetes Mellitus', kelas: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', level: 'danger', saran: 'Periksakan HbA1c dan konsultasi dokter' };
      }

    case 'kolesterol':
      if (nilai < 200) {
        return { teks: 'Optimal (<200)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else if (nilai <= 239) {
        return { teks: 'Batas Risiko (Borderline)', kelas: 'bg-orange-50 text-orange-700 border-orange-200', level: 'warning', saran: 'Kurangi makanan tinggi lemak jenuh' };
      } else {
        return { teks: 'Hiperkolesterolemia (Tinggi)', kelas: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', level: 'danger', saran: 'Perlu evaluasi profil lipid lengkap (HDL, LDL)' };
      }

    case 'trigliserida':
      if (nilai < 150) {
        return { teks: 'Normal (<150)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else if (nilai <= 199) {
        return { teks: 'Batas Ambang (150-199)', kelas: 'bg-orange-50 text-orange-700 border-orange-200', level: 'warning' };
      } else if (nilai <= 499) {
        return { teks: 'Tinggi (200-499)', kelas: 'bg-rose-50 text-rose-700 border-rose-200 font-medium', level: 'danger' };
      } else {
        return { teks: 'Sangat Tinggi (≥500)', kelas: 'bg-red-100 text-red-800 border-red-300 font-bold', level: 'danger', saran: 'Risiko pankreatitis, segera periksa ke dokter' };
      }

    case 'asamurat':
      if (nilai < 2.5) {
        return { teks: 'Rendah (<2.5)', kelas: 'bg-yellow-50 text-yellow-700 border-yellow-200', level: 'info' };
      } else if (nilai <= 7.0) {
        return { teks: 'Normal', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else {
        return { teks: 'Hiperurisemia (Tinggi)', kelas: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', level: 'danger', saran: 'Batasi jeroan, seafood, dan minum air putih yang cukup' };
      }

    case 'sgot':
      if (nilai <= 35) {
        return { teks: 'Normal (<35 U/L)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else if (nilai <= 70) {
        return { teks: 'Meningkat Ringan', kelas: 'bg-amber-50 text-amber-700 border-amber-200', level: 'warning' };
      } else {
        return { teks: 'Meningkat Signifikan', kelas: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', level: 'danger' };
      }

    case 'sgpt':
      if (nilai <= 45) {
        return { teks: 'Normal (<45 U/L)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else if (nilai <= 90) {
        return { teks: 'Meningkat Ringan', kelas: 'bg-amber-50 text-amber-700 border-amber-200', level: 'warning' };
      } else {
        return { teks: 'Meningkat Signifikan', kelas: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', level: 'danger' };
      }

    case 'lsm':
      if (nilai < 7.0) {
        return { teks: 'F0-F1 (Normal/Minimal)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal', keterangan: 'Kekakuan hati dalam batas normal' };
      } else if (nilai < 9.5) {
        return { teks: 'F2 (Fibrosis Sedang)', kelas: 'bg-orange-50 text-orange-700 border-orange-200 font-medium', level: 'warning', keterangan: 'Terdapat fibrosis moderate' };
      } else if (nilai < 12.5) {
        return { teks: 'F3 (Fibrosis Berat)', kelas: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold', level: 'danger', keterangan: 'Fibrosis lanjut' };
      } else {
        return { teks: 'F4 (Sirosis Hati)', kelas: 'bg-red-100 text-red-800 border-red-300 font-bold', level: 'danger', keterangan: 'Perlu pendampingan spesialis hepatologi' };
      }

    case 'cap':
      if (nilai < 238) {
        return { teks: 'S0 (Tanpa Steatosis)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal', keterangan: 'Kadar lemak hati normal' };
      } else if (nilai <= 259) {
        return { teks: 'S1 (Perlemakan Ringan)', kelas: 'bg-amber-50 text-amber-700 border-amber-200', level: 'info', keterangan: 'Steatosis derajat ringan' };
      } else if (nilai <= 290) {
        return { teks: 'S2 (Perlemakan Sedang)', kelas: 'bg-orange-50 text-orange-700 border-orange-200 font-medium', level: 'warning', keterangan: 'Steatosis derajat sedang' };
      } else {
        return { teks: 'S3 (Perlemakan Berat)', kelas: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', level: 'danger', keterangan: 'Steatosis derajat berat' };
      }

    case 'kreatinin':
      if (nilai < 0.6) {
        return { teks: 'Rendah (<0.6)', kelas: 'bg-yellow-50 text-yellow-700 border-yellow-200', level: 'info' };
      } else if (nilai <= 1.3) {
        return { teks: 'Normal (0.6 - 1.3)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else {
        return { teks: 'Meningkat (>1.3)', kelas: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', level: 'danger', saran: 'Periksa fungsi ginjal dan hidrasi tubuh' };
      }

    case 'egfr':
      if (nilai >= 90) {
        return { teks: 'Tahap 1 (Normal ≥90)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal', keterangan: 'Fungsi ginjal sangat baik' };
      } else if (nilai >= 60) {
        return { teks: 'Tahap 2 (Penurunan Ringan)', kelas: 'bg-amber-50 text-amber-700 border-amber-200', level: 'warning', keterangan: '60 - 89 mL/min' };
      } else if (nilai >= 30) {
        return { teks: 'Tahap 3 (Penurunan Sedang)', kelas: 'bg-orange-100 text-orange-800 border-orange-300 font-medium', level: 'warning', keterangan: '30 - 59 mL/min' };
      } else if (nilai >= 15) {
        return { teks: 'Tahap 4 (Penurunan Berat)', kelas: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', level: 'danger', keterangan: '15 - 29 mL/min' };
      } else {
        return { teks: 'Tahap 5 (Gagal Ginjal Akut/Kronis)', kelas: 'bg-red-200 text-red-900 border-red-400 font-bold', level: 'danger', keterangan: '<15 mL/min' };
      }

    case 'ureum':
      if (nilai < 15) {
        return { teks: 'Rendah (<15)', kelas: 'bg-yellow-50 text-yellow-700 border-yellow-200', level: 'info' };
      } else if (nilai <= 45) {
        return { teks: 'Normal (15 - 45)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200', level: 'normal' };
      } else {
        return { teks: 'Tinggi (>45)', kelas: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', level: 'danger' };
      }

    case 'beratBadan':
    case 'tinggiBadan':
      return null;

    default:
      return null;
  }
}

export function hitungBMI(beratKg?: number, tinggiCm?: number): { bmi: number; kategori: string; kelas: string } | null {
  if (!beratKg || !tinggiCm || tinggiCm <= 0 || beratKg <= 0) return null;
  const tinggiM = tinggiCm / 100;
  const bmi = parseFloat((beratKg / (tinggiM * tinggiM)).toFixed(1));
  
  if (bmi < 18.5) {
    return { bmi, kategori: 'Berat Badan Kurang (Underweight)', kelas: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
  } else if (bmi <= 22.9) {
    return { bmi, kategori: 'Normal / Ideal (Asia Pasifik)', kelas: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  } else if (bmi <= 24.9) {
    return { bmi, kategori: 'Kelebihan Berat Badan (Overweight)', kelas: 'bg-orange-50 text-orange-700 border-orange-200' };
  } else {
    return { bmi, kategori: 'Obesitas (Perlu Diet & Olahraga)', kelas: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold' };
  }
}

export const SAMPLE_HEALTH_DATA: HealthEntry[] = [
  {
    id: 'sample-1',
    tanggal: '2026-06-15',
    catatan: 'Pemeriksaan Rutin Awal Tahun',
    sistolik: 135,
    diastolik: 88,
    hr: 78,
    gula: 118,
    kolesterol: 215,
    trigliserida: 175,
    asamurat: 7.2,
    sgot: 32,
    sgpt: 38,
    lsm: 6.4,
    cap: 248,
    kreatinin: 1.05,
    egfr: 85,
    ureum: 32,
    beratBadan: 74,
    tinggiBadan: 170
  },
  {
    id: 'sample-2',
    tanggal: '2026-07-10',
    catatan: 'Evaluasi Setelah Pola Makan Rendah Lemak & Jalan Kaki',
    sistolik: 128,
    diastolik: 84,
    hr: 74,
    gula: 104,
    kolesterol: 198,
    trigliserida: 155,
    asamurat: 6.5,
    sgot: 28,
    sgpt: 32,
    lsm: 5.9,
    cap: 232,
    kreatinin: 0.98,
    egfr: 91,
    ureum: 29,
    beratBadan: 72.5,
    tinggiBadan: 170
  },
  {
    id: 'sample-3',
    tanggal: '2026-08-15',
    catatan: 'Hasil Kontrol Terkini (Progres Sangat Baik)',
    sistolik: 118,
    diastolik: 78,
    hr: 70,
    gula: 92,
    kolesterol: 182,
    trigliserida: 138,
    asamurat: 5.8,
    sgot: 24,
    sgpt: 26,
    lsm: 5.2,
    cap: 215,
    kreatinin: 0.92,
    egfr: 96,
    ureum: 26,
    beratBadan: 70.8,
    tinggiBadan: 170
  }
];
