import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api'

function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/customers/me')
                setAuthenticated(true)
            } catch (error) {
                setAuthenticated(false)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Checking authentication...</p>
            </div>
        )
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute