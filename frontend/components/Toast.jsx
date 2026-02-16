'use client';

import { useEffect } from 'react';

export default function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeClass = {
    error: 'toast-error',
    success: 'toast-success',
    warning: 'toast-warning',
    info: 'toast-info',
  };

  const icons = {
    error: '!',
    success: '\u2713',
    warning: '!',
    info: 'i',
  };

  return (
    <div className="toast-wrapper">
      <div className={`toast ${typeClass[type]}`}>
        <span className="toast-icon">{icons[type]}</span>
        <p className="toast-message">{message}</p>
        <button onClick={onClose} className="toast-close">
          &times;
        </button>
      </div>
    </div>
  );
}
