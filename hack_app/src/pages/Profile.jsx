import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Save, User, Copy, Check } from 'lucide-react';
import { Card, Button, Input, Spinner, Badge } from '../components/ui-components';

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        dob: '',
        address: '',
        patient_id: ''
    });
    const [copied, setCopied] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setFormData({
                    full_name: data.full_name || '',
                    dob: data.dob || '',
                    address: data.address || '',
                    patient_id: data.patient_id || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile: Request failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setSuccessMsg('');
        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: formData.full_name,
                    dob: formData.dob,
                    address: formData.address,
                    updated_at: new Date()
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    full_name: data.full_name || '',
                    dob: data.dob || '',
                    address: data.address || '',
                    patient_id: data.patient_id || ''
                }));
            }

            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            alert('Error updating profile!');
            console.error('Update failed');
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(formData.patient_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="mb-8 border-b border-health-border-light dark:border-health-border-dark pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <User size={24} />
                            </div>
                            Patient Identity
                        </h1>
                        <p className="text-health-text-secondary-light dark:text-health-text-secondary-dark mt-2">Manage your official records. You are the owner of this data.</p>
                    </div>
                    <Badge variant="success" className="hidden md:flex gap-1">
                        <Shield size={12} /> Verified Identity
                    </Badge>
                </div>
            </div>

            <Card>
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Patient ID (Read Only) */}
                    <div>
                        <label className="block text-sm font-medium text-health-text-secondary-light dark:text-health-text-secondary-dark mb-2">Unique Patient ID</label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-health-bg-light dark:bg-black/20 border border-health-border-light dark:border-health-border-dark rounded-xl px-4 py-3 text-health-text-secondary-light dark:text-health-text-secondary-dark font-mono text-sm break-all">
                                {formData.patient_id || 'Generating ID...'}
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={copyToClipboard}
                                title="Copy ID"
                                className="shrink-0"
                            >
                                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                            </Button>
                        </div>
                        <p className="text-xs text-health-text-secondary-light dark:text-health-text-secondary-dark mt-2">
                            This ID is shared with hospitals to request your data.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Your full name"
                        />
                        <Input
                            label="Date of Birth"
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-health-text-secondary-light dark:text-health-text-secondary-dark mb-2">Address</label>
                        <textarea
                            name="address"
                            rows={3}
                            value={formData.address}
                            onChange={handleChange}
                            className="input-base resize-none"
                            placeholder="Full residential address"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                        {successMsg ? (
                            <Badge variant="success" className="px-3 py-1 flex items-center gap-1">
                                <Check size={14} /> {successMsg}
                            </Badge>
                        ) : <span></span>}

                        <Button
                            type="submit"
                            isLoading={saving}
                        >
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
