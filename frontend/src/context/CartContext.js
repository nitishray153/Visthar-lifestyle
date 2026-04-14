import { createContext, useContext, useState, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [cartLoading, setCartLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        try {
            const { data } = await api.get('/cart');
            setItems(data.items || []);
            setTotal(data.total || 0);
        } catch {
            // silently fail
        }
    }, []);

    const addToCart = async (productId, quantity = 1) => {
        setCartLoading(true);
        try {
            await api.post('/cart/add', { product_id: productId, quantity });
            await fetchCart();
            toast.success('Added to cart');
        } catch (e) {
            toast.error(e.response?.data?.detail || 'Failed to add to cart');
        }
        setCartLoading(false);
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            await api.put(`/cart/update/${productId}`, { quantity });
            await fetchCart();
        } catch {
            toast.error('Failed to update cart');
        }
    };

    const removeItem = async (productId) => {
        try {
            await api.delete(`/cart/remove/${productId}`);
            await fetchCart();
            toast.success('Removed from cart');
        } catch {
            toast.error('Failed to remove item');
        }
    };

    const clearCart = async () => {
        try {
            await api.delete('/cart/clear');
            setItems([]);
            setTotal(0);
        } catch {
            // silently fail
        }
    };

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, total, cartCount, cartLoading, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
