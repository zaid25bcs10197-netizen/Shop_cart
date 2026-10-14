function OrderSummary({
    cartItems,
    subtotal,
    totalCount,
    distinctItemCount,
    onPlaceOrder,
    loading,
    generalError
}) {
    return (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                    Order Summary
                </h2>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </span>
            </div>

            {/* Error Message if any */}
            {generalError && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium flex items-start gap-2">
                    <span className="text-red-500 font-bold">⚠</span>
                    <span>{generalError}</span>
                </div>
            )}

            {/* Items List Snapshot */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1 mb-5 divide-y divide-gray-50">
                {cartItems.map((item) => {
                    const product = item.product || {}
                    const price = Number(product.price) || 0
                    const qty = Number(item.quantity) || 1
                    const lineTotal = price * qty

                    return (
                        <div
                            key={product._id}
                            className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-sm"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                            }}
                                        />
                                    ) : (
                                        <span className="text-xl">📦</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        ₹{price.toLocaleString('en-IN')} × {qty}
                                    </p>
                                </div>
                            </div>

                            <span className="font-extrabold text-gray-900 text-xs sm:text-sm shrink-0">
                                ₹{lineTotal.toLocaleString('en-IN')}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                    <span>Distinct Items</span>
                    <span className="font-bold text-gray-900">{distinctItemCount}</span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                    <span>Total Quantity</span>
                    <span className="font-bold text-gray-900">{totalCount} units</span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">
                        ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                    <span>Estimated Shipping</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">
                        FREE
                    </span>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
                    <div>
                        <span className="text-base font-extrabold text-gray-900 block">
                            Total Payable
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                            Includes all taxes
                        </span>
                    </div>
                    <span className="text-2xl font-black text-blue-600">
                        ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                </div>
            </div>

            {/* Place Order / Razorpay Payment CTA */}
            <button
                type="button"
                id="place-order-btn"
                onClick={onPlaceOrder}
                disabled={loading || cartItems.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                            />
                        </svg>
                        <span>Processing Order...</span>
                    </>
                ) : (
                    <>
                        <span>Pay with Razorpay</span>
                        <span>💳</span>
                    </>
                )}
            </button>

            {/* Razorpay Trust Badges */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Razorpay Test Mode standard integration</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Server-side stock and price revalidation</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>HMAC-SHA256 signature verified</span>
                </div>
            </div>
        </div>
    )
}

export default OrderSummary
