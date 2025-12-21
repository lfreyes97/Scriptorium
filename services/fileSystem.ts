// This service acts as the Unified Filesystem Bridge.
// Strategies:
// 1. TAURI: If running in desktop app, use native OS bindings.
// 2. API: If running in browser with local backend, use fetch.
// 3. MOCK: Fallback for demo/preview.

const API_URL = process.env.FS_API_URL || 'http://localhost:3001/api/fs';

// Tauri Types (Partial)
declare global {
  interface Window {
    __TAURI__?: {
      fs: {
        readDir: (path: string, options?: any) => Promise<any[]>;
        createDir: (path: string, options?: any) => Promise<void>;
        writeBinaryFile: (path: string, data: any) => Promise<void>;
        BaseDirectory: { Document: number };
      };
      path: {
        documentDir: () => Promise<string>;
        join: (...args: string[]) => Promise<string>;
      };
    };
  }
}

export interface FileEntry {
  id: string; // Full Path
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  size?: string;
  date: string;
  itemsCount?: number;
}

// --- HELPERS ---

const isTauri = () => typeof window !== 'undefined' && !!window.__TAURI__;

const getExtension = (filename: string) => filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);

// --- API IMPLEMENTATION ---

export const listFiles = async (path: string = '/'): Promise<FileEntry[]> => {
  // 1. TAURI STRATEGY
  if (isTauri()) {
    try {
      const tauri = window.__TAURI__!;
      let targetPath = path;
      
      // Default to Documents if root is requested
      if (!targetPath || targetPath === '/') {
        targetPath = await tauri.path.documentDir();
      }

      const entries = await tauri.fs.readDir(targetPath);
      
      // Map Tauri entries to our generic FileEntry
      return entries.map((e: any) => ({
        id: e.path,
        name: e.name || 'Unknown',
        type: e.children ? 'folder' : 'file',
        extension: e.children ? undefined : getExtension(e.name || ''),
        date: 'Hoy', // Metadata requires separate fs.stat call in Tauri, skipping for perf
        size: '-',
        itemsCount: e.children ? e.children.length : undefined
      }));
    } catch (error) {
      console.error("Tauri FS Error:", error);
      return []; // Return empty on permission error
    }
  }

  // 2. HTTP API STRATEGY
  try {
    const response = await fetch(`${API_URL}/list?path=${encodeURIComponent(path)}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // Fall through to mock
  }

  // 3. MOCK FALLBACK
  console.warn("FileSystem: Using Mock Data");
  return getMockFiles(path);
};

export const createFolder = async (path: string, folderName: string): Promise<boolean> => {
  if (isTauri()) {
    try {
      const tauri = window.__TAURI__!;
      const fullPath = await tauri.path.join(path, folderName);
      await tauri.fs.createDir(fullPath);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  try {
    const response = await fetch(`${API_URL}/mkdir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, name: folderName })
    });
    return response.ok;
  } catch (error) {
    return true; // Mock success
  }
};

export const uploadFile = async (path: string, file: File): Promise<boolean> => {
  if (isTauri()) {
    try {
      const tauri = window.__TAURI__!;
      const fullPath = await tauri.path.join(path, file.name);
      const buffer = await file.arrayBuffer();
      await tauri.fs.writeBinaryFile(fullPath, new Uint8Array(buffer));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    const response = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
    return response.ok;
  } catch (error) {
    return true; // Mock success
  }
};

// --- MOCK DATA ---

const MOCK_DB: FileEntry[] = [
    // Root Folders
    { id: '/Proyectos', name: 'Proyectos', type: 'folder', date: '2023-10-01', itemsCount: 5 },
    { id: '/Grabaciones', name: 'Grabaciones', type: 'folder', date: '2023-10-05', itemsCount: 12 },
    { id: '/Bibliografía', name: 'Bibliografía', type: 'folder', date: '2023-09-15', itemsCount: 30 },
    
    // Root Files
    { id: '/root_1.mp3', name: 'Sermón_Domingo.mp3', type: 'file', extension: 'mp3', size: '12 MB', date: 'Ayer' },
    { id: '/root_2.wav', name: 'Entrevista_Raw.wav', type: 'file', extension: 'wav', size: '45 MB', date: 'Hoy' },
    { id: '/root_3.pdf', name: 'Notas_Teologia.pdf', type: 'file', extension: 'pdf', size: '2.4 MB', date: 'Hace 2 horas' },
];

const getMockFiles = (path: string): Promise<FileEntry[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (path === '/' || path === '') {
                resolve(MOCK_DB);
            } else {
                resolve([]);
            }
        }, 300);
    });
};
