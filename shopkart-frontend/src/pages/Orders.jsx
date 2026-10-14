import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import OrderCard from '../components/OrderCard'
import api from '../services/api'

function Orders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updatingStatusId, setUpdatingStatusId] = useState(null)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.get('/orders')
            if (response.data?.orders) {
                setOrders(response.data.orders)
            } else {
                setOrders([])
            }
        } catch (err) {
            console.error('Failed to load orders:', err)
            setError(err.response?.data?.message || 'Unable to retrieve your order history.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // Bonus Challenge: Update order status progression
    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingStatusId(orderId)
        try {
            const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus })
            if (res.data?.success && res.data?.order) {
                setOrders((prev) =>
                    prev.map((ord) => (ord._id === orderId ? res.data.order : ord))
                )
            }
        } catch (err) {
            console.error('Failed to update status:', err)
        } finally {
            setUpdatingStatusId(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Header Banner */}
            <div className="bg-white border-b border-gray-200/80 shadow-xs">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">📦</span>
                                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                    My Orders
                                </h1>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                                Review your past orders, delivery snapshots, and live tracking status.
                            </p>
                        </div>

                        {!loading && !error && orders.length > 0 && (
                            <button
                                onClick={() => navigate('/products')}
                                className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer self-start sm:self-auto"
                            >
                                <span>Browse More Products →</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs animate-pulse space-y-4"
                            >
                                <div className="h-5 bg-gray-200 rounded-lg w-1/4"></div>
                                <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
                                <div className="h-5 bg-gray-200 rounded-lg w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-red-200 shadow-sm text-center max-w-md mx-auto">
                        <span className="text-4xl block mb-3">⚠️</span>
                        <h2 className="text-xl font-black text-gray-900 mb-2">
                            Failed to Load Orders
                        </h2>
                        <p className="text-sm text-red-600 mb-6">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition text-sm cursor-pointer shadow-md shadow-blue-500/20"
                        >
                            Retry Loading
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    /* Task 8: Empty State */
                    <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-200/80 shadow-sm text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-xs">
                            🛍️
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
                            You have not placed any orders yet.
                        </h2>
                        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                            When you checkout items from your cart, your order history and tracking will appear here.
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3.5 px-8 rounded-2xl text-sm shadow-lg shadow-blue-500/25 transition cursor-pointer"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-1">
                            <span>
                                Showing {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                            </span>
                            <span className="text-blue-600">✓ Real-time historical snapshots</span>
                        </div>

                        {orders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                onStatusUpdate={handleStatusUpdate}
                                isUpdating={updatingStatusId === order._id}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Orders
