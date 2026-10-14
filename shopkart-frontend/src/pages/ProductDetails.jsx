import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'

function ProductDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart, actionLoadingMap, getItemQuantityInCart } = useCart()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [addedNotice, setAddedNotice] = useState('')
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [wishlistSaving, setWishlistSaving] = useState(false)
    const [wishlistMessage, setWishlistMessage] = useState('')

    const isAddingToCart = actionLoadingMap[id] === 'adding'
    const inCartQty = getItemQuantityInCart(id)

    useEffect(() => {
        const fetchProductAndWishlist = async () => {
            setLoading(true)
            setError('')

            try {
                const response = await api.get(`/products/${id}`)
                setProduct(response.data.product)

                // Check wishlist status
                try {
                    const wishRes = await api.get('/wishlist')
                    const found = (wishRes.data.wishlist || []).some((item) => item._id === id)
                    setIsWishlisted(found)
                } catch {
                    // ignore if unauthenticated or wishlist error
                }
            } catch (err) {
                console.error(err)
                setError('Something went wrong while loading the product.')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchProductAndWishlist()
        }
    }, [id])

    const handleWishlistToggle = async () => {
        if (wishlistSaving || !product) return
        setWishlistSaving(true)
        setWishlistMessage('')

        try {
            if (!isWishlisted) {
                await api.post(`/wishlist/${product._id}`)
                setIsWishlisted(true)
                setWishlistMessage('♥ Added to Wishlist')
                window.dispatchEvent(new CustomEvent('wishlist-updated'))
            } else {
                await api.delete(`/wishlist/${product._id}`)
                setIsWishlisted(false)
                setWishlistMessage('Removed from Wishlist')
                window.dispatchEvent(new CustomEvent('wishlist-updated'))
            }
        } catch (err) {
            if (err.response?.status === 409) {
                setIsWishlisted(true)
                setWishlistMessage('Already in wishlist')
            } else {
                setWishlistMessage('Unable to update wishlist. Please try again.')
            }
        } finally {
            setWishlistSaving(false)
            setTimeout(() => setWishlistMessage(''), 3000)
        }
    }

    const handleAddToCart = async () => {
        if (!product || product.stock <= 0 || isAddingToCart) return
        const res = await addToCart(product._id, quantity)
        if (res.success) {
            setAddedNotice(`✓ Added ${quantity} item(s) to cart`)
        } else {
            setAddedNotice(res.message || 'Failed to add item to cart')
        }
        setTimeout(() => setAddedNotice(''), 3500)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
                {/* Breadcrumbs & Back Button */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <button
                            onClick={() => navigate('/')}
                            className="hover:text-blue-600 transition cursor-pointer font-medium"
                        >
                            Products
                        </button>
                        <span>/</span>
                        {product && (
                            <>
                                <span className="text-gray-600 font-medium">
                                    {product.category}
                                </span>
                                <span>/</span>
                                <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-sm">
                                    {product.name}
                                </span>
                            </>
                        )}
                    </nav>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl transition"
                    >
                        <span>←</span>
                        <span>Back to Store</span>
                    </button>
                </div>

                {loading ? (
                    <div className="py-28 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium text-sm">
                            Loading product details...
                        </p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-10 text-center max-w-md mx-auto my-12">
                        <p className="font-bold text-lg mb-2">Error</p>
                        <p className="text-sm mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition cursor-pointer"
                        >
                            Return to Store
                        </button>
                    </div>
                ) : !product ? (
                    <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-gray-100 shadow-xs">
                        <p className="text-gray-600 font-semibold">
                            Product not found
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Product Image Container */}
                            <div className="bg-gray-100/60 p-8 sm:p-12 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-200/80 relative">
                                <div className="relative group max-w-md w-full">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full max-h-[460px] object-contain rounded-2xl drop-shadow-md group-hover:scale-103 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null
                                            e.target.src =
                                                'https://placehold.co/600x500?text=No+Image'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Product Details Section */}
                            <div className="p-8 sm:p-10 flex flex-col justify-between">
                                <div>
                                    {/* Category & Status */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                                            {product.category}
                                        </span>

                                        <span
                                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                                product.stock > 0
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}
                                        >
                                            {product.stock > 0
                                                ? `✓ In Stock (${product.stock} units available)`
                                                : '✕ Out of Stock'}
                                        </span>
                                    </div>

                                    {/* Name */}
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                                        {product.name}
                                    </h1>

                                    {/* Price Box */}
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6 flex items-baseline gap-3">
                                        <span className="text-3xl sm:text-4xl font-black text-gray-900">
                                            ₹{Number(product.price).toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">
                                            Inclusive of all taxes
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Product Overview
                                        </h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                            {product.description}
                                        </p>
                                    </div>

                                    {/* Value Props */}
                                    <div className="grid grid-cols-2 gap-3 mb-8 text-xs text-gray-600">
                                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <span className="text-lg">⚡</span>
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    Free Delivery
                                                </p>
                                                <p className="text-[11px] text-gray-500">
                                                    2-4 Business Days
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <span className="text-lg">🔄</span>
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    Easy Returns
                                                </p>
                                                <p className="text-[11px] text-gray-500">
                                                    7 Days Replacement
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cart Controls */}
                                <div className="pt-6 border-t border-gray-100">
                                    {addedNotice && (
                                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-xl mb-4 flex items-center justify-between animate-fadeIn">
                                            <span>✓ Added {quantity} item(s) to cart (Demonstration)</span>
                                            <button
                                                onClick={() => setAddedNotice(false)}
                                                className="text-emerald-700 font-bold"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        {/* Quantity Counter (Visual) */}
                                        <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 p-1 w-full sm:w-auto justify-between">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setQuantity((q) =>
                                                        Math.max(1, q - 1)
                                                    )
                                                }
                                                className="w-9 h-9 flex items-center justify-center font-bold text-gray-600 hover:bg-white rounded-lg transition cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <span className="w-10 text-center font-bold text-sm text-gray-900">
                                                {quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setQuantity((q) =>
                                                        Math.min(
                                                            product.stock,
                                                            q + 1
                                                        )
                                                    )
                                                }
                                                className="w-9 h-9 flex items-center justify-center font-bold text-gray-600 hover:bg-white rounded-lg transition cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            type="button"
                                            disabled={product.stock <= 0 || isAddingToCart}
                                            onClick={handleAddToCart}
                                            className={`flex-1 w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                                                product.stock <= 0
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                                    : isAddingToCart
                                                    ? 'bg-blue-400 text-white cursor-wait opacity-90'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                            }`}
                                        >
                                            {isAddingToCart ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Adding to Cart...</span>
                                                </>
                                            ) : (
                                                <>
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
                                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                    </svg>
                                                    <span>
                                                        {product.stock <= 0
                                                            ? 'Out of Stock'
                                                            : inCartQty > 0
                                                            ? `Add to Cart (${inCartQty} in cart)`
                                                            : 'Add to Cart'}
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Wishlist Action Button */}
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            disabled={wishlistSaving}
                                            onClick={handleWishlistToggle}
                                            className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] ${
                                                wishlistSaving
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed opacity-80'
                                                    : isWishlisted
                                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {wishlistSaving ? (
                                                <>
                                                    <span>⏳</span>
                                                    <span>Saving...</span>
                                                </>
                                            ) : isWishlisted ? (
                                                <>
                                                    <span className="text-red-500">♥</span>
                                                    <span>Remove from Wishlist</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>♡</span>
                                                    <span>Save to Wishlist</span>
                                                </>
                                            )}
                                        </button>

                                        {wishlistMessage && (
                                            <p className="text-center text-xs font-semibold text-emerald-600 mt-2">
                                                {wishlistMessage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductDetails
