function CheckoutForm({ formData, setFormData, errors, setErrors, disabled }) {
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Clear error as user types
        if (errors[name]) {
            setErrors((prev) => {
                const updated = { ...prev }
                delete updated[name]
                return updated
            })
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        const trimmed = (value || '').trim()

        if (!trimmed) {
            setErrors((prev) => ({ ...prev, [name]: 'This field is required' }))
            return
        }

        if (name === 'phone') {
            const sanitized = trimmed.replace(/[-\s()]/g, '')
            if (!/^\+?[0-9]{10,14}$/.test(sanitized)) {
                setErrors((prev) => ({
                    ...prev,
                    phone: 'Enter a valid 10-digit phone number'
                }))
            }
        }

        if (name === 'pincode') {
            if (!/^\d{6}$/.test(trimmed)) {
                setErrors((prev) => ({
                    ...prev,
                    pincode: 'Pincode must contain 6 digits.'
                }))
            }
        }
    }

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    📍
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">
                        Shipping Details
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                        Where should we deliver your order?
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="fullName"
                        className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
                    >
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        placeholder="e.g. Aarav Sharma"
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                            errors.fullName
                                ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                                : 'border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-blue-100 text-gray-900'
                        }`}
                    />
                    {errors.fullName && (
                        <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                            <span>⚠</span> {errors.fullName}
                        </p>
                    )}
                </div>

                {/* Phone Number */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="phone"
                        className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
                    >
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        placeholder="e.g. 9876543210"
                        maxLength="15"
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                            errors.phone
                                ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                                : 'border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-blue-100 text-gray-900'
                        }`}
                    />
                    {errors.phone && (
                        <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                            <span>⚠</span> {errors.phone}
                        </p>
                    )}
                </div>

                {/* Address Line 1 */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="addressLine1"
                        className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
                    >
                        Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="addressLine1"
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        placeholder="Flat, House no., Building, Street / Road"
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                            errors.addressLine1
                                ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                                : 'border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-blue-100 text-gray-900'
                        }`}
                    />
                    {errors.addressLine1 && (
                        <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                            <span>⚠</span> {errors.addressLine1}
                        </p>
                    )}
                </div>

                {/* City */}
                <div>
                    <label
                        htmlFor="city"
                        className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
                    >
                        City <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        placeholder="e.g. Bengaluru"
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                            errors.city
                                ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                                : 'border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-blue-100 text-gray-900'
                        }`}
                    />
                    {errors.city && (
                        <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                            <span>⚠</span> {errors.city}
                        </p>
                    )}
                </div>

                {/* State */}
                <div>
                    <label
                        htmlFor="state"
                        className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
                    >
                        State <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="state"
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        placeholder="e.g. Karnataka"
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                            errors.state
                                ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                                : 'border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-blue-100 text-gray-900'
                        }`}
                    />
                    {errors.state && (
                        <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                            <span>⚠</span> {errors.state}
                        </p>
                    )}
                </div>

                {/* Pincode */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="pincode"
                        className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
                    >
                        Pincode (6 digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="pincode"
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        placeholder="e.g. 560001"
                        maxLength="6"
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                            errors.pincode
                                ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                                : 'border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-blue-100 text-gray-900'
                        }`}
                    />
                    {errors.pincode && (
                        <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                            <span>⚠</span> {errors.pincode}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CheckoutForm
