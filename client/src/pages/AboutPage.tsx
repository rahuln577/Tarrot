import { ArrowRight, Heart, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FadeInUp } from '../components/animations/FadeInUp'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

const pillars = [
  {
    title: 'Deep intuition',
    desc: 'Readings that feel personal, grounded, and empowering.',
  },
  {
    title: 'Clear guidance',
    desc: 'Practical insights for love, career, and personal growth.',
  },
  {
    title: 'Respect & privacy',
    desc: 'A calm session space where you can speak freely.',
  },
]

const services = [
  { icon: Heart, label: 'Tarot for Love', desc: 'Relationships, emotions, and healing.' },
  { icon: Target, label: 'Tarot for Career', desc: 'Direction, timing, and confidence.' },
  { icon: Sparkles, label: 'Tarot for Growth', desc: 'Purpose, alignment, and clarity.' },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-10">
      <FadeInUp>
        <div className="grid items-start gap-8 md:grid-cols-[1fr_1.1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-violet-50 to-amber-50 p-4">
            <img
              src="/divinesurmise/jetpack/wp-content/uploads/2024/10/image-4.png"
              alt="Anandamayii Roopa"
              className="mx-auto w-full max-w-sm rounded-2xl object-cover object-top shadow-lg"
            />
          </div>

          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              About Anandamayii Roopa
            </span>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Your guide to clarity & intuition
            </h1>
            <p className="text-base leading-relaxed text-slate-700">
              Hi, I&apos;m Anandamayii Roopa — a tarot reader and spiritual practitioner with over 10 years of
              experience. My journey into tarot began as a way to connect deeper with my own intuition. Now, I
              use this powerful tool to help others navigate life&apos;s uncertainties.
            </p>
            <p className="text-base leading-relaxed text-slate-700">
              My readings go beyond predicting the future. They empower you to make informed decisions and
              embrace the path ahead with confidence.
            </p>
          </div>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.05}>
        <Card className="border-gold/20 bg-white/75 p-6">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-2xl">Approach & philosophy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              I believe tarot is a mirror to the soul. It reveals patterns and insights that are not instantly
              visible. My approach is compassionate and non-judgmental — a safe space to explore your feelings
              and find the clarity you need.
            </p>
            <p>
              With 10+ years of experience, I bring a gentle, intuitive approach to every session — helping you
              understand patterns, release uncertainty, and move forward with purpose.
            </p>
          </CardContent>
        </Card>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-gold">✦</span> {p.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">{p.desc}</CardContent>
            </Card>
          ))}
        </div>
      </FadeInUp>

      <FadeInUp delay={0.15}>
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">What I offer</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-gold/20 bg-white/70 p-4 shadow-[0_0_0_1px_rgba(212,175,55,0.12)]"
              >
                <s.icon className="mb-2 h-5 w-5 text-gold" />
                <div className="text-sm font-semibold text-slate-900">{s.label}</div>
                <div className="mt-1 text-xs text-slate-600">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.2}>
        <div className="rounded-3xl border border-gold/30 bg-white/70 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold text-slate-900">Ready for a session?</h2>
              <p className="max-w-xl text-sm text-slate-600">
                Book a tarot reading and receive warm, actionable guidance tailored to your journey.
              </p>
            </div>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/booking">
                Book a reading <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </FadeInUp>
    </div>
  )
}
