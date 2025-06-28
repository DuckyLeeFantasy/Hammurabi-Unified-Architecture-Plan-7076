import React from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  Web,
  SmartToy,
  Folder,
  Settings,
  Minimize,
  CropSquare,
  Close
} from '@mui/icons-material';

export type AppView = 'dashboard' | 'browser' | 'agents' | 'files' | 'settings';

interface NavigationTabsProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentView,
  onViewChange
}) => {
  const tabs = [
    { value: 'dashboard', label: 'Dashboard', icon: Dashboard },
    { value: 'browser', label: 'Browser', icon: Web },
    { value: 'agents', label: 'AI Agents', icon: SmartToy },
    { value: 'files', label: 'Files', icon: Folder },
    { value: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const handleWindowControl = async (action: 'minimize' | 'maximize' | 'close') => {
    try {
      await window.electronAPI.window[action]();
    } catch (error) {
      console.error(`Failed to ${action} window:`, error);
    }
  };

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 0
    }}>
      <Toolbar sx={{ minHeight: 56, paddingX: 2 }}>
        {/* App Title */}
        <Typography variant="h6" sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginRight: 3
        }}>
          🏛️ Hammurabi
        </Typography>

        {/* Navigation Tabs */}
        <Tabs
          value={currentView}
          onChange={(_, value) => onViewChange(value)}
          sx={{ 
            flex: 1,
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500,
              '&.Mui-selected': {
                color: 'white'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white'
            }
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={<tab.icon />}
              iconPosition="start"
              sx={{ minHeight: 56 }}
            />
          ))}
        </Tabs>

        {/* Window Controls */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Minimize">
            <IconButton
              size="small"
              onClick={() => handleWindowControl('minimize')}
              sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              <Minimize fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Maximize">
            <IconButton
              size="small"
              onClick={() => handleWindowControl('maximize')}
              sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              <CropSquare fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={() => handleWindowControl('close')}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.2)'
                }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};