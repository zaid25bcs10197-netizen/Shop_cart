import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartItem from '../components/CartItem'
import { useCart } from '../context/CartContext'

function Cart() {
    const navigate = useNavigate()
    const {
        cartItems,
        loading,
        error,
        actionLoadingMap,
        totalCount,
        subtotal,
        distinctItemCount,
        updateQuantity,
        removeFromCart,
        refreshCart
    } = useCart()

    const handleCheckout = () => {
        navigate('/checkout')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Cart Header Banner */}
            <div className="bg-white border-b border-gray-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">🛒</span>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                    My Cart
                                </h1>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                                {!loading && !error && (
                                    <span>
                                        {distinctItemCount}{' '}
                                        {distinctItemCount === 1 ? 'item' : 'items'} (
                                        {totalCount} total {totalCount === 1 ? 'unit' : 'units'}) in your shopping bag
                                    </span>
                                )}
                            </p>
                        </div>

                        {!loading && !error && cartItems.length > 0 && (
                            <button
                                onClick={() => navigate('/products')}
                                className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer self-start sm:self-auto"
                            >
                                <span>← Continue Shopping</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
                {/* State 1: Loading State */}
                {loading && (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="text-gray-900 font-bold text-lg">
                            Loading your cart...
                        </h2>
                        <p className="text-gray-500 text-xs mt-1">
                            Fetching your saved cart items from MongoDB
                        </p>
                    </div>
                )}

                {/* State 2: Error State */}
                {!loading && error && (
                    <div className="bg-white border border-red-200 rounded-3xl p-10 text-center max-w-md mx-auto my-12 shadow-sm">
                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                            ⚠️
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Unable to load your cart.
                        </h2>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={refreshCart}
                            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer shadow-md shadow-blue-500/20"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* State 3: Empty State */}
                {!loading && !error && cartItems.length === 0 && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
                        <div className="text-6xl mb-4 select-none">
                            🛒
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Your cart is empty 🛒
                        </h2>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Looks like you haven't added anything yet. Explore our latest electronics, fashion, and books!
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-7 py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-500/25 transition cursor-pointer"
                        >
                            Browse Products
                        </button>
                    </div>
                )}

                {/* State 4: Cart Populated (Items List + Order Summary) */}
                {!loading && !error && cartItems.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider px-2">
                                <span>Cart Items ({distinctItemCount})</span>
                                <span>Quantity & Total</span>
                            </div>

                            {cartItems
                                .filter((item) => item && item.product)
                                .map((item) => (
                                    <CartItem
                                        key={item.product._id || item._id}
                                        item={item}
                                        onUpdateQuantity={updateQuantity}
                                        onRemove={removeFromCart}
                                        isUpdating={actionLoadingMap[item.product._id] === 'updating'}
                                        isRemoving={actionLoadingMap[item.product._id] === 'removing'}
                                    />
                                ))}

                            {/* Cart Helper Note */}
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-700 flex items-center gap-2">
                                <span>💡</span>
                                <span>Stock limits are checked automatically. Quantities cannot exceed live stock in MongoDB.</span>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-4 sticky top-24">
                            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-sm">
                                <h2 className="text-lg font-black text-gray-900 mb-5 pb-4 border-b border-gray-100">
                                    Order Summary
                                </h2>

                                <div className="space-y-3.5 text-sm mb-6">
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Distinct Items</span>
                                        <span className="font-bold text-gray-900">{distinctItemCount}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Total Units</span>
                                        <span className="font-bold text-gray-900">{totalCount}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-extrabold text-gray-900">
                                            ₹{subtotal.toLocaleString('en-IN')}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Estimated Delivery</span>
                                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                                            FREE
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
                                        <div>
                                            <span className="text-base font-extrabold text-gray-900 block">
                                                Total Amount
                                            </span>
                                            <span className="text-[11px] text-gray-400 font-medium">
                                                Including GST
                                            </span>
                                        </div>
                                        <span className="text-2xl font-black text-blue-600">
                                            ₹{subtotal.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                {/* Proceed to Checkout Button */}
                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                                >
                                    <span>Proceed to Checkout</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </button>

                                {/* Trust Highlights */}
                                <div className="mt-6 pt-5 border-t border-gray-100 space-y-2.5 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span>Persistent Cart saved to MongoDB</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span>7-day Replacement & Easy Return</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span>100% Genuine and Verified Products</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Cart
