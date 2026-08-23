// Google Drive & OAuth Service for HealthTrack
import { HealthEntry, ParamKey } from '../types';
import { paramConfig } from '../utils/healthCalculations';

declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleDriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  recordCount?: number;
}

export interface GoogleUserInfo {
  email?: string;
  name?: string;
  picture?: string;
}

const BACKUP_FILENAME_PREFIX = 'healthtrack_backup_';
const BACKUP_FOLDER_MIME = 'application/vnd.google-apps.folder';
const STORAGE_AUTOSYNC_KEY = 'healthtrack_autosync_enabled';
const STORAGE_USER_EMAIL_KEY = 'healthtrack_connected_email';
const STORAGE_LAST_SYNC_KEY = 'healthtrack_last_synced_at';

export class GoogleDriveService {
  private static tokenClient: any = null;
  private static accessToken: string | null = null;
  private static tokenExpiresAt: number = 0;
  private static syncInProgress: boolean = false;

  /**
   * Mengambil Client ID dari environment atau fallback Google Cloud ID
   */
  public static getClientId(): string {
    return (
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      (import.meta as any).env?.GOOGLE_CLIENT_ID ||
      '421102845950-web.apps.googleusercontent.com'
    );
  }

  public static isAutoSyncEnabled(): boolean {
    try {
      return localStorage.getItem(STORAGE_AUTOSYNC_KEY) === 'true';
    } catch {
      return false;
    }
  }

  public static setAutoSyncEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_AUTOSYNC_KEY, enabled ? 'true' : 'false');
    } catch {}
  }

  public static getSavedUserEmail(): string | null {
    try {
      return localStorage.getItem(STORAGE_USER_EMAIL_KEY);
    } catch {
      return null;
    }
  }

  public static setSavedUserEmail(email: string | null): void {
    try {
      if (email) {
        localStorage.setItem(STORAGE_USER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(STORAGE_USER_EMAIL_KEY);
      }
    } catch {}
  }

  public static getLastSyncTime(): string | null {
    try {
      return localStorage.getItem(STORAGE_LAST_SYNC_KEY);
    } catch {
      return null;
    }
  }

  public static setLastSyncTime(): void {
    try {
      localStorage.setItem(STORAGE_LAST_SYNC_KEY, new Date().toISOString());
    } catch {}
  }

  /**
   * Meminta Access Token OAuth secara interaktif di browser
   */
  public static async requestAccessToken(silent: boolean = false): Promise<string> {
    // Jika token masih valid (dengan buffer 60 detik)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    return new Promise((resolve, reject) => {
      const initAuth = () => {
        if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
          reject(new Error('Google Identity Services SDK belum selesai dimuat. Silakan muat ulang halaman.'));
          return;
        }

        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: this.getClientId(),
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: (tokenResponse: any) => {
              if (tokenResponse && tokenResponse.access_token) {
                this.accessToken = tokenResponse.access_token;
                const expiresInSeconds = tokenResponse.expires_in ? parseInt(tokenResponse.expires_in, 10) : 3599;
                this.tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
                
                // Ambil email user di background
                this.getUserProfile(tokenResponse.access_token).then(profile => {
                  if (profile?.email) {
                    this.setSavedUserEmail(profile.email);
                  }
                }).catch(() => {});

                resolve(tokenResponse.access_token);
              } else if (tokenResponse && tokenResponse.error) {
                reject(new Error(`Autentikasi gagal: ${tokenResponse.error_description || tokenResponse.error}`));
              } else {
                reject(new Error('Gagal mendapatkan token akses Google Drive.'));
              }
            },
            error_callback: (err: any) => {
              reject(new Error(`OAuth Error: ${err.message || 'Pop-up otorisasi ditutup atau diblokir.'}`));
            }
          });

          client.requestAccessToken({ prompt: silent ? 'none' : '' });
        } catch (err: any) {
          reject(new Error(`Gagal menginisialisasi OAuth: ${err.message}`));
        }
      };

      if (window.google?.accounts?.oauth2) {
        initAuth();
      } else {
        let retries = 0;
        const interval = setInterval(() => {
          retries++;
          if (window.google?.accounts?.oauth2) {
            clearInterval(interval);
            initAuth();
          } else if (retries > 25) {
            clearInterval(interval);
            reject(new Error('Google Identity Services SDK gagal dimuat. Periksa koneksi internet Anda.'));
          }
        }, 150);
      }
    });
  }

  /**
   * Mengambil info profil user (Email & Nama)
   */
  public static async getUserProfile(token: string): Promise<GoogleUserInfo | null> {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) return null;
      const profile = await res.json();
      if (profile?.email) {
        this.setSavedUserEmail(profile.email);
      }
      return profile;
    } catch {
      return null;
    }
  }

  /**
   * Mencari atau membuat folder khusus "HealthTrack_Backups" di Google Drive
   */
  private static async getOrCreateAppFolder(token: string): Promise<string> {
    const folderName = 'HealthTrack_Backups';
    
    // Cari folder
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `name='${folderName}' and mimeType='${BACKUP_FOLDER_MIME}' and trashed=false`
      )}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Jika tidak ada, buat folder baru
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: BACKUP_FOLDER_MIME
      })
    });

    if (!createRes.ok) {
      throw new Error('Gagal membuat folder cadangan di Google Drive.');
    }

    const newFolder = await createRes.json();
    return newFolder.id;
  }

  /**
   * Unggah cadangan data HealthTrack ke Google Drive
   */
  public static async backupToGoogleDrive(entries: HealthEntry[]): Promise<{ fileId: string; fileName: string }> {
    const token = await this.requestAccessToken();
    const folderId = await this.getOrCreateAppFolder(token);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    const fileName = `${BACKUP_FILENAME_PREFIX}${dateStr}_${timeStr}.json`;

    const payload = {
      app: 'HealthTrack',
      version: '2.0',
      exportedAt: now.toISOString(),
      recordCount: entries.length,
      data: entries
    };

    const fileContent = JSON.stringify(payload, null, 2);

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
      description: `Cadangan data kesehatan HealthTrack (${entries.length} catatan) dibuat pada ${now.toLocaleString('id-ID')}`
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || 'Gagal mengunggah file cadangan ke Google Drive.');
    }

    const result = await response.json();
    this.setLastSyncTime();
    return {
      fileId: result.id,
      fileName
    };
  }

  /**
   * Lakukan sinkronisasi otomatis di latar belakang jika diizinkan
   */
  public static async autoBackupInBackground(entries: HealthEntry[]): Promise<boolean> {
    if (!this.isAutoSyncEnabled() || this.syncInProgress || entries.length === 0) {
      return false;
    }

    // Hanya jika sudah punya access token yang aktif
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt - 30000) {
      return false;
    }

    try {
      this.syncInProgress = true;
      await this.backupToGoogleDrive(entries);
      return true;
    } catch (e) {
      console.warn('Auto backup background gagal:', e);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Mengambil daftar file cadangan HealthTrack yang tersimpan di Google Drive
   */
  public static async listBackups(): Promise<GoogleDriveBackupFile[]> {
    const token = await this.requestAccessToken();

    const query = `name contains '${BACKUP_FILENAME_PREFIX}' and trashed=false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&orderBy=createdTime desc&fields=files(id,name,createdTime,modifiedTime,size)&pageSize=25`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || 'Gagal membaca daftar cadangan dari Google Drive.');
    }

    const data = await response.json();
    return data.files || [];
  }

  /**
   * Memeriksa cadangan terbaru yang ada di cloud untuk sinkronisasi otomatis antar perangkat
   */
  public static async checkLatestCloudBackup(): Promise<{ file: GoogleDriveBackupFile; entries: HealthEntry[] } | null> {
    const token = await this.requestAccessToken();
    const list = await this.listBackups();
    if (list.length === 0) return null;

    const latest = list[0];
    const entries = await this.restoreFromGoogleDrive(latest.id);
    return {
      file: latest,
      entries
    };
  }

  /**
   * Memulihkan (download & parse) data kesehatan dari file di Google Drive
   */
  public static async restoreFromGoogleDrive(fileId: string): Promise<HealthEntry[]> {
    const token = await this.requestAccessToken();

    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Gagal mengunduh file cadangan dari Google Drive.');
    }

    const rawData = await response.json();

    this.setLastSyncTime();

    if (Array.isArray(rawData)) {
      return rawData;
    } else if (rawData && Array.isArray(rawData.data)) {
      return rawData.data;
    } else {
      throw new Error('Format file cadangan tidak dikenali atau kosong.');
    }
  }

  /**
   * Menghapus file backup lama di Google Drive
   */
  public static async deleteBackup(fileId: string): Promise<void> {
    const token = await this.requestAccessToken();

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok && response.status !== 404) {
      throw new Error('Gagal menghapus file cadangan.');
    }
  }

  /**
   * Parser file CSV kesehatan
   */
  public static parseCsv(csvText: string): HealthEntry[] {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('File CSV tidak memiliki baris data.');
    }

    // Header line
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const paramMap: { [colIndex: number]: ParamKey } = {};
    let dateCol = -1;
    let notesCol = -1;

    // Scan headers to map columns
    headers.forEach((h, idx) => {
      const lower = h.toLowerCase();
      if (lower.includes('tanggal') || lower.includes('date')) {
        dateCol = idx;
      } else if (lower.includes('catatan') || lower.includes('note')) {
        notesCol = idx;
      } else {
        // Cari matching paramConfig
        const foundKey = (Object.keys(paramConfig) as ParamKey[]).find(k => {
          const cfg = paramConfig[k];
          return lower.includes(cfg.label.toLowerCase()) || lower.startsWith(k.toLowerCase());
        });
        if (foundKey) {
          paramMap[idx] = foundKey;
        }
      }
    });

    if (dateCol === -1) {
      dateCol = 0; // Default first col
    }

    const result: HealthEntry[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV splitter respecting quotes
      const values: string[] = [];
      let inQuotes = false;
      let curVal = '';

      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(curVal.trim().replace(/^"|"$/g, ''));
          curVal = '';
        } else {
          curVal += char;
        }
      }
      values.push(curVal.trim().replace(/^"|"$/g, ''));

      const tanggalRaw = values[dateCol] || new Date().toISOString().split('T')[0];
      const entry: HealthEntry = {
        id: `csv-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        tanggal: tanggalRaw,
        catatan: notesCol !== -1 ? values[notesCol] : ''
      };

      let hasParam = false;
      Object.entries(paramMap).forEach(([colIdxStr, paramKey]) => {
        const cIdx = parseInt(colIdxStr, 10);
        const valStr = values[cIdx];
        if (valStr && valStr.trim() !== '') {
          const numVal = parseFloat(valStr.replace(',', '.'));
          if (!isNaN(numVal)) {
            entry[paramKey] = numVal;
            hasParam = true;
          }
        }
      });

      if (hasParam) {
        result.push(entry);
      }
    }

    if (result.length === 0) {
      throw new Error('Tidak ada baris data metrik kesehatan yang valid ditemukan dalam CSV.');
    }

    return result;
  }
}
