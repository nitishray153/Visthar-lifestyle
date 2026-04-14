import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const GOLD_LOGO = "https://customer-assets.emergentagent.com/job_eco-smart-hub/artifacts/2thwkzxn_visthar_logo-removebg-preview%20(1).png";

export default function AuthPage() {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { user, login, register } = useAuth();
    const { fetchCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '';

    useEffect(() => {
        if (user) navigate(redirect ? `/${redirect}` : '/');
    }, [user, navigate, redirect]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        let result;
        if (mode === 'login') {
            result = await login(email, password);
        } else {
            if (!name) { setError('Name is required'); setLoading(false); return; }
            result = await register(name, email, password, phone);
        }
        if (result.success) {
            await fetchCart();
            navigate(redirect ? `/${redirect}` : '/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div data-testid="auth-page" className="min-h-screen flex items-center justify-center px-4" style={{ background: '#050505' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <img src={GOLD_LOGO} alt="Visthar" className="h-14 mx-auto mb-4" />
                    <h1 className="text-3xl tracking-tighter font-medium">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-sm text-zinc-500 mt-2">
                        {mode === 'login' ? 'Sign in to your Visthar account' : 'Join the future of smart accessories'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 space-y-4" data-testid="auth-form">
                    {error && (
                        <div data-testid="auth-error" className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {mode === 'register' && (
                        <>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"
                                    data-testid="auth-name-input" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Phone (optional)</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210"
                                    data-testid="auth-phone-input" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                            data-testid="auth-email-input" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Password</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required
                                data-testid="auth-password-input" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} data-testid="auth-submit-btn" className="w-full btn-primary text-sm py-3">
                        {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>

                    <p className="text-center text-sm text-zinc-500">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                            data-testid="auth-toggle-mode" className="text-[#00FF66] hover:underline">
                            {mode === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
