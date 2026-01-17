import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield } from 'lucide-react';
import { Card, Button, Input } from '../components/ui-components';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Sign up user
        const { data, error: authError } = await signUp(email, password);

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (data.user && data.session) {
            // 2. Create Profile (Only if we have a session)
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        full_name: fullName,
                        // other fields null initially
                    }
                ]);

            if (profileError) {
                console.error('Error creating profile:', profileError);
                if (profileError.code === '42P01') {
                    setError("CRITICAL: Database tables missing. Please run the SQL script in Supabase Dashboard.");
                    setLoading(false);
                    return;
                }
            }

            navigate('/dashboard');
        } else if (data.user && !data.session) {
            setError('Account created! Please check your email to confirm your account before logging in.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-health-bg-light dark:bg-health-bg-dark flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300">
            {/* Background Decor */}
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-health-accent/20 rounded-full blur-[120px] pointer-events-none"></div>

            <Card className="w-full max-w-md relative z-10 animate-fade-in glass">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-health-primary-light/10 text-health-primary-light dark:text-health-primary-dark mb-4">
                        <Shield size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark">Create Account</h2>
                    <p className="text-health-text-secondary-light dark:text-health-text-secondary-dark mt-2">Secure your digital identity today</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-health-danger/10 border border-health-danger/20 text-health-danger text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Full Name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                    <Input
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                    <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full"
                    >
                        Sign Up
                    </Button>
                </form>

                <div className="mt-8 text-center text-health-text-secondary-light dark:text-health-text-secondary-dark text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-health-primary-light dark:text-health-primary-dark hover:underline font-medium">
                        Sign In
                    </Link>
                </div>
            </Card>
        </div>
    );
}
