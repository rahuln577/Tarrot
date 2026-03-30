import { ArrowRight, Mail, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FadeInUp } from '../components/animations/FadeInUp'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled'

type BookingStatusResponse = {
  appointmentId: string
  status: BookingStatus
  scheduledAt: string
  serviceType: string
  googleMeetLink: string | null
}

async function getBookingStatus(appointmentId: string): Promise<BookingStatusResponse> {
  const res = await fetch(`https://tarrot-eyi5.onrender.com/api/booking/status/${appointmentId}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch booking status')
  return data as BookingStatusResponse
}

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointmentId') || ''

  const [status, setStatus] = useState<BookingStatus>('Pending')
  const [googleMeetLink, setGoogleMeetLink] = useState<string | null>(null)
  const [serviceType, setServiceType] = useState<string>('')
  const [scheduledAt, setScheduledAt] = useState<string>('')

  const shouldPoll = useMemo(() => appointmentId.length > 0, [appointmentId])

  useEffect(() => {
    let alive = true

    async function poll() {
      if (!appointmentId) return

      const start = Date.now()
      while (alive && Date.now() - start < 120_000) {
        try {
          const s = await getBookingStatus(appointmentId)
          if (!alive) return

          setStatus(s.status)
          setGoogleMeetLink(s.googleMeetLink)
          setServiceType(s.serviceType)
          setScheduledAt(new Date(s.scheduledAt).toLocaleString())

          if (s.status === 'Confirmed' || s.status === 'Cancelled') return
        } catch {
          // ignore transient errors
        }

        // poll every 2.5s
        await new Promise((r) => setTimeout(r, 2500))
      }
    }

    if (shouldPoll) poll()

    return () => {
      alive = false
    }
  }, [appointmentId, shouldPoll])

  return (
    <div className="flex flex-col gap-6">
      <FadeInUp>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {status === 'Confirmed' ? 'Booking Confirmed' : 'Booking Pending'}
          </h1>
          <p className="max-w-2xl text-slate-700">
            {status === 'Confirmed'
              ? 'Your payment is verified and your Google Meet invite is being processed.'
              : 'We’re verifying payment via webhook. This usually takes a moment.'}
          </p>
        </div>
      </FadeInUp>

      <div className="grid gap-4 lg:grid-cols-3">
        <FadeInUp delay={0.05} className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gold" /> Status
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              <div className="text-slate-900 font-semibold">{status}</div>
              <div className="mt-2">Service: {serviceType || '—'}</div>
              <div className="mt-1">Time: {scheduledAt || '—'}</div>
            </CardContent>
          </Card>
        </FadeInUp>

        <FadeInUp delay={0.1} className="lg:col-span-2">
          <Card className="p-5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gold" /> Google Meet Link
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              {status === 'Confirmed' ? (
                googleMeetLink ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-gold/30 bg-white/70 p-3 shadow-[0_0_0_1px_rgba(212,175,55,0.12)]">
                      <div className="font-semibold text-slate-900">Join here</div>
                      <a
                        className="mt-2 block break-all text-gold hover:text-gold-dark"
                        href={googleMeetLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {googleMeetLink}
                      </a>
                    </div>
                    <div className="text-xs text-slate-600">
                      You’ll also receive this link by email shortly.
                    </div>
                  </div>
                ) : (
                  <div>
                    Meet link will show here as soon as the webhook finishes generating it.
                  </div>
                )
              ) : (
                <div>
                  Please wait while we finalize your confirmation. You’ll get the Meet link by email.
                </div>
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

