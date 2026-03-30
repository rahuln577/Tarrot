import { ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FadeInUp } from '../components/animations/FadeInUp'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

type RazorpayInstance = { open: () => void }
type RazorpayCheckoutOptions = {
  key: string
  amount: number
  currency: string
  name: string
  order_id: string
  prefill?: { name?: string; email?: string }
  notes?: Record<string, unknown>
  theme?: { color?: string }
  handler: (response: unknown) => void | Promise<void>
}

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

type Product = {
  id: string
  name: string
  description?: string
  price: number
}

type ShopOrderCreateResponse = {
  keyId: string
  orderId: string
  amount: number
  currency: string
  shopOrderId: string
}

function loadRazorpayScript() {
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

async function createShopOrder(params: {
  name: string
  email: string
  productId: string
  quantity: number
}) {
  const res = await fetch('https://tarrot-eyi5.onrender.com/api/shop/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Failed to create shop order')
  return data as ShopOrderCreateResponse
}

async function getShopOrderStatus(shopOrderId: string) {
  const res = await fetch(`https://tarrot-eyi5.onrender.com/api/shop/status/${shopOrderId}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch order status')
  return data as { status: 'Pending' | 'Paid' | 'Cancelled' }
}

export default function CrystalShopPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [isPaying, setIsPaying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('https://tarrot-eyi5.onrender.com/api/products')
        const data = await res.json().catch(() => ({}))
        const list: Product[] = (data?.products || []).map(
          (p: { _id?: string; id?: string; name: string; description?: string; price: number }) => ({
            id: p._id || p.id || '',
            name: p.name,
            description: p.description,
            price: p.price,
          }),
        )

        if (alive) setProducts(list)
      } catch {
        if (alive) setProducts([])
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const totalItems = useMemo(() => {
    return products.reduce((sum, p) => sum + (quantities[p.id] || 0), 0)
  }, [products, quantities])

  async function handleCheckout(product: Product) {
    setMessage(null)

    const qty = quantities[product.id] || 1
    if (!name.trim() || !email.trim()) {
      setMessage('Please enter your name and email to receive the confirmation.')
      return
    }
    if (!qty || qty < 1) {
      setMessage('Quantity must be at least 1.')
      return
    }

    try {
      setIsPaying(true)
      await loadRazorpayScript()

      const order = await createShopOrder({
        name,
        email,
        productId: product.id,
        quantity: qty,
      })

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Anandamayii Roopa',
        order_id: order.orderId,
        prefill: { name, email },
        theme: { color: '#D4AF37' },
        handler: async function (_response: unknown) {
          void _response
          setMessage('Payment successful. Waiting for confirmation email...')

          const start = Date.now()
          while (Date.now() - start < 60_000) {
            try {
              const s = await getShopOrderStatus(order.shopOrderId)
              if (s.status === 'Paid') {
                setMessage('Confirmed! Redirecting to confirmation...')
                navigate(
                  `/crystals/success?shopOrderId=${encodeURIComponent(order.shopOrderId)}`,
                )
                return
              }
            } catch {
              // ignore transient errors
            }
            await new Promise((r) => setTimeout(r, 2500))
          }

          setMessage(
            'Payment received. Confirmation may take a moment — please check your email shortly.',
          )
        },
      }

      const rzp = new window.Razorpay!(options)
      rzp.open()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not start checkout.'
      setMessage(msg)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FadeInUp>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Crystal Shop</h1>
          <p className="max-w-2xl text-slate-700">
            Browse healing stones and checkout securely. You’ll receive confirmation by email after webhook
            verification.
          </p>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.05}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
              placeholder="you@example.com"
              inputMode="email"
            />
          </div>
        </div>
      </FadeInUp>

      {message ? (
        <FadeInUp delay={0.1}>
          <div className="rounded-xl border border-gold/20 bg-white/70 p-4 text-sm text-slate-700">{message}</div>
        </FadeInUp>
      ) : null}

      <FadeInUp delay={0.15}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-700">
            {loading ? 'Loading crystals...' : `Available stones: ${products.length}`}
          </div>
          <div className="text-xs font-semibold text-slate-600">
            Items selected: <span className="text-slate-900">{totalItems}</span>
          </div>
        </div>
      </FadeInUp>

      <FadeInUp>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="animate-pulse rounded-xl border border-gold/20 bg-white/70 p-5"
                >
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-full rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-5/6 rounded bg-slate-200" />
                  <div className="mt-4 h-10 w-full rounded bg-slate-200" />
                </div>
              ))
            : products.map((product, idx) => {
                const qty = quantities[product.id] || 1
                return (
                  <FadeInUp key={product.id} delay={0.05 * idx}>
                    <Card className="p-5">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between gap-3">
                          <span>{product.name}</span>
                          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 text-gold">
                            <ShoppingBag className="h-4 w-4" />
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm leading-relaxed text-slate-700">
                          {product.description || 'Healing crystal.'}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <div className="text-sm font-semibold text-slate-900">₹{product.price}</div>
                            <div className="text-xs text-slate-600">each</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              value={qty}
                              onChange={(e) =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [product.id]: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                                }))
                              }
                              className="w-16 rounded-md border border-gold/30 bg-white px-2 py-1 text-sm outline-none focus:border-gold"
                            />
                            <Button
                              variant="outline"
                              className="px-3"
                              disabled={isPaying}
                              onClick={() => handleCheckout(product)}
                            >
                              Buy Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeInUp>
                )
              })}
        </div>
      </FadeInUp>
    </div>
  )
}

