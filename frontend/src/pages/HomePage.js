import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowRight, Star, Shield, Truck, Leaf, Zap, Cpu, Brain, Eye, Headphones, Cable, Battery, Speaker, ChevronRight, Users, Award, Globe } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/004ef417-6cdd-417a-8441-04bb16074be9/images/98f223321cf2917aefcd789a36aebd0c9d830ccb9a3c4a972d538d4a53df9fea.png";
const ECO_BG = "https://static.prod-images.emergentagent.com/jobs/004ef417-6cdd-417a-8441-04bb16074be9/images/aeff175e5492436954b8cc974e6721b659f6d79a0519c83de531e3c7f089f6fa.png";
const GLASSES_IMG = "https://static.prod-images.emergentagent.com/jobs/004ef417-6cdd-417a-8441-04bb16074be9/images/8ed348b667ca9993e00bbaeb1f51b1130b8a6a7e1b764ead89f26b9ea1b564e3.png";
const ECO_PKG = "https://static.prod-images.emergentagent.com/jobs/004ef417-6cdd-417a-8441-04bb16074be9/images/8f9baa2f06bf55a949f5b1c0b9e37312d1276050c8642075a0dd6766e00592c2.png";

const FadeIn = ({ children, delay = 0, className = '' }) => (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
        {children}
    </motion.div>
);

function HeroSection() {
    return (
        <section data-testid="hero-section" className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: '#050505' }}>
            {/* BG Particles */}
            <div className="absolute inset-0 opacity-20">
                <img src={ECO_BG} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505]" />

            <div className="section-container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
                {/* Text */}
                <div>
                    <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-xs tracking-[0.25em] uppercase text-[#00FF66] font-mono mb-4">
                        Introducing Visthar
                    </motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-5xl sm:text-6xl lg:text-7xl tracking-tighter font-medium leading-[1.05] mb-6">
                        Future of<br />
                        <span className="text-[#00FF66] neon-text">Smart</span> Accessories
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
                        className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-lg mb-8">
                        Premium eco-friendly tech accessories powered by AI. From plastic-free chargers to smart glasses for accessibility.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
                        className="flex flex-wrap gap-4">
                        <Link to="/products" data-testid="hero-shop-button" className="btn-primary flex items-center gap-2 text-sm">
                            <ShoppingCart size={16} /> Shop Now
                        </Link>
                        <Link to="/products?category=Coming+Soon" data-testid="hero-prebook-button" className="btn-secondary flex items-center gap-2 text-sm">
                            Pre-Book AI Products <ArrowRight size={16} />
                        </Link>
                    </motion.div>
                </div>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="relative flex items-center justify-center"
                >
                    <motion.img
                        src={HERO_IMG}
                        alt="Visthar AI Earbuds"
                        className="w-80 h-80 md:w-[420px] md:h-[420px] object-contain relative z-10 drop-shadow-2xl"
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Glow ring */}
                    <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full border border-[#00FF66]/10 animate-pulse-glow" />
                    <div className="absolute w-96 h-96 md:w-[480px] md:h-[480px] rounded-full border border-[#00FF66]/5" />
                </motion.div>
            </div>
        </section>
    );
}

function TrustSection() {
    const stats = [
        { icon: Users, value: '50,000+', label: 'Happy Customers' },
        { icon: Award, value: '4.8', label: 'Average Rating' },
        { icon: Shield, value: '1 Year', label: 'Warranty' },
        { icon: Globe, value: '100+', label: 'Cities Served' },
    ];
    const reviews = [
        { name: 'Rahul S.', rating: 5, text: 'Absolutely premium quality! The build and performance exceeded my expectations.', product: 'TurboCharge 65W' },
        { name: 'Priya M.', rating: 5, text: 'Love the eco-friendly approach. Finally a tech brand that cares about the planet.', product: 'EcoBuds TWS' },
        { name: 'Amit K.', rating: 4, text: 'Great sound quality and the battery life is incredible. Best purchase this year.', product: 'SonicPro ANC' },
    ];

    return (
        <section data-testid="trust-section" className="py-24 md:py-32" style={{ background: '#050505' }}>
            <div className="section-container">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                    {stats.map((stat, i) => (
                        <FadeIn key={stat.label} delay={i * 0.1}>
                            <div className="glass rounded-2xl p-6 text-center glass-hover">
                                <stat.icon className="mx-auto mb-3 text-[#00FF66]" size={24} />
                                <p className="text-2xl md:text-3xl font-semibold text-white">{stat.value}</p>
                                <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                {/* Reviews */}
                <FadeIn>
                    <p className="text-xs tracking-[0.2em] uppercase text-[#00FF66] font-mono text-center mb-3">What Customers Say</p>
                    <h2 className="text-4xl md:text-5xl tracking-tighter font-medium text-center mb-12">Trusted by Thousands</h2>
                </FadeIn>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((review, i) => (
                        <FadeIn key={i} delay={i * 0.15}>
                            <div className="glass rounded-2xl p-6 glass-hover">
                                <div className="flex gap-1 mb-3">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} size={14} className={j < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-zinc-700'} />
                                    ))}
                                </div>
                                <p className="text-sm text-zinc-300 leading-relaxed mb-4">"{review.text}"</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-white">{review.name}</p>
                                    <p className="text-xs text-zinc-600">{review.product}</p>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        api.get('/products?featured=true&coming_soon=false&limit=8').then(r => setProducts(r.data.products)).catch(() => {});
    }, []);

    if (!products.length) return null;
    return (
        <section data-testid="featured-products" className="py-24 md:py-32" style={{ background: '#0A0A0A' }}>
            <div className="section-container">
                <FadeIn>
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <p className="text-xs tracking-[0.2em] uppercase text-[#00FF66] font-mono mb-3">Featured</p>
                            <h2 className="text-4xl md:text-5xl tracking-tighter font-medium">Best Sellers</h2>
                        </div>
                        <Link to="/products" className="hidden md:flex items-center gap-2 text-sm text-zinc-400 hover:text-[#00FF66] transition-colors">
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                </FadeIn>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product, i) => (
                        <ProductCard key={product.id} product={product} index={i} />
                    ))}
                </div>
                <div className="mt-8 text-center md:hidden">
                    <Link to="/products" className="btn-secondary inline-flex items-center gap-2 text-sm">
                        View All Products <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function CategoriesSection() {
    const categories = [
        { name: 'Chargers', icon: Zap, desc: 'GaN & Eco-Friendly', color: '#00FF66' },
        { name: 'Cables', icon: Cable, desc: 'Braided & Durable', color: '#D4AF37' },
        { name: 'Headphones', icon: Headphones, desc: 'ANC & Hi-Res', color: '#A78BFA' },
        { name: 'Speakers', icon: Speaker, desc: 'Portable & Powerful', color: '#38BDF8' },
        { name: 'Earbuds', icon: Battery, desc: 'TWS & Wireless', color: '#F472B6' },
    ];

    return (
        <section data-testid="categories-section" className="py-24 md:py-32" style={{ background: '#050505' }}>
            <div className="section-container">
                <FadeIn>
                    <p className="text-xs tracking-[0.2em] uppercase text-[#00FF66] font-mono text-center mb-3">Browse</p>
                    <h2 className="text-4xl md:text-5xl tracking-tighter font-medium text-center mb-12">Product Categories</h2>
                </FadeIn>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {categories.map((cat, i) => (
                        <FadeIn key={cat.name} delay={i * 0.1}>
                            <Link
                                to={`/products?category=${cat.name}`}
                                data-testid={`category-${cat.name.toLowerCase()}`}
                                className="glass rounded-2xl p-6 text-center glass-hover group block"
                            >
                                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
                                    <cat.icon size={24} style={{ color: cat.color }} />
                                </div>
                                <h3 className="text-sm font-medium text-white mb-1">{cat.name}</h3>
                                <p className="text-xs text-zinc-500">{cat.desc}</p>
                            </Link>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ComingSoonSection() {
    const [comingSoon, setComingSoon] = useState([]);
    const [bookingData, setBookingData] = useState({ name: '', email: '', phone: '' });
    const [activeProduct, setActiveProduct] = useState(null);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        api.get('/products?coming_soon=true').then(r => setComingSoon(r.data.products)).catch(() => {});
    }, []);

    useEffect(() => {
        const target = new Date('2026-06-15T00:00:00');
        const timer = setInterval(() => {
            const diff = target - new Date();
            if (diff <= 0) { clearInterval(timer); return; }
            setCountdown({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                mins: Math.floor((diff % 3600000) / 60000),
                secs: Math.floor((diff % 60000) / 1000)
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePreBook = async (productId) => {
        if (!bookingData.name || !bookingData.email) { toast.error('Name and email are required'); return; }
        try {
            await api.post('/prebooking', { ...bookingData, product_id: productId });
            toast.success('Pre-booking confirmed! We will notify you on launch.');
            setActiveProduct(null);
            setBookingData({ name: '', email: '', phone: '' });
        } catch (e) {
            toast.error(e.response?.data?.detail || 'Failed to pre-book');
        }
    };

    return (
        <section data-testid="coming-soon-section" className="py-24 md:py-32 relative overflow-hidden" style={{ background: '#0A0A0A' }}>
            {/* Background glow effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[200px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#00FF66]/5 blur-[200px]" />
            </div>
            <div className="section-container relative z-10">
                <FadeIn>
                    {/* India's First Badge */}
                    <div className="flex justify-center mb-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                            <span className="indias-first-badge text-xs font-bold tracking-wider uppercase">India's First</span>
                        </div>
                    </div>
                    <p className="text-xs tracking-[0.2em] uppercase text-violet-400 font-mono text-center mb-3">Launching Soon</p>
                    <h2 className="text-4xl md:text-5xl tracking-tighter font-medium text-center mb-4">AI-Powered Innovation</h2>
                    <p className="text-center text-zinc-400 mb-8 max-w-lg mx-auto">The next generation of smart accessories. Pre-book now for exclusive early access pricing.</p>
                </FadeIn>

                {/* Countdown */}
                <FadeIn>
                    <div className="flex justify-center gap-4 mb-14">
                        {[['days', countdown.days], ['hours', countdown.hours], ['mins', countdown.mins], ['secs', countdown.secs]].map(([label, val]) => (
                            <div key={label} className="glass rounded-xl p-3 md:p-4 text-center min-w-[60px] md:min-w-[80px]" style={{ borderColor: 'rgba(167,139,250,0.2)' }}>
                                <p className="text-xl md:text-3xl font-semibold text-white font-mono">{String(val).padStart(2, '0')}</p>
                                <p className="text-[10px] uppercase text-zinc-500 tracking-wider">{label}</p>
                            </div>
                        ))}
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {comingSoon.map((product, i) => (
                        <FadeIn key={product.id} delay={i * 0.2}>
                            <div className="coming-soon-blur-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(167,139,250,0.15)' }}>
                                {/* Image with blur overlay */}
                                <div className="aspect-video relative overflow-hidden bg-[#080808]">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-contain p-8 transition-all duration-500 hover:scale-105" />
                                    {/* Blur overlay effect */}
                                    <div className="absolute inset-0 blur-overlay" />
                                    {/* Content over blur */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                        <span className="indias-first-badge text-lg md:text-2xl font-bold tracking-wider mb-1">INDIA'S FIRST</span>
                                        <span className="text-xs tracking-[0.3em] uppercase text-white/70 font-mono">Launching Soon</span>
                                    </div>
                                    {/* Top badges */}
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 backdrop-blur-sm">
                                            AI Powered
                                        </span>
                                        <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 backdrop-blur-sm">
                                            Limited Edition
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 relative z-10" style={{ background: 'rgba(10,10,10,0.9)' }}>
                                    <h3 className="text-xl font-medium mb-2">{product.name}</h3>
                                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{product.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {product.features.slice(0, 4).map(f => (
                                            <span key={f} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/5">{f}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-semibold text-white">{product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                                            {product.original_price && <span className="text-sm text-zinc-600 line-through ml-2">{product.original_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>}
                                        </div>
                                        <button
                                            data-testid={`prebook-${product.id}`}
                                            onClick={() => setActiveProduct(activeProduct === product.id ? null : product.id)}
                                            className="btn-primary text-sm px-6 py-2 animate-pulse-glow"
                                        >
                                            Pre-Book Now
                                        </button>
                                    </div>

                                    {activeProduct === product.id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                            <input type="text" placeholder="Your Name" value={bookingData.name} onChange={e => setBookingData(p => ({ ...p, name: e.target.value }))}
                                                data-testid="prebook-name-input" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                            <input type="email" placeholder="Email" value={bookingData.email} onChange={e => setBookingData(p => ({ ...p, email: e.target.value }))}
                                                data-testid="prebook-email-input" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                            <input type="tel" placeholder="Phone (optional)" value={bookingData.phone} onChange={e => setBookingData(p => ({ ...p, phone: e.target.value }))}
                                                data-testid="prebook-phone-input" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                            <button data-testid="prebook-confirm-btn" onClick={() => handlePreBook(product.id)} className="w-full btn-primary text-sm py-2.5">
                                                Confirm Pre-Booking
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

function BrowseCategoriesSection() {
    const cats = [
        { name: 'Chargers', image: 'https://images.unsplash.com/photo-1583142485083-291557266e6a?w=300&h=300&fit=crop', count: '3 Products' },
        { name: 'Cables', image: 'https://images.unsplash.com/photo-1660945671777-6389d37d6ab4?w=300&h=300&fit=crop', count: '3 Products' },
        { name: 'Headphones', image: 'https://images.unsplash.com/photo-1628911771730-881503b8e9c9?w=300&h=300&fit=crop', count: '2 Products' },
        { name: 'Speakers', image: 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=300&h=300&fit=crop', count: '2 Products' },
        { name: 'Earbuds', image: 'https://images.unsplash.com/photo-1677346414290-d337cbc682a6?w=300&h=300&fit=crop', count: '2 Products' },
    ];

    return (
        <section data-testid="browse-categories" className="py-20 md:py-28" style={{ background: '#050505' }}>
            <div className="section-container">
                <FadeIn>
                    <p className="text-xs tracking-[0.2em] uppercase text-[#00FF66] font-mono text-center mb-3">Browse by Category</p>
                    <h2 className="text-3xl md:text-4xl tracking-tighter font-medium text-center mb-10">Shop What You Love</h2>
                </FadeIn>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {cats.map((cat, i) => (
                        <FadeIn key={cat.name} delay={i * 0.1}>
                            <Link
                                to={`/products?category=${cat.name}`}
                                data-testid={`browse-cat-${cat.name.toLowerCase()}`}
                                className="cat-card-tilt glass rounded-2xl overflow-hidden group block"
                            >
                                <div className="aspect-square relative overflow-hidden">
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-sm font-semibold text-white mb-0.5">{cat.name}</h3>
                                        <p className="text-[10px] text-zinc-400">{cat.count}</p>
                                    </div>
                                    {/* Hover glow border */}
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00FF66]/30 rounded-2xl transition-colors duration-300" />
                                </div>
                            </Link>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SustainabilitySection() {
    const metrics = [
        { value: '50,000+', label: 'Plastic-Free Products Sold' },
        { value: '2.5 Tons', label: 'Plastic Waste Prevented' },
        { value: '100%', label: 'Recyclable Packaging' },
        { value: '30%', label: 'CO2 Reduction Per Product' },
    ];

    return (
        <section data-testid="sustainability-section" id="sustainability" className="py-24 md:py-32 relative overflow-hidden" style={{ background: '#050505' }}>
            <div className="absolute inset-0 opacity-10">
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-500 blur-[300px]" />
            </div>
            <div className="section-container relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <FadeIn>
                            <p className="text-xs tracking-[0.2em] uppercase text-emerald-400 font-mono mb-3">V Green Project</p>
                            <h2 className="text-4xl md:text-5xl tracking-tighter font-medium mb-6">
                                Tech That<br />
                                <span className="text-[#00FF66]">Respects</span> Earth
                            </h2>
                            <p className="text-base text-zinc-400 leading-relaxed mb-8 max-w-lg">
                                Our V Green Project is committed to eliminating plastic from tech accessories. Every product is designed with sustainability at its core, using recycled and biodegradable materials.
                            </p>
                        </FadeIn>
                        <div className="grid grid-cols-2 gap-4">
                            {metrics.map((m, i) => (
                                <FadeIn key={m.label} delay={i * 0.1}>
                                    <div className="glass rounded-xl p-4 glass-hover" style={{ borderColor: 'rgba(16,185,129,0.15)' }}>
                                        <p className="text-xl font-semibold text-[#00FF66]">{m.value}</p>
                                        <p className="text-xs text-zinc-500 mt-1">{m.label}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                    <FadeIn delay={0.3}>
                        <div className="relative">
                            <img src={ECO_PKG} alt="Eco Packaging" className="w-full rounded-2xl" />
                            <div className="absolute inset-0 rounded-2xl border border-emerald-500/10" />
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}

function InnovationSection() {
    const features = [
        { icon: Brain, title: 'AI-Powered Sound', desc: 'Adaptive audio that learns your preferences and environment in real-time.' },
        { icon: Eye, title: 'Vision Assist', desc: 'Smart glasses that help visually impaired users navigate the world.' },
        { icon: Cpu, title: 'Visthar V1 Chip', desc: 'Custom silicon designed for ultra-low power AI processing in earbuds.' },
        { icon: Leaf, title: 'Zero Plastic', desc: 'Every product designed with 100% recyclable and biodegradable materials.' },
    ];

    return (
        <section data-testid="innovation-section" id="innovation" className="py-24 md:py-32" style={{ background: '#0A0A0A' }}>
            <div className="section-container">
                <FadeIn>
                    <p className="text-xs tracking-[0.2em] uppercase text-[#D4AF37] font-mono text-center mb-3">Innovation</p>
                    <h2 className="text-4xl md:text-5xl tracking-tighter font-medium text-center mb-4">Powered by Intelligence</h2>
                    <p className="text-center text-zinc-400 max-w-lg mx-auto mb-12">We are building the next generation of smart accessories that adapt, learn, and empower.</p>
                </FadeIn>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feat, i) => (
                        <FadeIn key={feat.title} delay={i * 0.1}>
                            <div className="glass rounded-2xl p-8 glass-hover group">
                                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <feat.icon size={24} className="text-[#D4AF37]" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">{feat.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">{feat.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

function OEMSection() {
    const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', product_interest: '', quantity: 100, message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.company_name || !form.email || !form.contact_name || !form.phone || !form.product_interest) {
            toast.error('Please fill in all required fields'); return;
        }
        setLoading(true);
        try {
            await api.post('/oem/inquiry', form);
            toast.success('Inquiry submitted! Our team will contact you soon.');
            setForm({ company_name: '', contact_name: '', email: '', phone: '', product_interest: '', quantity: 100, message: '' });
        } catch {
            toast.error('Failed to submit inquiry');
        }
        setLoading(false);
    };

    return (
        <section data-testid="oem-section" id="oem" className="py-24 md:py-32" style={{ background: '#050505' }}>
            <div className="section-container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <FadeIn>
                        <div>
                            <p className="text-xs tracking-[0.2em] uppercase text-[#00FF66] font-mono mb-3">B2B</p>
                            <h2 className="text-4xl md:text-5xl tracking-tighter font-medium mb-6">OEM & Bulk Orders</h2>
                            <p className="text-base text-zinc-400 leading-relaxed mb-8">
                                Partner with Visthar for custom branding, bulk orders, and white-label solutions. We serve enterprises, retailers, and corporate gifting needs.
                            </p>
                            <div className="space-y-4">
                                {['Custom Branding & Packaging', 'Minimum Order: 100 Units', 'Dedicated Account Manager', 'Priority Support'].map(item => (
                                    <div key={item} className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                                        <span className="text-sm text-zinc-300">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 space-y-4" data-testid="oem-form">
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Company Name *" value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                                    data-testid="oem-company-input" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                <input placeholder="Contact Name *" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                                    data-testid="oem-contact-input" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="email" placeholder="Email *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    data-testid="oem-email-input" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                <input placeholder="Phone *" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                    data-testid="oem-phone-input" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                            </div>
                            <input placeholder="Product Interest *" value={form.product_interest} onChange={e => setForm(p => ({ ...p, product_interest: e.target.value }))}
                                data-testid="oem-product-input" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))}
                                    data-testid="oem-quantity-input" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                <div />
                            </div>
                            <textarea placeholder="Additional Message" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={3}
                                data-testid="oem-message-input" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none resize-none" />
                            <button type="submit" disabled={loading} data-testid="oem-submit-btn" className="w-full btn-primary text-sm py-3">
                                {loading ? 'Submitting...' : 'Submit Inquiry'}
                            </button>
                        </form>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}

export default function HomePage() {
    return (
        <div data-testid="home-page">
            <HeroSection />
            <TrustSection />
            <FeaturedProducts />
            <CategoriesSection />
            <ComingSoonSection />
            <SustainabilitySection />
            <InnovationSection />
            <BrowseCategoriesSection />
            <OEMSection />
        </div>
    );
}
