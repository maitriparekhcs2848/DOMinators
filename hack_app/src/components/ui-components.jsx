import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

// --- Card ---
export const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-health-card-light dark:bg-health-card-dark rounded-2xl shadow-sm border border-health-border-light dark:border-health-border-dark p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// --- Button ---
export const Button = forwardRef(({ variant = 'primary', size = 'md', isLoading, disabled, children, className = '', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";

    const variants = {
        primary: "bg-health-primary-light hover:bg-health-primary-hover text-health-text-primary-light shadow-lg shadow-health-primary-light/20 focus:ring-health-primary-light dark:bg-health-primary-light dark:text-health-text-primary-light",
        secondary: "bg-white text-health-text-secondary-light border border-health-border-light hover:bg-health-section-light dark:bg-transparent dark:border-health-border-dark dark:text-health-text-secondary-dark dark:hover:bg-health-card-dark",
        danger: "bg-health-danger text-health-dangerText hover:bg-red-200 focus:ring-red-300 border border-red-200",
        ghost: "bg-transparent hover:bg-health-bg-light text-health-text-primary-light dark:text-health-text-primary-dark dark:hover:bg-white/5"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
});

// --- Input ---
export const Input = forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-health-text-secondary-light dark:text-health-text-secondary-dark">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`input-base ${error ? 'border-health-danger focus:ring-health-danger/50' : ''} ${className}`}
                {...props}
            />
            {helperText && !error && (
                <p className="text-xs text-health-text-secondary-light dark:text-health-text-secondary-dark">{helperText}</p>
            )}
            {error && (
                <p className="text-xs text-health-danger">{error}</p>
            )}
        </div>
    );
});

// --- Badge ---
export const Badge = ({ variant = 'default', children, className = '' }) => {
    const variants = {
        default: "bg-health-bg-light text-health-text-primary-light dark:bg-health-bg-dark dark:text-health-text-primary-dark border border-health-border-light dark:border-health-border-dark",
        success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
        neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// --- Spinner ---
export const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };
    return (
        <Loader2 className={`animate-spin text-health-primary-light dark:text-health-primary-dark ${sizes[size]} ${className}`} />
    );
};
