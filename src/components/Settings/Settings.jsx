import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './Settings.css';

const { FiSettings, FiUser, FiShield, FiDatabase, FiGlobe, FiCpu, FiSave, FiRefreshCw, FiCheck, FiAlertTriangle } = FiIcons;

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      theme: 'dark',
      language: 'en',
      startupBehavior: 'restore',
      notifications: true,
      autoUpdate: true
    },
    browser: {
      defaultSearchEngine: 'google',
      homepage: 'about:home',
      blockAds: true,
      enableJavaScript: true,
      allowCookies: true,
      clearDataOnExit: false
    },
    agents: {
      maxActiveAgents: 5,
      aiModel: 'gpt-3.5-turbo',
      responseTimeout: 30,
      autoCoordination: true,
      logLevel: 'info'
    },
    security: {
      enableSandbox: true,
      blockMaliciousUrls: true,
      requireHttps: false,
      dataEncryption: true,
      sessionTimeout: 60
    },
    performance: {
      enableHardwareAcceleration: true,
      maxMemoryUsage: 4096,
      cacheSize: 1024,
      preloadPages: true,
      backgroundSync: true
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await window.electronAPI.db.getSettings();
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...savedSettings }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      await window.electronAPI.db.saveSettings(settings);
      setLastSaved(new Date());
      setHasChanges(false);
      
      // Show success message
      setTimeout(() => setLastSaved(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      // Reset to default values
      setSettings({
        general: {
          theme: 'dark',
          language: 'en',
          startupBehavior: 'restore',
          notifications: true,
          autoUpdate: true
        },
        browser: {
          defaultSearchEngine: 'google',
          homepage: 'about:home',
          blockAds: true,
          enableJavaScript: true,
          allowCookies: true,
          clearDataOnExit: false
        },
        agents: {
          maxActiveAgents: 5,
          aiModel: 'gpt-3.5-turbo',
          responseTimeout: 30,
          autoCoordination: true,
          logLevel: 'info'
        },
        security: {
          enableSandbox: true,
          blockMaliciousUrls: true,
          requireHttps: false,
          dataEncryption: true,
          sessionTimeout: 60
        },
        performance: {
          enableHardwareAcceleration: true,
          maxMemoryUsage: 4096,
          cacheSize: 1024,
          preloadPages: true,
          backgroundSync: true
        }
      });
      setHasChanges(true);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'browser', label: 'Browser', icon: FiGlobe },
    { id: 'agents', label: 'AI Agents', icon: FiCpu },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'performance', label: 'Performance', icon: FiDatabase }
  ];

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>General Settings</h3>
      
      <div className="setting-group">
        <label>Theme</label>
        <select
          value={settings.general.theme}
          onChange={(e) => updateSetting('general', 'theme', e.target.value)}
          className="setting-select"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="auto">Auto (System)</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Language</label>
        <select
          value={settings.general.language}
          onChange={(e) => updateSetting('general', 'language', e.target.value)}
          className="setting-select"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Startup Behavior</label>
        <select
          value={settings.general.startupBehavior}
          onChange={(e) => updateSetting('general', 'startupBehavior', e.target.value)}
          className="setting-select"
        >
          <option value="restore">Restore Previous Session</option>
          <option value="homepage">Open Homepage</option>
          <option value="blank">Start with Blank Page</option>
        </select>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.general.notifications}
            onChange={(e) => updateSetting('general', 'notifications', e.target.checked)}
          />
          <span>Enable Notifications</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.general.autoUpdate}
            onChange={(e) => updateSetting('general', 'autoUpdate', e.target.checked)}
          />
          <span>Automatic Updates</span>
        </label>
      </div>
    </div>
  );

  const renderBrowserSettings = () => (
    <div className="settings-section">
      <h3>Browser Settings</h3>
      
      <div className="setting-group">
        <label>Default Search Engine</label>
        <select
          value={settings.browser.defaultSearchEngine}
          onChange={(e) => updateSetting('browser', 'defaultSearchEngine', e.target.value)}
          className="setting-select"
        >
          <option value="google">Google</option>
          <option value="bing">Bing</option>
          <option value="duckduckgo">DuckDuckGo</option>
          <option value="startpage">Startpage</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Homepage URL</label>
        <input
          type="text"
          value={settings.browser.homepage}
          onChange={(e) => updateSetting('browser', 'homepage', e.target.value)}
          className="setting-input"
          placeholder="https://example.com"
        />
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.browser.blockAds}
            onChange={(e) => updateSetting('browser', 'blockAds', e.target.checked)}
          />
          <span>Block Advertisements</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.browser.enableJavaScript}
            onChange={(e) => updateSetting('browser', 'enableJavaScript', e.target.checked)}
          />
          <span>Enable JavaScript</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.browser.allowCookies}
            onChange={(e) => updateSetting('browser', 'allowCookies', e.target.checked)}
          />
          <span>Allow Cookies</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.browser.clearDataOnExit}
            onChange={(e) => updateSetting('browser', 'clearDataOnExit', e.target.checked)}
          />
          <span>Clear Data on Exit</span>
        </label>
      </div>
    </div>
  );

  const renderAgentsSettings = () => (
    <div className="settings-section">
      <h3>AI Agents Settings</h3>
      
      <div className="setting-group">
        <label>Maximum Active Agents</label>
        <input
          type="number"
          value={settings.agents.maxActiveAgents}
          onChange={(e) => updateSetting('agents', 'maxActiveAgents', parseInt(e.target.value))}
          className="setting-input"
          min="1"
          max="10"
        />
      </div>

      <div className="setting-group">
        <label>AI Model</label>
        <select
          value={settings.agents.aiModel}
          onChange={(e) => updateSetting('agents', 'aiModel', e.target.value)}
          className="setting-select"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="claude-3">Claude 3</option>
          <option value="local-llama">Local Llama</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Response Timeout (seconds)</label>
        <input
          type="number"
          value={settings.agents.responseTimeout}
          onChange={(e) => updateSetting('agents', 'responseTimeout', parseInt(e.target.value))}
          className="setting-input"
          min="5"
          max="300"
        />
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.agents.autoCoordination}
            onChange={(e) => updateSetting('agents', 'autoCoordination', e.target.checked)}
          />
          <span>Enable Auto-Coordination</span>
        </label>
      </div>

      <div className="setting-group">
        <label>Log Level</label>
        <select
          value={settings.agents.logLevel}
          onChange={(e) => updateSetting('agents', 'logLevel', e.target.value)}
          className="setting-select"
        >
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Security Settings</h3>
      
      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.security.enableSandbox}
            onChange={(e) => updateSetting('security', 'enableSandbox', e.target.checked)}
          />
          <span>Enable Process Sandbox</span>
        </label>
        <small>Isolates processes for enhanced security</small>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.security.blockMaliciousUrls}
            onChange={(e) => updateSetting('security', 'blockMaliciousUrls', e.target.checked)}
          />
          <span>Block Malicious URLs</span>
        </label>
        <small>Prevents access to known malicious websites</small>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.security.requireHttps}
            onChange={(e) => updateSetting('security', 'requireHttps', e.target.checked)}
          />
          <span>Require HTTPS</span>
        </label>
        <small>Automatically redirect HTTP to HTTPS when available</small>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.security.dataEncryption}
            onChange={(e) => updateSetting('security', 'dataEncryption', e.target.checked)}
          />
          <span>Enable Data Encryption</span>
        </label>
        <small>Encrypts local data storage</small>
      </div>

      <div className="setting-group">
        <label>Session Timeout (minutes)</label>
        <input
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
          className="setting-input"
          min="5"
          max="480"
        />
        <small>Automatically lock after inactivity</small>
      </div>
    </div>
  );

  const renderPerformanceSettings = () => (
    <div className="settings-section">
      <h3>Performance Settings</h3>
      
      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.performance.enableHardwareAcceleration}
            onChange={(e) => updateSetting('performance', 'enableHardwareAcceleration', e.target.checked)}
          />
          <span>Enable Hardware Acceleration</span>
        </label>
        <small>Uses GPU for better performance</small>
      </div>

      <div className="setting-group">
        <label>Maximum Memory Usage (MB)</label>
        <input
          type="number"
          value={settings.performance.maxMemoryUsage}
          onChange={(e) => updateSetting('performance', 'maxMemoryUsage', parseInt(e.target.value))}
          className="setting-input"
          min="512"
          max="16384"
          step="512"
        />
        <small>Limit memory usage to prevent system slowdown</small>
      </div>

      <div className="setting-group">
        <label>Cache Size (MB)</label>
        <input
          type="number"
          value={settings.performance.cacheSize}
          onChange={(e) => updateSetting('performance', 'cacheSize', parseInt(e.target.value))}
          className="setting-input"
          min="128"
          max="4096"
          step="128"
        />
        <small>Larger cache improves loading times</small>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.performance.preloadPages}
            onChange={(e) => updateSetting('performance', 'preloadPages', e.target.checked)}
          />
          <span>Preload Pages</span>
        </label>
        <small>Preloads links for faster navigation</small>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.performance.backgroundSync}
            onChange={(e) => updateSetting('performance', 'backgroundSync', e.target.checked)}
          />
          <span>Background Sync</span>
        </label>
        <small>Sync data in background for better responsiveness</small>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'browser':
        return renderBrowserSettings();
      case 'agents':
        return renderAgentsSettings();
      case 'security':
        return renderSecuritySettings();
      case 'performance':
        return renderPerformanceSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="settings">
      <motion.div 
        className="settings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-left">
          <h1>
            <SafeIcon icon={FiSettings} />
            Settings
          </h1>
          <p>Configure Hammurabi to your preferences</p>
        </div>
        
        <div className="header-actions">
          {lastSaved && (
            <div className="save-status success">
              <SafeIcon icon={FiCheck} />
              <span>Settings saved at {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          
          {hasChanges && (
            <div className="save-status warning">
              <SafeIcon icon={FiAlertTriangle} />
              <span>You have unsaved changes</span>
            </div>
          )}
          
          <button 
            className="btn btn-secondary"
            onClick={resetToDefaults}
            title="Reset to Defaults"
          >
            <SafeIcon icon={FiRefreshCw} />
            Reset
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={saveSettings}
            disabled={isSaving || !hasChanges}
          >
            <SafeIcon icon={isSaving ? FiRefreshCw : FiSave} className={isSaving ? 'spinning' : ''} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      <div className="settings-content">
        {/* Settings Tabs */}
        <motion.div 
          className="settings-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="settings-tabs">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <SafeIcon icon={tab.icon} />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div 
          className="settings-main"
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;