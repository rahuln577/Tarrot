import { CalendarDays, CreditCard, Heart, Mail, ShieldCheck, Sparkles, Target } from 'lucide-react'
import { useEffect, useMemo, useState, type ElementType } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar } from '../components/ui/calendar'
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

const TIME_SLOTS = ['10:00', '12:00', '15:00', '18:00']
const SERVICES: Array<{ serviceType: string; priceInRupees: number; label: string; icon: ElementType }> = [
  // Testing mode: 1 paise = 0.01 INR
  { serviceType: 'Love', priceInRupees: 0.01, label: 'Tarot for Love', icon: Heart },
  { serviceType: 'Career', priceInRupees: 0.01, label: 'Tarot for Career', icon: Target },
  { serviceType: 'Personal Growth', priceInRupees: 0.01, label: 'Tarot for Personal Growth', icon: Sparkles },
]

function formatSlotToLocalISO(date: Date, time: string) {
  const [h, m] = time.split(':').map((x) => Number(x))
  const dt = new Date(date)
  dt.setHours(h, m, 0, 0)
  return dt.toISOString()
}

async function createBookingOrder(params: {
  name: string
  email: string
  serviceType: string
  scheduledAt: string
  amountInRupees: number
  durationMinutes: number
}) {
  const res = await fetch('https://tarrot-eyi5.onrender.com/api/booking/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to create booking')
  }
  return data as {
    keyId: string
    orderId: string
    amount: number
    currency: string
    appointmentId: string
  }
}

async function getBookingStatus(appointmentId: string) {
  const res = await fetch(`https://tarrot-eyi5.onrender.com/api/booking/status/${appointmentId}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch status')
  return data as {
    appointmentId: string
    status: 'Pending' | 'Confirmed' | 'Cancelled'
    googleMeetLink: string | null
  }
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

export default function BookingPage() {
  const navigate = useNavigate()
  const [serviceType, setServiceType] = useState<string>(SERVICES[0]!.serviceType)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [isPaying, setIsPaying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Razorpay checkout script is loaded once on this page.
    loadRazorpayScript().catch(() => {
      // Non-fatal: user can still verify booking flow later.
    })
  }, [])

  const service = useMemo(() => SERVICES.find((s) => s.serviceType === serviceType)!, [serviceType])
  const amountInRupees = service?.priceInRupees ?? 0

  const scheduledAtISO = useMemo(() => {
    if (!selectedDate || !selectedTime) return null
    return formatSlotToLocalISO(selectedDate, selectedTime)
  }, [selectedDate, selectedTime])

  async function handlePay() {
    setMessage(null)

    if (!scheduledAtISO) {
      setMessage('Please select a date and time.')
      return
    }
    if (!name.trim() || !email.trim()) {
      setMessage('Please enter your name and email.')
      return
    }
    if (!amountInRupees) {
      setMessage('Unable to determine price for the selected service.')
      return
    }

    try {
      setIsPaying(true)
      await loadRazorpayScript()

      const order = await createBookingOrder({
        name,
        email,
        serviceType,
        scheduledAt: scheduledAtISO,
        durationMinutes: 60,
        amountInRupees,
      })

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Anandamayii Roopa',
        order_id: order.orderId,
        prefill: { name, email },
        notes: { appointmentId: order.appointmentId, serviceType },
        theme: { color: '#D4AF37' },
        handler: async function (_response: unknown) {
          void _response
          // Confirmation is done server-side via webhook verification.
          setMessage('Payment successful. Waiting for confirmation email...')

          // Poll for confirmation so the user sees a clear completion state.
          const start = Date.now()
          while (Date.now() - start < 60_000) {
            try {
              const s = await getBookingStatus(order.appointmentId)
              if (s.status === 'Confirmed') {
                navigate(`/booking/success?appointmentId=${encodeURIComponent(order.appointmentId)}`)
                return
              }
            } catch {
              // ignore transient status errors
            }
            await new Promise((r) => setTimeout(r, 2500))
          }
          setMessage('Payment received. Confirmation may take a moment — please check your email shortly.')
        },
      }

      const rzp = new window.Razorpay!(options)
      rzp.open()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment could not be started.'
      setMessage(msg)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FadeInUp>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Book Your Tarot Session
          </h1>
          <p className="max-w-2xl text-slate-700">
            Choose a service, pick a date/time, pay securely with Razorpay, and receive a Google Meet invite after webhook verification.
          </p>
        </div>
      </FadeInUp>

      {/* Service picker */}
      <FadeInUp delay={0.05}>
        <div className="grid gap-3 sm:grid-cols-3">
          {SERVICES.map((s) => {
            const active = s.serviceType === serviceType
            return (
              <button
                key={s.serviceType}
                type="button"
                onClick={() => setServiceType(s.serviceType)}
                className={[
                  'rounded-xl border px-4 py-3 text-left transition',
                  active
                    ? 'border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.35),0_0_24px_rgba(212,175,55,0.35)] bg-[#D4AF37]/5'
                    : 'border-[#D4AF37]/30 bg-white/70 hover:bg-[#D4AF37]/5',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <s.icon className="h-5 w-5 text-[#D4AF37]" />
                  <div className="text-sm font-semibold text-slate-900">{s.label}</div>
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-700">₹{s.priceInRupees}</div>
              </button>
            )
          })}
        </div>
      </FadeInUp>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Calendar */}
        <FadeInUp delay={0.1} className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#D4AF37]" /> Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => setSelectedDate(d)}
              />
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Time slots */}
        <FadeInUp delay={0.15} className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#D4AF37]" /> Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 text-sm text-slate-700">
                {selectedDate ? 'Select a time slot:' : 'Pick a date to see available slots.'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const active = slot === selectedTime
                  return (
                    <Button
                      key={slot}
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedTime(slot)}
                      disabled={!selectedDate}
                      className={[
                        'h-10 justify-center',
                            active
                              ? 'border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.35),0_0_24px_rgba(212,175,55,0.35)] bg-[#D4AF37]/10'
                              : 'bg-white/70',
                      ].join(' ')}
                    >
                      {slot}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Booking summary + payment */}
        <FadeInUp delay={0.2} className="lg:col-span-1">
          <Card className="p-5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#D4AF37]" /> Confirm & Pay
              </CardTitle>
            </CardHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-[#D4AF37]/30 bg-white px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-[#D4AF37]/30 bg-white px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                  placeholder="you@example.com"
                  inputMode="email"
                />
              </div>

              <div className="rounded-xl border border-[#D4AF37]/20 bg-white/60 p-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-900">{service.label}</span>
                  <span className="text-slate-900">₹{amountInRupees}</span>
                </div>
                <div className="mt-2 text-xs text-slate-700">
                  {scheduledAtISO
                    ? `Selected: ${new Date(scheduledAtISO).toLocaleString()}`
                    : 'Selected: date/time not chosen yet.'}
                </div>
              </div>

              <Button
                onClick={handlePay}
                disabled={isPaying || !scheduledAtISO || !name.trim() || !email.trim()}
                className="w-full"
                size="lg"
              >
                {isPaying ? 'Opening Razorpay...' : 'Pay with Razorpay'}
              </Button>

              {message ? (
                <div className="text-sm text-slate-700">
                  {message}
                </div>
              ) : null}
            </div>
          </Card>
        </FadeInUp>
      </div>

      {/* Info block */}
      <FadeInUp delay={0.25}>
        <div className="rounded-2xl border border-[#D4AF37]/30 bg-white/70 p-5 shadow-[0_0_0_1px_rgba(212,175,55,0.18)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Mail className="h-4 w-4 text-[#D4AF37]" /> Meet link notification
              </div>
              <div className="text-sm text-slate-700">
                After payment verification, a unique Google Meet link will be created and emailed to you and the owner.
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-600">
              Confirmation is webhook-verified before booking becomes <span className="text-slate-900">Confirmed</span>.
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  )
}

