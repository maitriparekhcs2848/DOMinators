import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

const ToastContext = createContext({});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up bg-white dark:bg-health-card-dark
                            ${toast.type === 'success' ? 'border-green-200 text-green-700 dark:border-green-900 dark:text-green-400' : ''}
                            ${toast.type === 'error' ? 'border-red-200 text-health-danger dark:border-red-900 dark:text-red-400' : ''}
                            ${toast.type === 'info' ? 'border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-400' : ''}
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle size={18} />}
                        {toast.type === 'error' && <XCircle size={18} />}
                        {toast.type === 'info' && <AlertTriangle size={18} />}

                        <p className="text-sm font-medium">{toast.message}</p>

                        <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 ml-2">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
