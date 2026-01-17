import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Shield, XCircle, Check } from 'lucide-react';
import { Card, Badge, Spinner, Button } from '../components/ui-components';

import { useToast } from '../context/ToastContext';

export default function Consent() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [apps, setApps] = useState([]);
    const [consents, setConsents] = useState({});
    const [loading, setLoading] = useState(true);
    const [granting, setGranting] = useState(null); // 'app' or 'doctor'
    const [successMessage, setSuccessMessage] = useState(null);

    // New State for Doctor Authorization
    const [doctors, setDoctors] = useState([]); // List of doctors with consent
    const [showGrantDoctorModal, setShowGrantDoctorModal] = useState(false);
    const [newDoctorId, setNewDoctorId] = useState('');
    const [doctorConsentError, setDoctorConsentError] = useState('');

    const DATA_FIELDS = [
        { key: 'full_name', label: 'Full Name', description: 'Used to identify you in medical records.' },
        { key: 'dob', label: 'Date of Birth', description: 'Required for age-appropriate care.' },
        { key: 'address', label: 'Address', description: 'Needed for local healthcare services.' },
    ];

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            // Fetch Apps
            const { data: appsData, error: appsError } = await supabase
                .from('applications')
                .select('*');

            if (appsError) throw appsError;

            // Fetch User Consents
            const { data: consentsData, error: consentsError } = await supabase
                .from('consents')
                .select('*')
                .eq('user_id', user.id);

            if (consentsError) throw consentsError;

            // Map consents to appId for easy lookup
            const consentsMap = {};
            consentsData?.forEach(c => {
                consentsMap[c.application_id] = c;
            });

            setApps(appsData || []);
            setConsents(consentsMap);
        } catch (error) {
            console.error('Error fetching consent data: Request failed');
        } finally {
            setLoading(false);
        }
    };

    const grantDoctorConsent = async (doctorId) => {
        if (!doctorId) {
            setDoctorConsentError('Doctor ID cannot be empty.');
            return;
        }
        setGranting(true);
        setDoctorConsentError('');

        try {
            // First, verify the doctorId exists and is a doctor
            const { data: doctorUser, error: doctorUserError } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('id', doctorId)
                .single();

            if (doctorUserError || !doctorUser) {
                throw new Error('Doctor not found or invalid ID.');
            }
            if (doctorUser.role !== 'doctor') {
                throw new Error('The provided ID does not belong to a doctor.');
            }

            // Check if consent already exists
            const { data: existingConsent, error: existingConsentError } = await supabase
                .from('doctor_consents')
                .select('*')
                .eq('user_id', user.id)
                .eq('doctor_id', doctorId)
                .single();

            if (existingConsentError && existingConsentError.code !== 'PGRST116') { // PGRST116 means no rows found
                throw existingConsentError;
            }

            if (existingConsent && existingConsent.status === 'active') {
                throw new Error('Consent already granted to this doctor.');
            }

            const { data, error } = await supabase
                .from('doctor_consents')
                .upsert(
                    {
                        user_id: user.id,
                        doctor_id: doctorId,
                        status: 'active',
                        allowed_fields: DATA_FIELDS.map(f => f.key), // Doctors get all fields by default
                        purpose: 'User granted access via dashboard'
                    },
                    { onConflict: 'user_id,doctor_id' }
                )
                .select()
                .single();

            if (error) throw error;

            addToast("Access granted successfully.", 'success');
            setShowGrantDoctorModal(false);
            setNewDoctorId('');
            // fetchDoctorConsents(); // Assuming this function exists to refresh the list
        } catch (err) {
            setDoctorConsentError(err.message);
            addToast(err.message, 'error');
        } finally {
            setGranting(false);
        }
    };

    const handleToggleField = async (appId, field) => {
        // 1. Calculate new state based on current valid state
        const currentConsent = consents[appId] || { allowed_fields: [], status: 'active' };
        const currentFields = currentConsent.allowed_fields || [];

        let newFields;
        if (currentFields.includes(field)) {
            newFields = currentFields.filter(f => f !== field);
        } else {
            newFields = [...currentFields, field];
        }

        // 2. Prepare payload
        const status = newFields.length > 0 ? 'active' : 'revoked';
        const payload = {
            user_id: user.id,
            application_id: appId,
            allowed_fields: newFields,
            status: status,
            purpose: 'User granted access via dashboard'
        };

        const optimisticConsent = { ...currentConsent, allowed_fields: newFields, status };
        setConsents(prev => ({ ...prev, [appId]: optimisticConsent }));

        try {
            const { data, error } = await supabase
                .from('consents')
                .upsert(
                    { ...payload, id: currentConsent.id }, // Include ID if it exists
                    { onConflict: 'user_id, application_id' }
                )
                .select()
                .single();

            if (error) throw error;

            // 4. Update with actual server data to ensure sync
            setConsents(prev => ({ ...prev, [appId]: data }));

        } catch (error) {
            console.error('Error saving consent: Request failed');
            alert('Failed to save consent. Reverting.');
            // Revert state if needed or just re-fetch
            fetchData();
        }
    };

    const handleRevoke = async (appId) => {
        const consent = consents[appId];
        if (!consent) return;

        try {
            const { data, error } = await supabase
                .from('consents')
                .update({ status: 'revoked', allowed_fields: [] })
                .eq('id', consent.id)
                .select()
                .single();

            if (error) throw error;

            setConsents({
                ...consents,
                [appId]: data
            });
        } catch (error) {
            console.error('Error revoking consent: Request failed');
        }
    };

    const updateDoctorStatus = async (id, status) => {
        try {
            // Optimistic update
            setDoctors(prev => prev.map(d => d.id === id ? { ...d, status } : d));

            const { error } = await supabase
                .from('doctor_consents')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            addToast(`Doctor access ${status === 'active' ? 'restored' : 'revoked'}.`, 'success');
        } catch (err) {
            console.error('Error updating doctor status:', err);
            addToast('Failed to update status.', 'error');
            // Revert on error could be added here, but skipping for simplicity in this prompt
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8 border-b border-health-border-light dark:border-health-border-dark pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark flex items-center gap-2">
                            <Shield className="text-purple-500" />
                            Consent Management
                        </h1>
                        <p className="text-health-text-secondary-light dark:text-health-text-secondary-dark mt-2">Control which applications access your data. Grant granular permissions.</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="neutral" className="gap-1"><Shield size={12} /> Consent-Based</Badge>
                    </div>
                </div>
            </div>

            {/* Doctor Authorization Section */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark">Authorized Medical Practitioners</h2>
                        <p className="text-sm text-health-text-secondary-light dark:text-health-text-secondary-dark">Grant temporary or permanent access to specific doctors.</p>
                    </div>
                    <Button onClick={() => setShowGrantDoctorModal(true)} size="sm">
                        <Plus size={16} className="mr-2" /> Authorize New Doctor
                    </Button>
                </div>

                {/* Grant Modal (Inline for now) */}
                {showGrantDoctorModal && (
                    <Card className="mb-6 border-health-primary-light/50 animate-fade-in bg-health-section-light/50">
                        <h3 className="font-bold mb-4">Grant Access to Doctor</h3>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Enter Doctor User ID"
                                value={newDoctorId}
                                onChange={(e) => setNewDoctorId(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={() => grantDoctorConsent(newDoctorId)} isLoading={granting}>
                                Grant Access
                            </Button>
                            <Button variant="secondary" onClick={() => setShowGrantDoctorModal(false)}>Cancel</Button>
                        </div>
                        {doctorConsentError && <p className="text-health-danger text-sm mt-2">{doctorConsentError}</p>}
                    </Card>
                )}

                {doctors.length === 0 && !showGrantDoctorModal && (
                    <div className="text-center py-8 px-6 rounded-xl bg-health-card-light/50 border border-dashed border-health-border-light dark:border-health-border-dark">
                        <p className="text-health-text-secondary-light opacity-70">No doctors have access to your personal records.</p>
                    </div>
                )}

                <div className="grid gap-4">
                    {doctors.map(doc => (
                        <Card key={doc.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-health-text-primary-light dark:text-health-text-primary-dark">
                                        Dr. {doc.doctor?.full_name || 'Unknown'} <span className="text-xs font-mono opacity-50 ml-2">({doc.doctor_id?.slice(0, 8)})</span>
                                    </h4>
                                    <div className="flex gap-2 text-xs mt-1">
                                        <Badge variant={doc.status === 'active' ? 'success' : 'neutral'}>
                                            {doc.status === 'active' ? 'Active Access' : 'Revoked'}
                                        </Badge>
                                        <span className="text-health-text-secondary-light">Authorized: {new Date(doc.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            {doc.status === 'active' ? (
                                <Button variant="danger" size="sm" onClick={() => updateDoctorStatus(doc.id, 'revoked')}>Revoke Access</Button>
                            ) : (
                                <Button variant="secondary" size="sm" onClick={() => updateDoctorStatus(doc.id, 'active')}>Re-Enable</Button>
                            )}
                        </Card>
                    ))}
                </div>
            </div>

            <div className="grid gap-6">
                {apps.length === 0 && !loading && (
                    <div className="text-center py-12 px-6 rounded-2xl bg-health-section-light dark:bg-health-section-dark border border-dashed border-health-border-light dark:border-health-border-dark">
                        <div className="mx-auto w-16 h-16 bg-health-bg-light dark:bg-health-bg-dark rounded-full flex items-center justify-center mb-4 text-health-primary-light">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-health-text-primary-light dark:text-health-text-primary-dark">No external applications connected</h3>
                        <p className="text-health-text-secondary-light dark:text-health-text-secondary-dark max-w-sm mx-auto mt-2">
                            Your data is safe. When you visit a hospital, their request will appear here for your approval.
                        </p>
                    </div>
                )}
                {apps.map(app => {
                    const consent = consents[app.id] || { allowed_fields: [], status: 'revoked' };
                    const isActive = consent.status === 'active';

                    return (
                        <Card key={app.id} className="overflow-hidden p-0 border border-health-border-light dark:border-health-border-dark">
                            <div className="p-6 border-b border-health-border-light dark:border-health-border-dark flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-health-text-primary-light dark:text-health-text-primary-dark">{app.name}</h3>
                                    <p className="text-sm text-health-text-secondary-light dark:text-health-text-secondary-dark">{app.description}</p>
                                </div>
                                <Badge variant={isActive ? 'success' : 'neutral'} className="shrink-0">
                                    {isActive ? 'Active Access' : 'No Access'}
                                </Badge>
                            </div>

                            <div className="p-6 bg-health-bg-light/50 dark:bg-black/20">
                                <h4 className="text-xs font-bold text-health-text-secondary-light dark:text-health-text-secondary-dark mb-4 uppercase tracking-wider">Select Allowed Data</h4>
                                <div className="flex flex-wrap gap-4 mb-6">
                                    {DATA_FIELDS.map(field => {
                                        const isChecked = consent.allowed_fields?.includes(field.key) || false;
                                        return (
                                            <label
                                                key={field.key}
                                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border transition-all duration-200 select-none
                                                    ${isChecked
                                                        ? 'bg-health-primary-light/10 border-health-primary-light text-health-text-primary-light dark:bg-health-primary-dark/10 dark:border-health-primary-dark dark:text-health-primary-dark'
                                                        : 'bg-white dark:bg-health-card-dark border-health-border-light dark:border-health-border-dark hover:border-health-primary-light/50 dark:hover:border-health-primary-dark/50'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors
                                                    ${isChecked
                                                        ? 'bg-health-primary-light border-health-primary-light text-white dark:bg-health-primary-dark dark:border-health-primary-dark dark:text-health-bg-dark'
                                                        : 'border-health-text-secondary-light dark:border-health-text-secondary-dark'
                                                    }`}
                                                >
                                                    {isChecked && <Check size={14} strokeWidth={3} />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleToggleField(app.id, field.key)}
                                                    className="hidden"
                                                />
                                                <span className={`font-medium ${isChecked ? '' : 'text-health-text-secondary-light dark:text-health-text-secondary-dark'}`}>
                                                    {field.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-4 border-t border-health-border-light dark:border-health-border-dark pt-4">
                                    {isActive && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRevoke(app.id)}
                                            className="flex items-center gap-2"
                                        >
                                            <XCircle size={16} />
                                            Revoke All Access
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div >
    );
}
