import { ArrowRight, Heart, Star, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FadeInUp } from '../components/animations/FadeInUp'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Monalika P.',
    text: 'I recently had a tarot card reading with Roopa ma’am, and the experience was both insightful and transformative. The session was strikingly accurate, with her insights resonating deeply with my current life. Her guidance was both reassuring and constructive, helping me see my situation more clearly and move forward with confidence and purpose. Roopa ma’am’s warmth and compassion created a safe space, allowing me to discuss sensitive topics openly and comfortably. Overall, after the session, I left with a renewed sense of purpose, feeling grounded and inspired by her advice.',
  },
  {
    name: 'Aditya Paul',
    text: '“God can’t be everywhere at a time, that’s why he send his angel!” You are among one of them.\n\nVery first meeting I remember, what ever you told truly speaking I haven’t believe! But when all those things happened to me/ my life then I recall each and every words of your and even till now I am surprised how a person without knowing another predicted such a right things.\n\nDuring those toughest situation i remember you were just beside me as a mentor and guided me in a right path. Again I can see hope as your predictions are becoming true—everything is getting normal as you said. You won’t believe you have achieved a different level of respect in my eyes.\n\nI wish you may get all the beautiful things in your life and always blessed with happiness and prosperity by the almighty. I will needing you help again—and i know you will be helping me again.\n\nThank you “Akka”❤🙏🙏🙏🙏”',
  },
  {
    name: 'Chethan M',
    text: 'Reading session with anandamayii roopa has truly exceeded my expectations. What impressed me the most was how accurate the predictions were at first I was skeptic but it turned out to be eye opener for me. Her intuition is incredible and always took time to explain the cards, making me feel engaged throughout the session. Her ability to connect with my energy was remarkable and her interpretations were both insightful and encouraging. I highly recommend this experience to anyone seeking personal insights and a deeper understanding of their journey ahead”',
  },
  {
    name: 'Archana S',
    text: 'Roopa is a very warm and a calm person. I instantly feel comfortable and at ease around her. Her predictions are accurate and she puts across the message in a very comforting way. My tarot reading session with her gave me a lot of clarity and relieved my confused mind. Her guidance has helped me put many difficult situations in proper place. She always makes us feel satisfied and makes us feel there is always a way to get over the difficulties. My love to her.',
  },
]

const galleryImages = [
  { src: '/divinesurmise/gallery/gallery-1.png', alt: 'Tarot reading moment' },
  { src: '/divinesurmise/gallery/gallery-2.png', alt: 'Client tarot reading' },
  { src: '/divinesurmise/gallery/gallery-3.png', alt: 'Tarot consultation' },
  { src: '/divinesurmise/gallery/gallery-4.png', alt: 'Intuitive guidance session' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col gap-24">
      {/* Hero */}
      <section className="pt-6">
        <FadeInUp>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/70 px-4 py-2 text-sm text-slate-700">
                <Sparkles className="h-4 w-4 text-gold" />
                Tarot Reading Service • Clarity & Guidance
              </div>

              <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Discover Your Intuition through Tarot Insights
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">
                Professional tarot readings for love, career, and personal growth - delivered with warmth and clarity.
              </p>

              <p className="max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">
                “Hi, I’m Anandamayii Roopa, a tarot reader and spiritual practitioner with over 10 years of experience. My journey into tarot began as a way to connect deeper with my own intuition. Now, I use this powerful tool to help others navigate life’s uncertainties. My readings go beyond predicting the future. They empower you to make informed decisions and embrace the path ahead.”
              </p>

              <p className="max-w-xl text-sm leading-relaxed text-slate-700">
                <span className="font-semibold">Approach and Philosophy:</span> “I believe tarot is a mirror to the soul. It reveals patterns and insights that are not instantly visible. My approach is compassionate. It is non-judgmental. This provides you with a safe space to explore your feelings. It helps you find the clarity you need.”
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <Link to="/booking">
                    Book Your Appointment Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/crystals">Shop Healing Crystals</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                {['Non-judgmental space', 'Clarity you can act on', 'Warm, intuitive guidance'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-gold/20 bg-white/70 px-3 py-1 text-xs text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl border border-gold/30 bg-white/70 p-4 shadow-[0_0_0_1px_rgba(212,175,55,0.22),0_20px_60px_rgba(0,0,0,0.06)]"
              >
                <img
                  src="/divinesurmise/images/background.png"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-25"
                />

                <div className="relative flex items-center justify-center">
                  <img
                    src="/divinesurmise/jetpack/wp-content/uploads/2024/10/image-4.png"
                    alt="Anandamayii Roopa"
                    className="h-auto w-full max-w-[420px] rounded-xl border border-gold/20 shadow-goldGlow"
                  />
                </div>

                <div className="relative mt-4 flex items-center justify-between gap-3 rounded-xl border border-gold/20 bg-white/80 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src="/divinesurmise/images/logo.png"
                      alt="Anandamayii Roopa"
                      className="h-10 w-10 rounded-full border border-gold/30 bg-white object-cover"
                    />
                    <div className="leading-tight">
                      <div className="text-sm font-semibold text-slate-900">Anandamayii Roopa</div>
                      <div className="text-xs text-slate-600">Tarot Reader</div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
                    <Sparkles className="h-4 w-4 text-gold" />
                    Spiritual guidance
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* About */}
      <section id="about">
        <FadeInUp>
          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">About Anandamayii Roopa</h2>
            <p className="max-w-3xl text-base leading-relaxed text-slate-700">
              With 10+ years of experience, Anandamayii Roopa brings a gentle, intuitive approach to tarot readings—helping you
              understand patterns, release uncertainty, and move forward with clarity.
            </p>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
              <span className="font-semibold">Approach and Philosophy:</span> “I believe tarot is a mirror to the soul. It reveals patterns and insights that are not instantly visible. My approach is compassionate. It is non-judgmental. This provides you with a safe space to explore your feelings. It helps you find the clarity you need.”
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-gold">✦</span> Deep intuition
                </CardTitle>
              </CardHeader>
              <CardContent>
                Readings that feel personal, grounded, and empowering.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-gold">✦</span> Clear guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                Practical insights for love, career, and personal growth.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-gold">✦</span> Respect & privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                A calm session space where you can speak freely.
              </CardContent>
            </Card>
          </div>
        </FadeInUp>
      </section>

      {/* Services */}
      <section>
        <FadeInUp delay={0.05}>
          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Services</h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-700">
              Choose the theme you want clarity on. Each session is guided with warmth, intuition, and actionable next steps.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: 'Tarot for Love', desc: 'Relationships, emotions, reconciliation, and healing.', icon: Heart },
              { title: 'Tarot for Career', desc: 'Direction, timing, opportunities, and confidence.', icon: Target },
              { title: 'Tarot for Personal Growth', desc: 'Inner alignment, purpose, and spiritual clarity.', icon: Sparkles },
            ].map((s) => (
              <Card key={s.title} className="p-5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <s.icon className="h-5 w-5 text-gold" />
                    {s.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-700">{s.desc}</CardContent>
                <div className="mt-5">
                  <Button asChild variant="outline" className="w-full justify-center">
                    <Link to="/booking?service=">
                      Book Now
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </FadeInUp>
      </section>

      {/* Testimonials */}
      <section>
        <FadeInUp delay={0.1}>
          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Transformative Tarot Experiences: Client Testimonials
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-700">
              Welcome to our <span className="font-semibold">Testimonials</span> page, where we celebrate the transformative experiences of our clients. Here, you’ll find heartfelt stories and inspiring feedback from those who have embarked on their journeys of self-discovery and empowerment through tarot readings.
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-slate-700">
              Every tarot reading offers a unique exploration of life’s mysteries. Check out our live event video featuring real-time tarot sessions, highlighting the clarity and guidance clients have experienced.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-5">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Star className="h-4 w-4" />
                  <span className="text-xs font-semibold text-slate-900">{t.name}</span>
                </div>
                <CardContent className="mt-3 text-sm leading-relaxed text-slate-700">
                  {t.text.split('\n').map((line, idx) => (
                    // Keep line breaks readable inside card.
                    <p key={`${t.name}-${idx}`} className={idx === 0 ? '' : 'mt-2'}>
                      {idx === 0 ? '“' : null}
                      {line}
                      {idx === 0 ? '”' : null}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gallery */}
          <div className="mt-10">
            <FadeInUp delay={0.15}>
              <div className="space-y-3 px-1">
                <h3 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">
                  A calm space for real moments
                </h3>
                <p className="max-w-2xl text-base leading-relaxed text-slate-700">
                  Step into Anandamayii Roopa’s serene tarot sessions. These moments reflect the warmth, trust, and clarity clients experience.
                </p>
              </div>

              <div className="mt-6 grid gap-2 grid-cols-2 sm:grid-cols-4 max-w-6xl mx-auto">
                {galleryImages.map((img) => (
                  <div
                    key={img.src}
                    className="group overflow-hidden rounded-2xl bg-white/60 shadow-[0_1px_14px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
                  >
                    <div className="relative aspect-square w-full h-full">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </FadeInUp>
          </div>

          {/* Video embed */}
          <div className="mt-10">
            <FadeInUp delay={0.2}>
              <Card className="overflow-hidden p-0">
                <div className="px-5 pt-5">
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-gold" />
                      Live Reading Video (Client Interaction)
                    </CardTitle>
                  </CardHeader>
                </div>

                <div className="relative mt-4 rounded-2xl border border-gold/20 bg-white/70 p-3 mx-5 mb-5 shadow-[0_0_0_1px_rgba(212,175,55,0.12)]">
                  <div className="w-full overflow-hidden rounded-xl">
                    <video
                      title="Client interaction video"
                      className="h-[360px] w-full object-cover"
                      controls
                      preload="metadata"
                      playsInline
                      poster="/divinesurmise/jetpack/wp-content/uploads/2025/01/ritz_mp4_std.original.jpg"
                    >
                      <source
                        src="/divinesurmise/jetpack/wp-content/uploads/2024/11/WhatsApp-Video-2024-10-23-at-16.33.23_53d61d5c.mp4"
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </Card>
            </FadeInUp>
          </div>
        </FadeInUp>
      </section>

      {/* CTA */}
      <section>
        <FadeInUp delay={0.15}>
          <div className="rounded-2xl border border-gold/30 bg-white/70 p-6 sm:p-8 shadow-[0_0_0_1px_rgba(212,175,55,0.18)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h3 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">
                  Ready for clarity?
                </h3>
                <p className="max-w-xl text-base leading-relaxed text-slate-700">
                  Choose a date, complete payment securely, and receive your Google Meet invitation.
                </p>
              </div>
              <Button asChild size="lg">
                <Link to="/booking">
                  Book Your Session
                </Link>
              </Button>
            </div>
          </div>
        </FadeInUp>
      </section>
    </div>
  )
}

