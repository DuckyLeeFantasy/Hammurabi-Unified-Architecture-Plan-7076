import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar/Sidebar'
import Browser from './components/Browser/Browser'
import Agents from './components/Agents/Agents'
import Files from './components/Files/Files'
import Settings from './components/Settings/Settings'
import Dashboard from './components/Dashboard/Dashboard'
import { mockElectronAPI } from './services/mock-electron-api'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    mcpServer: 'connecting' as const,
    agents: 'initializing' as const,
    fileSystem: 'ready' as const,
    browser: 'initializing' as const
  })

  useEffect(() => {
    // Initialize mock API for web environment
    if (typeof window !== 'undefined' && !window.electronAPI) {
      window.electronAPI = mockElectronAPI
    }

    // Initialize system status
    const initializeApp = async () => {
      try {
        // Check MCP server status
        const tools = await window.electronAPI.mcp.listTools()
        setSystemStatus(prev => ({ ...prev, mcpServer: 'connected' }))

        // Check agents status
        const agents = await window.electronAPI.agent.list()
        setSystemStatus(prev => ({ ...prev, agents: 'ready' }))

        // Browser is ready (simulated)
        setSystemStatus(prev => ({ ...prev, browser: 'ready' }))
      } catch (error) {
        console.error('App initialization error:', error)
        setSystemStatus(prev => ({
          ...prev,
          mcpServer: 'error',
          agents: 'error'
        }))
      }
    }

    initializeApp()
  }, [])

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  }

  return (
    <Router>
      <div className="app">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          systemStatus={systemStatus}
        />
        
        <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  <motion.div
                    key="dashboard"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Dashboard systemStatus={systemStatus} />
                  </motion.div>
                }
              />
              <Route
                path="/browser"
                element={
                  <motion.div
                    key="browser"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Browser />
                  </motion.div>
                }
              />
              <Route
                path="/agents"
                element={
                  <motion.div
                    key="agents"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Agents />
                  </motion.div>
                }
              />
              <Route
                path="/files"
                element={
                  <motion.div
                    key="files"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Files />
                  </motion.div>
                }
              />
              <Route
                path="/settings"
                element={
                  <motion.div
                    key="settings"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Settings />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  )
}

export default App