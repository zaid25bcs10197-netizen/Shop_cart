import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

function OrderSuccess() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true)
            try {
                const response = await api.get(`/orders/${id}`)
                if (response.data?.order) {
                    setOrder(response.data.order)
                }
            } catch (err) {
                console.error('Failed to load order:', err)
                setError(err.response?.data?.message || 'Unable to retrieve order details.')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchOrder()
        }
    }, [id])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
                {loading ? (
                    <div className="bg-white rounded-3xl p-10 border border-gray-200/80 shadow-sm text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm font-semibold text-gray-500">
                            Confirming your order details...
                        </p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-sm text-center">
                        <span className="text-4xl block mb-3">⚠️</span>
                        <h2 className="text-xl font-black text-gray-900 mb-2">
                            Order Retrieval Issue
                        </h2>
                        <p className="text-sm text-red-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/orders')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition text-sm cursor-pointer shadow-md shadow-blue-500/20"
                        >
                            View My Orders
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-sm text-center">
                        {/* Green Success Badge Icon */}
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner border border-emerald-100">
                            ✓
                        </div>

                        <span className="inline-block text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full mb-3">
                            Payment Verified & Order Confirmed
                        </span>

                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
                            Order Placed Successfully!
                        </h1>

                        <p className="text-sm text-gray-500 font-medium max-w-md mx-auto mb-8">
                            Your order has been recorded with historical snapshot pricing. A confirmation receipt has been generated.
                        </p>

                        {/* Order Snapshot Card */}
                        <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 text-left mb-8 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/70 gap-2">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                                        Order ID
                                    </span>
                                    <span className="text-sm sm:text-base font-black font-mono text-gray-900">
                                        {order._id}
                                    </span>
                                </div>
                                <div className="sm:text-right">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                                        Status
                                    </span>
                                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-blue-100 text-blue-700">
                                        {order.status || 'PLACED'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="text-gray-400 font-medium block">Total Amount</span>
                                    <span className="text-base font-black text-gray-900">
                                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-400 font-medium block">Payment Status</span>
                                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                        {order.paymentStatus || 'PAID'}
                                    </span>
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <span className="text-gray-400 font-medium block">Payment Reference</span>
                                    <span className="font-mono text-gray-700 truncate block">
                                        {order.razorpayPaymentId || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Shipping Address Summary */}
                            {order.shippingAddress && (
                                <div className="pt-3 border-t border-gray-200/70 text-xs text-gray-600">
                                    <span className="font-bold text-gray-700 block mb-1">
                                        Delivering to:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {order.shippingAddress.fullName} ({order.shippingAddress.phone})
                                    </p>
                                    <p className="text-gray-600">
                                        {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{' '}
                                        {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                    </p>
                                </div>
                            )}

                            {/* Snapshot Items Summary */}
                            {order.items && order.items.length > 0 && (
                                <div className="pt-3 border-t border-gray-200/70 space-y-2">
                                    <span className="font-bold text-gray-700 text-xs block">
                                        Items ({order.items.length}):
                                    </span>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                        {order.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between text-xs py-1"
                                            >
                                                <span className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-xs">
                                                    {item.name} × {item.quantity}
                                                </span>
                                                <span className="font-bold text-gray-900">
                                                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold py-3.5 px-7 rounded-2xl text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
                            >
                                View My Orders
                            </button>

                            <button
                                onClick={() => navigate('/products')}
                                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 px-7 rounded-2xl text-sm transition cursor-pointer"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default OrderSuccess
