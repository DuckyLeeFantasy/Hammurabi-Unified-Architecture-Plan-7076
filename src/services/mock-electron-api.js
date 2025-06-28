// Mock Electron API for web environment
export const mockElectronAPI = {
  // Agent Management
  agent: {
    list: async () => {
      const agents = JSON.parse(localStorage.getItem('agents') || '[]');
      return agents;
    },
    
    create: async (config) => {
      const agents = JSON.parse(localStorage.getItem('agents') || '[]');
      const newAgent = {
        id: Date.now().toString(),
        name: config.name,
        type: config.type,
        status: 'active',
        lastActivity: new Date().toISOString(),
        config
      };
      agents.push(newAgent);
      localStorage.setItem('agents', JSON.stringify(agents));
      return newAgent;
    },
    
    sendMessage: async (agentId, message) => {
      // Simulate AI response based on agent type
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const agents = JSON.parse(localStorage.getItem('agents') || '[]');
      const agent = agents.find(a => a.id === agentId);
      
      if (!agent) throw new Error('Agent not found');
      
      // Update last activity
      agent.lastActivity = new Date().toISOString();
      localStorage.setItem('agents', JSON.stringify(agents));
      
      // Generate response based on agent type
      switch (agent.type) {
        case 'file-manager':
          if (message.toLowerCase().includes('list')) {
            return 'Here are the files in the current directory: README.md, package.json, src/';
          }
          return 'I can help you with file operations. Try asking me to list files or create a new file.';
          
        case 'web-scraper':
          if (message.toLowerCase().includes('scrape')) {
            return 'I can scrape web content. Please provide a URL and specify what data you need.';
          }
          return 'I specialize in extracting data from websites. What would you like me to scrape?';
          
        case 'code-assistant':
          if (message.toLowerCase().includes('code') || message.toLowerCase().includes('function')) {
            return 'I can help you write, debug, and optimize code. What programming language are you working with?';
          }
          return 'I\'m here to assist with programming tasks. Share your code or describe what you\'re building.';
          
        default:
          const responses = [
            `I understand you're asking about: "${message}". How can I help you with this?`,
            `That's an interesting question. Let me think about how to assist you with "${message}".`,
            `I'm processing your request about "${message}". What specific help do you need?`
          ];
          return responses[Math.floor(Math.random() * responses.length)];
      }
    },
    
    stop: async (agentId) => {
      const agents = JSON.parse(localStorage.getItem('agents') || '[]');
      const filteredAgents = agents.filter(a => a.id !== agentId);
      localStorage.setItem('agents', JSON.stringify(filteredAgents));
      return { success: true };
    }
  },

  // File System Operations (Mock)
  fs: {
    readDirectory: async (path) => {
      // Simulate directory structure
      const mockFiles = [
        { name: 'Documents', path: '/home/user/Documents', type: 'directory', size: 0, modified: new Date(), readable: false },
        { name: 'Downloads', path: '/home/user/Downloads', type: 'directory', size: 0, modified: new Date(), readable: false },
        { name: 'README.md', path: '/home/user/README.md', type: 'file', size: 1024, modified: new Date(), extension: '.md', readable: true },
        { name: 'package.json', path: '/home/user/package.json', type: 'file', size: 2048, modified: new Date(), extension: '.json', readable: true },
        { name: 'config.txt', path: '/home/user/config.txt', type: 'file', size: 512, modified: new Date(), extension: '.txt', readable: true }
      ];
      
      return {
        path: path || '/home/user',
        items: mockFiles
      };
    },
    
    readFile: async (filePath) => {
      // Simulate file content based on extension
      const fileName = filePath.split('/').pop();
      let content = '';
      
      if (fileName.endsWith('.md')) {
        content = '# README\n\nThis is a sample markdown file.\n\n## Features\n\n- Feature 1\n- Feature 2\n- Feature 3';
      } else if (fileName.endsWith('.json')) {
        content = JSON.stringify({
          name: "sample-project",
          version: "1.0.0",
          description: "A sample project file",
          dependencies: {
            "react": "^18.0.0",
            "vite": "^4.0.0"
          }
        }, null, 2);
      } else {
        content = `This is the content of ${fileName}.\n\nLine 2\nLine 3\nLine 4`;
      }
      
      return {
        path: filePath,
        content,
        size: content.length,
        modified: new Date(),
        encoding: 'utf8'
      };
    },
    
    writeFile: async (filePath, content) => {
      // Simulate file write
      console.log(`Writing to ${filePath}:`, content);
      return {
        path: filePath,
        size: content.length,
        modified: new Date(),
        success: true
      };
    },
    
    executeCommand: async (command, args = [], options = {}) => {
      // Simulate command execution
      let stdout = '';
      
      if (command.includes('ls')) {
        stdout = 'README.md\npackage.json\nDocuments/\nDownloads/';
      } else if (command.includes('pwd')) {
        stdout = '/home/user';
      } else {
        stdout = `Command executed: ${command} ${args.join(' ')}`;
      }
      
      return {
        success: true,
        stdout,
        stderr: '',
        exitCode: 0
      };
    }
  },

  // Browser Operations (Mock)
  browser: {
    navigate: async (url) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        url,
        title: `Page: ${url}`,
        success: true
      };
    },
    
    getContent: async (tabId) => {
      return {
        tabId,
        url: 'https://example.com',
        title: 'Example Page',
        html: '<html><body><h1>Example Page</h1><p>This is mock content.</p></body></html>',
        text: 'Example Page\nThis is mock content.',
        timestamp: new Date()
      };
    },
    
    executeScript: async (tabId, script) => {
      return {
        tabId,
        result: 'Script executed successfully',
        success: true
      };
    }
  },

  // Database Operations (Mock using localStorage)
  db: {
    query: async (query, params = []) => {
      console.log('Mock DB query:', query, params);
      return [];
    },
    
    saveSettings: async (settings) => {
      localStorage.setItem('app-settings', JSON.stringify(settings));
      return { success: true };
    },
    
    getSettings: async () => {
      const settings = localStorage.getItem('app-settings');
      return settings ? JSON.parse(settings) : {};
    }
  },

  // MCP Operations (Mock)
  mcp: {
    listTools: async () => {
      return [
        { name: 'read_file', description: 'Read contents of a file' },
        { name: 'write_file', description: 'Write content to a file' },
        { name: 'list_directory', description: 'List contents of a directory' },
        { name: 'navigate_browser', description: 'Navigate browser to a URL' },
        { name: 'send_agent_message', description: 'Send message to an agent' }
      ];
    },
    
    callTool: async (toolName, args) => {
      console.log(`Mock MCP tool call: ${toolName}`, args);
      return { success: true, result: `Tool ${toolName} executed with args: ${JSON.stringify(args)}` };
    }
  }
};

// Make it globally available
if (typeof window !== 'undefined') {
  window.electronAPI = mockElectronAPI;
}