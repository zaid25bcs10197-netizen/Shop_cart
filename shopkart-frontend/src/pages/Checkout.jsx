import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CheckoutForm from '../components/CheckoutForm'
import OrderSummary from '../components/OrderSummary'
import { useCart } from '../context/CartContext'
import api from '../services/api'
import { loadRazorpayScript } from '../services/razorpay'

function Checkout() {
    const navigate = useNavigate()
    const {
        cartItems,
        loading: cartLoading,
        subtotal,
        totalCount,
        distinctItemCount,
        clearCartState
    } = useCart()

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    })

    const [errors, setErrors] = useState({})
    const [generalError, setGeneralError] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    // State for test simulation modal (if Razorpay script/API is unavailable or dummy credentials)
    const [testModalData, setTestModalData] = useState(null)

    // Pre-fill user data from profile if available
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await api.get('/customers/profile')
                if (res.data?.customer) {
                    const c = res.data.customer
                    setFormData((prev) => ({
                        ...prev,
                        fullName: prev.fullName || c.fullName || '',
                        phone: prev.phone || c.phone || ''
                    }))
                }
            } catch {
                // If profile fetch fails, leave empty
            }
        }
        fetchUserProfile()
    }, [])

    const validateForm = () => {
        const newErrors = {}

        if (!formData.fullName || !formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required'
        }

        if (!formData.phone || !formData.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else {
            const sanitizedPhone = formData.phone.trim().replace(/[-\s()]/g, '')
            if (!/^\+?[0-9]{10,14}$/.test(sanitizedPhone)) {
                newErrors.phone = 'Enter a valid 10-digit phone number'
            }
        }

        if (!formData.addressLine1 || !formData.addressLine1.trim()) {
            newErrors.addressLine1 = 'Delivery address is required'
        }

        if (!formData.city || !formData.city.trim()) {
            newErrors.city = 'City is required'
        }

        if (!formData.state || !formData.state.trim()) {
            newErrors.state = 'State is required'
        }

        if (!formData.pincode || !formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required'
        } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
            newErrors.pincode = 'Pincode must contain 6 digits.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handlePlaceOrder = async () => {
        setGeneralError('')

        // 1. Client-side Form Validation
        if (!validateForm()) {
            setGeneralError('Please fix the errors in the shipping address form.')
            return
        }

        // 2. Validate Cart not empty
        if (!cartItems || cartItems.length === 0) {
            setGeneralError('Your cart is empty. Please add items before checking out.')
            return
        }

        setIsProcessing(true)

        try {
            // 3. Create ShopKart Order & Razorpay Order on server
            // Note: Frontend sends ONLY shippingAddress. Backend computes total and validates stock.
            const response = await api.post('/orders/create-payment-order', {
                shippingAddress: {
                    fullName: formData.fullName.trim(),
                    phone: formData.phone.trim(),
                    addressLine1: formData.addressLine1.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim()
                }
            })

            const data = response.data
            if (!data.success) {
                setGeneralError(data.message || 'Failed to initialize payment.')
                setIsProcessing(false)
                return
            }

            // 4. Try loading standard Razorpay Checkout
            const isScriptLoaded = await loadRazorpayScript()

            if (isScriptLoaded && window.Razorpay && !data.isTestSimulation) {
                try {
                    const options = {
                        key: data.key,
                        amount: data.amount,
                        currency: data.currency || 'INR',
                        name: 'ShopKart',
                        description: `Order #${data.shopKartOrderId.slice(-6)} Checkout`,
                        order_id: data.razorpayOrderId,
                        handler: async function (paymentResponse) {
                            await completePaymentVerification({
                                shopKartOrderId: data.shopKartOrderId,
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature
                            })
                        },
                        prefill: {
                            name: formData.fullName,
                            contact: formData.phone
                        },
                        theme: {
                            color: '#2563EB'
                        },
                        modal: {
                            ondismiss: function () {
                                setIsProcessing(false)
                            }
                        }
                    }

                    const rzp = new window.Razorpay(options)

                    rzp.on('payment.failed', function (failResponse) {
                        setIsProcessing(false)
                        setGeneralError(
                            failResponse.error?.description ||
                                'Payment failed. Your cart has not been cleared. Please try again.'
                        )
                    })

                    rzp.open()
                    return
                } catch (modalErr) {
                    console.warn('Real Razorpay modal failed to open:', modalErr)
                    // Fallback to in-app test simulator modal
                }
            }

            // Fallback: Open in-app Razorpay Test Mode Simulator if Razorpay CDN is restricted or dummy key used
            setTestModalData(data)
            setIsProcessing(false)
        } catch (err) {
            console.error('Checkout error:', err)
            setIsProcessing(false)
            const errorMsg =
                err.response?.data?.message ||
                'Unable to create order. Please check your cart or try again.'
            setGeneralError(errorMsg)
        }
    }

    const completePaymentVerification = async ({
        shopKartOrderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    }) => {
        setIsProcessing(true)
        try {
            const verifyRes = await api.post('/orders/verify-payment', {
                shopKartOrderId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            })

            if (verifyRes.data?.success) {
                // Clear global cart state in Context & update navbar immediately
                clearCartState()
                navigate(`/order-success/${shopKartOrderId}`)
            } else {
                setGeneralError(verifyRes.data?.message || 'Payment verification failed.')
            }
        } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr)
            setGeneralError(
                verifyErr.response?.data?.message ||
                    'Payment signature verification failed. Your cart has been preserved.'
            )
        } finally {
            setIsProcessing(false)
            setTestModalData(null)
        }
    }

    // Handler for in-app test simulator payment
    const handleSimulatedPaymentSuccess = async () => {
        if (!testModalData) return
        setIsProcessing(true)
        try {
            const fakePaymentId = `pay_test_${Math.random().toString(36).substring(2, 10)}`

            // Request valid HMAC signature from backend helper
            const sigRes = await api.post('/orders/generate-test-signature', {
                shopKartOrderId: testModalData.shopKartOrderId,
                razorpay_payment_id: fakePaymentId
            })

            if (sigRes.data?.success && sigRes.data?.signature) {
                await completePaymentVerification({
                    shopKartOrderId: testModalData.shopKartOrderId,
                    razorpay_order_id: testModalData.razorpayOrderId,
                    razorpay_payment_id: fakePaymentId,
                    razorpay_signature: sigRes.data.signature
                })
            } else {
                setGeneralError('Failed to generate test signature.')
                setIsProcessing(false)
            }
        } catch (err) {
            console.error('Simulation error:', err)
            setGeneralError('Test payment simulation failed.')
            setIsProcessing(false)
        }
    }

    const handleSimulatedPaymentFailure = () => {
        setTestModalData(null)
        setIsProcessing(false)
        setGeneralError('Payment failed. Your cart has not been cleared. Please try again.')
    }

    if (cartLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        )
    }

    if (!cartLoading && cartItems.length === 0 && !testModalData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                            🛒
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2">
                            Your Cart is Empty
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            You cannot proceed to checkout with an empty cart. Add items to your shopping bag first.
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition cursor-pointer text-sm shadow-md shadow-blue-500/20"
                        >
                            Browse Products
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Checkout Header & Steps */}
            <div className="bg-white border-b border-gray-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">💳</span>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                    Checkout
                                </h1>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                                Review your cart, provide delivery address, and proceed to secure payment.
                            </p>
                        </div>

                        {/* Step Indicators */}
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <span
                                onClick={() => navigate('/cart')}
                                className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                            >
                                <span>Cart</span>
                                <span className="text-gray-300">›</span>
                            </span>
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full shadow-xs">
                                2. Checkout & Shipping
                            </span>
                            <span className="text-gray-300">›</span>
                            <span className="text-gray-400">3. Confirmation</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Shipping Form */}
                    <div className="lg:col-span-7 space-y-6">
                        <CheckoutForm
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                            setErrors={setErrors}
                            disabled={isProcessing}
                        />

                        {/* Order Security & Policy Callout */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 text-xs text-blue-900 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-blue-700">
                                <span>🛡️</span>
                                <span>Razorpay Test Mode Order Guarantee</span>
                            </div>
                            <p className="text-blue-800/80 leading-relaxed">
                                Live stocks and pricing are snapshotted on server-side before order creation. Your cart is only cleared once Razorpay HMAC signature is verified on the backend.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Order Summary Sidebar */}
                    <div className="lg:col-span-5">
                        <OrderSummary
                            cartItems={cartItems}
                            subtotal={subtotal}
                            totalCount={totalCount}
                            distinctItemCount={distinctItemCount}
                            onPlaceOrder={handlePlaceOrder}
                            loading={isProcessing}
                            generalError={generalError}
                        />
                    </div>
                </div>
            </main>

            {/* Test Mode Simulator Modal */}
            {testModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">💳</span>
                                <h3 className="text-lg font-black text-gray-900">
                                    Razorpay Test Checkout
                                </h3>
                            </div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                Test Mode
                            </span>
                        </div>

                        <div className="my-5 space-y-3 text-sm">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span>ShopKart Order ID:</span>
                                    <span className="font-mono font-bold text-gray-900">
                                        {testModalData.shopKartOrderId}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Razorpay Order ID:</span>
                                    <span className="font-mono font-bold text-gray-900">
                                        {testModalData.razorpayOrderId}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Amount in Paise:</span>
                                    <span className="font-mono font-bold text-gray-900">
                                        {testModalData.amount} paise (₹{testModalData.amount / 100})
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500">
                                Select a simulated test response to test backend HMAC signature verification, cart clearance, and order confirmation.
                            </p>
                        </div>

                        <div className="space-y-2.5">
                            <button
                                type="button"
                                onClick={handleSimulatedPaymentSuccess}
                                disabled={isProcessing}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                            >
                                {isProcessing ? 'Verifying...' : '✓ Simulate Successful Payment'}
                            </button>

                            <button
                                type="button"
                                onClick={handleSimulatedPaymentFailure}
                                disabled={isProcessing}
                                className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 rounded-xl text-sm transition cursor-pointer"
                            >
                                ✕ Simulate Failed Payment
                            </button>

                            <button
                                type="button"
                                onClick={() => setTestModalData(null)}
                                disabled={isProcessing}
                                className="w-full text-gray-500 hover:text-gray-700 font-semibold py-2 text-xs transition cursor-pointer"
                            >
                                Cancel Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Checkout
