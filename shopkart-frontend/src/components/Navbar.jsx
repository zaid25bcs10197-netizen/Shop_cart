import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { totalCount } = useCart()
    const [wishlistCount, setWishlistCount] = useState(0)

    const fetchWishlistCount = async () => {
        try {
            const response = await api.get('/wishlist')
            const count = response.data.count ?? (response.data.wishlist?.length || 0)
            setWishlistCount(count)
        } catch {
            // Silently ignore if unauthenticated or on public routes
        }
    }

    useEffect(() => {
        fetchWishlistCount()

        const handleWishlistUpdate = () => {
            fetchWishlistCount()
        }

        window.addEventListener('wishlist-updated', handleWishlistUpdate)
        return () => {
            window.removeEventListener('wishlist-updated', handleWishlistUpdate)
        }
    }, [])

    const handleLogout = async () => {
        try {
            await api.post('/customers/logout')
            window.dispatchEvent(new CustomEvent('auth-changed'))
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error.response?.data)
            navigate('/login')
        }
    }

    const isProductsActive =
        location.pathname === '/' ||
        location.pathname === '/products' ||
        location.pathname.startsWith('/products/')

    const isWishlistActive = location.pathname === '/wishlist'
    const isCartActive = location.pathname === '/cart'
    const isOrdersActive = location.pathname.startsWith('/orders') || location.pathname.startsWith('/order-success')

    const isProfileActive =
        location.pathname === '/profile' || location.pathname === '/home'

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.2"
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xl font-black tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                                Shop<span className="text-blue-600">Kart</span>
                            </span>
                        </div>
                    </button>

                    {/* Navigation Menu */}
                    <nav className="flex items-center gap-1.5 sm:gap-2.5">
                        {/* Products / Store Link */}
                        <button
                            onClick={() => navigate('/')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                isProductsActive
                                    ? 'bg-blue-50 text-blue-600 shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                            }`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                />
                            </svg>
                            <span>Products</span>
                        </button>

                        {/* Task 8 + Bonus Task 24: Wishlist Link with dynamic backend count */}
                        <button
                            onClick={() => navigate('/wishlist')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                isWishlistActive
                                    ? 'bg-red-50 text-red-600 shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                            }`}
                        >
                            <svg
                                className={`w-4 h-4 ${isWishlistActive ? 'fill-red-600' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <span>Wishlist</span>
                            {wishlistCount > 0 && (
                                <span className="bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                    {wishlistCount}
                                </span>
                            )}
                        </button>

                        {/* Task 16: Cart Link with dynamic total quantity count */}
                        <button
                            id="nav-cart-btn"
                            onClick={() => navigate('/cart')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                isCartActive
                                    ? 'bg-blue-50 text-blue-600 shadow-xs ring-1 ring-blue-500/20'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                            }`}
                        >
                            <svg
                                className={`w-4 h-4 ${isCartActive ? 'text-blue-600' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.2"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <span>Cart ({totalCount})</span>
                        </button>

                        {/* Lab 06: My Orders Link */}
                        <button
                            id="nav-orders-btn"
                            onClick={() => navigate('/orders')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                isOrdersActive
                                    ? 'bg-blue-50 text-blue-600 shadow-xs ring-1 ring-blue-500/20'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                            }`}
                        >
                            <svg
                                className={`w-4 h-4 ${isOrdersActive ? 'text-blue-600' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                            </svg>
                            <span className="hidden sm:inline">Orders</span>
                        </button>

                        {/* My Profile Link */}
                        <button
                            onClick={() => navigate('/profile')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                isProfileActive
                                    ? 'bg-blue-50 text-blue-600 shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                            }`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            <span className="hidden sm:inline">My Profile</span>
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 ml-1 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition-all cursor-pointer border border-transparent hover:border-red-100"
                            title="Sign out of your account"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Navbar