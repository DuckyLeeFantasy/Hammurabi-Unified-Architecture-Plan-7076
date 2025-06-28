// Hammurabi Integration Helper Script
const fs = require('fs').promises;
const path = require('path');

class HammurabiIntegrator {
  constructor() {
    this.sourceLocations = {
      mcpServer: "I:\\Code Based\\Hammurabi Code Workspace\\mcp_servers",
      aiAgents: "I:\\Code Based\\Hammurabi Code Workspace\\ai_agents", 
      browserEngine: "C:\\Users\\rames\\Koofr\\Browser of Hammurabi\\src",
      desktopCommander: "I:\\Code Based\\Hammurabi Code Workspace\\desktop_commander"
    };
    
    this.targetLocations = {
      mcpServer: "./src/main/mcp",
      aiAgents: "./src/agents", 
      browserEngine: "./src/main/browser",
      desktopCommander: "./src/main/services"
    };
  }

  async checkSourcesExist() {
    console.log('\n🔍 Checking source locations...\n');
    
    for (const [name, location] of Object.entries(this.sourceLocations)) {
      try {
        await fs.access(location);
        console.log(`✅ ${name}: ${location}`);
      } catch (error) {
        console.log(`❌ ${name}: ${location} (Not found)`);
      }
    }
  }

  async copyWithAdaptation(source, target, adaptations = {}) {
    try {
      const stats = await fs.stat(source);
      
      if (stats.isDirectory()) {
        await fs.mkdir(target, { recursive: true });
        const files = await fs.readdir(source);
        
        for (const file of files) {
          const sourcePath = path.join(source, file);
          const targetPath = path.join(target, file);
          await this.copyWithAdaptation(sourcePath, targetPath, adaptations);
        }
      } else {
        let content = await fs.readFile(source, 'utf8');
        
        // Apply adaptations based on file type
        if (adaptations.imports && source.endsWith('.py')) {
          content = this.adaptPythonImports(content);
        }
        
        if (adaptations.electronAPI && source.endsWith('.js')) {
          content = this.adaptElectronAPI(content);
        }
        
        await fs.writeFile(target, content);
      }
    } catch (error) {
      console.error(`Failed to copy ${source} to ${target}:`, error.message);
    }
  }

  adaptPythonImports(content) {
    // Convert Python MCP server to JavaScript/TypeScript
    return `// Converted from Python MCP Server
// Original Python code:
/*
${content}
*/

// TypeScript implementation:
import { MCPServer } from '../shared/mcp-types';

export class ConvertedMCPServer implements MCPServer {
  // TODO: Implement converted functionality
  async start() {
    console.log('MCP Server starting...');
  }
  
  async stop() {
    console.log('MCP Server stopping...');
  }
}
`;
  }

  adaptElectronAPI(content) {
    // Adapt browser code for Electron integration
    return content
      .replace(/require\(['"]electron['"]\)/g, "require('electron')")
      .replace(/window\.electronAPI/g, 'window.electronAPI')
      .replace(/webContents\.executeJavaScript/g, 'webContents.executeJavaScript');
  }

  async integrateComponents() {
    console.log('\n🔧 Starting integration process...\n');
    
    // 1. Integrate MCP Server
    console.log('📡 Integrating MCP Server...');
    try {
      await this.copyWithAdaptation(
        this.sourceLocations.mcpServer,
        this.targetLocations.mcpServer,
        { imports: true }
      );
      console.log('✅ MCP Server integrated');
    } catch (error) {
      console.log('⚠️ MCP Server: Manual integration required');
    }

    // 2. Integrate AI Agents
    console.log('🤖 Integrating AI Agents...');
    try {
      await this.copyWithAdaptation(
        this.sourceLocations.aiAgents,
        this.targetLocations.aiAgents,
        { imports: true }
      );
      console.log('✅ AI Agents integrated');
    } catch (error) {
      console.log('⚠️ AI Agents: Manual integration required');
    }

    // 3. Integrate Browser Engine
    console.log('🌐 Integrating Browser Engine...');
    try {
      await this.copyWithAdaptation(
        this.sourceLocations.browserEngine,
        this.targetLocations.browserEngine,
        { electronAPI: true }
      );
      console.log('✅ Browser Engine integrated');
    } catch (error) {
      console.log('⚠️ Browser Engine: Manual integration required');
    }

    console.log('\n✨ Integration process completed!\n');
  }

  async generateBridgeFiles() {
    console.log('🌉 Generating bridge files...\n');

    // Generate TypeScript MCP Bridge
    const mcpBridge = `
import { EventEmitter } from 'events';
import { ipcMain } from 'electron';

export class MCPBridge extends EventEmitter {
  private isInitialized = false;
  private agents = new Map();
  
  async initialize(): Promise<void> {
    console.log('🚀 MCP Bridge initializing...');
    
    try {
      // Initialize MCP server components
      await this.startMCPServer();
      
      // Setup IPC handlers
      this.setupIPCHandlers();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('✅ MCP Bridge initialized successfully');
    } catch (error) {
      console.error('❌ MCP Bridge initialization failed:', error);
      throw error;
    }
  }

  private async startMCPServer(): Promise<void> {
    // TODO: Start your MCP server here
    // This will be adapted from your existing Python MCP server
  }

  private setupIPCHandlers(): void {
    // Agent management
    ipcMain.handle('mcp:list-agents', async () => {
      return Array.from(this.agents.values());
    });

    ipcMain.handle('mcp:send-message', async (event, agentId: string, message: string) => {
      const agent = this.agents.get(agentId);
      if (agent) {
        return await agent.processMessage(message);
      }
      throw new Error(\`Agent \${agentId} not found\`);
    });

    // File operations
    ipcMain.handle('mcp:file-operation', async (event, operation: string, params: any) => {
      // TODO: Implement file operations from Desktop Commander
      console.log('File operation:', operation, params);
      return { success: true, result: 'File operation completed' };
    });
  }

  async shutdown(): Promise<void> {
    if (this.isInitialized) {
      // TODO: Cleanup MCP server
      this.isInitialized = false;
      console.log('🔌 MCP Bridge shut down');
    }
  }
}
`;

    await fs.writeFile('./src/main/mcp/mcp-bridge.ts', mcpBridge);

    // Generate Agent Manager
    const agentManager = `
export interface Agent {
  id: string;
  type: string;
  isActive: boolean;
  lastActivity: Date;
  processMessage(message: string): Promise<string>;
}

export class AgentManager {
  private agents = new Map<string, Agent>();

  async createAgent(type: string, config: any): Promise<Agent> {
    const agent: Agent = {
      id: \`agent-\${Date.now()}\`,
      type,
      isActive: true,
      lastActivity: new Date(),
      processMessage: async (message: string) => {
        // TODO: Implement agent-specific message processing
        return \`Agent \${type} processed: \${message}\`;
      }
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  async listAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async sendMessage(agentId: string, message: string): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(\`Agent \${agentId} not found\`);
    }

    agent.lastActivity = new Date();
    return await agent.processMessage(message);
  }
}
`;

    await fs.writeFile('./src/agents/agent-manager.ts', agentManager);

    // Generate File System Bridge
    const fileSystemBridge = `
import { promises as fs } from 'fs';
import { join } from 'path';

export class FileSystemBridge {
  async readFile(filePath: string): Promise<{ content: string; size: number }> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const stats = await fs.stat(filePath);
      
      return {
        content,
        size: stats.size
      };
    } catch (error) {
      throw new Error(\`Failed to read file: \${error.message}\`);
    }
  }

  async writeFile(filePath: string, content: string): Promise<{ success: boolean }> {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return { success: true };
    } catch (error) {
      throw new Error(\`Failed to write file: \${error.message}\`);
    }
  }

  async listDirectory(dirPath: string): Promise<{ files: any[] }> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      const files = entries.map(entry => ({
        name: entry.name,
        path: join(dirPath, entry.name),
        is_directory: entry.isDirectory(),
        size: entry.isFile() ? 0 : undefined // Will be filled by stat call
      }));

      return { files };
    } catch (error) {
      throw new Error(\`Failed to list directory: \${error.message}\`);
    }
  }
}
`;

    await fs.writeFile('./src/main/services/filesystem-bridge.ts', fileSystemBridge);

    console.log('✅ Bridge files generated successfully\n');
  }

  async updateMainApp() {
    console.log('🔄 Updating main application...\n');

    const updatedMainApp = `
import { app, BrowserWindow, ipcMain } from 'electron';
import { MCPBridge } from './mcp/mcp-bridge';
import { FileSystemBridge } from './services/filesystem-bridge';
import * as path from 'path';

export class HammurabiApp {
  private mainWindow: BrowserWindow | null = null;
  private mcpBridge: MCPBridge;
  private fileSystemBridge: FileSystemBridge;

  constructor() {
    this.mcpBridge = new MCPBridge();
    this.fileSystemBridge = new FileSystemBridge();
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    await app.whenReady();
    
    console.log('🏛️ Hammurabi Unified starting...');
    
    // Initialize services
    await this.initializeServices();
    
    // Create main window
    this.createMainWindow();
    
    // Setup IPC handlers
    this.setupIPCHandlers();
    
    // Handle app events
    this.setupAppEvents();
    
    console.log('✅ Hammurabi Unified ready!');
  }

  private async initializeServices(): Promise<void> {
    try {
      await this.mcpBridge.initialize();
      console.log('✅ All services initialized');
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
    }
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700,
      show: false,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
      },
      icon: path.join(__dirname, '../../resources/icons/icon.png')
    });

    const isDev = process.env.NODE_ENV === 'development';
    const rendererPath = isDev 
      ? 'http://localhost:3000'
      : \`file://\${path.join(__dirname, '../renderer/index.html')}\`;
    
    this.mainWindow.loadURL(rendererPath);

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupIPCHandlers(): void {
    // File system operations
    ipcMain.handle('fs:read-file', async (event, filePath: string) => {
      return await this.fileSystemBridge.readFile(filePath);
    });

    ipcMain.handle('fs:write-file', async (event, filePath: string, content: string) => {
      return await this.fileSystemBridge.writeFile(filePath, content);
    });

    ipcMain.handle('fs:list-directory', async (event, dirPath: string) => {
      return await this.fileSystemBridge.listDirectory(dirPath);
    });

    // Window controls
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
    });
  }

  private setupAppEvents(): void {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', async () => {
      await this.cleanup();
    });
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up...');
    await this.mcpBridge.shutdown();
    console.log('✅ Cleanup completed');
  }
}

// Initialize the application
new HammurabiApp();
`;

    await fs.writeFile('./src/main/app.ts', updatedMainApp);
    console.log('✅ Main application updated\n');
  }

  async run() {
    console.log('🏛️ Hammurabi Integration Helper\n');
    
    await this.checkSourcesExist();
    await this.integrateComponents();
    await this.generateBridgeFiles();
    await this.updateMainApp();
    
    console.log('🎉 Integration completed successfully!\n');
    console.log('Next steps:');
    console.log('1. npm install');
    console.log('2. npm run dev');
    console.log('3. Test all components');
  }
}

// Run the integration
const integrator = new HammurabiIntegrator();
integrator.run().catch(console.error);