import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CartItem({ item, onUpdateQuantity, onRemove, isUpdating = false, isRemoving = false }) {
    const navigate = useNavigate()
    const { product, quantity } = item
    const [actionFeedback, setActionFeedback] = useState('')

    if (!product) return null

    const isAtMaxStock = quantity >= product.stock
    const isAtMinQuantity = quantity <= 1
    const lineTotal = (Number(product.price) || 0) * quantity

    const handleIncrease = async () => {
        if (isAtMaxStock || isUpdating || isRemoving) return
        const res = await onUpdateQuantity(product._id, quantity + 1)
        if (!res.success) {
            setActionFeedback(res.message || 'Unable to increase quantity')
            setTimeout(() => setActionFeedback(''), 3000)
        }
    }

    const handleDecrease = async () => {
        if (isAtMinQuantity || isUpdating || isRemoving) return
        const res = await onUpdateQuantity(product._id, quantity - 1)
        if (!res.success) {
            setActionFeedback(res.message || 'Unable to decrease quantity')
            setTimeout(() => setActionFeedback(''), 3000)
        }
    }

    const handleRemoveClick = async () => {
        if (isRemoving || isUpdating) return
        const res = await onRemove(product._id)
        if (!res.success) {
            setActionFeedback(res.message || 'Unable to remove item')
            setTimeout(() => setActionFeedback(''), 3000)
        }
    }

    return (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:border-blue-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
            {/* Left: Product Image & Details */}
            <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                {/* Thumbnail Image */}
                <div
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden cursor-pointer group"
                >
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://placehold.co/200x200?text=No+Image'
                        }}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                        {product.category}
                    </span>
                    <h3
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="text-sm sm:text-base font-bold text-gray-900 hover:text-blue-600 transition cursor-pointer truncate"
                        title={product.name}
                    >
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Unit Price: <span className="font-semibold text-gray-800">₹{Number(product.price).toLocaleString('en-IN')}</span>
                    </p>

                    {/* Stock Alert / Badge */}
                    <div className="flex items-center gap-2 mt-1.5">
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                product.stock > 5
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : product.stock > 0
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                            }`}
                        >
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>

                        {isAtMaxStock && (
                            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50/80 px-1.5 py-0.5 rounded">
                                Max stock reached
                            </span>
                        )}
                    </div>

                    {actionFeedback && (
                        <p className="text-xs text-red-600 font-semibold mt-1">
                            {actionFeedback}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: Quantity Controls, Subtotal & Remove Button */}
            <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                {/* Quantity Controls: [-] Qty [+] */}
                <div className="flex flex-col items-center">
                    <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                        {/* Decrement [-] */}
                        <button
                            type="button"
                            disabled={isAtMinQuantity || isUpdating || isRemoving}
                            onClick={handleDecrease}
                            title={isAtMinQuantity ? 'Minimum quantity is 1 (use Remove instead)' : 'Decrease quantity'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base transition-colors ${
                                isAtMinQuantity || isUpdating || isRemoving
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-white hover:text-blue-600 shadow-xs cursor-pointer'
                            }`}
                        >
                            -
                        </button>

                        {/* Quantity Number */}
                        <div className="w-10 text-center text-sm font-extrabold text-gray-900 select-none flex items-center justify-center">
                            {isUpdating ? (
                                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                quantity
                            )}
                        </div>

                        {/* Increment [+] */}
                        <button
                            type="button"
                            disabled={isAtMaxStock || isUpdating || isRemoving}
                            onClick={handleIncrease}
                            title={isAtMaxStock ? `Max available stock is ${product.stock}` : 'Increase quantity'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base transition-colors ${
                                isAtMaxStock || isUpdating || isRemoving
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-white hover:text-blue-600 shadow-xs cursor-pointer'
                            }`}
                        >
                            +
                        </button>
                    </div>

                    <span className="text-[10px] text-gray-400 mt-1 font-medium">
                        Qty: {quantity}
                    </span>
                </div>

                {/* Line Total */}
                <div className="text-right min-w-[100px]">
                    <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">
                        Item Total
                    </span>
                    <span className="text-base sm:text-lg font-black text-gray-900">
                        ₹{lineTotal.toLocaleString('en-IN')}
                    </span>
                </div>

                {/* Remove Button */}
                <button
                    type="button"
                    disabled={isRemoving || isUpdating}
                    onClick={handleRemoveClick}
                    title="Remove item from cart"
                    className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 active:bg-red-100 transition cursor-pointer border border-transparent hover:border-red-100 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRemoving ? (
                        <>
                            <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Removing...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Remove</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default CartItem
