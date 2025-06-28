import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './Dashboard.css';

const { FiActivity, FiCpu, FiHardDrive, FiUsers, FiGlobe, FiTrendingUp, FiZap, FiShield } = FiIcons;

const Dashboard = ({ systemStatus }) => {
  const [stats, setStats] = useState({
    activeAgents: 0,
    openTabs: 0,
    filesAccessed: 0,
    mcpCalls: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load agents
      const agents = await window.electronAPI.agent.list();
      
      // Simulate other stats (in real app, these would come from actual services)
      setStats({
        activeAgents: agents.filter(agent => agent.status === 'active').length,
        openTabs: Math.floor(Math.random() * 5) + 1,
        filesAccessed: Math.floor(Math.random() * 20) + 10,
        mcpCalls: Math.floor(Math.random() * 100) + 50
      });

      // Simulate recent activity
      setRecentActivity([
        { type: 'agent', message: 'File Manager agent completed task', time: '2 minutes ago' },
        { type: 'browser', message: 'Navigated to example.com', time: '5 minutes ago' },
        { type: 'file', message: 'Opened project.json', time: '8 minutes ago' },
        { type: 'mcp', message: 'MCP tool executed successfully', time: '12 minutes ago' }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const getStatusIndicator = (status) => {
    const colors = {
      ready: '#10b981',
      connected: '#10b981',
      error: '#ef4444',
      loading: '#f59e0b',
      connecting: '#3b82f6',
      initializing: '#f59e0b'
    };

    return {
      color: colors[status] || '#6b7280',
      pulse: ['connecting', 'loading', 'initializing'].includes(status)
    };
  };

  const statCards = [
    {
      title: 'Active Agents',
      value: stats.activeAgents,
      icon: FiUsers,
      color: '#667eea',
      change: '+2 from yesterday'
    },
    {
      title: 'Browser Tabs',
      value: stats.openTabs,
      icon: FiGlobe,
      color: '#00d2d3',
      change: 'Currently open'
    },
    {
      title: 'Files Accessed',
      value: stats.filesAccessed,
      icon: FiHardDrive,
      color: '#ff6b6b',
      change: 'Today'
    },
    {
      title: 'MCP Calls',
      value: stats.mcpCalls,
      icon: FiZap,
      color: '#f59e0b',
      change: 'Last 24 hours'
    }
  ];

  return (
    <div className="dashboard">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>
          <SafeIcon icon={FiActivity} />
          Dashboard
        </h1>
        <p>Welcome to your unified AI desktop environment</p>
      </motion.div>

      {/* System Status Overview */}
      <motion.div 
        className="status-overview"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2>System Status</h2>
        <div className="status-cards">
          {Object.entries(systemStatus).map(([service, status], index) => {
            const indicator = getStatusIndicator(status);
            return (
              <motion.div 
                key={service}
                className="status-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="status-card-header">
                  <SafeIcon 
                    icon={service === 'mcpServer' ? FiZap : 
                          service === 'agents' ? FiUsers :
                          service === 'fileSystem' ? FiHardDrive :
                          service === 'browser' ? FiGlobe : FiCpu} 
                    style={{ color: indicator.color }}
                  />
                  <h3>{service.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                </div>
                <div className="status-indicator-large">
                  <div 
                    className={`status-dot-large ${indicator.pulse ? 'pulse' : ''}`}
                    style={{ backgroundColor: indicator.color }}
                  />
                  <span className="status-text">{status}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div 
        className="stats-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2>
          <SafeIcon icon={FiTrendingUp} />
          Statistics
        </h2>
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <motion.div 
              key={stat.title}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <SafeIcon icon={stat.icon} />
              </div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-change">{stat.change}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        className="activity-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2>
          <SafeIcon icon={FiActivity} />
          Recent Activity
        </h2>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <motion.div 
              key={index}
              className="activity-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <div className="activity-icon">
                <SafeIcon 
                  icon={activity.type === 'agent' ? FiUsers :
                        activity.type === 'browser' ? FiGlobe :
                        activity.type === 'file' ? FiHardDrive :
                        FiZap} 
                />
              </div>
              <div className="activity-content">
                <p>{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="quick-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <motion.button 
            className="action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiUsers} />
            Create Agent
          </motion.button>
          <motion.button 
            className="action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiGlobe} />
            Open Browser
          </motion.button>
          <motion.button 
            className="action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiHardDrive} />
            Browse Files
          </motion.button>
          <motion.button 
            className="action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiShield} />
            Security Scan
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;