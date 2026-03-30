import { Link } from 'react-router-dom'
import { Button } from '../ui/button'

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/20 bg-white/70 backdrop-blur-sm">
      <div className="section-container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 shadow-[0_0_0_1px_rgba(212,175,55,0.20)]">
            <img src="/divinesurmise/images/logo.png" alt="Anandamayii Roopa" className="h-5 w-5 object-contain" />
          </span>
          <div className="leading-tight">
            <div className="font-heading text-sm font-semibold tracking-wide text-slate-950">
              Anandamayii Roopa
            </div>
            <div className="text-xs text-slate-600">Tarot Reader</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/#about">About</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/booking">Book a Reading</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/crystals">Crystal Shop</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

