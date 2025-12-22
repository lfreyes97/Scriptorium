import { BaseDirectory, readTextFile, writeTextFile, writeFile as writeBinaryFile, mkdir, exists, readDir, stat, metadata } from '@tauri-apps/plugin-fs';
import { homeDir, join } from '@tauri-apps/api/path';

export interface FileEntry {
  id: string;
  name: string;
  type: 'file' | 'folder';
  date: string;
  size?: string;
  itemsCount?: number;
}

class FileSystemService {
  private baseDir: string = 'Documentos/Scriptorium';

  async getBasePath(): Promise<string> {
    const home = await homeDir();
    return await join(home, this.baseDir);
  }

  async ensureDirectoryExists(): Promise<void> {
    const path = await this.getBasePath();
    const doesExist = await exists(path);

    if (!doesExist) {
      try {
        await mkdir(path, { recursive: true });
      } catch (e) {
        console.error("Failed to create directory:", e);
        throw e;
      }
    }
  }

  async writeFile(filename: string, content: string): Promise<void> {
    await this.ensureDirectoryExists();
    const basePath = await this.getBasePath();
    const path = await join(basePath, filename);
    await writeTextFile(path, content);
  }

  async readFile(filename: string): Promise<string> {
    const basePath = await this.getBasePath();
    const path = await join(basePath, filename);
    return await readTextFile(path);
  }

  // --- New Methods for KnowledgeBaseView ---

  async listFiles(subPath: string = '/'): Promise<FileEntry[]> {
    await this.ensureDirectoryExists();
    const basePath = await this.getBasePath();
    // Normalize subPath: ensure it doesn't start with / if we are joining, or handle it carefully
    // If subPath is '/', we just use basePath.
    const targetPath = subPath === '/' ? basePath : await join(basePath, subPath);

    try {
      const entries = await readDir(targetPath);
      const fileEntries: FileEntry[] = [];

      for (const entry of entries) {
        const fullPath = await join(targetPath, entry.name);

        let stats;
        try {
          stats = await stat(fullPath);
        } catch (e) {
          console.warn(`Could not get stats for ${fullPath}`, e);
          stats = { mtime: new Date(), size: 0 }; // Fallback
        }

        const isDir = entry.isDirectory;

        fileEntries.push({
          id: subPath === '/' ? entry.name : `${subPath}/${entry.name}`, // Simple relative path as ID
          name: entry.name,
          type: isDir ? 'folder' : 'file',
          date: stats.mtime ? new Date(stats.mtime).toLocaleDateString() : 'Unknown', // Simplistic date formatting
          size: isDir ? undefined : this.formatSize(stats.size || 0),
          itemsCount: isDir ? 0 : undefined, // We'd need to recursive count to be accurate, setting 0 for now
        });
      }
      return fileEntries;
    } catch (e) {
      console.error("Error listing files:", e);
      return [];
    }
  }

  async createFolder(subPath: string, folderName: string): Promise<void> {
    const basePath = await this.getBasePath();
    const targetParent = subPath === '/' ? basePath : await join(basePath, subPath);
    const newFolderPath = await join(targetParent, folderName);

    await mkdir(newFolderPath);
  }

  async uploadFile(subPath: string, file: File): Promise<void> {
    const basePath = await this.getBasePath();
    const targetParent = subPath === '/' ? basePath : await join(basePath, subPath);
    const targetPath = await join(targetParent, file.name);

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    await writeBinaryFile(targetPath, uint8Array);
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

export const fileSystem = new FileSystemService();

// Stacked exports for compatibility with KnowledgeBaseView import structure
export const listFiles = (path: string) => fileSystem.listFiles(path);
export const createFolder = (path: string, name: string) => fileSystem.createFolder(path, name);
export const uploadFile = (path: string, file: File) => fileSystem.uploadFile(path, file);
