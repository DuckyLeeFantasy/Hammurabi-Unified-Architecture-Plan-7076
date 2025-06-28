import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './Browser.css';

const { FiGlobe, FiRefreshCw, FiArrowLeft, FiArrowRight, FiPlus, FiX, FiHome, FiSearch } = FiIcons;

const Browser = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [addressBar, setAddressBar] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Create initial tab
    createNewTab();
  }, []);

  const createNewTab = async () => {
    try {
      const newTab = {
        id: Date.now().toString(),
        url: 'about:blank',
        title: 'New Tab',
        loading: false
      };
      
      setTabs(prev => [...prev, newTab]);
      setActiveTab(newTab.id);
      setAddressBar('');
    } catch (error) {
      console.error('Failed to create new tab:', error);
    }
  };

  const closeTab = (tabId) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      if (activeTab === tabId && filtered.length > 0) {
        setActiveTab(filtered[0].id);
      } else if (filtered.length === 0) {
        createNewTab();
      }
      return filtered;
    });
  };

  const navigateToUrl = async (url) => {
    if (!url || !activeTab) return;

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:')) {
      url = `https://${url}`;
    }

    try {
      setLoading(true);
      
      // In a real implementation, this would navigate the browser
      const result = await window.electronAPI.browser.navigate(url);
      
      // Update tab information
      setTabs(prev => prev.map(tab => 
        tab.id === activeTab 
          ? { ...tab, url: result.url, title: result.title || url, loading: false }
          : tab
      ));
      
      setAddressBar(result.url);
      
      // Add to history
      setHistory(prev => [
        { url: result.url, title: result.title || url, timestamp: new Date() },
        ...prev.slice(0, 49) // Keep last 50 entries
      ]);
      
    } catch (error) {
      console.error('Navigation failed:', error);
      // Show error in tab
      setTabs(prev => prev.map(tab => 
        tab.id === activeTab 
          ? { ...tab, title: 'Error loading page', loading: false }
          : tab
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleAddressBarSubmit = (e) => {
    e.preventDefault();
    navigateToUrl(addressBar);
  };

  const refreshPage = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab && currentTab.url !== 'about:blank') {
      navigateToUrl(currentTab.url);
    }
  };

  const goHome = () => {
    navigateToUrl('https://www.google.com');
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="browser">
      <motion.div 
        className="browser-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>
          <SafeIcon icon={FiGlobe} />
          Browser
        </h1>
      </motion.div>

      {/* Tab Bar */}
      <motion.div 
        className="tab-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="tabs">
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.id}
              className={`tab ${tab.id === activeTab ? 'active' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={() => setActiveTab(tab.id)}
            >
              <SafeIcon icon={FiGlobe} className="tab-icon" />
              <span className="tab-title">{tab.title}</span>
              {tab.loading && <SafeIcon icon={FiRefreshCw} className="tab-loading" />}
              <button 
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <SafeIcon icon={FiX} />
              </button>
            </motion.div>
          ))}
        </div>
        
        <motion.button 
          className="new-tab-btn"
          onClick={createNewTab}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SafeIcon icon={FiPlus} />
        </motion.button>
      </motion.div>

      {/* Navigation Bar */}
      <motion.div 
        className="nav-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="nav-controls">
          <button className="nav-btn" disabled>
            <SafeIcon icon={FiArrowLeft} />
          </button>
          <button className="nav-btn" disabled>
            <SafeIcon icon={FiArrowRight} />
          </button>
          <button className="nav-btn" onClick={refreshPage}>
            <SafeIcon icon={loading ? FiRefreshCw : FiRefreshCw} className={loading ? 'spinning' : ''} />
          </button>
          <button className="nav-btn" onClick={goHome}>
            <SafeIcon icon={FiHome} />
          </button>
        </div>

        <form className="address-bar" onSubmit={handleAddressBarSubmit}>
          <SafeIcon icon={FiSearch} className="address-icon" />
          <input
            type="text"
            value={addressBar}
            onChange={(e) => setAddressBar(e.target.value)}
            placeholder="Enter URL or search..."
            className="address-input"
          />
        </form>
      </motion.div>

      {/* Browser Content */}
      <motion.div 
        className="browser-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {currentTab ? (
          <div className="tab-content">
            {currentTab.url === 'about:blank' ? (
              <div className="start-page">
                <div className="start-page-content">
                  <SafeIcon icon={FiGlobe} className="start-icon" />
                  <h2>Welcome to Hammurabi Browser</h2>
                  <p>AI-powered browsing with integrated agent assistance</p>
                  
                  <div className="quick-links">
                    <h3>Quick Links</h3>
                    <div className="link-grid">
                      <button 
                        className="quick-link"
                        onClick={() => navigateToUrl('https://www.google.com')}
                      >
                        <SafeIcon icon={FiSearch} />
                        Google
                      </button>
                      <button 
                        className="quick-link"
                        onClick={() => navigateToUrl('https://github.com')}
                      >
                        <SafeIcon icon={FiGlobe} />
                        GitHub
                      </button>
                      <button 
                        className="quick-link"
                        onClick={() => navigateToUrl('https://stackoverflow.com')}
                      >
                        <SafeIcon icon={FiGlobe} />
                        Stack Overflow
                      </button>
                      <button 
                        className="quick-link"
                        onClick={() => navigateToUrl('https://news.ycombinator.com')}
                      >
                        <SafeIcon icon={FiGlobe} />
                        Hacker News
                      </button>
                    </div>
                  </div>

                  {history.length > 0 && (
                    <div className="recent-history">
                      <h3>Recent History</h3>
                      <div className="history-list">
                        {history.slice(0, 5).map((item, index) => (
                          <button
                            key={index}
                            className="history-item"
                            onClick={() => navigateToUrl(item.url)}
                          >
                            <SafeIcon icon={FiGlobe} />
                            <div className="history-info">
                              <span className="history-title">{item.title}</span>
                              <span className="history-url">{item.url}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="web-view">
                <div className="web-view-placeholder">
                  <SafeIcon icon={FiGlobe} />
                  <h3>Web Content</h3>
                  <p>Currently viewing: {currentTab.url}</p>
                  <small>In a full implementation, this would show the actual web content</small>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-tabs">
            <SafeIcon icon={FiGlobe} />
            <p>No tabs open</p>
            <button className="btn btn-primary" onClick={createNewTab}>
              Create New Tab
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Browser;