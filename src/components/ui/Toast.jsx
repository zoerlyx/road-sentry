import { useEffect } from 'react';

import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';



export const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {

  useEffect(() => {

    const timer = setTimeout(onClose, duration);

    return () => clearTimeout(timer);

  }, [duration, onClose]);



  const icons = {

    success: FaCheckCircle,

    error: FaExclamationCircle,

    info: FaInfoCircle

  };



  const colors = {

    success: '#10B981',

    error: '#EF4444',

    info: '#2563EB'

  };



  const IconComponent = icons[type];



  return (

    <div className="toast show">

      <IconComponent style={{ color: colors[type] }} />

      <span>{message}</span>

    </div>

  );

};
