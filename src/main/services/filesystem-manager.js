import { promises as fs } from 'fs';
import { join, dirname, extname } from 'path';
import { spawn } from 'child_process';
import chokidar from 'chokidar';
import { EventEmitter } from 'events';

export class FileSystemManager extends EventEmitter {
  constructor() {
    super();
    this.watchers = new Map();
    this.allowedExtensions = new Set([
      '.txt', '.md', '.json', '.js', '.jsx', '.ts', '.tsx',
      '.html', '.css', '.scss', '.py', '.java', '.cpp',
      '.c', '.h', '.xml', '.yaml', '.yml', '.toml'
    ]);
  }

  async initialize() {
    console.log('File System Manager initialized');
  }

  async readDirectory(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`${dirPath} is not a directory`);
      }

      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      const items = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = join(dirPath, entry.name);
          const stats = await fs.stat(fullPath);
          
          return {
            name: entry.name,
            path: fullPath,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            modified: stats.mtime,
            extension: entry.isFile() ? extname(entry.name) : null,
            readable: this.isReadableFile(entry.name)
          };
        })
      );

      // Sort: directories first, then files alphabetically
      items.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return {
        path: dirPath,
        items
      };
    } catch (error) {
      throw new Error(`Failed to read directory ${dirPath}: ${error.message}`);
    }
  }

  async readFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      
      if (!stats.isFile()) {
        throw new Error(`${filePath} is not a file`);
      }

      if (!this.isReadableFile(filePath)) {
        throw new Error(`File type not supported: ${extname(filePath)}`);
      }

      const content = await fs.readFile(filePath, 'utf8');
      
      return {
        path: filePath,
        content,
        size: stats.size,
        modified: stats.mtime,
        encoding: 'utf8'
      };
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  async writeFile(filePath, content) {
    try {
      // Ensure directory exists
      const dir = dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(filePath, content, 'utf8');
      
      const stats = await fs.stat(filePath);
      
      this.emit('file:changed', {
        path: filePath,
        type: 'modified',
        size: stats.size
      });

      return {
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        success: true
      };
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      
      this.emit('file:changed', {
        path: filePath,
        type: 'deleted'
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
    }
  }

  async createDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      
      this.emit('directory:created', { path: dirPath });
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
    }
  }

  async executeCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        shell: true
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code
          });
        } else {
          reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to execute command: ${error.message}`));
      });
    });
  }

  async watchDirectory(dirPath, callback) {
    if (this.watchers.has(dirPath)) {
      this.watchers.get(dirPath).close();
    }

    const watcher = chokidar.watch(dirPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    watcher
      .on('add', path => callback({ type: 'added', path }))
      .on('change', path => callback({ type: 'modified', path }))
      .on('unlink', path => callback({ type: 'deleted', path }))
      .on('addDir', path => callback({ type: 'directory_added', path }))
      .on('unlinkDir', path => callback({ type: 'directory_deleted', path }));

    this.watchers.set(dirPath, watcher);
    
    return watcher;
  }

  async stopWatching(dirPath) {
    const watcher = this.watchers.get(dirPath);
    if (watcher) {
      await watcher.close();
      this.watchers.delete(dirPath);
    }
  }

  isReadableFile(filePath) {
    const ext = extname(filePath).toLowerCase();
    return this.allowedExtensions.has(ext) || ext === '';
  }

  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      
      return {
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        permissions: stats.mode,
        readable: this.isReadableFile(filePath)
      };
    } catch (error) {
      throw new Error(`Failed to get file info for ${filePath}: ${error.message}`);
    }
  }
}