import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';
import { Card, Button, Input } from '../components/ui-components';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log('Attempting login for:', email);
        const { data, error } = await signIn(email, password);
        if (error) {
            console.error('Login failed:', error);
            setError(error.message);
            setLoading(false);
        } else {
            if (data?.session) {
                console.log('Login successful. Session found. Redirecting to Dashboard...');
                navigate('/dashboard');
            } else {
                console.warn('Login returned no error but no session?!');
                setError('Login succeeded but session was missing. Check email confirmation.');
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-health-bg-light dark:bg-health-bg-dark flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300">
            {/* Background Decor */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-health-primary-light/20 rounded-full blur-[120px] pointer-events-none"></div>

            <Card className="w-full max-w-md relative z-10 animate-fade-in glass">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-health-primary-light/10 text-health-primary-light dark:text-health-primary-dark mb-4">
                        <Shield size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-health-text-primary-light dark:text-health-text-primary-dark">Welcome Back</h2>
                    <p className="text-health-text-secondary-light dark:text-health-text-secondary-dark mt-2">Sign in to manage your identity</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-health-danger/10 border border-health-danger/20 text-health-danger text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        Sign In
                    </Button>
                </form>

                <div className="mt-8 text-center text-health-text-secondary-light dark:text-health-text-secondary-dark text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-health-primary-light dark:text-health-primary-dark hover:underline font-medium">
                        Create Profile
                    </Link>
                </div>
            </Card>
        </div>
    );
}
