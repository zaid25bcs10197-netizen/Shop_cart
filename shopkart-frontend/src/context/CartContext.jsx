import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import api from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoadingMap, setActionLoadingMap] = useState({}) // { [productId]: 'adding' | 'updating' | 'removing' }

    // Fetch user's cart from backend
    const refreshCart = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.get('/cart')
            if (response.data && response.data.cart) {
                setCartItems(response.data.cart)
            } else {
                setCartItems([])
            }
        } catch (err) {
            // If 401 (not logged in), set cart to empty silently
            if (err.response?.status === 401) {
                setCartItems([])
            } else {
                console.error('Failed to load cart:', err)
                setError(err.response?.data?.message || 'Unable to load your cart.')
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshCart()

        // Re-fetch cart when authentication state changes or custom trigger occurs
        const handleAuthChange = () => {
            refreshCart()
        }

        window.addEventListener('auth-changed', handleAuthChange)
        window.addEventListener('cart-updated', handleAuthChange)

        return () => {
            window.removeEventListener('auth-changed', handleAuthChange)
            window.removeEventListener('cart-updated', handleAuthChange)
        }
    }, [refreshCart])

    // Task 2: Add Product to Cart
    const addToCart = async (productId, quantity = 1) => {
        setActionLoadingMap((prev) => ({ ...prev, [productId]: 'adding' }))
        try {
            const response = await api.post(`/cart/${productId}`, { quantity })
            if (response.data?.success && response.data?.cart) {
                setCartItems(response.data.cart)
            } else {
                await refreshCart()
            }
            return {
                success: true,
                message: response.data?.message || 'Added to cart successfully'
            }
        } catch (err) {
            console.error('Add to cart error:', err)
            const message =
                err.response?.data?.message || 'Failed to add item to cart.'
            return {
                success: false,
                message,
                status: err.response?.status
            }
        } finally {
            setActionLoadingMap((prev) => {
                const next = { ...prev }
                delete next[productId]
                return next
            })
        }
    }

    // Task 4: Update Product Quantity
    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return { success: false, message: 'Quantity must be at least 1' }

        setActionLoadingMap((prev) => ({ ...prev, [productId]: 'updating' }))
        try {
            const response = await api.patch(`/cart/${productId}`, {
                quantity: newQuantity
            })
            if (response.data?.success && response.data?.cart) {
                setCartItems(response.data.cart)
            } else {
                await refreshCart()
            }
            return {
                success: true,
                message: response.data?.message || 'Quantity updated'
            }
        } catch (err) {
            console.error('Update quantity error:', err)
            const message =
                err.response?.data?.message || 'Failed to update quantity.'
            return {
                success: false,
                message,
                status: err.response?.status
            }
        } finally {
            setActionLoadingMap((prev) => {
                const next = { ...prev }
                delete next[productId]
                return next
            })
        }
    }

    // Task 5: Remove Product from Cart
    const removeFromCart = async (productId) => {
        setActionLoadingMap((prev) => ({ ...prev, [productId]: 'removing' }))
        try {
            const response = await api.delete(`/cart/${productId}`)
            if (response.data?.success && response.data?.cart) {
                setCartItems(response.data.cart)
            } else {
                await refreshCart()
            }
            return {
                success: true,
                message: response.data?.message || 'Product removed from cart'
            }
        } catch (err) {
            console.error('Remove from cart error:', err)
            const message =
                err.response?.data?.message || 'Failed to remove product from cart.'
            return {
                success: false,
                message,
                status: err.response?.status
            }
        } finally {
            setActionLoadingMap((prev) => {
                const next = { ...prev }
                delete next[productId]
                return next
            })
        }
    }

    // Derived values calculated directly from state (not stored in MongoDB)
    const totalCount = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0)
    }, [cartItems])

    const subtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const price = Number(item.product?.price) || 0
            const qty = Number(item.quantity) || 0
            return acc + price * qty
        }, 0)
    }, [cartItems])

    const distinctItemCount = cartItems.length

    const isProductInCart = useCallback(
        (productId) => {
            return cartItems.some(
                (item) => item.product && item.product._id === productId
            )
        },
        [cartItems]
    )

    const getItemQuantityInCart = useCallback(
        (productId) => {
            const item = cartItems.find(
                (item) => item.product && item.product._id === productId
            )
            return item ? item.quantity : 0
        },
        [cartItems]
    )

    const clearCartState = useCallback(() => {
        setCartItems([])
        window.dispatchEvent(new CustomEvent('cart-updated'))
    }, [])

    const value = {
        cartItems,
        loading,
        error,
        actionLoadingMap,
        totalCount,
        subtotal,
        distinctItemCount,
        isProductInCart,
        getItemQuantityInCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        clearCartState,
        clearCart: clearCartState
    }

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export default CartContext
