import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import WishlistCard from '../components/WishlistCard'

function Wishlist() {
    const navigate = useNavigate()
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [removingId, setRemovingId] = useState(null)
    const [feedback, setFeedback] = useState(null)

    const fetchWishlist = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await api.get('/wishlist')
            setWishlist(response.data.wishlist || [])
        } catch (err) {
            console.error('Failed to fetch wishlist:', err)
            setError(
                err.response?.data?.message ||
                "We couldn't load your wishlist."
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWishlist()
    }, [])

    const handleRemove = async (productId) => {
        setRemovingId(productId)
        try {
            const response = await api.delete(`/wishlist/${productId}`)
            if (response.data.success) {
                setWishlist((prev) => prev.filter((item) => item._id !== productId))
                setFeedback({
                    type: 'success',
                    message: response.data.message || 'Product removed from wishlist'
                })
                // Dispatch event so Navbar updates wishlist count badge dynamically
                window.dispatchEvent(new CustomEvent('wishlist-updated'))
            }
        } catch (err) {
            console.error('Failed to remove from wishlist:', err)
            setFeedback({
                type: 'error',
                message:
                    err.response?.data?.message ||
                    'Unable to remove product. Please try again.'
            })
        } finally {
            setRemovingId(null)
            setTimeout(() => {
                setFeedback(null)
            }, 3500)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Page Header Banner */}
            <div className="bg-white border-b border-gray-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">❤️</span>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                    My Wishlist
                                </h1>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                                {!loading && !error && (
                                    <span>
                                        {wishlist.length}{' '}
                                        {wishlist.length === 1 ? 'product' : 'products'}{' '}
                                        saved
                                    </span>
                                )}
                            </p>
                        </div>

                        {!loading && !error && wishlist.length > 0 && (
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
                {/* Notification Banner */}
                {feedback && (
                    <div
                        className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs transition-all ${
                            feedback.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                    >
                        <span>
                            {feedback.type === 'success' ? '✓ ' : '✕ '}
                            {feedback.message}
                        </span>
                        <button
                            onClick={() => setFeedback(null)}
                            className="font-bold opacity-75 hover:opacity-100 cursor-pointer text-sm"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* State 1: Loading State */}
                {loading && (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600 font-semibold text-base">
                            Loading your wishlist...
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            Fetching your saved products from the server
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
                            Something went wrong.
                        </h2>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={fetchWishlist}
                            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer shadow-md shadow-blue-500/20"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* State 3: Empty State */}
                {!loading && !error && wishlist.length === 0 && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
                        <div className="text-6xl mb-4 select-none animate-bounce">
                            ❤️
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Your wishlist is empty
                        </h2>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Save products you love and find them here later.
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

                {/* State 4: Saved Products Grid */}
                {!loading && !error && wishlist.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <WishlistCard
                                key={product._id}
                                product={product}
                                onRemove={handleRemove}
                                isRemoving={removingId === product._id}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Wishlist
