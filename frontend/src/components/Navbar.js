import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, Shield, ChevronDown, Zap, Cable, Headphones, Speaker, Battery } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_eco-smart-hub/artifacts/2thwkzxn_visthar_logo-removebg-preview%20(1).png";

const CATEGORIES = [
    { name: 'Chargers', icon: Zap, color: '#00FF66', image: 'https://images.unsplash.com/photo-1583142485083-291557266e6a?w=100&h=100&fit=crop' },
    { name: 'Cables', icon: Cable, color: '#D4AF37', image: 'https://images.unsplash.com/photo-1660945671777-6389d37d6ab4?w=100&h=100&fit=crop' },
    { name: 'Headphones', icon: Headphones, color: '#A78BFA', image: 'https://images.unsplash.com/photo-1628911771730-881503b8e9c9?w=100&h=100&fit=crop' },
    { name: 'Speakers', icon: Speaker, color: '#38BDF8', image: 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=100&h=100&fit=crop' },
    { name: 'Earbuds', icon: Battery, color: '#F472B6', image: 'https://images.unsplash.com/photo-1677346414290-d337cbc682a6?w=100&h=100&fit=crop' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [catBarVisible, setCatBarVisible] = useState(true);
    const userMenuRef = useRef(null);

    // Close user menu on click outside
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Hide category bar on scroll
    useEffect(() => {
        let lastY = 0;
        const handler = () => {
            const y = window.scrollY;
            setCatBarVisible(y < 100 || y < lastY);
            lastY = y;
        };
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const isHome = location.pathname === '/';

    return (
        <>
            {/* Main Navbar */}
            <nav data-testid="main-navbar" className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="section-container flex items-center justify-between h-16 md:h-[68px]">
                    {/* Logo */}
                    <Link to="/" data-testid="navbar-logo" className="flex items-center gap-2 shrink-0">
                        <img src={LOGO_URL} alt="Visthar" className="h-9 md:h-11 w-auto transition-transform hover:scale-105" />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { label: 'Home', path: '/' },
                            { label: 'Products', path: '/products' },
                            { label: 'Coming Soon', path: '/products?category=Coming+Soon' },
                        ].map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                                className={`text-sm font-medium transition-colors relative group ${location.pathname === link.path ? 'text-[#00FF66]' : 'text-zinc-400 hover:text-white'}`}
                            >
                                {link.label}
                                <span className={`absolute -bottom-1 left-0 h-px bg-[#00FF66] transition-all ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Link to="/products" data-testid="nav-search-btn" className="p-2 text-zinc-400 hover:text-white transition-colors">
                            <Search size={18} />
                        </Link>

                        <Link to="/cart" data-testid="nav-cart-btn" className="p-2 text-zinc-400 hover:text-white transition-colors relative">
                            <ShoppingCart size={18} />
                            {cartCount > 0 && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#00FF66] text-black text-[10px] font-bold flex items-center justify-center">
                                    {cartCount}
                                </motion.span>
                            )}
                        </Link>

                        {/* Profile / Auth */}
                        {user ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    data-testid="nav-user-menu-btn"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-zinc-400 hover:text-white transition-colors group"
                                >
                                    <div className="w-7 h-7 rounded-full bg-[#00FF66]/15 flex items-center justify-center text-xs font-bold text-[#00FF66] group-hover:bg-[#00FF66]/25 transition-colors">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden md:inline text-sm">{user.name.split(' ')[0]}</span>
                                    <ChevronDown size={14} className={`hidden md:inline transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-2xl"
                                            style={{ background: 'rgba(10,10,10,0.98)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
                                        >
                                            <div className="px-4 py-3 border-b border-white/5">
                                                <p className="text-sm font-medium truncate">{user.name}</p>
                                                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                                {user.role === 'admin' && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] mt-1 inline-block">Admin</span>}
                                            </div>
                                            <div className="py-1">
                                                <Link to="/profile" onClick={() => setUserMenuOpen(false)} data-testid="nav-profile-link" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                                    <User size={15} /> My Profile
                                                </Link>
                                                <Link to="/profile" onClick={() => setUserMenuOpen(false)} data-testid="nav-orders-link" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                                    <Package size={15} /> My Orders
                                                </Link>
                                                {user.role === 'admin' && (
                                                    <Link to="/admin" onClick={() => setUserMenuOpen(false)} data-testid="nav-admin-link" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                                        <Shield size={15} /> Admin Panel
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="border-t border-white/5 py-1">
                                                <button
                                                    data-testid="nav-logout-btn"
                                                    onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors w-full"
                                                >
                                                    <LogOut size={15} /> Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link to="/auth" data-testid="nav-login-btn" className="hidden md:inline-flex btn-primary text-sm px-5 py-2">
                                Sign In
                            </Link>
                        )}

                        <button data-testid="mobile-menu-toggle" className="md:hidden p-2 text-zinc-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Category Bar - boAt style */}
                <div
                    data-testid="category-bar"
                    className={`hidden md:block border-t border-white/5 transition-all duration-300 overflow-hidden ${catBarVisible ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}
                    style={{ background: 'rgba(5,5,5,0.6)' }}
                >
                    <div className="section-container flex items-center justify-center gap-8 py-2.5">
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.name}
                                to={`/products?category=${cat.name}`}
                                data-testid={`catbar-${cat.name.toLowerCase()}`}
                                className="category-hover-item flex flex-col items-center gap-1.5 group"
                            >
                                <div
                                    className="w-11 h-11 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                                    style={{ borderColor: 'rgba(255,255,255,0.1)', '--hover-color': cat.color }}
                                >
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                <span className="text-[10px] font-medium text-zinc-500 group-hover:text-white transition-colors">{cat.name}</span>
                            </Link>
                        ))}
                        <Link
                            to="/products?category=Coming+Soon"
                            data-testid="catbar-coming-soon"
                            className="category-hover-item flex flex-col items-center gap-1.5 group"
                        >
                            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-violet-500/30 transition-all duration-300 group-hover:scale-110 group-hover:border-violet-400 relative">
                                <img src="https://static.prod-images.emergentagent.com/jobs/004ef417-6cdd-417a-8441-04bb16074be9/images/98f223321cf2917aefcd789a36aebd0c9d830ccb9a3c4a972d538d4a53df9fea.png" alt="Coming Soon" className="w-full h-full object-cover blur-[1px] transition-all duration-300 group-hover:blur-0" />
                                <div className="absolute inset-0 bg-violet-500/20 group-hover:bg-transparent transition-colors" />
                            </div>
                            <span className="text-[10px] font-medium text-violet-400 group-hover:text-violet-300 transition-colors">AI Series</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden overflow-hidden border-t border-white/5"
                            style={{ background: 'rgba(5,5,5,0.98)' }}
                        >
                            <div className="px-6 py-4">
                                {/* Mobile Categories */}
                                <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-none">
                                    {CATEGORIES.map((cat) => (
                                        <Link key={cat.name} to={`/products?category=${cat.name}`} onClick={() => setMobileOpen(false)} className="flex flex-col items-center gap-1 shrink-0">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[10px] text-zinc-400">{cat.name}</span>
                                        </Link>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Home', path: '/' },
                                        { label: 'All Products', path: '/products' },
                                        { label: 'Coming Soon', path: '/products?category=Coming+Soon' },
                                    ].map((link) => (
                                        <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-zinc-400 hover:text-white py-2">
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                                {!user && (
                                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="block btn-primary text-center text-sm mt-4">
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            {/* Spacer for category bar */}
            <div className="h-0 md:h-0" />
        </>
    );
}
