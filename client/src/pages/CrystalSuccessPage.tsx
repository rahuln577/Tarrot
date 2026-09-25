import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FadeInUp } from '../components/animations/FadeInUp'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

type ShopOrderStatus = 'Pending' | 'Paid' | 'Cancelled'

type ShopOrderStatusResponse = {
  shopOrderId: string
  status: ShopOrderStatus
  subtotal: number
  currency: string
}

async function getShopOrderStatus(shopOrderId: string): Promise<ShopOrderStatusResponse> {
  const res = await fetch(`/api/shop/status/${shopOrderId}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch order status')
  return data as ShopOrderStatusResponse
}

export default function CrystalSuccessPage() {
  const [searchParams] = useSearchParams()
  const shopOrderId = searchParams.get('shopOrderId') || ''

  const [status, setStatus] = useState<ShopOrderStatus>('Pending')
  const [subtotal, setSubtotal] = useState<number>(0)
  const [currency, setCurrency] = useState<string>('INR')

  const shouldPoll = useMemo(() => shopOrderId.length > 0, [shopOrderId])

  useEffect(() => {
    let alive = true

    async function poll() {
      if (!shopOrderId) return

      const start = Date.now()
      while (alive && Date.now() - start < 120_000) {
        try {
          const s = await getShopOrderStatus(shopOrderId)
          if (!alive) return

          setStatus(s.status)
          setSubtotal(s.subtotal)
          setCurrency(s.currency)

          if (s.status === 'Paid' || s.status === 'Cancelled') return
        } catch {
          // ignore transient errors
        }

        await new Promise((r) => setTimeout(r, 2500))
      }
    }

    if (shouldPoll) poll()

    return () => {
      alive = false
    }
  }, [shopOrderId, shouldPoll])

  return (
    <div className="flex flex-col gap-6">
      <FadeInUp>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {status === 'Paid' ? 'Order Confirmed' : 'Order Pending'}
          </h1>
          <p className="max-w-2xl text-slate-700">
            {status === 'Paid'
              ? 'Payment is verified and your order is confirmed. Please check your email.'
              : 'Verifying payment via webhook. Please wait a moment.'}
          </p>
        </div>
      </FadeInUp>

      <div className="grid gap-4 lg:grid-cols-3">
        <FadeInUp delay={0.05} className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gold" /> Status
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              <div className="text-slate-900 font-semibold">{status}</div>
              <div className="mt-2">Total: ₹{subtotal || 0}</div>
              <div className="mt-1 text-xs text-slate-600">Currency: {currency}</div>
            </CardContent>
          </Card>
        </FadeInUp>

        <FadeInUp delay={0.1} className="lg:col-span-2">
          <Card className="p-5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              {status === 'Paid' ? (
                <div className="space-y-3">
                  <div>
                    Your crystal order is confirmed. You’ll receive a confirmation message by email shortly.
                  </div>
                  <div className="text-xs text-slate-600">
                    Note: Delivery / fulfillment steps can be added later.
                  </div>
                </div>
              ) : (
                <div>We’re finalizing your order confirmation. Please check your email soon.</div>
              )}

              <div className="mt-5">
                <Button asChild variant="outline" className="w-full justify-center">
                  <Link to="/">
                    Back to Home <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeInUp>
      </div>
    </div>
  )
}

