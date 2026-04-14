import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_eco-smart-hub/artifacts/2thwkzxn_visthar_logo-removebg-preview%20(1).png";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'Products', path: '/products' },
        { label: 'Coming Soon', path: '/products?category=Coming+Soon' },
    ];

    return (
        <nav data-testid="main-navbar" className="fixed top-0 left-0 right-0 z-50 glass" style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)' }}>
            <div className="section-container flex items-center justify-between h-16 md:h-20">
                {/* Logo */}
                <Link to="/" data-testid="navbar-logo" className="flex items-center gap-2 shrink-0">
                    <img src={LOGO_URL} alt="Visthar" className="h-9 md:h-11 w-auto transition-transform hover:scale-105" />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#00FF66] transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link to="/products" data-testid="nav-search-btn" className="p-2 text-zinc-400 hover:text-white transition-colors">
                        <Search size={18} />
                    </Link>

                    <Link to="/cart" data-testid="nav-cart-btn" className="p-2 text-zinc-400 hover:text-white transition-colors relative">
                        <ShoppingCart size={18} />
                        {cartCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00FF66] text-black text-xs font-bold flex items-center justify-center"
                            >
                                {cartCount}
                            </motion.span>
                        )}
                    </Link>

                    {user ? (
                        <div className="relative">
                            <button
                                data-testid="nav-user-menu-btn"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <User size={18} />
                            </button>
                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 top-full mt-2 w-48 glass rounded-xl overflow-hidden"
                                        style={{ background: 'rgba(10,10,10,0.95)' }}
                                    >
                                        <div className="px-4 py-3 border-b border-white/5">
                                            <p className="text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                        </div>
                                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                            <Package size={14} /> My Orders
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                                <Shield size={14} /> Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            data-testid="nav-logout-btn"
                                            onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors w-full"
                                        >
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/auth" data-testid="nav-login-btn" className="hidden md:inline-flex btn-primary text-sm px-5 py-2">
                            Sign In
                        </Link>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        data-testid="mobile-menu-toggle"
                        className="md:hidden p-2 text-zinc-400 hover:text-white"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
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
                        <div className="px-6 py-4 space-y-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileOpen(false)}
                                    className="block text-sm font-medium text-zinc-400 hover:text-white py-2"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!user && (
                                <Link to="/auth" onClick={() => setMobileOpen(false)} className="block btn-primary text-center text-sm mt-3">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
