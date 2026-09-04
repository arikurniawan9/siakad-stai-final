import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { objectStorageService } from './objectStorageService.js';
import { logger } from '../config/logger.js';

// Konfigurasi Multer Memory Storage (Maksimum 50MB)
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

/**
 * Upload single file ke Object Storage
 */
export async function handleFileUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: { code: 'NO_FILE_PROVIDED', message: 'Tidak ada berkas yang diunggah.' } });
      return;
    }

    const folderPrefix = (req.body.folderPrefix as string) || (req.query.folder as string) || 'general';
    const metadata = await objectStorageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folderPrefix
    );

    res.status(201).json({
      data: metadata
    });
  } catch (err) {
    logger.error('Error handling file upload:', err);
    next(err);
  }
}

/**
 * Mengambil dan menyajikan berkas (inline preview / download)
 */
export async function handleGetFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Ambil parameter fileKey atau path wildcard
    const fileKey = req.params.fileKey || (req.params as any)[0] || '';
    if (!fileKey) {
      res.status(400).json({ error: { code: 'INVALID_FILE_KEY', message: 'Kunci berkas tidak valid.' } });
      return;
    }

    const decodedKey = decodeURIComponent(fileKey);
    const result = await objectStorageService.getFile(decodedKey);

    if (!result) {
      res.status(404).json({ error: { code: 'FILE_NOT_FOUND', message: 'Berkas tidak ditemukan di penyimpanan server.' } });
      return;
    }

    const ext = path.extname(decodedKey).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (ext === '.pptx') contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    else if (ext === '.zip') contentType = 'application/zip';
    else if (ext === '.mp4') contentType = 'video/mp4';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(decodedKey)}"`);
    res.send(result.buffer);
  } catch (err) {
    logger.error('Error serving file:', err);
    next(err);
  }
}
