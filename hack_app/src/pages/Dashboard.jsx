import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, Activity, FileText, Clock, AlertTriangle, CheckCircle, User, Plus } from 'lucide-react';
import { Card, Button, Badge, Spinner } from '../components/ui-components';
import DoctorDashboard from './DoctorDashboard';

export default function Dashboard() {
    const { user } = useAuth();

    // Redirect Doctors to Doctor Dashboard
    if (user?.role === 'doctor') {
        return <DoctorDashboard />;
    }

    // Patient Dashboard Stats
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                if (mounted && data) setProfile(data);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchProfile();

        return () => { mounted = false; };
    }, [user]);

    const firstName = profile?.full_name?.split(' ')[0] || 'User';

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark">Welcome back, {firstName}</h1>
                    <p className="text-health-text-secondary-light dark:text-health-text-secondary-dark mt-2">Manage your digital identity and privacy settings.</p>
                </div>
                <Badge variant="success" className="px-4 py-2 text-sm flex gap-2 items-center w-fit">
                    <Shield size={16} />
                    <span>Protected Mode Active</span>
                </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <DashboardCard
                    to="/profile"
                    icon={<User className="text-health-primary-light dark:text-health-primary-dark" />}
                    title="My Identity"
                    desc="Manage your personal information and Patient ID."
                    className="border-health-primary-light/30 dark:border-health-primary-dark/30 hover:shadow-health-primary-light/10"
                />
                <DashboardCard
                    to="/consent"
                    icon={<FileText className="text-purple-500" />}
                    title="Consent Manager"
                    desc="Control which applications can access your data."
                    className="border-purple-200 dark:border-purple-800 hover:shadow-purple-500/10"
                />
                <DashboardCard
                    to="/access-logs"
                    icon={<Activity className="text-orange-500" />}
                    title="Access Logs"
                    desc="View transparent history of who accessed your data."
                    className="border-orange-200 dark:border-orange-800 hover:shadow-orange-500/10"
                />
            </div>

            {/* Quick Status Section - Trust Signals */}
            <Card className="flex flex-col md:flex-row items-center gap-6 border-health-primary-light/20 bg-health-section-light/50 dark:bg-health-section-dark/50">
                <div className="p-4 rounded-full bg-health-primary-light/10 text-health-primary-light dark:text-health-primary-dark">
                    <Shield size={32} />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark mb-2">Privacy Shield Active</h2>
                    <p className="text-health-text-secondary-light dark:text-health-text-secondary-dark">
                        Your health data is encrypted at rest. Row Level Security (RLS) policies are enforcing strict access control.
                    </p>
                </div>
                <div className="flex gap-4 text-xs font-bold text-health-text-secondary-light dark:text-health-text-secondary-dark opacity-75">
                    <div className="flex items-center gap-1"><Shield size={14} /> End-to-End Encrypted</div>
                    <div className="flex items-center gap-1"><User size={14} /> User-Controlled</div>
                </div>
            </Card>
        </div>
    );
}

function DashboardCard({ to, icon, title, desc, className }) {
    return (
        <Link to={to} className="block group">
            <Card className={`h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}>
                <div className="mb-4 w-12 h-12 rounded-xl bg-health-bg-light dark:bg-black/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-health-text-primary-light dark:text-health-text-primary-dark mb-2 group-hover:text-health-primary-light dark:group-hover:text-health-primary-dark transition-colors">{title}</h3>
                <p className="text-health-text-secondary-light dark:text-health-text-secondary-dark text-sm">{desc}</p>
            </Card>
        </Link>
    );
}
