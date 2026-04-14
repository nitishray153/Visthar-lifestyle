import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
    const { items, total, fetchCart, updateQuantity, removeItem } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { fetchCart(); }, [fetchCart]);

    if (items.length === 0) {
        return (
            <div data-testid="cart-page-empty" className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#050505' }}>
                <ShoppingCart size={48} className="text-zinc-700" />
                <h2 className="text-2xl font-medium">Your cart is empty</h2>
                <p className="text-sm text-zinc-500">Add some products to get started</p>
                <Link to="/products" className="btn-primary text-sm mt-4">Browse Products</Link>
            </div>
        );
    }

    return (
        <div data-testid="cart-page" className="min-h-screen" style={{ background: '#050505' }}>
            <div className="section-container py-8 md:py-12">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl tracking-tighter font-medium mb-8">
                    Your Cart
                </motion.h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, i) => (
                            <motion.div
                                key={item.product_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                data-testid={`cart-item-${item.product_id}`}
                                className="glass rounded-xl p-4 flex gap-4"
                            >
                                <Link to={`/product/${item.product_id}`} className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-[#0A0A0A]">
                                    <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/product/${item.product_id}`} className="text-sm font-medium hover:text-[#00FF66] transition-colors truncate block">
                                        {item.product?.name}
                                    </Link>
                                    <p className="text-xs text-zinc-500 mt-0.5">{item.product?.category}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center glass rounded-full">
                                            <button data-testid={`cart-qty-dec-${item.product_id}`} onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white">
                                                <Minus size={12} />
                                            </button>
                                            <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                                            <button data-testid={`cart-qty-inc-${item.product_id}`} onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white">
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold">{(item.product?.price * item.quantity).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                                            <button data-testid={`cart-remove-${item.product_id}`} onClick={() => removeItem(item.product_id)} className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="glass rounded-2xl p-6 sticky top-24" data-testid="cart-summary">
                            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Subtotal ({items.length} items)</span>
                                    <span>{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Shipping</span>
                                    <span className="text-[#00FF66]">Free</span>
                                </div>
                                <div className="border-t border-white/5 pt-3 flex justify-between">
                                    <span className="font-medium">Total</span>
                                    <span className="text-xl font-semibold">{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                            <button
                                data-testid="checkout-btn"
                                onClick={() => user ? navigate('/checkout') : navigate('/auth?redirect=checkout')}
                                className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2"
                            >
                                {user ? 'Proceed to Checkout' : 'Sign In to Checkout'} <ArrowRight size={16} />
                            </button>
                            <Link to="/products" className="block text-center text-xs text-zinc-500 hover:text-[#00FF66] mt-4 transition-colors">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
