'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextType {
  addToast: (title: string, message: string, variant?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message: string, variant: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    // Prevent duplicate toasts that are currently active
    setToasts((prev) => {
      const isDuplicate = prev.some((t) => t.title === title && t.message === message);
      if (isDuplicate) return prev;

      const id = Math.random().toString(36).substring(2, 9);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 5000);

      return [...prev, { id, title, message, variant }];
    });
  }, [removeToast]);

  const getIconForVariant = (variant: 'success' | 'error' | 'warning' | 'info') => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: 'var(--danger)' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />;
      case 'info':
      default:
        return <Info size={18} style={{ color: 'var(--primary)' }} />;
    }
  };

  const getBorderColorForVariant = (variant: 'success' | 'error' | 'warning' | 'info') => {
    switch (variant) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--danger)';
      case 'warning':
        return 'var(--warning)';
      case 'info':
      default:
        return 'var(--primary)';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Style block for animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%) scale(0.9); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 380px;
          width: calc(100% - 48px);
        }
        .toast-card {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.03);
          transition: all 0.2s ease;
          position: relative;
        }
        [data-theme='dark'] .toast-card {
          background: rgba(17, 24, 39, 0.85);
        }
        .toast-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px -10px rgba(0, 0, 0, 0.12);
        }
      `}</style>

      {/* Render active toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-card"
            style={{
              borderLeft: `4px solid ${getBorderColorForVariant(toast.variant)}`,
            }}
          >
            <div style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: toast.variant === 'success' ? 'var(--success-light)' :
                               toast.variant === 'error' ? 'var(--danger-light)' :
                               toast.variant === 'warning' ? 'var(--warning-light)' : 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '2px'
            }}>
              {getIconForVariant(toast.variant)}
            </div>
            <div style={{ flex: 1, paddingRight: '20px' }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                display: 'block',
                color: 'var(--text-primary)',
                lineHeight: '1.3'
              }}>
                {toast.title}
              </span>
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                lineHeight: '1.4'
              }}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                border: 'none',
                background: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              className="scale-hover"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
