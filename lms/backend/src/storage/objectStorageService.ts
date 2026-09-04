import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface StoredFileMetadata {
  key: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
}

class ObjectStorageService {
  private localUploadDir: string;

  constructor() {
    this.localUploadDir = ENV.STORAGE_LOCAL_DIR;
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }

  /**
   * Menyimpan berkas biner ke storage backend
   */
  public async uploadFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    folderPrefix = 'general'
  ): Promise<StoredFileMetadata> {
    const ext = path.extname(originalFilename).toLowerCase();
    const uniqueKey = `${folderPrefix}/${Date.now()}-${uuidv4()}${ext}`;
    const destinationPath = path.join(this.localUploadDir, uniqueKey);

    // Pastikan direktori folderPrefix ada
    const folderPath = path.dirname(destinationPath);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Tulis berkas ke disk
    await fs.promises.writeFile(destinationPath, fileBuffer);

    logger.info('File successfully written to object storage', {
      key: uniqueKey,
      sizeBytes: fileBuffer.length,
      mimeType
    });

    const publicUrl = `/api/v1/storage/files/${encodeURIComponent(uniqueKey)}`;

    return {
      key: uniqueKey,
      originalName: originalFilename,
      mimeType,
      sizeBytes: fileBuffer.length,
      publicUrl
    };
  }

  /**
   * Mengambil stream berkas untuk authenticated proxy download
   */
  public async getFile(key: string): Promise<{ buffer: Buffer; filePath: string } | null> {
    // Sanitasi key untuk mencegah path traversal
    const safeKey = key.replace(/\.\./g, '');
    const fullPath = path.join(this.localUploadDir, safeKey);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const buffer = await fs.promises.readFile(fullPath);
    return { buffer, filePath: fullPath };
  }

  /**
   * Menghapus berkas
   */
  public async deleteFile(key: string): Promise<boolean> {
    const safeKey = key.replace(/\.\./g, '');
    const fullPath = path.join(this.localUploadDir, safeKey);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
    return false;
  }
}

export const objectStorageService = new ObjectStorageService();
