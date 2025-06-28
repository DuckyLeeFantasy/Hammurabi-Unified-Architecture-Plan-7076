import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  LinearProgress,
  Tooltip
} from '@mui/material';
import { 
  Circle,
  Memory,
  Storage,
  NetworkCheck
} from '@mui/icons-material';
import type { SystemStatus } from '../../shared/types';

export const StatusBar: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    mcpServer: 'connecting',
    agents: 'initializing',
    fileSystem: 'ready',
    browser: 'initializing'
  });
  
  const [systemStats, setSystemStats] = useState({
    memoryUsage: 45,
    activeAgents: 3,
    openTabs: 2,
    mcpConnections: 1
  });

  useEffect(() => {
    // Simulate status updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        mcpServer: Math.random() > 0.1 ? 'connected' : 'connecting',
        agents: Math.random() > 0.05 ? 'ready' : 'initializing'
      }));
      
      setSystemStats(prev => ({
        ...prev,
        memoryUsage: Math.min(80, prev.memoryUsage + (Math.random() - 0.5) * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
        return '#4caf50';
      case 'connecting':
      case 'initializing':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (service: string, status: string) => {
    const serviceNames = {
      mcpServer: 'MCP',
      agents: 'Agents',
      fileSystem: 'Files',
      browser: 'Browser'
    };
    
    return `${serviceNames[service as keyof typeof serviceNames]}: ${status}`;
  };

  return (
    <Box sx={{ 
      height: 32,
      backgroundColor: '#1e1e1e',
      borderTop: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      paddingX: 2,
      gap: 3,
      fontSize: '0.75rem'
    }}>
      {/* System Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {Object.entries(systemStatus).map(([service, status]) => (
          <Tooltip key={service} title={getStatusText(service, status)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Circle 
                sx={{ 
                  fontSize: 8, 
                  color: getStatusColor(status)
                }} 
              />
              <Typography variant="caption" sx={{ color: '#ccc' }}>
                {service.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>

      {/* Separator */}
      <Box sx={{ width: 1, height: 16, backgroundColor: '#333' }} />

      {/* System Stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={`Memory Usage: ${systemStats.memoryUsage.toFixed(1)}%`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Memory sx={{ fontSize: 14, color: '#ccc' }} />
            <Typography variant="caption" sx={{ color: '#ccc', minWidth: 35 }}>
              {systemStats.memoryUsage.toFixed(0)}%
            </Typography>
          </Box>
        </Tooltip>

        <Tooltip title={`Active Agents: ${systemStats.activeAgents}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#4caf50' }}>
              🤖 {systemStats.activeAgents}
            </Typography>
          </Box>
        </Tooltip>

        <Tooltip title={`Open Tabs: ${systemStats.openTabs}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#2196f3' }}>
              🌐 {systemStats.openTabs}
            </Typography>
          </Box>
        </Tooltip>
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Version Info */}
      <Typography variant="caption" sx={{ color: '#666' }}>
        Hammurabi v2.0.0
      </Typography>
    </Box>
  );
};