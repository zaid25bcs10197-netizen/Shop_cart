/**
 * Dynamically loads the Razorpay checkout script if not already present on window.
 * Returns a Promise that resolves to true if successfully loaded, false otherwise.
 */
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            return resolve(true)
        }

        const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        )
        if (existingScript) {
            existingScript.onload = () => resolve(true)
            existingScript.onerror = () => resolve(false)
            return
        }

        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => resolve(true)
        script.onerror = () => {
            console.warn('Failed to load Razorpay Checkout script from CDN.')
            resolve(false)
        }

        document.body.appendChild(script)
    })
}
