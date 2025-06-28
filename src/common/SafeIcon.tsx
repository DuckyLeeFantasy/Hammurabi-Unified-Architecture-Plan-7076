import React from 'react';
import * as FiIcons from 'react-icons/fi';
import { FiAlertTriangle } from 'react-icons/fi';

interface SafeIconProps {
  icon?: React.ComponentType<any>;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const SafeIcon: React.FC<SafeIconProps> = ({ icon, name, ...props }) => {
  let IconComponent: React.ComponentType<any> | null = null;

  try {
    IconComponent = icon || (name && (FiIcons as any)[`Fi${name}`]);
  } catch (e) {
    IconComponent = null;
  }

  return IconComponent ? (
    <IconComponent {...props} />
  ) : (
    <FiAlertTriangle {...props} />
  );
};

export default SafeIcon;