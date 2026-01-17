import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Search, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { Card, Button, Input, Spinner } from '../components/ui-components';

export default function HealthApp() {
    const [selectedApp, setSelectedApp] = useState('');
    const [apps, setApps] = useState([]);
    const [patientId, setPatientId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        const { data } = await supabase.from('applications').select('*');
        if (data) {
            setApps(data);
            if (data.length > 0) setSelectedApp(data[0].id);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        // Input Validation: Ensure it looks like a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(patientId)) {
            setError('Invalid Patient ID format. Please use a valid UUID.');
            return;
        }

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            // Call the secure RPC function
            const { data, error } = await supabase.rpc('request_patient_data', {
                p_patient_id: patientId,
                p_app_id: selectedApp
            });

            if (error) throw error; // RPC call error (e.g. network)

            // RPC returns data, but inside it might contain an "error" key (business logic error)
            // or valid fields.
            if (data.error) {
                setError(data.error);
            } else {
                setResult(data);
            }

        } catch (err) {
            console.error('Verification error: Request failed');
            setError('System Error: Failed to connect to verification ledger.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-20">
            <div className="mb-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6 ring-8 ring-green-50 dark:ring-green-900/10">
                    <Shield size={40} />
                </div>
                <h1 className="text-4xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark mb-4">Hospital Verification Portal</h1>
                <p className="text-lg text-health-text-secondary-light dark:text-health-text-secondary-dark max-w-2xl mx-auto">
                    This system demonstrates how 3rd party providers access patient data.
                    Access is cryptographically enforced by the patient's consent settings.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                    <h2 className="text-xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark mb-6 flex items-center gap-2">
                        <Search className="text-health-text-secondary-light dark:text-health-text-secondary-dark" />
                        Request Patient Data
                    </h2>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-health-text-secondary-light dark:text-health-text-secondary-dark mb-2">Simulate Application</label>
                            <select
                                value={selectedApp}
                                onChange={(e) => setSelectedApp(e.target.value)}
                                className="input-base"
                            >
                                {apps.map(app => (
                                    <option key={app.id} value={app.id}>{app.name}</option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Patient ID"
                            type="text"
                            required
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            placeholder="Paste your Patient ID here..."
                            helperText="(Get this from your Profile page)"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={loading}
                            disabled={!selectedApp}
                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 dark:bg-green-600 dark:hover:bg-green-500"
                        >
                            Request Data
                        </Button>
                    </form>
                </Card>

                <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 text-slate-300 min-h-[400px] flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Database className="text-blue-400" />
                        Data Response
                    </h2>

                    <div className="flex-1 bg-black/50 rounded-xl p-6 font-mono text-sm overflow-auto border border-white/5 relative">
                        {!result && !error && !loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pb-8">
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 mb-4 animate-[spin_10s_linear_infinite]"></div>
                                Waiting for request...
                            </div>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center h-full text-blue-400">
                                <span className="animate-pulse">Checking Consent Ledger...</span>
                            </div>
                        )}

                        {error && (
                            <div className="flex flex-col items-center justify-center h-full text-red-500 animate-fade-in">
                                <AlertCircle size={48} className="mb-4" />
                                <span className="text-lg font-bold">Access Denied</span>
                                <span className="text-center mt-2 opacity-80">{error}</span>
                            </div>
                        )}

                        {result && (
                            <div className="animate-fade-in relative z-10">
                                <div className="flex items-center gap-2 text-green-400 mb-4 font-bold">
                                    <CheckCircle size={20} />
                                    <span>Access Granted</span>
                                </div>
                                <pre className="text-slate-300 whitespace-pre-wrap">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 text-xs text-slate-500 flex justify-between">
                        <span>Protocol: SecureRPC v2.0 (Real)</span>
                        <span>Encryption: AES-256</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
