import { useState, useEffect, useCallback } from 'react';

export interface ServiceStatus {
  name: string;
  status: 'initializing' | 'ready' | 'error' | 'stopped';
  lastActivity: Date;
  details?: any;
}

export interface AppStatus {
  mcp: any;
  browser: any;
  desktopCommander: any;
  services: ServiceStatus[];
}

export const useServices = () => {
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await window.electronAPI.app.getStatus();
      setAppStatus(status);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to get application status');
      console.error('Failed to get app status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    refreshStatus();

    // Set up periodic refresh
    const interval = setInterval(refreshStatus, 5000);

    // Listen for real-time status updates
    const handleStatusUpdate = (data: any) => {
      setAppStatus(prev => prev ? { ...prev, ...data } : null);
    };

    window.electronAPI.on('service-status-updated', handleStatusUpdate);

    return () => {
      clearInterval(interval);
      window.electronAPI.removeListener('service-status-updated', handleStatusUpdate);
    };
  }, [refreshStatus]);

  const getServiceStatus = useCallback((serviceName: string) => {
    return appStatus?.services?.find(s => s.name === serviceName);
  }, [appStatus]);

  const isServiceReady = useCallback((serviceName: string) => {
    const service = getServiceStatus(serviceName);
    return service?.status === 'ready';
  }, [getServiceStatus]);

  const areAllServicesReady = useCallback(() => {
    return appStatus?.services?.every(s => s.status === 'ready') || false;
  }, [appStatus]);

  return {
    appStatus,
    loading,
    error,
    refreshStatus,
    getServiceStatus,
    isServiceReady,
    areAllServicesReady
  };
};