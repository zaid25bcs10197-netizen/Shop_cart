import { useNavigate } from 'react-router-dom'

function WishlistCard({ product, onRemove, isRemoving = false }) {
    const navigate = useNavigate()

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
        <div className="group bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-200/80 hover:border-red-200 hover:-translate-y-1 relative">
            {/* Image Box */}
            <div className="w-full h-52 bg-gray-50 relative overflow-hidden flex items-center justify-center">
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

                {/* Stock Status Badge */}
                <span
                    className={`absolute top-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                        product.stock > 0
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                    }`}
                >
                    {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                </span>
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
                        {product.description || `Category: ${product.category}`}
                    </p>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-auto">
                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-[11px] text-gray-400 block font-medium">
                                Saved Price
                            </span>
                            <span className="text-xl font-black text-gray-900">
                                ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                        </div>

                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            {product.category}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                        {/* View Details Button */}
                        <button
                            type="button"
                            onClick={() => navigate(`/products/${product._id}`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2 rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <span>View Details</span>
                            <span>→</span>
                        </button>

                        {/* Remove from Wishlist Button */}
                        <button
                            type="button"
                            disabled={isRemoving}
                            onClick={() => onRemove(product._id)}
                            className="w-full bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 py-2 rounded-xl font-semibold text-xs border border-red-200/70 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove this item from your saved wishlist"
                        >
                            {isRemoving ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Removing...</span>
                                </>
                            ) : (
                                <>
                                    <span>♥</span>
                                    <span>Remove from Wishlist</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WishlistCard
