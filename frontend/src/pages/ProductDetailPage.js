import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, ChevronRight, Minus, Plus, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import { toast } from 'sonner';

export default function ProductDetailPage() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [related, setRelated] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [imageZoom, setImageZoom] = useState(false);
    const [bookingData, setBookingData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        setLoading(true);
        api.get(`/products/${id}`).then(r => {
            setProduct(r.data.product);
            setReviews(r.data.reviews || []);
            // Fetch related
            if (r.data.product.category) {
                api.get(`/products?category=${r.data.product.category}&limit=4`).then(rel => {
                    setRelated(rel.data.products.filter(p => p.id !== id));
                }).catch(() => {});
            }
            setLoading(false);
        }).catch(() => setLoading(false));
        window.scrollTo(0, 0);
    }, [id]);

    const handlePreBook = async () => {
        if (!bookingData.name || !bookingData.email) { toast.error('Name and email required'); return; }
        try {
            await api.post('/prebooking', { ...bookingData, product_id: id });
            toast.success('Pre-booking confirmed!');
            setBookingData({ name: '', email: '', phone: '' });
        } catch (e) {
            toast.error(e.response?.data?.detail || 'Failed');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
            <div className="w-8 h-8 border-2 border-[#00FF66]/20 border-t-[#00FF66] rounded-full animate-spin" />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
            <p className="text-zinc-500">Product not found</p>
        </div>
    );

    const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

    return (
        <div data-testid="product-detail-page" className="min-h-screen" style={{ background: '#050505' }}>
            <div className="section-container py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
                    <Link to="/" className="hover:text-white transition-colors">Home</Link>
                    <ChevronRight size={12} />
                    <Link to="/products" className="hover:text-white transition-colors">Products</Link>
                    <ChevronRight size={12} />
                    <Link to={`/products?category=${product.category}`} className="hover:text-white transition-colors">{product.category}</Link>
                    <ChevronRight size={12} />
                    <span className="text-zinc-300 truncate">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="relative">
                        <div
                            className={`glass rounded-2xl overflow-hidden aspect-square bg-[#0A0A0A] cursor-zoom-in ${imageZoom ? 'cursor-zoom-out' : ''}`}
                            onClick={() => setImageZoom(!imageZoom)}
                            data-testid="product-image-container"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className={`w-full h-full object-contain p-8 transition-transform duration-500 ${imageZoom ? 'scale-150' : ''}`}
                            />
                        </div>
                        {product.badge && (
                            <span className="absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30">
                                {product.badge}
                            </span>
                        )}
                    </motion.div>

                    {/* Details */}
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                        <p className="text-xs tracking-[0.2em] uppercase text-zinc-500 font-mono mb-2">{product.category}</p>
                        <h1 className="text-3xl md:text-4xl tracking-tight font-medium mb-4">{product.name}</h1>

                        {product.rating > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className={i < Math.round(product.rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-zinc-700'} />
                                    ))}
                                </div>
                                <span className="text-sm text-zinc-400">{product.rating} ({product.review_count} reviews)</span>
                            </div>
                        )}

                        <p className="text-base text-zinc-400 leading-relaxed mb-6">{product.description}</p>

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl font-semibold">{product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                            {product.original_price && (
                                <>
                                    <span className="text-lg text-zinc-600 line-through">{product.original_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                                    <span className="text-sm font-semibold text-[#00FF66]">{discount}% off</span>
                                </>
                            )}
                        </div>

                        {/* Features */}
                        {product.features?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold mb-3">Key Features</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {product.features.map(f => (
                                        <div key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                                            <Check size={14} className="text-[#00FF66] shrink-0" />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Specs */}
                        {product.specs && Object.keys(product.specs).length > 0 && (
                            <div className="mb-6 glass rounded-xl p-4">
                                <h3 className="text-sm font-semibold mb-3">Specifications</h3>
                                <div className="space-y-2">
                                    {Object.entries(product.specs).map(([key, val]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-zinc-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-zinc-300">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {product.is_coming_soon ? (
                            <div className="space-y-3 glass rounded-xl p-6" data-testid="prebook-form-detail">
                                <h3 className="text-sm font-semibold mb-2">Pre-Book This Product</h3>
                                <input placeholder="Your Name" value={bookingData.name} onChange={e => setBookingData(p => ({ ...p, name: e.target.value }))}
                                    data-testid="detail-prebook-name" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                <input type="email" placeholder="Email" value={bookingData.email} onChange={e => setBookingData(p => ({ ...p, email: e.target.value }))}
                                    data-testid="detail-prebook-email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none" />
                                <button onClick={handlePreBook} data-testid="detail-prebook-submit" className="w-full btn-primary text-sm py-3">
                                    Pre-Book Now
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center glass rounded-full">
                                        <button data-testid="qty-decrease" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white">
                                            <Minus size={16} />
                                        </button>
                                        <span data-testid="qty-value" className="w-10 text-center text-sm font-medium">{quantity}</span>
                                        <button data-testid="qty-increase" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <button data-testid="add-to-cart-detail" onClick={() => addToCart(product.id, quantity)} className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-3">
                                        <ShoppingCart size={16} /> Add to Cart
                                    </button>
                                </div>

                                {/* Trust badges */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { icon: Truck, label: 'Free Shipping' },
                                        { icon: Shield, label: '1 Year Warranty' },
                                        { icon: RotateCcw, label: '7-Day Returns' },
                                    ].map(b => (
                                        <div key={b.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                                            <b.icon size={12} className="text-[#00FF66]" />
                                            {b.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Reviews */}
                {reviews.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-medium mb-8">Customer Reviews</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="glass rounded-xl p-5 glass-hover">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-[#00FF66]/10 flex items-center justify-center text-xs font-bold text-[#00FF66]">
                                            {review.user_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{review.user_name}</p>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} className={i < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-zinc-700'} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-400">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Products */}
                {related.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-medium mb-8">Related Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {related.slice(0, 4).map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Buy Bar */}
            {!product.is_coming_soon && (
                <div data-testid="sticky-buy-bar" className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 lg:hidden" style={{ background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)' }}>
                    <div className="section-container flex items-center justify-between py-3">
                        <div>
                            <p className="text-lg font-semibold">{product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                            {product.original_price && <p className="text-xs text-zinc-500 line-through">{product.original_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>}
                        </div>
                        <button onClick={() => addToCart(product.id)} className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2">
                            <ShoppingCart size={14} /> Add to Cart
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
