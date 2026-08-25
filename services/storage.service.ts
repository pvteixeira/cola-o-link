import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import { APP_CONFIG } from '@/config/app.config';
import { assertSafeFilePath } from '@/lib/security/sanitize';

export interface StoredFileMetadata {
  jobId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: number;
  expiresAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __colaOLinkStorageService: StorageService | undefined;
}

export class StorageService {
  private fileRegistry = new Map<string, StoredFileMetadata>();
  private candidateDirs: string[];

  constructor() {
    this.candidateDirs = [
      path.resolve(process.cwd(), 'temp_downloads'),
      path.join(os.tmpdir(), 'colaolink-downloads'),
      APP_CONFIG.storage.tempDir,
    ];
    this.ensureStorageDirs();
  }

  public static getInstance(): StorageService {
    if (!global.__colaOLinkStorageService) {
      global.__colaOLinkStorageService = new StorageService();
    }
    return global.__colaOLinkStorageService;
  }

  public async ensureStorageDirs(): Promise<void> {
    for (const dir of this.candidateDirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch {
        // Ignora
      }
    }
  }

  public async registerFile(jobId: string, metadata: Omit<StoredFileMetadata, 'createdAt' | 'expiresAt'>): Promise<void> {
    const now = Date.now();
    const entry: StoredFileMetadata = {
      ...metadata,
      createdAt: now,
      expiresAt: now + APP_CONFIG.storage.fileTTLMs,
    };

    this.fileRegistry.set(jobId, entry);

    // Salva metadados em todos os diretórios candidatos para garantir persistência total
    for (const dir of this.candidateDirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        const metaPath = path.join(dir, `${jobId}.meta.json`);
        await fs.writeFile(metaPath, JSON.stringify(entry), 'utf-8');
      } catch {
        // Ignora erro individual
      }
    }
  }

  public getFile(jobId: string): StoredFileMetadata | null {
    // 1. Tenta recuperar da memória
    const meta = this.fileRegistry.get(jobId);
    if (meta) {
      if (Date.now() > meta.expiresAt) {
        this.deleteFile(jobId);
        return null;
      }
      return meta;
    }

    // 2. Fallback: busca arquivo meta.json em todos os diretórios candidatos
    for (const dir of this.candidateDirs) {
      try {
        const metaPath = path.join(dir, `${jobId}.meta.json`);
        if (fsSync.existsSync(metaPath)) {
          const raw = fsSync.readFileSync(metaPath, 'utf-8');
          const diskMeta: StoredFileMetadata = JSON.parse(raw);
          if (Date.now() > diskMeta.expiresAt) {
            this.deleteFile(jobId);
            return null;
          }
          this.fileRegistry.set(jobId, diskMeta);
          return diskMeta;
        }
      } catch {
        // Ignora
      }
    }

    return null;
  }

  public async deleteFile(jobId: string): Promise<void> {
    const meta = this.getFile(jobId);
    this.fileRegistry.delete(jobId);

    if (meta) {
      try {
        const safePath = assertSafeFilePath(meta.filePath);
        if (fsSync.existsSync(safePath)) {
          await fs.unlink(safePath);
        }
      } catch {
        // Ignora
      }
    }

    for (const dir of this.candidateDirs) {
      try {
        const metaPath = path.join(dir, `${jobId}.meta.json`);
        if (fsSync.existsSync(metaPath)) {
          await fs.unlink(metaPath);
        }
      } catch {
        // Ignora
      }
    }
  }

  public async cleanupExpiredFiles(): Promise<number> {
    let deletedCount = 0;
    const now = Date.now();

    for (const [jobId, meta] of this.fileRegistry.entries()) {
      if (now > meta.expiresAt) {
        await this.deleteFile(jobId);
        deletedCount++;
      }
    }

    for (const dir of this.candidateDirs) {
      try {
        if (!fsSync.existsSync(dir)) continue;
        const files = await fs.readdir(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          try {
            const stats = await fs.stat(fullPath);
            if (now - stats.mtimeMs > APP_CONFIG.storage.fileTTLMs) {
              await fs.unlink(fullPath);
              deletedCount++;
            }
          } catch {
            // Ignora
          }
        }
      } catch {
        // Ignora
      }
    }

    return deletedCount;
  }
}

export const storageService = StorageService.getInstance();
