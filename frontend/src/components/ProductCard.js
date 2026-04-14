import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product, index = 0 }) {
    const { addToCart } = useCart();

    const badgeColors = {
        'Best Seller': 'bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/30',
        'Eco': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        'New': 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30',
        'Premium': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        'Popular': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        'Coming Soon': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    };

    const discount = product.original_price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : 0;

    return (
        <motion.div
            data-testid={`product-card-${product.id}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="product-card glass rounded-2xl overflow-hidden group"
        >
            {/* Image */}
            <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-[#0A0A0A]">
                <img
                    src={product.image}
                    alt={product.name}
                    className="product-image w-full h-full object-cover"
                    loading="lazy"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge */}
                {product.badge && (
                    <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${badgeColors[product.badge] || 'bg-white/10 text-white border-white/20'}`}>
                        {product.badge}
                    </span>
                )}

                {/* Discount */}
                {discount > 0 && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        -{discount}%
                    </span>
                )}

                {/* Quick actions */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <Link
                        to={`/product/${product.id}`}
                        data-testid={`view-product-${product.id}`}
                        className="w-9 h-9 rounded-full glass flex items-center justify-center text-white hover:text-[#00FF66] transition-colors"
                    >
                        <Eye size={14} />
                    </Link>
                    {!product.is_coming_soon && (
                        <button
                            data-testid={`add-to-cart-quick-${product.id}`}
                            onClick={(e) => { e.preventDefault(); addToCart(product.id); }}
                            className="w-9 h-9 rounded-full bg-[#00FF66] flex items-center justify-center text-black hover:bg-[#39FF14] transition-colors"
                        >
                            <ShoppingCart size={14} />
                        </button>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono mb-1">{product.category}</p>
                <Link to={`/product/${product.id}`} className="block">
                    <h3 className="text-sm font-medium text-white truncate hover:text-[#00FF66] transition-colors">{product.name}</h3>
                </Link>

                {/* Rating */}
                {product.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                        <Star size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
                        <span className="text-xs text-zinc-400">{product.rating}</span>
                        <span className="text-xs text-zinc-600">({product.review_count})</span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-semibold text-white">
                        {product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </span>
                    {product.original_price && (
                        <span className="text-xs text-zinc-600 line-through">
                            {product.original_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                        </span>
                    )}
                </div>

                {/* CTA */}
                {product.is_coming_soon ? (
                    <Link to={`/product/${product.id}`} data-testid={`prebook-btn-${product.id}`} className="mt-3 w-full block text-center text-xs font-semibold py-2 rounded-full border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-colors">
                        Pre-Book Now
                    </Link>
                ) : (
                    <button
                        data-testid={`add-to-cart-${product.id}`}
                        onClick={() => addToCart(product.id)}
                        className="mt-3 w-full btn-primary text-xs py-2"
                    >
                        Add to Cart
                    </button>
                )}
            </div>
        </motion.div>
    );
}
