import React, { useEffect, useState } from 'react';
import { GetStarted } from '@questlabs/react-sdk';
import { questConfig } from '../../config/questConfig';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './GetStarted.css';

const { FiX, FiPlay } = FiIcons;

const GetStartedComponent = ({ isOpen, onClose }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get or create user ID
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = questConfig.USER_ID;
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  if (!isOpen || !userId) return null;

  return (
    <motion.div
      className="getstarted-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="getstarted-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="getstarted-header">
          <div className="getstarted-title">
            <SafeIcon icon={FiPlay} />
            <h2>Get Started with Hammurabi</h2>
          </div>
          <button className="getstarted-close" onClick={onClose}>
            <SafeIcon icon={FiX} />
          </button>
        </div>

        <div className="getstarted-content">
          <GetStarted
            questId={questConfig.GET_STARTED_QUESTID}
            uniqueUserId={userId}
            accent={questConfig.PRIMARY_COLOR}
            autoHide={false}
          >
            <GetStarted.Header />
            <GetStarted.Progress />
            <GetStarted.Content />
            <GetStarted.Footer />
          </GetStarted>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GetStartedComponent;