export type RazorpayCheckoutResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayInstance = {
  open: () => void
  on: (event: 'payment.failed', handler: (response: { error?: { description?: string; code?: string } }) => void) => void
}

type RazorpayCheckoutOptions = {
  key: string
  amount: number
  currency: string
  name: string
  order_id: string
  prefill?: { name?: string; email?: string }
  notes?: Record<string, unknown>
  theme?: { color?: string }
  handler: (response: RazorpayCheckoutResponse) => void | Promise<void>
  modal?: { ondismiss?: () => void }
}

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

export function getRazorpayKeyId(keyFromServer?: string) {
  return keyFromServer || import.meta.env.VITE_RAZORPAY_KEY_ID || ''
}

export function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve()

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'))
    document.body.appendChild(script)
  })
}

export async function verifyPayment(response: RazorpayCheckoutResponse) {
  const res = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || 'Payment verification failed.')
  }
  return data as { success: boolean; paid: boolean }
}

export function openRazorpayCheckout(
  options: Omit<RazorpayCheckoutOptions, 'modal' | 'handler'> & {
    onSuccess: (response: RazorpayCheckoutResponse) => void | Promise<void>
    onDismiss: () => void
    onFailure: (message: string) => void
  },
) {
  if (!window.Razorpay) {
    throw new Error('Razorpay checkout is not loaded.')
  }
  if (!options.key) {
    throw new Error('Razorpay key is missing.')
  }

  const rzp = new window.Razorpay({
    key: options.key,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    order_id: options.order_id,
    prefill: options.prefill,
    notes: options.notes,
    theme: options.theme,
    handler: async (response) => {
      await options.onSuccess(response)
    },
    modal: {
      ondismiss: options.onDismiss,
    },
  })

  rzp.on('payment.failed', (response) => {
    options.onFailure(response.error?.description || 'Payment failed. Please try again.')
  })

  rzp.open()
}
