import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

export class MCPServer {
  constructor(services) {
    this.services = services;
    this.wss = null;
    this.clients = new Map();
    this.tools = new Map();
    this.port = 8080;
  }

  async start() {
    this.registerDefaultTools();
    
    this.wss = new WebSocketServer({ port: this.port });
    
    this.wss.on('connection', (ws) => {
      const clientId = uuidv4();
      this.clients.set(clientId, ws);
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          const response = await this.handleMessage(message);
          ws.send(JSON.stringify(response));
        } catch (error) {
          ws.send(JSON.stringify({
            error: error.message,
            id: message?.id
          }));
        }
      });
      
      ws.on('close', () => {
        this.clients.delete(clientId);
      });
    });
    
    console.log(`MCP Server started on port ${this.port}`);
  }

  async stop() {
    if (this.wss) {
      this.wss.close();
    }
  }

  registerDefaultTools() {
    // File System Tools
    this.tools.set('read_file', {
      name: 'read_file',
      description: 'Read contents of a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to read' }
        },
        required: ['path']
      },
      handler: async (args) => {
        return await this.services.fileSystemManager.readFile(args.path);
      }
    });

    this.tools.set('write_file', {
      name: 'write_file',
      description: 'Write content to a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to write' },
          content: { type: 'string', description: 'Content to write' }
        },
        required: ['path', 'content']
      },
      handler: async (args) => {
        return await this.services.fileSystemManager.writeFile(args.path, args.content);
      }
    });

    this.tools.set('list_directory', {
      name: 'list_directory',
      description: 'List contents of a directory',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path to list' }
        },
        required: ['path']
      },
      handler: async (args) => {
        return await this.services.fileSystemManager.readDirectory(args.path);
      }
    });

    // Browser Tools
    this.tools.set('navigate_browser', {
      name: 'navigate_browser',
      description: 'Navigate browser to a URL',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to navigate to' }
        },
        required: ['url']
      },
      handler: async (args) => {
        return await this.services.browserEngine.navigate(args.url);
      }
    });

    this.tools.set('get_page_content', {
      name: 'get_page_content',
      description: 'Get content of current browser page',
      inputSchema: {
        type: 'object',
        properties: {
          tabId: { type: 'string', description: 'Tab ID to get content from' }
        }
      },
      handler: async (args) => {
        return await this.services.browserEngine.getContent(args.tabId);
      }
    });

    // Agent Tools
    this.tools.set('send_agent_message', {
      name: 'send_agent_message',
      description: 'Send message to an agent',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string', description: 'Agent ID' },
          message: { type: 'string', description: 'Message to send' }
        },
        required: ['agentId', 'message']
      },
      handler: async (args) => {
        return await this.services.agentManager.sendMessage(args.agentId, args.message);
      }
    });
  }

  async handleMessage(message) {
    const { method, params, id } = message;

    switch (method) {
      case 'tools/list':
        return {
          id,
          result: {
            tools: Array.from(this.tools.values()).map(tool => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema
            }))
          }
        };

      case 'tools/call':
        const { name, arguments: args } = params;
        const tool = this.tools.get(name);
        
        if (!tool) {
          throw new Error(`Tool ${name} not found`);
        }

        const result = await tool.handler(args);
        return {
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          }
        };

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  async listTools() {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
  }

  async callTool(toolName, args) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    return await tool.handler(args);
  }
}