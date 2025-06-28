import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Agent Management
  agent: {
    list: () => ipcRenderer.invoke('agent:list'),
    create: (config) => ipcRenderer.invoke('agent:create', config),
    sendMessage: (agentId, message) => ipcRenderer.invoke('agent:send-message', agentId, message),
    stop: (agentId) => ipcRenderer.invoke('agent:stop', agentId)
  },

  // File System Operations
  fs: {
    readDirectory: (path) => ipcRenderer.invoke('fs:read-directory', path),
    readFile: (path) => ipcRenderer.invoke('fs:read-file', path),
    writeFile: (path, content) => ipcRenderer.invoke('fs:write-file', path, content),
    executeCommand: (command, args) => ipcRenderer.invoke('fs:execute-command', command, args)
  },

  // Browser Operations
  browser: {
    navigate: (url) => ipcRenderer.invoke('browser:navigate', url),
    getContent: (tabId) => ipcRenderer.invoke('browser:get-content', tabId),
    executeScript: (tabId, script) => ipcRenderer.invoke('browser:execute-script', tabId, script)
  },

  // Database Operations
  db: {
    query: (query, params) => ipcRenderer.invoke('db:query', query, params),
    saveSettings: (settings) => ipcRenderer.invoke('db:save-settings', settings),
    getSettings: () => ipcRenderer.invoke('db:get-settings')
  },

  // MCP Operations
  mcp: {
    listTools: () => ipcRenderer.invoke('mcp:list-tools'),
    callTool: (toolName, args) => ipcRenderer.invoke('mcp:call-tool', toolName, args)
  }
});