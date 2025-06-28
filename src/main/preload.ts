import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // MCP Bridge API
  mcp: {
    listAgents: () => ipcRenderer.invoke('mcp:list-agents'),
    sendMessage: (agentId: string, message: string) => 
      ipcRenderer.invoke('mcp:send-message', agentId, message),
    coordinateAgents: (agentIds: string[], task: string) =>
      ipcRenderer.invoke('mcp:coordinate-agents', agentIds, task),
    fileOperation: (operation: string, params: any) =>
      ipcRenderer.invoke('mcp:file-operation', operation, params),
    databaseQuery: (queryType: string, params: any) =>
      ipcRenderer.invoke('mcp:database-query', queryType, params),
  },

  // File System API
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:read-file', filePath),
    writeFile: (filePath: string, content: string) => 
      ipcRenderer.invoke('fs:write-file', filePath, content),
    listDirectory: (dirPath: string) => ipcRenderer.invoke('fs:list-directory', dirPath),
  },

  // Browser API
  browser: {
    navigateToUrl: (url: string) => ipcRenderer.invoke('browser:navigate', url),
    navigateBack: () => ipcRenderer.send('browser:back'),
    navigateForward: () => ipcRenderer.send('browser:forward'),
    refresh: () => ipcRenderer.send('browser:refresh'),
    addBookmark: (bookmark: any) => ipcRenderer.invoke('browser:add-bookmark', bookmark),
  },

  // Window Controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // Settings API
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (settings: any) => ipcRenderer.invoke('settings:save', settings),
  },

  // Event listeners
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, callback);
  },
  
  removeListener: (channel: string, callback: Function) => {
    ipcRenderer.removeListener(channel, callback);
  },
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      mcp: {
        listAgents: () => Promise<any>;
        sendMessage: (agentId: string, message: string) => Promise<any>;
        coordinateAgents: (agentIds: string[], task: string) => Promise<any>;
        fileOperation: (operation: string, params: any) => Promise<any>;
        databaseQuery: (queryType: string, params: any) => Promise<any>;
      };
      fs: {
        readFile: (filePath: string) => Promise<any>;
        writeFile: (filePath: string, content: string) => Promise<any>;
        listDirectory: (dirPath: string) => Promise<any>;
      };
      browser: {
        navigateToUrl: (url: string) => Promise<any>;
        navigateBack: () => void;
        navigateForward: () => void;
        refresh: () => void;
        addBookmark: (bookmark: any) => Promise<any>;
      };
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
      };
      settings: {
        get: () => Promise<any>;
        save: (settings: any) => Promise<any>;
      };
      on: (channel: string, callback: Function) => void;
      removeListener: (channel: string, callback: Function) => void;
    };
  }
}