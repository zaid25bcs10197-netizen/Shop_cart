import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

function Login() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Frontend validation
        if (!formData.email || !formData.password) {
            setError('Please enter both email and password.')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address.')
            return
        }

        try {
            setLoading(true)
            const res = await api.post('/customers/login', formData)

            // Save token for cross-origin Bearer auth (cookies may be blocked)
            if (res.data.token) {
                localStorage.setItem('token', res.data.token)
            }

            // Dispatch auth event to refresh user's cart immediately
            window.dispatchEvent(new CustomEvent('auth-changed'))
            window.dispatchEvent(new CustomEvent('wishlist-updated'))

            // Clear form
            setFormData({
                email: '',
                password: ''
            })

            // Go to home (now Products catalog)
            navigate('/')
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Invalid credentials. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background glowing ambient blobs */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-500/5 p-8 sm:p-10 border border-gray-100 relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 mx-auto mb-3">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.2"
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        Welcome to Shop<span className="text-blue-600">Kart</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1.5 font-medium">
                        Sign in to access your account & browse catalog
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold p-3.5 rounded-xl text-center mb-5 flex items-center justify-center gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value
                                })
                            }
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50 focus:bg-white"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value
                                })
                            }
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50 focus:bg-white"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Switch to Register */}
                <p className="text-center text-xs text-gray-500 font-medium mt-8">
                    Don't have an account yet?{' '}
                    <Link
                        to="/register"
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login