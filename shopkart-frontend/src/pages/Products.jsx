import { useEffect, useState } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'

const CATEGORIES = [
    { label: 'All Categories', icon: '✨', value: 'All Categories' },
    { label: 'Electronics', icon: '💻', value: 'Electronics' },
    { label: 'Fashion', icon: '👕', value: 'Fashion' },
    { label: 'Books', icon: '📚', value: 'Books' },
    { label: 'Home', icon: '🏠', value: 'Home' }
]

function Products() {
    const [products, setProducts] = useState([])
    const [wishlistIds, setWishlistIds] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All Categories')
    const [sort, setSort] = useState('')

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/wishlist')
            const ids = new Set((response.data.wishlist || []).map((p) => p._id))
            setWishlistIds(ids)
        } catch {
            // Unauthenticated or network issue, silently continue
        }
    }

    useEffect(() => {
        fetchWishlist()

        const handleWishlistUpdate = () => {
            fetchWishlist()
        }

        window.addEventListener('wishlist-updated', handleWishlistUpdate)
        return () => {
            window.removeEventListener('wishlist-updated', handleWishlistUpdate)
        }
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            setError('')

            try {
                const params = {}
                if (search.trim()) {
                    params.search = search.trim()
                }
                if (category && category !== 'All Categories') {
                    params.category = category
                }
                if (sort) {
                    params.sort = sort
                }

                const response = await api.get('/products', { params })
                setProducts(response.data.products || [])
            } catch (err) {
                console.error(err)
                setError('Something went wrong while loading products.')
            } finally {
                setLoading(false)
            }
        }

        const timer = setTimeout(() => {
            fetchProducts()
        }, 300)

        return () => clearTimeout(timer)
    }, [search, category, sort])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Hero Banner */}
            <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <span>ShopKart Storefront • New Season Arrivals</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                            Discover Top Products at Unbeatable Prices.
                        </h1>
                        <p className="text-blue-100 text-base sm:text-lg leading-relaxed mb-6">
                            Explore verified electronics, trendy fashion apparel, best-selling books, and modern home essentials with fast delivery.
                        </p>

                        {/* Search Input Bar */}
                        <div className="relative max-w-xl">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2.2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by product name (e.g. keyboard, headphones, jacket)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white text-gray-900 placeholder-gray-400 pl-11 pr-10 py-3.5 rounded-2xl text-sm font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/40 transition"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Catalog View */}
            <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
                {/* Category Pills & Sort Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        {CATEGORIES.map((cat) => {
                            const isSelected = category === cat.value
                            return (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategory(cat.value)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Sorting & Results Count */}
                    <div className="flex items-center justify-between md:justify-end gap-4">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">
                            Showing{' '}
                            <strong className="text-gray-900">
                                {products.length}
                            </strong>{' '}
                            {products.length === 1 ? 'product' : 'products'}
                        </span>

                        <div className="relative">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
                            >
                                <option value="">Sort by: Featured</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="py-28 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium text-sm">
                            Loading products...
                        </p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-8 text-center max-w-lg mx-auto">
                        <p className="font-semibold mb-2">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-xs bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-12 text-center max-w-md mx-auto my-8">
                        <div className="text-5xl mb-4">🔍</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            No products found
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            We couldn't find any products matching your current search or category criteria.
                        </p>
                        <button
                            onClick={() => {
                                setSearch('')
                                setCategory('All Categories')
                                setSort('')
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                initialIsWishlisted={wishlistIds.has(product._id)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Products
