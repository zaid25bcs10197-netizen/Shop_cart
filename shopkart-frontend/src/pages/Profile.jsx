import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'

function Profile() {
    const navigate = useNavigate()

    const [customer, setCustomer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [profileError, setProfileError] = useState('')

    // Change password form state
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/customers/me')
                setCustomer(response.data.customer || response.data)
            } catch (err) {
                console.error(err)
                setProfileError('Failed to load profile details.')
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [navigate])

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setPasswordMsg({ type: '', text: '' })

        if (!passwordData.oldPassword || !passwordData.newPassword) {
            setPasswordMsg({ type: 'error', text: 'All fields are required.' })
            return
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMsg({
                type: 'error',
                text: 'New password must be at least 6 characters long.'
            })
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMsg({
                type: 'error',
                text: 'New passwords do not match.'
            })
            return
        }

        try {
            setPasswordLoading(true)
            const res = await api.patch('/customers/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            })

            setPasswordMsg({
                type: 'success',
                text: res.data.message || 'Password changed successfully!'
            })

            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
        } catch (err) {
            setPasswordMsg({
                type: 'error',
                text:
                    err.response?.data?.message ||
                    'Failed to change password. Please verify current password.'
            })
        } finally {
            setPasswordLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-500">{profileError || 'User not found'}</p>
                </div>
            </div>
        )
    }

    // Avatar initials
    const initials = customer.fullName
        ? customer.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'U'

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
                {/* Header Banner */}
                <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl mb-8 overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-2xl bg-white text-blue-600 font-extrabold text-3xl flex items-center justify-center shadow-lg border-4 border-white/30">
                            {initials}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                <h1 className="text-3xl font-bold">
                                    {customer.fullName}
                                </h1>
                                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
                                    Verified Customer
                                </span>
                            </div>
                            <p className="text-blue-100 text-sm">{customer.email}</p>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold shadow-md transition-all active:scale-95 cursor-pointer text-sm"
                        >
                            Browse Products →
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Account Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                Personal Info
                            </h2>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                        Full Name
                                    </p>
                                    <p className="font-semibold text-gray-800 mt-0.5">
                                        {customer.fullName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                        Email Address
                                    </p>
                                    <p className="font-semibold text-gray-800 mt-0.5 break-all">
                                        {customer.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                        Phone Number
                                    </p>
                                    <p className="font-semibold text-gray-800 mt-0.5">
                                        {customer.phone || 'Not provided'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                        Account Status
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-green-700 font-semibold text-xs">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 text-blue-900">
                            <h3 className="font-bold text-sm mb-2">ShopKart Member</h3>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Enjoy member-only product discounts, fast delivery across India, and simple 1-click discovery.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Security / Change Password */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                Security Settings
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Update your account password to keep your ShopKart account secure.
                            </p>

                            {/* Message feedback */}
                            {passwordMsg.text && (
                                <div
                                    className={`p-4 rounded-xl text-sm font-medium mb-6 ${
                                        passwordMsg.type === 'success'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}
                                >
                                    {passwordMsg.text}
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter your current password"
                                        value={passwordData.oldPassword}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                oldPassword: e.target.value
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Min. 6 characters"
                                            value={passwordData.newPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    newPassword: e.target.value
                                                })
                                            }
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Re-enter new password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword: e.target.value
                                                })
                                            }
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer text-sm"
                                    >
                                        {passwordLoading
                                            ? 'Updating Password...'
                                            : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Profile
