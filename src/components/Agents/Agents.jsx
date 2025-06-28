import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './Agents.css';

const { FiUsers, FiPlus, FiMessageSquare, FiPlay, FiPause, FiTrash2, FiSettings, FiCpu, FiActivity, FiX } = FiIcons;

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const agentList = await window.electronAPI.agent.list();
      setAgents(agentList);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const createAgent = async (config) => {
    try {
      setLoading(true);
      const newAgent = await window.electronAPI.agent.create(config);
      await loadAgents();
      setShowCreateModal(false);
      setSelectedAgent(newAgent.id);
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedAgent) return;

    try {
      setLoading(true);
      
      // Add user message to conversation
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: newMessage,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, userMessage]);
      setNewMessage('');

      // Send message to agent
      const response = await window.electronAPI.agent.sendMessage(selectedAgent, newMessage);
      
      // Add agent response to conversation
      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: response,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopAgent = async (agentId) => {
    try {
      await window.electronAPI.agent.stop(agentId);
      await loadAgents();
      if (selectedAgent === agentId) {
        setSelectedAgent(null);
        setConversation([]);
      }
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  };

  const agentTypes = [
    {
      id: 'general',
      name: 'General Assistant',
      description: 'Multi-purpose AI assistant for general tasks',
      icon: FiCpu
    },
    {
      id: 'file-manager',
      name: 'File Manager',
      description: 'Specialized in file operations and organization',
      icon: FiUsers
    },
    {
      id: 'web-scraper',
      name: 'Web Scraper',
      description: 'Extract and analyze web content',
      icon: FiActivity
    },
    {
      id: 'code-assistant',
      name: 'Code Assistant',
      description: 'Help with programming and development tasks',
      icon: FiSettings
    }
  ];

  const selectedAgentData = agents.find(agent => agent.id === selectedAgent);

  return (
    <div className="agents">
      <motion.div 
        className="agents-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>
          <SafeIcon icon={FiUsers} />
          AI Agents
        </h1>
        <motion.button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={FiPlus} />
          Create Agent
        </motion.button>
      </motion.div>

      <div className="agents-content">
        {/* Agent List */}
        <motion.div 
          className="agents-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2>Active Agents</h2>
          <div className="agents-list">
            {agents.length === 0 ? (
              <div className="empty-state">
                <SafeIcon icon={FiUsers} />
                <p>No agents created yet</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Your First Agent
                </button>
              </div>
            ) : (
              agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  className={`agent-card ${selectedAgent === agent.id ? 'selected' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedAgent(agent.id);
                    setConversation([]);
                  }}
                >
                  <div className="agent-info">
                    <div className="agent-avatar">
                      <SafeIcon icon={FiCpu} />
                    </div>
                    <div className="agent-details">
                      <h3>{agent.name}</h3>
                      <p>{agent.type}</p>
                      <div className="agent-status">
                        <div 
                          className={`status-dot ${agent.status}`}
                        />
                        <span>{agent.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="agent-actions">
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        stopAgent(agent.id);
                      }}
                      title="Stop Agent"
                    >
                      <SafeIcon icon={FiTrash2} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div 
          className="chat-interface"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {selectedAgent ? (
            <>
              <div className="chat-header">
                <div className="chat-agent-info">
                  <SafeIcon icon={FiCpu} />
                  <div>
                    <h3>{selectedAgentData?.name}</h3>
                    <p>{selectedAgentData?.type}</p>
                  </div>
                </div>
                <div className="chat-status">
                  <div className={`status-dot ${selectedAgentData?.status}`} />
                  <span>{selectedAgentData?.status}</span>
                </div>
              </div>

              <div className="chat-messages">
                <AnimatePresence>
                  {conversation.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`message ${message.type}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="message-avatar">
                        <SafeIcon icon={message.type === 'user' ? FiUsers : FiCpu} />
                      </div>
                      <div className="message-content">
                        <div className="message-text">{message.content}</div>
                        <div className="message-time">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {loading && (
                  <motion.div
                    className="message agent typing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="message-avatar">
                      <SafeIcon icon={FiCpu} />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <form className="chat-input" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || loading}
                  className="btn btn-primary"
                >
                  <SafeIcon icon={FiMessageSquare} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-agent-selected">
              <SafeIcon icon={FiMessageSquare} />
              <h3>Select an Agent</h3>
              <p>Choose an agent from the sidebar to start a conversation</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Agent Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateAgentModal 
            agentTypes={agentTypes}
            onClose={() => setShowCreateModal(false)}
            onCreate={createAgent}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CreateAgentModal = ({ agentTypes, onClose, onCreate, loading }) => {
  const [selectedType, setSelectedType] = useState(agentTypes[0]);
  const [agentName, setAgentName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agentName.trim()) return;

    onCreate({
      name: agentName,
      type: selectedType.id,
      description: selectedType.description
    });
  };

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Create New Agent</h2>
          <button className="modal-close" onClick={onClose}>
            <SafeIcon icon={FiX} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label>Agent Name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter agent name..."
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label>Agent Type</label>
            <div className="agent-type-grid">
              {agentTypes.map((type) => (
                <div
                  key={type.id}
                  className={`agent-type-card ${selectedType.id === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedType(type)}
                >
                  <SafeIcon icon={type.icon} className="type-icon" />
                  <h4>{type.name}</h4>
                  <p>{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!agentName.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Agents;