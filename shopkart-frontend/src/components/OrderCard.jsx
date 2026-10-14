import { useNavigate } from 'react-router-dom'

const STATUS_CONFIG = {
    PENDING_PAYMENT: { label: 'Pending Payment', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    PLACED: { label: 'Placed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    CONFIRMED: { label: 'Confirmed', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    SHIPPED: { label: 'Shipped', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    DELIVERED: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
}

const PROGRESS_STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

function OrderCard({ order, onStatusUpdate, isUpdating }) {
    const navigate = useNavigate()

    const formattedDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          })
        : 'Recent'

    const statusStyle =
        STATUS_CONFIG[order.status] || {
            label: order.status,
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200'
        }

    const currentStepIndex = PROGRESS_STEPS.indexOf(order.status)

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-md transition-all">
            {/* Header: Order ID & Date & Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Order
                        </span>
                        <span className="font-mono font-extrabold text-sm sm:text-base text-gray-900">
                            #{order._id}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{formattedDate}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                        {statusStyle.label}
                    </span>
                    <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                            order.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                        {order.paymentStatus || 'PAID'}
                    </span>
                </div>
            </div>

            {/* Visual Status Progression Tracker */}
            {currentStepIndex !== -1 && (
                <div className="py-4 border-b border-gray-100">
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
                                <div key={step} className="relative z-10 flex flex-col items-center">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                            isCompleted
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'bg-gray-200 text-gray-500'
                                        } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                                    >
                                        {isCompleted ? '✓' : idx + 1}
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${
                                            isCompleted ? 'text-blue-600' : 'text-gray-400'
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

            {/* Snapshot Items List */}
            <div className="py-4 space-y-3">
                {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-lg">
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
                                <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                                    {item.name}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                    ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                                </p>
                            </div>
                        </div>

                        <span className="font-bold text-gray-900 text-xs sm:text-sm shrink-0">
                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer: Total & Actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <span className="text-xs text-gray-500 font-medium block">Total Amount</span>
                    <span className="text-xl font-black text-blue-600">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Bonus Challenge: Quick Status Progression Selector */}
                    {onStatusUpdate && (
                        <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                            className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 disabled:opacity-50 border border-gray-200 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none"
                            title="Bonus Challenge: Test Status Progression"
                        >
                            <option value="PLACED">Status: PLACED</option>
                            <option value="CONFIRMED">Status: CONFIRMED</option>
                            <option value="SHIPPED">Status: SHIPPED</option>
                            <option value="DELIVERED">Status: DELIVERED</option>
                        </select>
                    )}

                    <button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                    >
                        View Details →
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrderCard
