import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingCart, DollarSign, Bell, BookOpen, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const statusLabels = { placed: 'Placed', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
const statusFlow = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="glass rounded-xl p-5 glass-hover">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={18} style={{ color }} />
                </div>
                <div>
                    <p className="text-2xl font-semibold">{value}</p>
                    <p className="text-xs text-zinc-500">{label}</p>
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [prebookings, setPrebookings] = useState([]);
    const [oem, setOem] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/auth'); return; }
        loadDashboard();
    }, [user, navigate]);

    const loadDashboard = async () => {
        try {
            const [dashRes, ordersRes, usersRes, productsRes, prebookRes, oemRes] = await Promise.all([
                api.get('/admin/dashboard'),
                api.get('/admin/orders'),
                api.get('/admin/users'),
                api.get('/admin/products'),
                api.get('/prebooking'),
                api.get('/oem/inquiries'),
            ]);
            setStats(dashRes.data.stats);
            setOrders(ordersRes.data.orders);
            setUsers(usersRes.data.users);
            setProducts(productsRes.data.products);
            setPrebookings(prebookRes.data.prebookings);
            setOem(oemRes.data.inquiries);
        } catch {
            toast.error('Failed to load admin data');
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order updated to ${statusLabels[newStatus]}`);
            const { data } = await api.get('/admin/orders');
            setOrders(data.orders);
        } catch {
            toast.error('Failed to update order');
        }
    };

    if (!user || user.role !== 'admin') return null;
    if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}><div className="w-8 h-8 border-2 border-[#00FF66]/20 border-t-[#00FF66] rounded-full animate-spin" /></div>;

    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'orders', label: `Orders (${orders.length})` },
        { id: 'products', label: `Products (${products.length})` },
        { id: 'users', label: `Users (${users.length})` },
        { id: 'prebookings', label: `Pre-bookings (${prebookings.length})` },
        { id: 'oem', label: `OEM (${oem.length})` },
    ];

    return (
        <div data-testid="admin-page" className="min-h-screen" style={{ background: '#050505' }}>
            <div className="section-container py-8 md:py-12">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl tracking-tighter font-medium mb-6">
                    Admin Panel
                </motion.h1>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-8" data-testid="admin-tabs">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            data-testid={`admin-tab-${t.id}`}
                            className={`shrink-0 text-xs font-medium px-4 py-2 rounded-full border transition-all ${tab === t.id ? 'bg-[#00FF66] text-black border-[#00FF66]' : 'bg-white/5 text-zinc-400 border-white/10'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Dashboard */}
                {tab === 'dashboard' && stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard icon={DollarSign} label="Revenue" value={`₹${(stats.total_revenue || 0).toLocaleString()}`} color="#00FF66" />
                        <StatCard icon={ShoppingCart} label="Orders" value={stats.total_orders} color="#D4AF37" />
                        <StatCard icon={Package} label="Products" value={stats.total_products} color="#A78BFA" />
                        <StatCard icon={Users} label="Users" value={stats.total_users} color="#38BDF8" />
                        <StatCard icon={Bell} label="Pre-bookings" value={stats.total_prebookings} color="#F472B6" />
                        <StatCard icon={BookOpen} label="OEM Leads" value={stats.total_oem_inquiries} color="#FB923C" />
                    </div>
                )}

                {/* Orders */}
                {tab === 'orders' && (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order.id} data-testid={`admin-order-${order.id}`} className="glass rounded-xl p-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium">{order.order_number}</p>
                                        <p className="text-xs text-zinc-500">{order.user_name} &middot; {order.user_email}</p>
                                        <p className="text-xs text-zinc-500">{order.items.length} items &middot; {order.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full ${order.status === 'delivered' ? 'bg-[#00FF66]/15 text-[#00FF66]' : order.status === 'cancelled' ? 'bg-red-500/15 text-red-400' : 'bg-[#D4AF37]/15 text-[#D4AF37]'}`}>
                                            {statusLabels[order.status]}
                                        </span>
                                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                            <select
                                                data-testid={`order-status-select-${order.id}`}
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                            >
                                                {statusFlow.map(s => (
                                                    <option key={s} value={s}>{statusLabels[s]}</option>
                                                ))}
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="text-center text-zinc-500 py-12">No orders yet</p>}
                    </div>
                )}

                {/* Products */}
                {tab === 'products' && (
                    <div className="space-y-3">
                        {products.map(p => (
                            <div key={p.id} className="glass rounded-xl p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0A0A0A] shrink-0">
                                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{p.name}</p>
                                    <p className="text-xs text-zinc-500">{p.category} &middot; Stock: {p.stock}</p>
                                </div>
                                <p className="text-sm font-medium shrink-0">{p.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Users */}
                {tab === 'users' && (
                    <div className="space-y-3">
                        {users.map(u => (
                            <div key={u.id} className="glass rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{u.name}</p>
                                    <p className="text-xs text-zinc-500">{u.email}</p>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-white/5 text-zinc-400'}`}>
                                    {u.role}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pre-bookings */}
                {tab === 'prebookings' && (
                    <div className="space-y-3">
                        {prebookings.map(b => (
                            <div key={b.id} className="glass rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{b.name}</p>
                                        <p className="text-xs text-zinc-500">{b.email} &middot; {b.phone || 'No phone'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-400">{b.product_name}</p>
                                        <p className="text-xs text-zinc-600">{new Date(b.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {prebookings.length === 0 && <p className="text-center text-zinc-500 py-12">No pre-bookings yet</p>}
                    </div>
                )}

                {/* OEM */}
                {tab === 'oem' && (
                    <div className="space-y-3">
                        {oem.map(o => (
                            <div key={o.id} className="glass rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">{o.company_name}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#00FF66]/15 text-[#00FF66]">{o.status}</span>
                                </div>
                                <p className="text-xs text-zinc-500">{o.contact_name} &middot; {o.email} &middot; {o.phone}</p>
                                <p className="text-xs text-zinc-400 mt-1">Interest: {o.product_interest} &middot; Qty: {o.quantity}</p>
                                {o.message && <p className="text-xs text-zinc-500 mt-1 italic">{o.message}</p>}
                            </div>
                        ))}
                        {oem.length === 0 && <p className="text-center text-zinc-500 py-12">No OEM inquiries yet</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
