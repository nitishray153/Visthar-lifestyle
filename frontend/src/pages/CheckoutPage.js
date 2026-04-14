import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MapPin, CreditCard, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { user, updateUser } = useAuth();
    const { items, total, fetchCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '', is_default: true });
    const [showNewAddress, setShowNewAddress] = useState(false);

    useEffect(() => { fetchCart(); }, [fetchCart]);
    useEffect(() => {
        if (!user) navigate('/auth?redirect=checkout');
    }, [user, navigate]);

    useEffect(() => {
        if (user?.addresses?.length > 0) {
            const def = user.addresses.find(a => a.is_default);
            setSelectedAddress(def?.id || user.addresses[0].id);
        } else {
            setShowNewAddress(true);
        }
    }, [user]);

    const handleAddAddress = async () => {
        if (!newAddress.name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
            toast.error('Please fill all address fields'); return;
        }
        try {
            const { data } = await api.post('/auth/addresses', newAddress);
            updateUser(data.user);
            const addedAddr = data.user.addresses[data.user.addresses.length - 1];
            setSelectedAddress(addedAddr.id);
            setShowNewAddress(false);
            toast.success('Address added');
        } catch {
            toast.error('Failed to add address');
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) { toast.error('Select a delivery address'); return; }
        setLoading(true);
        try {
            const { data } = await api.post('/orders', { address_id: selectedAddress, payment_method: paymentMethod });
            toast.success('Order placed successfully!');
            navigate(`/profile`);
        } catch (e) {
            toast.error(e.response?.data?.detail || 'Failed to place order');
        }
        setLoading(false);
    };

    if (!user || items.length === 0) return null;

    return (
        <div data-testid="checkout-page" className="min-h-screen" style={{ background: '#050505' }}>
            <div className="section-container py-8 md:py-12 max-w-4xl mx-auto">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl tracking-tighter font-medium mb-8">
                    Checkout
                </motion.h1>

                {/* Steps */}
                <div className="flex items-center gap-4 mb-8">
                    {[{ num: 1, label: 'Address', icon: MapPin }, { num: 2, label: 'Payment', icon: CreditCard }].map(s => (
                        <button
                            key={s.num}
                            onClick={() => s.num <= step && setStep(s.num)}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${step >= s.num ? 'text-[#00FF66]' : 'text-zinc-600'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${step > s.num ? 'bg-[#00FF66] text-black' : step === s.num ? 'border-2 border-[#00FF66] text-[#00FF66]' : 'border border-zinc-700 text-zinc-600'}`}>
                                {step > s.num ? <Check size={14} /> : s.num}
                            </div>
                            <span className="hidden md:inline">{s.label}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {/* Step 1: Address */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="checkout-step-address">
                                <h2 className="text-lg font-medium mb-4">Delivery Address</h2>
                                {user.addresses?.length > 0 && !showNewAddress && (
                                    <div className="space-y-3 mb-4">
                                        {user.addresses.map(addr => (
                                            <label key={addr.id} data-testid={`address-option-${addr.id}`}
                                                className={`block glass rounded-xl p-4 cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-[#00FF66]/50 shadow-[0_0_15px_rgba(0,255,102,0.1)]' : ''}`}>
                                                <div className="flex items-start gap-3">
                                                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)}
                                                        className="mt-1 accent-[#00FF66]" />
                                                    <div>
                                                        <p className="text-sm font-medium">{addr.name} <span className="text-zinc-500 font-normal">({addr.phone})</span></p>
                                                        <p className="text-xs text-zinc-400 mt-1">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {!showNewAddress && (
                                    <button onClick={() => setShowNewAddress(true)} className="text-sm text-[#00FF66] hover:underline mb-4">+ Add New Address</button>
                                )}
                                {showNewAddress && (
                                    <div className="glass rounded-xl p-4 space-y-3 mb-4" data-testid="new-address-form">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input placeholder="Full Name *" value={newAddress.name} onChange={e => setNewAddress(p => ({ ...p, name: e.target.value }))}
                                                data-testid="addr-name" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                            <input placeholder="Phone *" value={newAddress.phone} onChange={e => setNewAddress(p => ({ ...p, phone: e.target.value }))}
                                                data-testid="addr-phone" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                        </div>
                                        <input placeholder="Street Address *" value={newAddress.street} onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))}
                                            data-testid="addr-street" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                        <div className="grid grid-cols-3 gap-3">
                                            <input placeholder="City *" value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))}
                                                data-testid="addr-city" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                            <input placeholder="State *" value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))}
                                                data-testid="addr-state" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                            <input placeholder="Pincode *" value={newAddress.pincode} onChange={e => setNewAddress(p => ({ ...p, pincode: e.target.value }))}
                                                data-testid="addr-pincode" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                        </div>
                                        <button onClick={handleAddAddress} data-testid="save-address-btn" className="btn-primary text-sm px-6 py-2">Save Address</button>
                                    </div>
                                )}
                                <button onClick={() => selectedAddress && setStep(2)} data-testid="continue-to-payment" className="w-full btn-primary text-sm py-3 mt-4">
                                    Continue to Payment
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="checkout-step-payment">
                                <h2 className="text-lg font-medium mb-4">Payment Method</h2>
                                <div className="space-y-3 mb-6">
                                    {[
                                        { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                                        { id: 'razorpay', label: 'Razorpay (Coming Soon)', desc: 'UPI, Cards, Net Banking', disabled: true },
                                    ].map(pm => (
                                        <label key={pm.id} className={`block glass rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === pm.id ? 'border-[#00FF66]/50' : ''} ${pm.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <div className="flex items-start gap-3">
                                                <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => !pm.disabled && setPaymentMethod(pm.id)}
                                                    disabled={pm.disabled} className="mt-1 accent-[#00FF66]" />
                                                <div>
                                                    <p className="text-sm font-medium">{pm.label}</p>
                                                    <p className="text-xs text-zinc-500">{pm.desc}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <button onClick={handlePlaceOrder} disabled={loading} data-testid="place-order-btn" className="w-full btn-primary text-sm py-3">
                                    {loading ? 'Placing Order...' : 'Place Order'}
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="glass rounded-2xl p-6 sticky top-24" data-testid="checkout-summary">
                            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {items.map(item => (
                                    <div key={item.product_id} className="flex gap-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0A0A0A] shrink-0">
                                            <img src={item.product?.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs truncate">{item.product?.name}</p>
                                            <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-xs font-medium shrink-0">{(item.product?.price * item.quantity).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-white/5 pt-3 space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-zinc-400">Subtotal</span><span>{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-zinc-400">Shipping</span><span className="text-[#00FF66]">Free</span></div>
                                <div className="flex justify-between font-medium text-lg pt-2 border-t border-white/5"><span>Total</span><span>{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
