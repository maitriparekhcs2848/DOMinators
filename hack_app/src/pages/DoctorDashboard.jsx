import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, Button, Input, Badge, Spinner } from '../components/ui-components';
import { Search, Shield, User, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [patientData, setPatientData] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPatientData(null);

        try {
            const { data, error } = await supabase.rpc('request_patient_data', {
                target_patient_id: patientId
            });

            if (error) throw error;
            setPatientData(data);
        } catch (err) {
            setError(err.message || "Access Denied. Ensure you have active consent.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-health-primary-light/10 text-health-primary-light dark:text-health-primary-dark">
                            <User size={32} />
                        </div>
                        Medical Portal
                    </h1>
                    <p className="text-health-text-secondary-light dark:text-health-text-secondary-dark mt-2">
                        Dr. {user?.email} • <span className="font-mono text-xs opacity-70">{user?.id.slice(0, 8)}</span>
                    </p>
                </div>
                <Badge variant="neutral" className="px-3 py-1">
                    <Shield size={14} className="mr-1" /> Authorized Medical Practitioner
                </Badge>
            </div>

            {/* Verification Status */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-health-primary-light/20 bg-health-section-light/50 dark:bg-health-section-dark/50">
                    <h3 className="text-lg font-bold text-health-text-primary-light dark:text-health-text-primary-dark mb-2 flex items-center gap-2">
                        <Shield size={20} className="text-health-primary-light" />
                        Consent-Based Access
                    </h3>
                    <p className="text-sm text-health-text-secondary-light dark:text-health-text-secondary-dark">
                        You can only access patient records if the patient has explicitly granted 'Active' consent to your ID. All access events are logged immutably.
                    </p>
                </Card>

                <Card className="flex items-center justify-center flex-col text-center">
                    <div className="text-4xl font-bold text-health-primary-light dark:text-health-primary-dark mb-1">
                        SECURE
                    </div>
                    <div className="text-xs font-bold text-health-text-secondary-light uppercase tracking-wider">
                        Connection
                    </div>
                </Card>
            </div>

            {/* Search Interface */}
            <Card className="p-8">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <Input
                            label="Patient UHID (Unique Health ID)"
                            placeholder="e.g. 550e8400-e29b..."
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            required
                            icon={<Search size={18} />}
                        />
                    </div>
                    <Button type="submit" isLoading={loading} disabled={!patientId} className="w-full md:w-auto h-[46px]">
                        Verify & Access Records
                    </Button>
                </form>

                {error && (
                    <div className="mt-6 p-4 rounded-xl bg-health-danger/10 border border-health-danger/20 text-health-danger flex items-start gap-3 animate-fade-in">
                        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Access Denied</p>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                    </div>
                )}
            </Card>

            {/* Results Section */}
            {patientData && (
                <div className="animate-slide-up">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark">Patient Records</h2>
                        <Badge variant="success">
                            <CheckCircle size={12} className="mr-1" /> Consent Verified
                        </Badge>
                    </div>

                    <Card className="overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-health-text-secondary-light uppercase tracking-wider">Full Name</label>
                                    <p className="text-lg font-medium text-health-text-primary-light dark:text-health-text-primary-dark">
                                        {patientData.full_name || 'REDACTED'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-health-text-secondary-light uppercase tracking-wider">Date of Birth</label>
                                    <p className="text-lg font-medium text-health-text-primary-light dark:text-health-text-primary-dark">
                                        {patientData.dob || 'REDACTED'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-health-text-secondary-light uppercase tracking-wider">Address</label>
                                    <p className="text-lg font-medium text-health-text-primary-light dark:text-health-text-primary-dark">
                                        {patientData.address || 'REDACTED'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-health-section-light dark:bg-health-section-dark border border-dashed border-health-border-light dark:border-health-border-dark">
                                    <div className="flex items-center gap-2 text-sm text-health-text-secondary-light">
                                        <FileText size={16} />
                                        <span>Clinical Notes (Restricted)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
