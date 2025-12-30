import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import './Toast.css';

// Create context
const ToastContext = createContext(null);

// Toast types
const TOAST_TYPES = {
    success: { icon: CheckCircle, className: 'toast-success' },
    error: { icon: AlertCircle, className: 'toast-error' },
    warning: { icon: AlertTriangle, className: 'toast-warning' },
    info: { icon: Info, className: 'toast-info' }
};

// Individual Toast component
const Toast = ({ id, type, title, message, onClose }) => {
    const { icon: Icon, className } = TOAST_TYPES[type] || TOAST_TYPES.info;

    return (
        <div className={`toast ${className}`}>
            <div className="toast-icon">
                <Icon size={20} />
            </div>
            <div className="toast-content">
                {title && <p className="toast-title">{title}</p>}
                <p className="toast-message">{message}</p>
            </div>
            <button className="toast-close" onClick={() => onClose(id)}>
                <X size={16} />
            </button>
        </div>
    );
};

// Confirm Dialog component
const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirmText, cancelText, type }) => {
    return (
        <div className="confirm-overlay">
            <div className="confirm-dialog">
                <div className={`confirm-header ${type || 'default'}`}>
                    {type === 'danger' && <AlertTriangle size={24} />}
                    {type === 'warning' && <AlertCircle size={24} />}
                    <h3>{title || 'Confirm Action'}</h3>
                </div>
                <div className="confirm-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-actions">
                    <button className="btn-cancel" onClick={onCancel}>
                        {cancelText || 'Cancel'}
                    </button>
                    <button className={`btn-confirm ${type || 'default'}`} onClick={onConfirm}>
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Toast Provider component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);

    const addToast = useCallback((type, message, title = '', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, type, title, message }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, title = '') => addToast('success', message, title), [addToast]);
    const error = useCallback((message, title = '') => addToast('error', message, title, 6000), [addToast]);
    const warning = useCallback((message, title = '') => addToast('warning', message, title), [addToast]);
    const info = useCallback((message, title = '') => addToast('info', message, title), [addToast]);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfirmState({
                ...options,
                onConfirm: () => {
                    setConfirmState(null);
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmState(null);
                    resolve(false);
                }
            });
        });
    }, []);

    const value = {
        success,
        error,
        warning,
        info,
        confirm,
        addToast,
        removeToast
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>

            {/* Confirm Dialog */}
            {confirmState && (
                <ConfirmDialog {...confirmState} />
            )}
        </ToastContext.Provider>
    );
};

// Custom hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastProvider;
