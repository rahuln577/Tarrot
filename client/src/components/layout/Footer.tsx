import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-white/60">
      <div className="section-container py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            © {new Date().getFullYear()} Anandamayii Roopa. All rights reserved.
          </div>
          <div className="flex gap-4 text-sm">
            <Link className="text-gold hover:text-gold-dark" to="/booking">
              Booking
            </Link>
            <Link className="text-gold hover:text-gold-dark" to="/crystals">
              Crystal Shop
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

