import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

const PROGRESS_STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

function OrderDetails() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await api.get(`/orders/${id}`)
                if (response.data?.order) {
                    setOrder(response.data.order)
                } else {
                    setError('Order not found.')
                }
            } catch (err) {
                console.error('Failed to load order details:', err)
                if (err.response?.status === 403) {
                    setError('You do not have permission to view this order.')
                } else if (err.response?.status === 404) {
                    setError('Order does not exist.')
                } else {
                    setError(err.response?.data?.message || 'Unable to load order details.')
                }
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchOrder()
        }
    }, [id])

    // Bonus Challenge status progression
    const handleStatusChange = async (newStatus) => {
        setIsUpdatingStatus(true)
        try {
            const res = await api.patch(`/orders/${id}/status`, { status: newStatus })
            if (res.data?.success && res.data?.order) {
                setOrder(res.data.order)
            }
        } catch (err) {
            console.error('Error updating status:', err)
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const currentStepIndex = order ? PROGRESS_STEPS.indexOf(order.status) : -1

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Breadcrumb / Top Bar */}
            <div className="bg-white border-b border-gray-200/80 shadow-xs">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <button
                        onClick={() => navigate('/orders')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition cursor-pointer"
                    >
                        <span>← Back to My Orders</span>
                    </button>
                </div>
            </div>

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {loading ? (
                    <div className="bg-white rounded-3xl p-12 border border-gray-200/80 shadow-xs text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm font-semibold text-gray-500">
                            Loading order details...
                        </p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-3xl p-10 border border-red-200 shadow-sm text-center max-w-md mx-auto">
                        <span className="text-4xl block mb-3">⚠️</span>
                        <h2 className="text-xl font-black text-gray-900 mb-2">Order Error</h2>
                        <p className="text-sm text-red-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/orders')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition text-sm cursor-pointer shadow-md shadow-blue-500/20"
                        >
                            Return to Orders
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Order Header Summary */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Order ID
                                        </span>
                                        <h1 className="font-mono font-black text-base sm:text-lg text-gray-900">
                                            #{order._id}
                                        </h1>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                        Placed on{' '}
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                        Status: {order.status}
                                    </span>
                                    <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Payment: {order.paymentStatus}
                                    </span>

                                    {/* Bonus Progression Selector */}
                                    <select
                                        value={order.status}
                                        disabled={isUpdatingStatus}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
                                        title="Bonus: Update status progression"
                                    >
                                        <option value="PLACED">Set: PLACED</option>
                                        <option value="CONFIRMED">Set: CONFIRMED</option>
                                        <option value="SHIPPED">Set: SHIPPED</option>
                                        <option value="DELIVERED">Set: DELIVERED</option>
                                    </select>
                                </div>
                            </div>

                            {/* Status Progression Tracker */}
                            {currentStepIndex !== -1 && (
                                <div className="pt-6 pb-2">
                                    <div className="relative flex items-center justify-between max-w-lg mx-auto">
                                        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-gray-100 -z-0">
                                            <div
                                                className="h-full bg-blue-600 transition-all duration-300"
                                                style={{
                                                    width: `${(currentStepIndex / (PROGRESS_STEPS.length - 1)) * 100}%`
                                                }}
                                            />
                                        </div>

                                        {PROGRESS_STEPS.map((step, idx) => {
                                            const isCompleted = idx <= currentStepIndex
                                            const isCurrent = idx === currentStepIndex

                                            return (
                                                <div
                                                    key={step}
                                                    className="relative z-10 flex flex-col items-center"
                                                >
                                                    <div
                                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                            isCompleted
                                                                ? 'bg-blue-600 text-white shadow-xs'
                                                                : 'bg-gray-200 text-gray-500'
                                                        } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                                                    >
                                                        {isCompleted ? '✓' : idx + 1}
                                                    </div>
                                                    <span
                                                        className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${
                                                            isCompleted
                                                                ? 'text-blue-600'
                                                                : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {step}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Items & Shipping Address Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            {/* Items Purchased (Historical Snapshot) */}
                            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-sm space-y-4">
                                <h2 className="text-base font-black text-gray-900 pb-3 border-b border-gray-100">
                                    Items in this Order ({order.items?.length})
                                </h2>

                                <div className="divide-y divide-gray-100">
                                    {order.items?.map((item, idx) => {
                                        const lineTotal = (item.price || 0) * (item.quantity || 1)
                                        return (
                                            <div
                                                key={idx}
                                                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-xl">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none'
                                                                }}
                                                            />
                                                        ) : (
                                                            '📦'
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-gray-900 text-sm truncate">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                            Historical Price: ₹
                                                            {item.price?.toLocaleString('en-IN')} ×{' '}
                                                            {item.quantity}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="font-black text-gray-900 text-sm shrink-0">
                                                    ₹{lineTotal.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Sidebar: Shipping Address & Payment Info */}
                            <div className="space-y-6">
                                {/* Shipping Address Card */}
                                <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-3">
                                    <h3 className="text-sm font-black text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                                        <span>📍</span> Shipping Address
                                    </h3>
                                    {order.shippingAddress ? (
                                        <div className="text-xs text-gray-600 space-y-1">
                                            <p className="font-bold text-gray-900 text-sm">
                                                {order.shippingAddress.fullName}
                                            </p>
                                            <p className="font-medium text-gray-700">
                                                📞 {order.shippingAddress.phone}
                                            </p>
                                            <p className="text-gray-600 leading-relaxed pt-1">
                                                {order.shippingAddress.addressLine1}
                                                <br />
                                                {order.shippingAddress.city},{' '}
                                                {order.shippingAddress.state} -{' '}
                                                {order.shippingAddress.pincode}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400">
                                            No address on record.
                                        </p>
                                    )}
                                </div>

                                {/* Payment Breakdown Card */}
                                <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-3.5 text-xs">
                                    <h3 className="text-sm font-black text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                                        <span>💳</span> Payment Breakdown
                                    </h3>

                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-900">
                                            ₹{order.totalAmount?.toLocaleString('en-IN')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery</span>
                                        <span className="font-bold text-emerald-600">FREE</span>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                                        <span className="text-sm font-black text-gray-900">
                                            Total Paid
                                        </span>
                                        <span className="text-xl font-black text-blue-600">
                                            ₹{order.totalAmount?.toLocaleString('en-IN')}
                                        </span>
                                    </div>

                                    {order.razorpayPaymentId && (
                                        <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                                            <span className="block font-medium">Razorpay Payment ID:</span>
                                            <span className="font-mono text-gray-600 break-all">
                                                {order.razorpayPaymentId}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default OrderDetails
