import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './ModelStudio.css';

const { FiCpu, FiDownload, FiGitMerge, FiCheckCircle, FiPlay, FiSettings, FiCloud, FiZap } = FiIcons;

const ModelStudio = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [availableModels, setAvailableModels] = useState([]);
  const [downloadedModels, setDownloadedModels] = useState([]);
  const [mergedModels, setMergedModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [mergeConfig, setMergeConfig] = useState({
    method: 'slerp',
    name: '',
    weights: {},
    outputPath: ''
  });
  const [merging, setMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [validationResults, setValidationResults] = useState(null);

  useEffect(() => {
    loadModelData();
  }, []);

  const loadModelData = async () => {
    try {
      // Load available models from Hugging Face
      const available = [
        {
          id: 'cognitivecomputations/dolphin-2.7-mistral-7b',
          name: 'Dolphin 2.7 Mistral 7B',
          description: 'Uncensored conversational AI with strong reasoning',
          capabilities: ['conversation', 'reasoning', 'coding'],
          size: '13.8GB',
          downloads: '2.1M',
          status: 'available'
        },
        {
          id: 'jondurbin/airoboros-l2-70b-gpt4-1.4.1',
          name: 'Airoboros L2 70B',
          description: 'Large language model optimized for instruction following',
          capabilities: ['instruction', 'reasoning', 'analysis'],
          size: '138GB',
          downloads: '567K',
          status: 'available'
        },
        {
          id: 'teknium/OpenHermes-2.5-Mistral-7B',
          name: 'OpenHermes 2.5 Mistral 7B',
          description: 'High-quality conversational AI model',
          capabilities: ['conversation', 'knowledge', 'helpfulness'],
          size: '13.8GB',
          downloads: '1.8M',
          status: 'available'
        }
      ];

      // Load downloaded models
      const downloaded = await window.electronAPI.mcp.callTool('list_local_models', {});
      
      // Load merged models
      const merged = await window.electronAPI.mcp.callTool('list_merged_models', {});

      setAvailableModels(available);
      setDownloadedModels(downloaded.result || []);
      setMergedModels(merged.result || []);
    } catch (error) {
      console.error('Failed to load model data:', error);
    }
  };

  const downloadModel = async (modelId) => {
    try {
      const result = await window.electronAPI.mcp.callTool('download_model', {
        model_id: modelId,
        destination: './models',
        model_type: 'base'
      });

      if (result.success) {
        await loadModelData();
      }
    } catch (error) {
      console.error('Failed to download model:', error);
    }
  };

  const selectModelForMerge = (model) => {
    if (selectedModels.find(m => m.id === model.id)) {
      setSelectedModels(prev => prev.filter(m => m.id !== model.id));
    } else if (selectedModels.length < 4) {
      setSelectedModels(prev => [...prev, model]);
    }
  };

  const startMerge = async () => {
    if (selectedModels.length < 2) return;

    try {
      setMerging(true);
      setMergeProgress(0);

      const mergeParams = {
        models: selectedModels.map(model => ({
          path: model.path,
          weight: mergeConfig.weights[model.id] || 0.5,
          name: model.name
        })),
        merge_method: mergeConfig.method,
        output_path: `./models/merged/${mergeConfig.name || 'merged_model'}`,
        config_overrides: {
          name: mergeConfig.name,
          description: `Merged model from: ${selectedModels.map(m => m.name).join(', ')}`
        }
      };

      // Start merge process
      const result = await window.electronAPI.mcp.callTool('merge_models', mergeParams);

      if (result.success) {
        setMergeProgress(100);
        await loadModelData();
        setSelectedModels([]);
        setActiveTab('validation');
      }
    } catch (error) {
      console.error('Merge failed:', error);
    } finally {
      setMerging(false);
    }
  };

  const validateModel = async (modelPath) => {
    try {
      const result = await window.electronAPI.mcp.callTool('validate_model', {
        model_path: modelPath,
        validation_type: 'comprehensive',
        test_prompts: [
          'Explain quantum computing in simple terms',
          'Write a Python function to sort a list',
          'What are the implications of artificial intelligence?',
          'Solve this logic puzzle: If all roses are flowers...'
        ]
      });

      setValidationResults(result.validation_results);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const deployToVenice = async (modelPath) => {
    try {
      const result = await window.electronAPI.mcp.callTool('deploy_to_venice', {
        model_path: modelPath,
        deployment_config: {
          name: mergeConfig.name,
          description: 'Custom merged model from Hammurabi Studio',
          public: false
        }
      });

      if (result.success) {
        console.log('Successfully deployed to Venice.ai:', result.deployment_url);
      }
    } catch (error) {
      console.error('Venice deployment failed:', error);
    }
  };

  const tabs = [
    { id: 'library', label: 'Model Library', icon: FiDownload },
    { id: 'merge', label: 'Merge Models', icon: FiGitMerge },
    { id: 'validation', label: 'Test & Validate', icon: FiCheckCircle },
    { id: 'deploy', label: 'Deploy', icon: FiCloud }
  ];

  const renderModelLibrary = () => (
    <div className="model-library">
      <motion.div
        className="library-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-header">
          <h3>Available Models</h3>
          <button className="btn btn-secondary" onClick={loadModelData}>
            <SafeIcon icon={FiPlay} />
            Refresh
          </button>
        </div>
        
        <div className="model-grid">
          {availableModels.map((model, index) => (
            <motion.div
              key={model.id}
              className="model-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => downloadModel(model.id)}
            >
              <div className="model-header">
                <div className="model-info">
                  <h4>{model.name}</h4>
                  <p>{model.description}</p>
                </div>
                <div className={`model-status status-${model.status}`}>
                  {model.status}
                </div>
              </div>
              
              <div className="model-capabilities">
                {model.capabilities.map(cap => (
                  <span key={cap} className="capability-tag">{cap}</span>
                ))}
              </div>
              
              <div className="model-stats">
                <div className="stat-item">
                  <span className="stat-label">Size</span>
                  <span className="stat-value">{model.size}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Downloads</span>
                  <span className="stat-value">{model.downloads}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {downloadedModels.length > 0 && (
        <motion.div
          className="library-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="section-header">
            <h3>Downloaded Models</h3>
          </div>
          
          <div className="model-grid">
            {downloadedModels.map((model, index) => (
              <motion.div
                key={model.id}
                className={`model-card ${selectedModels.find(m => m.id === model.id) ? 'selected' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => selectModelForMerge(model)}
              >
                <div className="model-header">
                  <div className="model-info">
                    <h4>{model.name}</h4>
                    <p>{model.description}</p>
                  </div>
                  <div className="model-status status-downloaded">
                    Ready
                  </div>
                </div>
                
                <div className="model-capabilities">
                  {model.capabilities?.map(cap => (
                    <span key={cap} className="capability-tag">{cap}</span>
                  ))}
                </div>
                
                <div className="model-stats">
                  <div className="stat-item">
                    <span className="stat-label">Size</span>
                    <span className="stat-value">{model.size}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Type</span>
                    <span className="stat-value">{model.type}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {mergedModels.length > 0 && (
        <motion.div
          className="library-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="section-header">
            <h3>Merged Models</h3>
          </div>
          
          <div className="model-grid">
            {mergedModels.map((model, index) => (
              <motion.div
                key={model.id}
                className="model-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="model-header">
                  <div className="model-info">
                    <h4>{model.name}</h4>
                    <p>Custom merged model</p>
                  </div>
                  <div className="model-status status-merged">
                    Merged
                  </div>
                </div>
                
                <div className="model-capabilities">
                  {model.sourceModels?.map(source => (
                    <span key={source} className="capability-tag">{source}</span>
                  ))}
                </div>
                
                <div className="model-stats">
                  <div className="stat-item">
                    <span className="stat-label">Method</span>
                    <span className="stat-value">{model.mergeMethod}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{model.score || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderMergeWizard = () => (
    <div className="merge-wizard">
      {!merging ? (
        <motion.div
          className="wizard-step"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="step-header">
            <h3>Model Merging Studio</h3>
            <p>Select 2-4 models to merge and configure the merging parameters</p>
          </div>

          <div className="model-selection">
            <div className="selection-column">
              <h4>Selected Models ({selectedModels.length}/4)</h4>
              {selectedModels.map(model => (
                <div key={model.id} className="selected-model">
                  <div className="model-info">
                    <h5>{model.name}</h5>
                    <p>{model.capabilities?.join(', ')}</p>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => selectModelForMerge(model)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            <div className="selection-column">
              <h4>Available Models</h4>
              {downloadedModels.filter(model => 
                !selectedModels.find(selected => selected.id === model.id)
              ).map(model => (
                <div
                  key={model.id}
                  className="model-card"
                  onClick={() => selectModelForMerge(model)}
                >
                  <div className="model-info">
                    <h5>{model.name}</h5>
                    <p>{model.capabilities?.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedModels.length >= 2 && (
            <motion.div
              className="merge-config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="config-section">
                <h4>Merge Configuration</h4>
                
                <div className="form-group">
                  <label>Merge Method</label>
                  <select
                    value={mergeConfig.method}
                    onChange={(e) => setMergeConfig(prev => ({ ...prev, method: e.target.value }))}
                    className="input"
                  >
                    <option value="slerp">SLERP (Spherical Linear Interpolation)</option>
                    <option value="ties">TIES (Task Arithmetic in Embedding Space)</option>
                    <option value="dare">DARE (Drop and REscale)</option>
                    <option value="linear">Linear Interpolation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Model Name</label>
                  <input
                    type="text"
                    value={mergeConfig.name}
                    onChange={(e) => setMergeConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter custom model name"
                    className="input"
                  />
                </div>

                <div className="config-section">
                  <h4>Model Weights</h4>
                  {selectedModels.map(model => (
                    <div key={model.id} className="weight-slider">
                      <label>
                        <span>{model.name}</span>
                        <span>{(mergeConfig.weights[model.id] || 0.5).toFixed(2)}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={mergeConfig.weights[model.id] || 0.5}
                        onChange={(e) => setMergeConfig(prev => ({
                          ...prev,
                          weights: {
                            ...prev.weights,
                            [model.id]: parseFloat(e.target.value)
                          }
                        }))}
                        className="slider-input"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={startMerge}
                  disabled={!mergeConfig.name || selectedModels.length < 2}
                >
                  <SafeIcon icon={FiGitMerge} />
                  Start Merge
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="merge-progress"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="progress-circle"></div>
          <div className="progress-text">
            <h3>Merging Models</h3>
            <p>Please wait while we merge your selected models...</p>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${mergeProgress}%` }}
            ></div>
          </div>
          <p>{mergeProgress}% Complete</p>
        </motion.div>
      )}
    </div>
  );

  const renderValidation = () => (
    <div className="validation-panel">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="step-header">
          <h3>Model Validation & Testing</h3>
          <p>Test your merged models across different capabilities</p>
        </div>

        <div className="test-suite">
          <div className="test-category">
            <h4>Reasoning Tests</h4>
            <p>Logical reasoning and problem-solving capabilities</p>
            <button className="btn btn-primary">
              <SafeIcon icon={FiPlay} />
              Run Tests
            </button>
          </div>
          
          <div className="test-category">
            <h4>Conversation Tests</h4>
            <p>Natural dialogue and helpfulness evaluation</p>
            <button className="btn btn-primary">
              <SafeIcon icon={FiPlay} />
              Run Tests
            </button>
          </div>
          
          <div className="test-category">
            <h4>Coding Tests</h4>
            <p>Programming and technical knowledge assessment</p>
            <button className="btn btn-primary">
              <SafeIcon icon={FiPlay} />
              Run Tests
            </button>
          </div>
          
          <div className="test-category">
            <h4>Knowledge Tests</h4>
            <p>Factual accuracy and domain expertise</p>
            <button className="btn btn-primary">
              <SafeIcon icon={FiPlay} />
              Run Tests
            </button>
          </div>
        </div>

        {validationResults && (
          <div className="test-results">
            <h3>Validation Results</h3>
            {validationResults.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <h4>{result.test_name}</h4>
                  <div className={`result-score score-${result.grade}`}>
                    {result.score}/100
                  </div>
                </div>
                <p>{result.description}</p>
                <div className="sample-output">
                  <strong>Sample Output:</strong>
                  <p>{result.sample_response}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderDeployment = () => (
    <div className="validation-panel">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="step-header">
          <h3>Deploy Your Model</h3>
          <p>Deploy to Venice.ai or use locally in your agents</p>
        </div>

        <div className="test-suite">
          <div className="test-category">
            <h4>Local Agent Integration</h4>
            <p>Use your merged model with Hammurabi agents</p>
            <button className="btn btn-primary">
              <SafeIcon icon={FiCpu} />
              Create Agent
            </button>
          </div>
          
          <div className="test-category">
            <h4>Venice.ai Deployment</h4>
            <p>Deploy to Venice.ai cloud platform</p>
            <button className="btn btn-secondary">
              <SafeIcon icon={FiCloud} />
              Deploy to Venice
            </button>
          </div>
          
          <div className="test-category">
            <h4>Browser Integration</h4>
            <p>Enhance browsing with your custom model</p>
            <button className="btn btn-success">
              <SafeIcon icon={FiZap} />
              Enable Browser AI
            </button>
          </div>
          
          <div className="test-category">
            <h4>Export Model</h4>
            <p>Export for use in other applications</p>
            <button className="btn btn-secondary">
              <SafeIcon icon={FiDownload} />
              Export Model
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'library':
        return renderModelLibrary();
      case 'merge':
        return renderMergeWizard();
      case 'validation':
        return renderValidation();
      case 'deploy':
        return renderDeployment();
      default:
        return renderModelLibrary();
    }
  };

  return (
    <div className="model-studio">
      <motion.div
        className="studio-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-left">
          <h1>
            <SafeIcon icon={FiCpu} />
            Model Studio
          </h1>
          <p>Create custom AI models by merging existing ones</p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-secondary">
            <SafeIcon icon={FiSettings} />
            Settings
          </button>
        </div>
      </motion.div>

      <div className="studio-nav">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <SafeIcon icon={tab.icon} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      <div className="studio-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModelStudio;