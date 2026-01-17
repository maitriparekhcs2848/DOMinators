import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';
import { Card, Badge, Spinner } from '../components/ui-components';

export default function AccessLogs() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        if (user) {
            fetchLogs(mounted);
        }

        return () => { mounted = false; };
    }, [user]);

    const fetchLogs = async (mounted = true) => {
        try {
            // Fetch logs and join with applications table to get names
            const { data, error } = await supabase
                .from('access_logs')
                .select(`
                    *,
                    applications (
                        name
                    )
                `)
                .eq('user_id', user.id)
                .order('timestamp', { ascending: false });

            if (error) throw error;
            if (mounted) setLogs(data || []);
        } catch (error) {
            console.error('Error fetching logs: Request failed');
        } finally {
            if (mounted) setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8 border-b border-health-border-light dark:border-health-border-dark pb-4">
                <h1 className="text-2xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark flex items-center gap-2">
                    <Activity className="text-orange-500" />
                    Access Transparency Logs
                </h1>
                <p className="text-health-text-secondary-light dark:text-health-text-secondary-dark mt-2">Immutable record of every attempt to access your data.</p>
            </div>

            <Card className="overflow-hidden p-0 border border-health-border-light dark:border-health-border-dark">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-health-bg-light dark:bg-black/20 border-b border-health-border-light dark:border-health-border-dark">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-health-text-secondary-light dark:text-health-text-secondary-dark">Timestamp</th>
                                <th className="px-6 py-4 font-semibold text-health-text-secondary-light dark:text-health-text-secondary-dark">Application</th>
                                <th className="px-6 py-4 font-semibold text-health-text-secondary-light dark:text-health-text-secondary-dark">Purpose</th>
                                <th className="px-6 py-4 font-semibold text-health-text-secondary-light dark:text-health-text-secondary-dark">Fields Accessed</th>
                                <th className="px-6 py-4 font-semibold text-health-text-secondary-light dark:text-health-text-secondary-dark">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-health-border-light dark:divide-health-border-dark text-health-text-primary-light dark:text-health-text-primary-dark">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-health-text-secondary-light dark:text-health-text-secondary-dark">
                                        No access logs found.
                                    </td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-health-bg-light/50 dark:hover:bg-white/5 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-health-text-secondary-light dark:text-health-text-secondary-dark">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {log.applications?.name || 'Unknown App'}
                                    </td>
                                    <td className="px-6 py-4 text-health-text-secondary-light dark:text-health-text-secondary-dark">
                                        {log.purpose}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1 flex-wrap">
                                            {log.fields_accessed?.map(f => (
                                                <span key={f} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs border border-blue-100 dark:border-blue-800">
                                                    {f}
                                                </span>
                                            ))}
                                            {(!log.fields_accessed || log.fields_accessed.length === 0) && (
                                                <span className="text-health-text-secondary-light dark:text-health-text-secondary-dark italic">None</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={log.status === 'success' ? 'success' : 'danger'}>
                                            {log.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
