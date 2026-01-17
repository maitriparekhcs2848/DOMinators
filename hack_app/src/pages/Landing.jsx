import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12">
                <nav className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-2 text-2xl font-bold">
                        <Shield className="text-blue-400" />
                        <span>PrivID</span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition">Login</Link>
                        <Link to="/signup" className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-500/30">Get Started</Link>
                    </div>
                </nav>

                <main className="flex flex-col items-center text-center mt-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-8 animate-fade-in backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-sm font-medium text-slate-200">The Future of Digital Identity</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200">
                        Current Identity. <br />
                        <span className="text-blue-400">Your Rules.</span>
                    </h1>

                    <p className="text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed">
                        A privacy-first platform where YOU decide who sees your healthcare data.
                        Granular consent, real-time transparency, and zero compromises.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 mb-20 animate-slide-up">
                        <Link to="/signup" className="px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-lg font-semibold transition-all shadow-xl hover:shadow-blue-500/25">
                            Create My Identity
                        </Link>
                        <Link to="/health-app" className="px-8 py-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-lg font-semibold transition-all border border-slate-700">
                            Demo Hospital Portal
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-left max-w-5xl w-full">
                        <FeatureCard
                            icon={<Lock className="text-blue-400" />}
                            title="Data Minimization"
                            desc="Share only what's necessary. Name, DOB, or Address—field level control."
                        />
                        <FeatureCard
                            icon={<Eye className="text-purple-400" />}
                            title="Total Transparency"
                            desc="See exactly who accessed your data, when, and why. Immutable audit logs."
                        />
                        <FeatureCard
                            icon={<CheckCircle className="text-green-400" />}
                            title="Active Consent"
                            desc="No access without your explicit permission. Revoke anytime instantly."
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md">
            <div className="mb-4 w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{desc}</p>
        </div>
    );
}
