export type ParamGroupKey = 'kardio' | 'metabolik' | 'hati' | 'ginjal' | 'antropometri';

export type ParamKey = 
  | 'sistolik' 
  | 'diastolik' 
  | 'hr' 
  | 'gula' 
  | 'kolesterol' 
  | 'trigliserida' 
  | 'asamurat' 
  | 'sgot' 
  | 'sgpt' 
  | 'lsm' 
  | 'cap' 
  | 'kreatinin' 
  | 'egfr' 
  | 'ureum'
  | 'beratBadan'
  | 'tinggiBadan';

export interface HealthEntry {
  id: string;
  tanggal: string; // YYYY-MM-DD
  catatan?: string;
  sistolik?: number;
  diastolik?: number;
  hr?: number;
  gula?: number;
  kolesterol?: number;
  trigliserida?: number;
  asamurat?: number;
  sgot?: number;
  sgpt?: number;
  lsm?: number;
  cap?: number;
  kreatinin?: number;
  egfr?: number;
  ureum?: number;
  beratBadan?: number;
  tinggiBadan?: number;
}

export interface GroupConfig {
  id: ParamGroupKey;
  label: string;
  iconName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface ParamConfigItem {
  key: ParamKey;
  label: string;
  shortLabel?: string;
  unit: string;
  color: string;
  bgColor: string;
  iconName: string;
  group: ParamGroupKey;
  min?: number;
  max?: number;
  step?: string;
  placeholder?: string;
  description?: string;
}

export type DiagnosisLevel = 'normal' | 'optimal' | 'warning' | 'danger' | 'info';

export interface DiagnosisResult {
  teks: string;
  kelas: string;
  level: DiagnosisLevel;
  saran?: string;
  keterangan?: string;
}
