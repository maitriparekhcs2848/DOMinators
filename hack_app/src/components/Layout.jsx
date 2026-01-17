import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, FileText, Activity, LogOut, LayoutDashboard } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }) {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-health-bg-light dark:bg-health-bg-dark flex flex-col md:flex-row transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-white/80 dark:bg-health-card-dark/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-health-border-light dark:border-health-border-dark flex-shrink-0 flex flex-col z-20 sticky top-0 md:h-screen">
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-health-primary-light/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-health-primary-light dark:text-health-primary-dark" />
                        </div>
                        <span className="font-bold text-xl text-health-text-primary-light dark:text-health-text-primary-dark">PrivID</span>
                    </div>
                    {/* Theme Toggle Mobile */}
                    <div className="md:hidden">
                        <ThemeToggle />
                    </div>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto flex-1">
                    <div className="text-xs font-semibold text-health-text-secondary-light dark:text-health-text-secondary-dark uppercase tracking-wider px-4 mb-2">Menu</div>
                    <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === '/dashboard'} />
                    <NavLink to="/profile" icon={<User size={20} />} label="My Identity" active={location.pathname === '/profile'} />
                    <NavLink to="/consent" icon={<FileText size={20} />} label="Consents" active={location.pathname === '/consent'} />
                    <NavLink to="/access-logs" icon={<Activity size={20} />} label="Access Logs" active={location.pathname === '/access-logs'} />

                    <div className="mt-8 pt-6 border-t border-health-border-light dark:border-health-border-dark">
                        <div className="text-xs font-semibold text-health-text-secondary-light dark:text-health-text-secondary-dark uppercase tracking-wider px-4 mb-2">Apps</div>
                        <NavLink to="/health-app" icon={<Shield className="text-green-500" size={20} />} label="Hospital Portal (Demo)" active={location.pathname === '/health-app'} />
                    </div>
                </nav>

                <div className="p-4 border-t border-health-border-light dark:border-health-border-dark space-y-4">
                    <div className="hidden md:flex justify-between items-center px-4">
                        <span className="text-sm text-health-text-secondary-light dark:text-health-text-secondary-dark font-medium">Appearance</span>
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-health-text-secondary-light dark:text-health-text-secondary-dark hover:bg-health-danger/10 hover:text-health-danger rounded-xl transition-colors group"
                    >
                        <LogOut size={20} className="group-hover:text-health-danger" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-[calc(100vh-theme(spacing.20))] md:h-screen p-4 md:p-8 relative">
                {/* Gradient/Blob Background Effect */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-health-primary-light/5 to-transparent pointer-events-none -z-10" />
                {children || <Outlet />}
            </main>
        </div>
    );
}

function NavLink({ to, icon, label, active }) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${active
                    ? 'bg-health-primary-light/10 text-health-primary-light dark:bg-health-primary-dark/10 dark:text-health-primary-dark'
                    : 'text-health-text-secondary-light dark:text-health-text-secondary-dark hover:bg-health-bg-light dark:hover:bg-health-card-dark/50 hover:text-health-text-primary-light dark:hover:text-health-text-primary-dark'
                }`}
        >
            <span className={active ? 'opacity-100' : 'opacity-70'}>{icon}</span>
            <span>{label}</span>
        </Link>
    );
}
