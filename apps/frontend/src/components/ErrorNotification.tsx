import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorNotificationProps {
  error: string | null;
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ 
  error, 
  onDismiss, 
  autoHide = true, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (error && autoHide) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [error, autoHide, duration, onDismiss]);

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-900 border border-red-700 rounded-lg p-4 shadow-lg animate-slide-in-right">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="text-red-100 font-medium text-sm">Error</h4>
            <p className="text-red-200 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 flex-shrink-0 p-1 rounded hover:bg-red-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};