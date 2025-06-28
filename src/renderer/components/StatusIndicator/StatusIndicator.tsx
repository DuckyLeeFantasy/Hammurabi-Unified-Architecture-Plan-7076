import React from 'react';
import { 
  Box, 
  Chip, 
  Tooltip, 
  CircularProgress,
  Typography 
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  Warning, 
  HourglassEmpty 
} from '@mui/icons-material';

interface StatusIndicatorProps {
  status: 'initializing' | 'ready' | 'error' | 'stopped';
  label: string;
  size?: 'small' | 'medium';
  showLabel?: boolean;
  details?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'small',
  showLabel = true,
  details
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'ready':
        return {
          color: '#4caf50' as const,
          icon: CheckCircle,
          text: 'Ready',
          chipColor: 'success' as const
        };
      case 'error':
        return {
          color: '#f44336' as const,
          icon: Error,
          text: 'Error',
          chipColor: 'error' as const
        };
      case 'initializing':
        return {
          color: '#ff9800' as const,
          icon: HourglassEmpty,
          text: 'Initializing',
          chipColor: 'warning' as const
        };
      case 'stopped':
        return {
          color: '#9e9e9e' as const,
          icon: Warning,
          text: 'Stopped',
          chipColor: 'default' as const
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const indicator = status === 'initializing' ? (
    <CircularProgress 
      size={size === 'small' ? 16 : 20} 
      sx={{ color: config.color }} 
    />
  ) : (
    <IconComponent 
      sx={{ 
        fontSize: size === 'small' ? 16 : 20, 
        color: config.color 
      }} 
    />
  );

  const content = showLabel ? (
    <Chip
      icon={indicator}
      label={`${label}: ${config.text}`}
      color={config.chipColor}
      size={size}
      variant="outlined"
      sx={{
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? 16 : 20
        }
      }}
    />
  ) : (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {indicator}
      {size !== 'small' && (
        <Typography variant="caption" sx={{ color: config.color }}>
          {config.text}
        </Typography>
      )}
    </Box>
  );

  const tooltipText = details 
    ? `${label}: ${config.text}\n${details}`
    : `${label}: ${config.text}`;

  return (
    <Tooltip title={tooltipText} arrow>
      <Box component="span">
        {content}
      </Box>
    </Tooltip>
  );
};