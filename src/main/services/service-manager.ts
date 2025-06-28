import { EventEmitter } from 'events';
import { MCPServer } from '../mcp/mcp-server';
import { AgentManager } from '../../agents/base/agent-manager';
import { BrowserEngine } from '../browser/browser-engine';
import { DesktopCommanderBridge } from './desktop-commander-bridge';

export interface ServiceStatus {
  name: string;
  status: 'initializing' | 'ready' | 'error' | 'stopped';
  lastActivity: Date;
  details?: any;
}

export class ServiceManager extends EventEmitter {
  private services: Map<string, any> = new Map();
  private serviceStatus: Map<string, ServiceStatus> = new Map();
  private isInitialized = false;

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    console.log('🔧 Initializing Service Manager...');

    try {
      // Initialize core services
      await this.initializeService('mcp-server', MCPServer);
      await this.initializeService('agent-manager', AgentManager);
      await this.initializeService('desktop-commander', DesktopCommanderBridge);

      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('✅ Service Manager initialized successfully');
    } catch (error) {
      console.error('❌ Service Manager initialization failed:', error);
      throw error;
    }
  }

  private async initializeService(name: string, ServiceClass: any): Promise<void> {
    try {
      this.updateServiceStatus(name, 'initializing');
      
      const service = new ServiceClass();
      this.services.set(name, service);

      // Initialize the service if it has an initialize method
      if (typeof service.initialize === 'function') {
        await service.initialize();
      }

      // Set up event forwarding
      if (service.on && typeof service.on === 'function') {
        service.on('error', (error: any) => {
          this.updateServiceStatus(name, 'error', { error: error.message });
          this.emit('service-error', { service: name, error });
        });

        service.on('started', () => {
          this.updateServiceStatus(name, 'ready');
          this.emit('service-started', name);
        });

        service.on('stopped', () => {
          this.updateServiceStatus(name, 'stopped');
          this.emit('service-stopped', name);
        });
      }

      this.updateServiceStatus(name, 'ready');
      console.log(`✅ Service ${name} initialized`);
    } catch (error) {
      this.updateServiceStatus(name, 'error', { error: (error as Error).message });
      console.error(`❌ Failed to initialize service ${name}:`, error);
      throw error;
    }
  }

  private updateServiceStatus(name: string, status: ServiceStatus['status'], details?: any): void {
    this.serviceStatus.set(name, {
      name,
      status,
      lastActivity: new Date(),
      details
    });

    this.emit('status-updated', { name, status, details });
  }

  getService<T>(name: string): T | null {
    return this.services.get(name) || null;
  }

  getServiceStatus(): ServiceStatus[] {
    return Array.from(this.serviceStatus.values());
  }

  getServiceByName(name: string): ServiceStatus | null {
    return this.serviceStatus.get(name) || null;
  }

  async restartService(name: string): Promise<void> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }

    try {
      this.updateServiceStatus(name, 'initializing');

      // Stop the service if it has a stop method
      if (typeof service.stop === 'function') {
        await service.stop();
      }

      // Start the service if it has a start method
      if (typeof service.start === 'function') {
        await service.start();
      } else if (typeof service.initialize === 'function') {
        await service.initialize();
      }

      this.updateServiceStatus(name, 'ready');
      this.emit('service-restarted', name);
    } catch (error) {
      this.updateServiceStatus(name, 'error', { error: (error as Error).message });
      throw error;
    }
  }

  async stopService(name: string): Promise<void> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }

    try {
      if (typeof service.stop === 'function') {
        await service.stop();
      }

      this.updateServiceStatus(name, 'stopped');
      this.emit('service-stopped', name);
    } catch (error) {
      this.updateServiceStatus(name, 'error', { error: (error as Error).message });
      throw error;
    }
  }

  async startService(name: string): Promise<void> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }

    try {
      this.updateServiceStatus(name, 'initializing');

      if (typeof service.start === 'function') {
        await service.start();
      } else if (typeof service.initialize === 'function') {
        await service.initialize();
      }

      this.updateServiceStatus(name, 'ready');
      this.emit('service-started', name);
    } catch (error) {
      this.updateServiceStatus(name, 'error', { error: (error as Error).message });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    console.log('🔌 Shutting down Service Manager...');

    const shutdownPromises = Array.from(this.services.entries()).map(async ([name, service]) => {
      try {
        if (typeof service.stop === 'function') {
          await service.stop();
        } else if (typeof service.shutdown === 'function') {
          await service.shutdown();
        }
        this.updateServiceStatus(name, 'stopped');
      } catch (error) {
        console.error(`Error shutting down service ${name}:`, error);
      }
    });

    await Promise.all(shutdownPromises);
    this.services.clear();
    this.isInitialized = false;
    
    console.log('✅ Service Manager shut down');
  }

  isServiceReady(name: string): boolean {
    const status = this.serviceStatus.get(name);
    return status?.status === 'ready';
  }

  areAllServicesReady(): boolean {
    return Array.from(this.serviceStatus.values()).every(status => status.status === 'ready');
  }

  getHealthCheck(): any {
    const services = Array.from(this.serviceStatus.values());
    const readyCount = services.filter(s => s.status === 'ready').length;
    const errorCount = services.filter(s => s.status === 'error').length;

    return {
      isInitialized: this.isInitialized,
      totalServices: services.length,
      readyServices: readyCount,
      errorServices: errorCount,
      allReady: readyCount === services.length,
      services: services.map(s => ({
        name: s.name,
        status: s.status,
        lastActivity: s.lastActivity
      }))
    };
  }
}