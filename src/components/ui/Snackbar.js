'use client';
import { useEffect } from 'react';

const Snackbar = ({ open, message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 transform transition-all duration-300 pointer-events-none ${
        open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      aria-live="assertive"
      role="status"
    >
      <div className="bg-gray-900 text-white px-4 py-2 rounded shadow-lg">
        {message}
      </div>
    </div>
  );
};

export default Snackbar;
