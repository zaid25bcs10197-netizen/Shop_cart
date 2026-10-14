import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

function ProductCard({ product, initialIsWishlisted = false, onWishlistToggle }) {
    const navigate = useNavigate()
    const { addToCart, actionLoadingMap, getItemQuantityInCart } = useCart()

    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted)
    const [isSaving, setIsSaving] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [isError, setIsError] = useState(false)

    const isAdding = actionLoadingMap[product._id] === 'adding'
    const inCartQty = getItemQuantityInCart(product._id)

    useEffect(() => {
        setIsWishlisted(initialIsWishlisted)
    }, [initialIsWishlisted])

    const handleWishlistClick = async (e) => {
        e.stopPropagation()

        // Prevent duplicate requests while saving
        if (isSaving) return

        setIsSaving(true)
        setStatusMessage('')
        setIsError(false)

        try {
            if (!isWishlisted) {
                // Add to wishlist
                const response = await api.post(`/wishlist/${product._id}`)
                if (response.data.success || response.status === 200 || response.status === 201) {
                    setIsWishlisted(true)
                    setStatusMessage('♥ Added to Wishlist')
                    window.dispatchEvent(new CustomEvent('wishlist-updated'))
                    if (onWishlistToggle) {
                        onWishlistToggle(product._id, true)
                    }
                }
            } else {
                // Bonus Task 23: Remove/toggle from wishlist
                const response = await api.delete(`/wishlist/${product._id}`)
                if (response.data.success || response.status === 200) {
                    setIsWishlisted(false)
                    setStatusMessage('Removed from Wishlist')
                    window.dispatchEvent(new CustomEvent('wishlist-updated'))
                    if (onWishlistToggle) {
                        onWishlistToggle(product._id, false)
                    }
                }
            }
        } catch (err) {
            console.error('Wishlist action error:', err)
            setIsError(true)

            if (err.response?.status === 409) {
                setIsWishlisted(true)
                setStatusMessage('Already in wishlist')
            } else if (err.response?.status === 401) {
                setStatusMessage('Please login to save')
            } else {
                setStatusMessage('Unable to save product. Please try again.')
            }
        } finally {
            setIsSaving(false)
            setTimeout(() => {
                setStatusMessage('')
                setIsError(false)
            }, 3000)
        }
    }

    const handleAddToCart = async (e) => {
        e.stopPropagation()
        if (product.stock <= 0 || isAdding) return

        const result = await addToCart(product._id)
        if (result.success) {
            setIsError(false)
            setStatusMessage('✓ Added to Cart')
        } else {
            setIsError(true)
            setStatusMessage(result.message || 'Failed to add')
        }

        setTimeout(() => {
            setStatusMessage('')
            setIsError(false)
        }, 3000)
    }

    const categoryColors = {
        Electronics: 'bg-blue-50 text-blue-700 border-blue-100',
        Fashion: 'bg-purple-50 text-purple-700 border-purple-100',
        Books: 'bg-amber-50 text-amber-700 border-amber-100',
        Home: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    }

    const badgeStyle =
        categoryColors[product.category] ||
        'bg-gray-50 text-gray-700 border-gray-100'

    return (
        <div className="group bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-200/70 hover:border-blue-200 hover:-translate-y-1 relative">
            {/* Image Box */}
            <div className="w-full h-56 bg-gray-50 relative overflow-hidden flex items-center justify-center">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://placehold.co/400x300?text=No+Image'
                    }}
                />

                {/* Category Badge */}
                <span
                    className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-xs border backdrop-blur-xs ${badgeStyle}`}
                >
                    {product.category}
                </span>

                {/* Floating Wishlist Heart Icon Button (Quick Action) */}
                <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleWishlistClick}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md ${
                        isWishlisted
                            ? 'bg-red-500 text-white shadow-red-500/30 hover:scale-110'
                            : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 hover:scale-110'
                    } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                    {isSaving ? (
                        <span className="text-xs animate-spin">⏳</span>
                    ) : (
                        <span className="text-base leading-none">
                            {isWishlisted ? '♥' : '♡'}
                        </span>
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3
                        className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1"
                        title={product.name}
                    >
                        {product.name}
                    </h3>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-3">
                        {product.description}
                    </p>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-auto">
                    {/* Price & Stock status */}
                    <div className="flex items-center justify-between mb-3.5">
                        <div>
                            <span className="text-xs text-gray-400 block font-medium">
                                Price
                            </span>
                            <span className="text-xl font-black text-gray-900">
                                ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                        </div>

                        <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                product.stock > 0
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                            }`}
                        >
                            {product.stock > 0 ? `${product.stock} units left` : 'Sold out'}
                        </span>
                    </div>

                    {/* Status / Feedback Banner if active */}
                    {statusMessage && (
                        <div
                            className={`text-[11px] font-bold py-1 px-2.5 rounded-lg mb-2 text-center transition-all ${
                                isError
                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                        >
                            {statusMessage}
                        </div>
                    )}

                    {/* Card Actions: [ View Details ] [ Add to Cart / Add Another ] */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* View Details */}
                        <button
                            type="button"
                            onClick={() => navigate(`/products/${product._id}`)}
                            className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                        >
                            <span>Details</span>
                            <span>→</span>
                        </button>

                        {/* Task 7: Add to Cart Button with all states */}
                        <button
                            type="button"
                            disabled={product.stock <= 0 || isAdding}
                            onClick={handleAddToCart}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-xs active:scale-95 ${
                                product.stock <= 0
                                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                    : isAdding
                                    ? 'bg-blue-400 text-white cursor-wait opacity-90'
                                    : inCartQty > 0
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                            }`}
                        >
                            {isAdding ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Adding...</span>
                                </>
                            ) : product.stock <= 0 ? (
                                <span>Sold Out</span>
                            ) : inCartQty > 0 ? (
                                <>
                                    <span>+ Add Another</span>
                                    <span className="text-[10px] font-extrabold opacity-80">
                                        ({inCartQty})
                                    </span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-3.5 h-3.5"
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
                                    <span>Add to Cart</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
