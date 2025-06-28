import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MCPServer } from './services/mcp-server.js';
import { AgentManager } from './services/agent-manager.js';
import { FileSystemManager } from './services/filesystem-manager.js';
import { DatabaseManager } from './services/database-manager.js';
import { BrowserEngine } from './browser/browser-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class HammurabiApp {
  constructor() {
    this.mainWindow = null;
    this.mcpServer = null;
    this.agentManager = null;
    this.fileSystemManager = null;
    this.databaseManager = null;
    this.browserEngine = null;
  }

  async initialize() {
    await this.initializeServices();
    this.createMainWindow();
    this.setupIPC();
    this.createMenus();
  }

  async initializeServices() {
    // Initialize core services
    this.databaseManager = new DatabaseManager();
    await this.databaseManager.initialize();

    this.fileSystemManager = new FileSystemManager();
    await this.fileSystemManager.initialize();

    this.agentManager = new AgentManager();
    await this.agentManager.initialize();

    this.browserEngine = new BrowserEngine();
    await this.browserEngine.initialize();

    this.mcpServer = new MCPServer({
      agentManager: this.agentManager,
      fileSystemManager: this.fileSystemManager,
      databaseManager: this.databaseManager,
      browserEngine: this.browserEngine
    });
    await this.mcpServer.start();
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
        webSecurity: true
      },
      titleBarStyle: 'hiddenInset',
      icon: join(__dirname, '../../resources/icon.png'),
      show: false
    });

    // Load the React app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(join(__dirname, '../../dist-renderer/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  setupIPC() {
    // Agent Management
    ipcMain.handle('agent:list', async () => {
      return await this.agentManager.listAgents();
    });

    ipcMain.handle('agent:create', async (event, config) => {
      return await this.agentManager.createAgent(config);
    });

    ipcMain.handle('agent:send-message', async (event, agentId, message) => {
      return await this.agentManager.sendMessage(agentId, message);
    });

    ipcMain.handle('agent:stop', async (event, agentId) => {
      return await this.agentManager.stopAgent(agentId);
    });

    // File System Operations
    ipcMain.handle('fs:read-directory', async (event, path) => {
      return await this.fileSystemManager.readDirectory(path);
    });

    ipcMain.handle('fs:read-file', async (event, path) => {
      return await this.fileSystemManager.readFile(path);
    });

    ipcMain.handle('fs:write-file', async (event, path, content) => {
      return await this.fileSystemManager.writeFile(path, content);
    });

    ipcMain.handle('fs:execute-command', async (event, command, args) => {
      return await this.fileSystemManager.executeCommand(command, args);
    });

    // Browser Operations
    ipcMain.handle('browser:navigate', async (event, url) => {
      return await this.browserEngine.navigate(url);
    });

    ipcMain.handle('browser:get-content', async (event, tabId) => {
      return await this.browserEngine.getContent(tabId);
    });

    ipcMain.handle('browser:execute-script', async (event, tabId, script) => {
      return await this.browserEngine.executeScript(tabId, script);
    });

    // Database Operations
    ipcMain.handle('db:query', async (event, query, params) => {
      return await this.databaseManager.query(query, params);
    });

    ipcMain.handle('db:save-settings', async (event, settings) => {
      return await this.databaseManager.saveSettings(settings);
    });

    ipcMain.handle('db:get-settings', async () => {
      return await this.databaseManager.getSettings();
    });

    // MCP Operations
    ipcMain.handle('mcp:list-tools', async () => {
      return await this.mcpServer.listTools();
    });

    ipcMain.handle('mcp:call-tool', async (event, toolName, args) => {
      return await this.mcpServer.callTool(toolName, args);
    });
  }

  createMenus() {
    const template = [
      {
        label: 'Hammurabi',
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'File',
        submenu: [
          { role: 'close' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  async shutdown() {
    if (this.mcpServer) {
      await this.mcpServer.stop();
    }
    if (this.agentManager) {
      await this.agentManager.shutdown();
    }
    if (this.databaseManager) {
      await this.databaseManager.close();
    }
  }
}

// App lifecycle
const hammurabiApp = new HammurabiApp();

app.whenReady().then(async () => {
  await hammurabiApp.initialize();
});

app.on('window-all-closed', async () => {
  await hammurabiApp.shutdown();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await hammurabiApp.initialize();
  }
});

app.on('before-quit', async () => {
  await hammurabiApp.shutdown();
});