import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors duration-200 
                bg-health-primary-light/10 text-health-primary-light hover:bg-health-primary-light/20
                dark:bg-health-primary-dark/20 dark:text-health-primary-dark dark:hover:bg-health-primary-dark/30"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
}
