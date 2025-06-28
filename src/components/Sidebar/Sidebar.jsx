import React from 'react';
import {Link,useLocation} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './Sidebar.css';

const {FiHome,FiGlobe,FiUsers,FiFolderOpen,FiSettings,FiMenu,FiActivity,FiPlay}=FiIcons;

const Sidebar=({collapsed,onToggleCollapse,systemStatus,onGetStartedClick})=> {
  const location=useLocation();

  const menuItems=[ 
    {path: '/',icon: FiHome,label: 'Dashboard',id: 'dashboard'},
    {path: '/browser',icon: FiGlobe,label: 'Browser',id: 'browser'},
    {path: '/agents',icon: FiUsers,label: 'AI Agents',id: 'agents'},
    {path: '/files',icon: FiFolderOpen,label: 'Files',id: 'files'},
    {path: '/settings',icon: FiSettings,label: 'Settings',id: 'settings'} 
  ];

  const getStatusColor=(status)=> {
    switch (status) {
      case 'ready': return '#10b981';
      case 'connected': return '#10b981';
      case 'error': return '#ef4444';
      case 'loading': return '#f59e0b';
      case 'connecting': return '#3b82f6';
      case 'initializing': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return ( 
    <motion.aside 
      className={`sidebar ${collapsed ? 'collapsed' : ''}`} 
      initial={{x: -280}} 
      animate={{x: 0}} 
      transition={{type: 'spring',damping: 20}} 
    > 
      <div className="sidebar-header"> 
        <motion.button 
          className="sidebar-toggle" 
          onClick={onToggleCollapse} 
          whileHover={{scale: 1.1}} 
          whileTap={{scale: 0.9}} 
        > 
          <SafeIcon icon={FiMenu} /> 
        </motion.button> 
        {!collapsed && ( 
          <motion.div 
            className="sidebar-title" 
            initial={{opacity: 0}} 
            animate={{opacity: 1}} 
            transition={{delay: 0.2}} 
          > 
            <h1>🏛️ Hammurabi</h1> 
            <p>Unified AI Desktop</p> 
          </motion.div> 
        )} 
      </div> 

      <nav className="sidebar-nav"> 
        {menuItems.map((item,index)=> ( 
          <motion.div 
            key={item.id} 
            initial={{opacity: 0,x: -20}} 
            animate={{opacity: 1,x: 0}} 
            transition={{delay: index * 0.1}} 
          > 
            <Link 
              to={item.path} 
              className={`sidebar-item ${location.pathname===item.path ? 'active' : ''}`} 
              title={collapsed ? item.label : ''} 
            > 
              <SafeIcon icon={item.icon} className="sidebar-icon" /> 
              {!collapsed && <span className="sidebar-label">{item.label}</span>} 
            </Link> 
          </motion.div> 
        ))} 

        {/* Get Started Button */}
        {!collapsed && (
          <motion.div
            initial={{opacity: 0,x: -20}}
            animate={{opacity: 1,x: 0}}
            transition={{delay: menuItems.length * 0.1}}
          >
            <button
              className="sidebar-item sidebar-getstarted"
              onClick={onGetStartedClick}
              title="Get Started Guide"
            >
              <SafeIcon icon={FiPlay} className="sidebar-icon" />
              <span className="sidebar-label">Get Started</span>
            </button>
          </motion.div>
        )}
      </nav> 

      {!collapsed && ( 
        <motion.div 
          className="sidebar-status" 
          initial={{opacity: 0,y: 20}} 
          animate={{opacity: 1,y: 0}} 
          transition={{delay: 0.5}} 
        > 
          <h3> 
            <SafeIcon icon={FiActivity} /> 
            System Status 
          </h3> 
          <div className="status-grid"> 
            {Object.entries(systemStatus).map(([service,status])=> ( 
              <div key={service} className="status-item"> 
                <div 
                  className="status-dot" 
                  style={{backgroundColor: getStatusColor(status)}} 
                /> 
                <div className="status-info"> 
                  <span className="status-service"> 
                    {service.replace(/([A-Z])/g,' $1').replace(/^./,str=> str.toUpperCase())} 
                  </span> 
                  <span className="status-value">{status}</span> 
                </div> 
              </div> 
            ))} 
          </div> 
        </motion.div> 
      )} 
    </motion.aside> 
  );
};

export default Sidebar;