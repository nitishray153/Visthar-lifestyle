import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [sort, setSort] = useState('newest');

    const activeCategory = searchParams.get('category') || '';

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {});
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (activeCategory) params.set('category', activeCategory);
        if (search) params.set('search', search);
        if (sort) params.set('sort', sort);

        api.get(`/products?${params.toString()}`).then(r => {
            setProducts(r.data.products);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [activeCategory, search, sort]);

    const setCategory = (cat) => {
        const newParams = new URLSearchParams(searchParams);
        if (cat) newParams.set('category', cat);
        else newParams.delete('category');
        setSearchParams(newParams);
    };

    return (
        <div data-testid="products-page" className="min-h-screen" style={{ background: '#050505' }}>
            <div className="section-container py-8 md:py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium mb-2">
                        {activeCategory || 'All Products'}
                    </h1>
                    <p className="text-sm text-zinc-500">Premium tech accessories for the modern lifestyle</p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            data-testid="products-search-input"
                            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#00FF66]/50 focus:outline-none"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        data-testid="products-sort-select"
                        className="bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white focus:border-[#00FF66]/50 focus:outline-none appearance-none cursor-pointer"
                    >
                        <option value="newest">Newest</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none" data-testid="category-tabs">
                    <button
                        onClick={() => setCategory('')}
                        className={`shrink-0 text-xs font-medium px-4 py-2 rounded-full border transition-all ${!activeCategory ? 'bg-[#00FF66] text-black border-[#00FF66]' : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/20'}`}
                    >
                        All
                    </button>
                    {[...categories, 'Coming Soon'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            data-testid={`filter-${cat.toLowerCase().replace(/\s/g, '-')}`}
                            className={`shrink-0 text-xs font-medium px-4 py-2 rounded-full border transition-all ${activeCategory === cat ? 'bg-[#00FF66] text-black border-[#00FF66]' : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/20'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                                <div className="aspect-square bg-zinc-800" />
                                <div className="p-4 space-y-2">
                                    <div className="h-3 bg-zinc-800 rounded w-1/3" />
                                    <div className="h-4 bg-zinc-800 rounded w-2/3" />
                                    <div className="h-5 bg-zinc-800 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-zinc-500">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map((product, i) => (
                            <ProductCard key={product.id} product={product} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
