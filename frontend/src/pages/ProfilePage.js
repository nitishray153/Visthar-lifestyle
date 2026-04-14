import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, User, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const statusFlow = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const statusLabels = { placed: 'Placed', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

function OrderCard({ order }) {
    const [expanded, setExpanded] = useState(false);
    const currentIndex = statusFlow.indexOf(order.status);

    return (
        <div data-testid={`order-${order.id}`} className="glass rounded-xl overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0A0A0A] shrink-0">
                        {order.items[0]?.image && <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{order.order_number}</p>
                        <p className="text-xs text-zinc-500">{order.items.length} item(s) &middot; {order.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${order.status === 'delivered' ? 'bg-[#00FF66]/15 text-[#00FF66]' : order.status === 'cancelled' ? 'bg-red-500/15 text-red-400' : 'bg-[#D4AF37]/15 text-[#D4AF37]'}`}>
                        {statusLabels[order.status] || order.status}
                    </span>
                    <ChevronRight size={16} className={`text-zinc-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </div>
            </button>

            {expanded && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-white/5 p-4">
                    {/* Progress bar */}
                    {order.status !== 'cancelled' && (
                        <div className="mb-6" data-testid={`tracking-${order.id}`}>
                            <div className="flex items-center justify-between mb-2">
                                {statusFlow.map((s, i) => (
                                    <div key={s} className="flex flex-col items-center flex-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i <= currentIndex ? 'bg-[#00FF66] text-black' : 'bg-zinc-800 text-zinc-600'}`}>
                                            {i < currentIndex ? '✓' : i + 1}
                                        </div>
                                        <p className="text-[9px] text-zinc-500 mt-1 text-center hidden md:block">{statusLabels[s]}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="h-1 bg-zinc-800 rounded-full relative mt-1">
                                <div className="h-full bg-[#00FF66] rounded-full transition-all" style={{ width: `${(currentIndex / (statusFlow.length - 1)) * 100}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2 mb-4">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded bg-[#0A0A0A] overflow-hidden shrink-0">
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className="flex-1 text-zinc-300 truncate">{item.name}</span>
                                <span className="text-zinc-500">x{item.quantity}</span>
                                <span className="text-zinc-300">{item.subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                            </div>
                        ))}
                    </div>

                    {/* Details */}
                    <div className="text-xs text-zinc-500 space-y-1">
                        <p>Tracking ID: <span className="text-zinc-300 font-mono">{order.tracking_id}</span></p>
                        <p>Payment: <span className="text-zinc-300 capitalize">{order.payment_method}</span></p>
                        <p>Address: <span className="text-zinc-300">{order.address?.street}, {order.address?.city}</span></p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [tab, setTab] = useState('orders');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/auth'); return; }
        api.get('/orders').then(r => { setOrders(r.data.orders); setLoading(false); }).catch(() => setLoading(false));
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div data-testid="profile-page" className="min-h-screen" style={{ background: '#050505' }}>
            <div className="section-container py-8 md:py-12 max-w-4xl mx-auto">
                {/* User Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-8 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#00FF66]/10 flex items-center justify-center text-lg font-bold text-[#00FF66]">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-xl font-medium">{user.name}</h1>
                        <p className="text-sm text-zinc-500">{user.email}</p>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[{ id: 'orders', label: 'My Orders', icon: Package }, { id: 'addresses', label: 'Addresses', icon: MapPin }, { id: 'profile', label: 'Profile', icon: User }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            data-testid={`profile-tab-${t.id}`}
                            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-all ${tab === t.id ? 'bg-[#00FF66] text-black border-[#00FF66]' : 'bg-white/5 text-zinc-400 border-white/10'}`}>
                            <t.icon size={14} /> {t.label}
                        </button>
                    ))}
                </div>

                {/* Orders Tab */}
                {tab === 'orders' && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12"><div className="w-6 h-6 border-2 border-[#00FF66]/20 border-t-[#00FF66] rounded-full animate-spin mx-auto" /></div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package size={40} className="text-zinc-700 mx-auto mb-3" />
                                <p className="text-zinc-500">No orders yet</p>
                            </div>
                        ) : (
                            orders.map(order => <OrderCard key={order.id} order={order} />)
                        )}
                    </div>
                )}

                {/* Addresses Tab */}
                {tab === 'addresses' && (
                    <div className="space-y-3">
                        {user.addresses?.length === 0 ? (
                            <p className="text-zinc-500 text-center py-12">No saved addresses</p>
                        ) : (
                            user.addresses?.map(addr => (
                                <div key={addr.id} className="glass rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{addr.name} <span className="text-zinc-500">({addr.phone})</span></p>
                                        <p className="text-xs text-zinc-400">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                    </div>
                                    {addr.is_default && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00FF66]/15 text-[#00FF66]">Default</span>}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {tab === 'profile' && (
                    <div className="glass rounded-2xl p-6 space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1">Name</label>
                            <p className="text-sm">{user.name}</p>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1">Email</label>
                            <p className="text-sm">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1">Phone</label>
                            <p className="text-sm">{user.phone || 'Not set'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1">Role</label>
                            <p className="text-sm capitalize">{user.role}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
