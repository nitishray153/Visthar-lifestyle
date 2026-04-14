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
            {/* Category Browse Strip (like boAt) */}
            <div className="border-b border-white/5 py-8">
                <div className="section-container">
                    <div className="flex items-center justify-center gap-6 md:gap-10 overflow-x-auto scrollbar-none">
                        {[
                            { name: 'Chargers', image: 'https://images.unsplash.com/photo-1583142485083-291557266e6a?w=80&h=80&fit=crop' },
                            { name: 'Cables', image: 'https://images.unsplash.com/photo-1660945671777-6389d37d6ab4?w=80&h=80&fit=crop' },
                            { name: 'Headphones', image: 'https://images.unsplash.com/photo-1628911771730-881503b8e9c9?w=80&h=80&fit=crop' },
                            { name: 'Speakers', image: 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=80&h=80&fit=crop' },
                            { name: 'Earbuds', image: 'https://images.unsplash.com/photo-1677346414290-d337cbc682a6?w=80&h=80&fit=crop' },
                        ].map(cat => (
                            <Link key={cat.name} to={`/products?category=${cat.name}`} className="flex flex-col items-center gap-2 shrink-0 group">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#00FF66]/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(0,255,102,0.2)]">
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[10px] font-medium text-zinc-500 group-hover:text-[#00FF66] transition-colors">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

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
