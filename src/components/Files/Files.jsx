import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './Files.css';

const { FiFolderOpen, FiFile, FiFolder, FiHome, FiArrowLeft, FiRefreshCw, FiEdit3, FiTrash2, FiPlus, FiSearch, FiDownload, FiUpload } = FiIcons;

const Files = () => {
  const [currentPath, setCurrentPath] = useState(process.env.HOME || '/home');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pathHistory, setPathHistory] = useState([]);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path) => {
    try {
      setLoading(true);
      const result = await window.electronAPI.fs.readDirectory(path);
      setFiles(result.items || []);
      setCurrentPath(result.path);
    } catch (error) {
      console.error('Failed to load directory:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToPath = (path) => {
    setPathHistory(prev => [...prev, currentPath]);
    setCurrentPath(path);
    setSelectedFile(null);
    setFileContent('');
    setEditMode(false);
  };

  const navigateBack = () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(prev => prev.slice(0, -1));
      setCurrentPath(previousPath);
      setSelectedFile(null);
      setFileContent('');
      setEditMode(false);
    }
  };

  const navigateToParent = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    navigateToPath(parentPath);
  };

  const openFile = async (file) => {
    if (file.type === 'directory') {
      navigateToPath(file.path);
    } else if (file.readable) {
      try {
        setLoading(true);
        const result = await window.electronAPI.fs.readFile(file.path);
        setSelectedFile(file);
        setFileContent(result.content);
        setEditMode(false);
      } catch (error) {
        console.error('Failed to read file:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    
    try {
      setLoading(true);
      await window.electronAPI.fs.writeFile(selectedFile.path, fileContent);
      setEditMode(false);
      // Refresh the file list to update modification time
      await loadDirectory(currentPath);
    } catch (error) {
      console.error('Failed to save file:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeCommand = async (command) => {
    try {
      setLoading(true);
      const result = await window.electronAPI.fs.executeCommand(command, [], { cwd: currentPath });
      console.log('Command output:', result.stdout);
      // Refresh directory after command execution
      await loadDirectory(currentPath);
    } catch (error) {
      console.error('Command failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const getFileIcon = (file) => {
    if (file.type === 'directory') return FiFolder;
    
    const ext = file.extension?.toLowerCase();
    switch (ext) {
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
      case '.json':
        return FiFile;
      case '.md':
      case '.txt':
        return FiFile;
      case '.html':
      case '.css':
      case '.scss':
        return FiFile;
      default:
        return FiFile;
    }
  };

  return (
    <div className="files">
      <motion.div 
        className="files-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-left">
          <h1>
            <SafeIcon icon={FiFolderOpen} />
            File Manager
          </h1>
          <div className="breadcrumb">
            <button 
              className="breadcrumb-btn"
              onClick={() => navigateToPath(process.env.HOME || '/home')}
              title="Home"
            >
              <SafeIcon icon={FiHome} />
            </button>
            <span className="path-separator">/</span>
            <span className="current-path">{currentPath}</span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <SafeIcon icon={FiSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="action-btn" onClick={() => loadDirectory(currentPath)} title="Refresh">
            <SafeIcon icon={FiRefreshCw} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </motion.div>

      <div className="files-content">
        {/* Navigation Bar */}
        <motion.div 
          className="nav-bar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="nav-controls">
            <button 
              className="nav-btn"
              onClick={navigateBack}
              disabled={pathHistory.length === 0}
              title="Back"
            >
              <SafeIcon icon={FiArrowLeft} />
            </button>
            <button 
              className="nav-btn"
              onClick={navigateToParent}
              title="Parent Directory"
            >
              <SafeIcon icon={FiFolder} />
            </button>
          </div>

          <div className="quick-actions">
            <button 
              className="quick-btn"
              onClick={() => executeCommand('ls -la')}
              title="List Details"
            >
              <SafeIcon icon={FiFile} />
              Details
            </button>
            <button 
              className="quick-btn"
              onClick={() => executeCommand('pwd')}
              title="Print Working Directory"
            >
              <SafeIcon icon={FiFolderOpen} />
              PWD
            </button>
          </div>
        </motion.div>

        <div className="files-main">
          {/* File List */}
          <motion.div 
            className="file-list-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="file-list-header">
              <h3>Files and Folders</h3>
              <span className="file-count">{filteredFiles.length} items</span>
            </div>
            
            <div className="file-list">
              {loading ? (
                <div className="loading-state">
                  <SafeIcon icon={FiRefreshCw} className="spinning" />
                  <p>Loading...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="empty-state">
                  <SafeIcon icon={FiFolderOpen} />
                  <p>No files found</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredFiles.map((file, index) => (
                    <motion.div
                      key={file.path}
                      className={`file-item ${selectedFile?.path === file.path ? 'selected' : ''}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => openFile(file)}
                    >
                      <div className="file-icon">
                        <SafeIcon 
                          icon={getFileIcon(file)} 
                          className={file.type === 'directory' ? 'folder-icon' : 'file-icon'}
                        />
                      </div>
                      <div className="file-info">
                        <h4>{file.name}</h4>
                        <div className="file-meta">
                          <span className="file-size">
                            {file.type === 'directory' ? 'Folder' : formatFileSize(file.size)}
                          </span>
                          <span className="file-date">{formatDate(file.modified)}</span>
                        </div>
                      </div>
                      {file.type === 'file' && (
                        <div className="file-actions">
                          <button 
                            className="file-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openFile(file);
                            }}
                            title="Open"
                          >
                            <SafeIcon icon={FiEdit3} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* File Viewer/Editor */}
          <motion.div 
            className="file-viewer-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {selectedFile ? (
              <>
                <div className="viewer-header">
                  <div className="file-details">
                    <h3>{selectedFile.name}</h3>
                    <div className="file-stats">
                      <span>Size: {formatFileSize(selectedFile.size)}</span>
                      <span>Modified: {formatDate(selectedFile.modified)}</span>
                    </div>
                  </div>
                  
                  <div className="viewer-actions">
                    {!editMode ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => setEditMode(true)}
                      >
                        <SafeIcon icon={FiEdit3} />
                        Edit
                      </button>
                    ) : (
                      <div className="edit-actions">
                        <button 
                          className="btn btn-success"
                          onClick={saveFile}
                          disabled={loading}
                        >
                          <SafeIcon icon={FiDownload} />
                          Save
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditMode(false);
                            openFile(selectedFile);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="file-content">
                  {editMode ? (
                    <textarea
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      className="file-editor"
                      placeholder="File content..."
                    />
                  ) : (
                    <pre className="file-viewer">{fileContent}</pre>
                  )}
                </div>
              </>
            ) : (
              <div className="no-file-selected">
                <SafeIcon icon={FiFile} />
                <h3>No File Selected</h3>
                <p>Select a file from the list to view or edit its contents</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Files;