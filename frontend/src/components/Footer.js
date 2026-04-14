import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const GOLD_LOGO = "https://customer-assets.emergentagent.com/job_eco-smart-hub/artifacts/2thwkzxn_visthar_logo-removebg-preview%20(1).png";

export default function Footer() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNewsletter = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const { data } = await api.post('/newsletter/subscribe', { email });
            toast.success(data.message);
            setEmail('');
        } catch {
            toast.error('Failed to subscribe');
        }
        setLoading(false);
    };

    return (
        <footer data-testid="main-footer" className="border-t border-white/5" style={{ background: '#050505' }}>
            <div className="section-container py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <img src={GOLD_LOGO} alt="Visthar" className="h-12 mb-4" />
                        <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                            Future of Smart Accessories. Premium eco-friendly tech for a sustainable tomorrow.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-zinc-600">
                                <MapPin size={12} /> Bengaluru, India
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-600">
                                <Phone size={12} /> +91 9876543210
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-600">
                                <Mail size={12} /> hello@visthar.com
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-white">Shop</h4>
                        <div className="space-y-2">
                            {['Chargers', 'Cables', 'Headphones', 'Speakers', 'Earbuds'].map(cat => (
                                <Link key={cat} to={`/products?category=${cat}`} className="block text-sm text-zinc-500 hover:text-[#00FF66] transition-colors">
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-white">Company</h4>
                        <div className="space-y-2">
                            {[
                                { label: 'About Us', path: '/#sustainability' },
                                { label: 'V Green Project', path: '/#sustainability' },
                                { label: 'AI Innovation', path: '/#innovation' },
                                { label: 'Bulk Orders', path: '/#oem' },
                                { label: 'Track Order', path: '/profile' },
                            ].map(link => (
                                <Link key={link.label} to={link.path} className="block text-sm text-zinc-500 hover:text-[#00FF66] transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-white">Stay Updated</h4>
                        <p className="text-sm text-zinc-500 mb-4">Get notified about new launches and exclusive deals.</p>
                        <form onSubmit={handleNewsletter} className="flex gap-2" data-testid="newsletter-form">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                data-testid="newsletter-email-input"
                                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                data-testid="newsletter-submit-btn"
                                className="w-10 h-10 rounded-full bg-[#00FF66] flex items-center justify-center text-black hover:bg-[#39FF14] transition-colors shrink-0"
                            >
                                <ArrowRight size={16} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-600">
                        &copy; {new Date().getFullYear()} Vistharuio Electronics Private Limited. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Privacy Policy</span>
                        <span className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Terms of Service</span>
                        <span className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Refund Policy</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
