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

  // --- Project Management Methods ---

  async getProjectsPath(): Promise<string> {
    const base = await this.getBasePath();
    return await join(base, 'projects');
  }

  async ensureProjectsDirectoryExists(): Promise<void> {
    const path = await this.getProjectsPath();
    const doesExist = await exists(path);
    if (!doesExist) {
      await mkdir(path, { recursive: true });
    }
  }

  async createProject(projectId: string, initialData: any): Promise<void> {
    await this.ensureProjectsDirectoryExists();
    const projectsPath = await this.getProjectsPath();
    const projectDir = await join(projectsPath, projectId);

    // Create specific project folder
    await mkdir(projectDir, { recursive: true });

    // Create 'project.json' with metadata
    const metadataPath = await join(projectDir, 'project.json');
    await writeTextFile(metadataPath, JSON.stringify(initialData, null, 2));

    // Create default subfolders
    await mkdir(await join(projectDir, 'content'));
    await mkdir(await join(projectDir, 'assets'));
  }

  async listProjects(): Promise<any[]> {
    await this.ensureProjectsDirectoryExists();
    const projectsPath = await this.getProjectsPath();
    const entries = await readDir(projectsPath);

    const projects = [];
    for (const entry of entries) {
      if (entry.isDirectory) {
        try {
          const projectDir = await join(projectsPath, entry.name);
          const metadataPath = await join(projectDir, 'project.json');
          if (await exists(metadataPath)) {
            const content = await readTextFile(metadataPath);
            projects.push(JSON.parse(content));
          }
        } catch (e) {
          console.warn(`Failed to read project ${entry.name}`, e);
        }
      }
    }
    return projects;
  }
}

export const fileSystem = new FileSystemService();

// Stacked exports for compatibility with KnowledgeBaseView import structure
// Stacked exports for compatibility with KnowledgeBaseView import structure
export const listFiles = (path: string) => fileSystem.listFiles(path);
export const createFolder = (path: string, name: string) => fileSystem.createFolder(path, name);
export const uploadFile = (path: string, file: File) => fileSystem.uploadFile(path, file);
export const createProject = (id: string, data: any) => fileSystem.createProject(id, data);
export const listProjects = () => fileSystem.listProjects();
