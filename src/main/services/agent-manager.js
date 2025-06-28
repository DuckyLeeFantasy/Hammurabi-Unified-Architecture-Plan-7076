import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

export class AgentManager extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.conversations = new Map();
  }

  async initialize() {
    console.log('Agent Manager initialized');
  }

  async createAgent(config) {
    const agentId = uuidv4();
    const agent = new Agent(agentId, config);
    
    this.agents.set(agentId, agent);
    this.conversations.set(agentId, []);
    
    await agent.initialize();
    
    this.emit('agent:created', { agentId, config });
    
    return {
      id: agentId,
      status: 'active',
      config
    };
  }

  async listAgents() {
    return Array.from(this.agents.entries()).map(([id, agent]) => ({
      id,
      name: agent.config.name,
      type: agent.config.type,
      status: agent.status,
      lastActivity: agent.lastActivity
    }));
  }

  async sendMessage(agentId, message) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const conversation = this.conversations.get(agentId);
    conversation.push({
      id: uuidv4(),
      type: 'user',
      content: message,
      timestamp: new Date()
    });

    const response = await agent.processMessage(message);
    
    conversation.push({
      id: uuidv4(),
      type: 'agent',
      content: response,
      timestamp: new Date()
    });

    this.emit('agent:message', { agentId, message, response });

    return response;
  }

  async stopAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    await agent.stop();
    this.agents.delete(agentId);
    
    this.emit('agent:stopped', { agentId });
    
    return { success: true };
  }

  async getConversation(agentId) {
    return this.conversations.get(agentId) || [];
  }

  async shutdown() {
    for (const [agentId, agent] of this.agents) {
      await agent.stop();
    }
    this.agents.clear();
    this.conversations.clear();
  }
}

class Agent {
  constructor(id, config) {
    this.id = id;
    this.config = config;
    this.status = 'initializing';
    this.lastActivity = new Date();
  }

  async initialize() {
    this.status = 'active';
    console.log(`Agent ${this.id} (${this.config.name}) initialized`);
  }

  async processMessage(message) {
    this.lastActivity = new Date();
    
    // Simulate AI processing based on agent type
    switch (this.config.type) {
      case 'file-manager':
        return await this.processFileManagerMessage(message);
      case 'web-scraper':
        return await this.processWebScraperMessage(message);
      case 'code-assistant':
        return await this.processCodeAssistantMessage(message);
      case 'general':
      default:
        return await this.processGeneralMessage(message);
    }
  }

  async processFileManagerMessage(message) {
    // File management specific logic
    if (message.toLowerCase().includes('list files')) {
      return 'I can help you list files. Please specify the directory path.';
    }
    if (message.toLowerCase().includes('create file')) {
      return 'I can help you create files. Please specify the file path and content.';
    }
    return 'I\'m your file management assistant. I can help with listing, creating, reading, and modifying files.';
  }

  async processWebScraperMessage(message) {
    // Web scraping specific logic
    if (message.toLowerCase().includes('scrape')) {
      return 'I can help you scrape web content. Please provide the URL you want to scrape.';
    }
    return 'I\'m your web scraping assistant. I can extract data from websites and analyze web content.';
  }

  async processCodeAssistantMessage(message) {
    // Code assistance specific logic
    if (message.toLowerCase().includes('code') || message.toLowerCase().includes('function')) {
      return 'I can help you with code analysis, generation, and debugging. What programming task can I assist with?';
    }
    return 'I\'m your code assistant. I can help with programming tasks, code review, and technical questions.';
  }

  async processGeneralMessage(message) {
    // General purpose responses
    const responses = [
      `I understand you're asking about: "${message}". How can I help you with this?`,
      `That's an interesting question about "${message}". Let me think about how to assist you.`,
      `I'm processing your request: "${message}". What specific help do you need?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async stop() {
    this.status = 'stopped';
    console.log(`Agent ${this.id} stopped`);
  }
}