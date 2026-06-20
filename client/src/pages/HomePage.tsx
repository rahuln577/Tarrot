import {
  ArrowRight,
  CalendarDays,
  Gem,
  Heart,
  Quote,
  Sparkles,
  Star,
  Target,
  Video,
  Wand2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FadeInUp } from '../components/animations/FadeInUp'
import { Button } from '../components/ui/button'
import { Calendar } from '../components/ui/calendar'

const TIME_SLOTS = ['10:00', '12:00', '15:00', '18:00']

const services = [
  {
    title: 'Love',
    label: 'Tarot for Love',
    desc: 'Relationships, healing & emotional clarity.',
    icon: Heart,
    gradient: 'from-rose-400/20 to-pink-500/10',
  },
  {
    title: 'Career',
    label: 'Tarot for Career',
    desc: 'Direction, timing & confident next steps.',
    icon: Target,
    gradient: 'from-sky-400/20 to-indigo-500/10',
  },
  {
    title: 'Personal Growth',
    label: 'Tarot for Growth',
    desc: 'Purpose, alignment & inner peace.',
    icon: Sparkles,
    gradient: 'from-violet-400/20 to-fuchsia-500/10',
  },
]

const testimonials = [
  {
    name: 'Monalika P.',
    text: 'Strikingly accurate. I left with renewed purpose and clarity.',
  },
  {
    name: 'Aditya Paul',
    text: 'Her predictions became true. She guided me through my toughest phase.',
  },
  {
    name: 'Chethan M',
    text: 'Exceeded expectations. Her intuition and explanations were incredible.',
  },
  {
    name: 'Archana S',
    text: 'Warm, calm, and comforting. Gave me clarity when I needed it most.',
  },
]

const galleryImages = [
  { src: '/divinesurmise/gallery/gallery-1.png', alt: 'Tarot reading moment' },
  { src: '/divinesurmise/gallery/gallery-2.png', alt: 'Client tarot reading' },
  { src: '/divinesurmise/gallery/gallery-3.png', alt: 'Tarot consultation' },
  { src: '/divinesurmise/gallery/gallery-4.png', alt: 'Intuitive guidance session' },
]

const vibes = [
  { label: 'Years of intuition', value: '10+' },
  { label: 'Session vibe', value: 'Safe' },
  { label: 'Guidance style', value: 'Real' },
]

function Tile({
  children,
  className = '',
  delay = 0,
  id,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  id?: string
}) {
  return (
    <FadeInUp delay={delay}>
      <motion.div
        id={id}
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className={[
          'group relative overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-md sm:p-6',
          'before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/50 before:to-transparent before:opacity-0 before:transition-opacity group-hover:before:opacity-100',
          className,
        ].join(' ')}
      >
        {children}
      </motion.div>
    </FadeInUp>
  )
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  const bookingReady = Boolean(selectedDate && selectedTime)
  const formattedSelection = useMemo(() => {
    if (!selectedDate || !selectedTime) return null
    const [h, m] = selectedTime.split(':').map(Number)
    const dt = new Date(selectedDate)
    dt.setHours(h, m, 0, 0)
    return dt.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }, [selectedDate, selectedTime])

  const activeTestimonial = testimonials[testimonialIndex]!

  return (
    <div className="relative flex flex-col gap-8 pb-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-32 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-40 left-1/3 h-64 w-64 rounded-full bg-fuchsia-200/25 blur-3xl"
      />

      {/* Hero strip */}
      <FadeInUp>
        <section className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 px-6 py-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_55%)]" />
          <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                your intuition era starts here
              </span>
              <h1 className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Tarot that actually{' '}
                <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">
                  gets you
                </span>
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                Love, career, growth — pick your vibe, book a slot, and get real guidance from Anandamayii
                Roopa. No judgment. Just clarity.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {vibes.map((v) => (
                <div
                  key={v.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur-sm"
                >
                  <div className="text-lg font-semibold text-gold">{v.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-white/60">{v.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInUp>

      {/* Bento grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-min">
        {/* Booking calendar tile */}
        <Tile className="md:col-span-7 md:row-span-2" delay={0.05}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-gold">
                <CalendarDays className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Book a session</span>
              </div>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
                Pick your date & time
              </h2>
              <p className="mt-1 text-sm text-slate-600">Secure checkout + Google Meet invite after payment.</p>
            </div>
            <span className="hidden rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 sm:inline">
              live slots
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-gold/15 bg-gradient-to-br from-amber-50/80 to-white p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: new Date() }}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Time slots</p>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const active = slot === selectedTime
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!selectedDate}
                        onClick={() => setSelectedTime(slot)}
                        className={[
                          'rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                          !selectedDate && 'cursor-not-allowed opacity-40',
                          active
                            ? 'border-gold bg-gold/15 text-slate-900 shadow-goldGlow'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-gold/40 hover:bg-gold/5',
                        ].join(' ')}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-auto space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your pick</p>
                <p className="text-sm font-medium text-slate-800">
                  {formattedSelection ?? 'Select a date and time to continue'}
                </p>
                {bookingReady ? (
                  <Button asChild size="lg" className="w-full">
                    <Link to="/booking">Continue booking</Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    Choose date & time
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Tile>

        {/* Profile tile */}
        <Tile className="md:col-span-5" delay={0.08}>
          <div className="flex h-full flex-col gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-violet-50 to-amber-50 p-3">
              <img
                src="/divinesurmise/jetpack/wp-content/uploads/2024/10/image-4.png"
                alt="Anandamayii Roopa"
                className="mx-auto h-44 w-full max-w-[220px] rounded-xl object-cover object-top shadow-lg sm:h-48"
              />
            </div>
            <div className="flex items-center gap-3">
              <img
                src="/divinesurmise/images/logo.png"
                alt=""
                className="h-11 w-11 rounded-full border border-gold/30 bg-white object-cover"
              />
              <div>
                <h3 className="font-heading text-lg font-semibold text-slate-900">Anandamayii Roopa</h3>
                <p className="text-sm text-slate-600">Tarot reader • 10+ years</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              Tarot is a mirror to the soul — compassionate, non-judgmental guidance in a safe space.
            </p>
            <Button asChild variant="outline" className="mt-auto w-full">
              <Link to="/#about">
                Meet Roopa <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Tile>

        {/* Services tile */}
        <Tile className="md:col-span-5" delay={0.1}>
          <div className="mb-4 flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-gold" />
            <h2 className="font-heading text-xl font-semibold text-slate-900">Choose your reading</h2>
          </div>
          <div className="space-y-3">
            {services.map((s) => (
              <Link
                key={s.title}
                to="/booking"
                className={[
                  'flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-r p-3 transition hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-md',
                  s.gradient,
                ].join(' ')}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/80 bg-white/80">
                  <s.icon className="h-5 w-5 text-gold" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900">{s.label}</div>
                  <div className="truncate text-xs text-slate-600">{s.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        </Tile>

        {/* Crystal shop tile */}
        <Tile className="md:col-span-4" delay={0.12}>
          <div className="flex h-full flex-col">
            <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Gem className="h-3.5 w-3.5" />
              crystal shop
            </div>
            <h2 className="font-heading text-2xl font-semibold text-slate-900">Healing stones</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Rose quartz, amethyst, citrine & more — curated for your energy.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {['Rose Quartz', 'Amethyst', 'Citrine', 'Clear Quartz'].map((name) => (
                <div
                  key={name}
                  className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-3 py-2 text-xs font-medium text-emerald-900"
                >
                  {name}
                </div>
              ))}
            </div>
            <Button asChild className="mt-auto w-full pt-4">
              <Link to="/crystals">
                Shop crystals <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Tile>

        {/* Philosophy tile */}
        <Tile className="md:col-span-4" delay={0.14} id="about">
          <Quote className="h-8 w-8 text-gold/80" />
          <h2 className="mt-3 font-heading text-xl font-semibold text-slate-900">The vibe</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            I believe tarot reveals patterns you can&apos;t always see. My sessions are warm, honest, and
            empowering — so you leave with clarity you can actually use.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['No judgment', 'Real talk', 'Safe space', 'Actionable clarity'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </Tile>

        {/* Testimonials tile */}
        <Tile className="md:col-span-4" delay={0.16}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-gold text-gold" />
              <h2 className="font-heading text-xl font-semibold text-slate-900">Client love</h2>
            </div>
            <div className="flex gap-1">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show testimonial ${i + 1}`}
                  onClick={() => setTestimonialIndex(i)}
                  className={[
                    'h-2 w-2 rounded-full transition',
                    i === testimonialIndex ? 'bg-gold' : 'bg-slate-300 hover:bg-slate-400',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>
          <motion.div
            key={activeTestimonial.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 rounded-2xl border border-gold/15 bg-gradient-to-br from-amber-50/60 to-white p-4"
          >
            <p className="text-sm leading-relaxed text-slate-700">&ldquo;{activeTestimonial.text}&rdquo;</p>
            <p className="mt-3 text-xs font-semibold text-slate-900">— {activeTestimonial.name}</p>
          </motion.div>
        </Tile>

        {/* Gallery tile */}
        <Tile className="md:col-span-6" delay={0.18}>
          <h2 className="font-heading text-xl font-semibold text-slate-900">Session moments</h2>
          <p className="mt-1 text-sm text-slate-600">Real readings. Real clarity. Real calm.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={img.src}
                whileHover={{ scale: 1.03 }}
                className={[
                  'overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm',
                  i === 0 ? 'sm:col-span-2 sm:row-span-2' : '',
                ].join(' ')}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="aspect-square h-full w-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </Tile>

        {/* Video tile */}
        <Tile className="md:col-span-6" delay={0.2}>
          <div className="mb-3 flex items-center gap-2">
            <Video className="h-5 w-5 text-gold" />
            <h2 className="font-heading text-xl font-semibold text-slate-900">Watch a live reading</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gold/20 bg-slate-900/5">
            <video
              className="aspect-video w-full object-cover"
              controls
              preload="metadata"
              playsInline
              poster="/divinesurmise/jetpack/wp-content/uploads/2025/01/ritz_mp4_std.original.jpg"
            >
              <source
                src="/divinesurmise/jetpack/wp-content/uploads/2024/11/WhatsApp-Video-2024-10-23-at-16.33.23_53d61d5c.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </Tile>

        {/* Final CTA tile */}
        <Tile className="md:col-span-12" delay={0.22}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
                Ready when you are ✨
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Book a session, pay securely, and get your Google Meet link after confirmation.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/booking">
                  Book now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/crystals">Crystal shop</Link>
              </Button>
            </div>
          </div>
        </Tile>
      </section>
    </div>
  )
}
