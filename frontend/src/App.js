import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="w-8 h-8 border-2 border-[#00FF66]/20 border-t-[#00FF66] rounded-full animate-spin" />
    </div>
);

function App() {
    const [showLoading, setShowLoading] = useState(true);

    const handleLoadingComplete = useCallback(() => {
        setShowLoading(false);
    }, []);

    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
                    <div className={`min-h-screen transition-opacity duration-700 ${showLoading ? 'opacity-0' : 'opacity-100'}`} style={{ background: '#050505' }}>
                        <Navbar />
                        <main className="pt-16 md:pt-20">
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/products" element={<ProductsPage />} />
                                    <Route path="/product/:id" element={<ProductDetailPage />} />
                                    <Route path="/cart" element={<CartPage />} />
                                    <Route path="/checkout" element={<CheckoutPage />} />
                                    <Route path="/auth" element={<AuthPage />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/admin" element={<AdminPage />} />
                                </Routes>
                            </Suspense>
                        </main>
                        <Footer />
                    </div>
                    <Toaster position="top-right" theme="dark" />
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
