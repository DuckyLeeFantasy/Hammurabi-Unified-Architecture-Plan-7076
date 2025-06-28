// Shared type definitions for Hammurabi Unified

export interface Agent {
  id: string;
  type: string;
  name: string;
  isActive: boolean;
  lastActivity: Date;
  config: AgentConfig;
}

export interface AgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: string[];
}

export interface MCPRequest {
  tool_name: string;
  parameters: Record<string, any>;
}

export interface MCPResponse {
  success: boolean;
  result?: any;
  error?: string;
}

export interface FileItem {
  name: string;
  path: string;
  is_directory: boolean;
  size?: number;
  modified?: Date;
  created?: Date;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface AppSettings {
  general: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    startupBehavior: 'restore' | 'homepage' | 'blank';
    notifications: boolean;
    autoUpdate: boolean;
  };
  browser: {
    defaultSearchEngine: string;
    homepage: string;
    blockAds: boolean;
    enableJavaScript: boolean;
    allowCookies: boolean;
    clearDataOnExit: boolean;
  };
  agents: {
    maxActiveAgents: number;
    aiModel: string;
    responseTimeout: number;
    autoCoordination: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  security: {
    enableSandbox: boolean;
    blockMaliciousUrls: boolean;
    requireHttps: boolean;
    dataEncryption: boolean;
    sessionTimeout: number;
  };
  performance: {
    enableHardwareAcceleration: boolean;
    maxMemoryUsage: number;
    cacheSize: number;
    preloadPages: boolean;
    backgroundSync: boolean;
  };
}

export interface SystemStatus {
  mcpServer: 'connecting' | 'connected' | 'error' | 'disconnected';
  agents: 'initializing' | 'ready' | 'error';
  fileSystem: 'ready' | 'error';
  browser: 'initializing' | 'ready' | 'error';
}