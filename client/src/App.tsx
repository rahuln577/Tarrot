import { Route, Routes } from 'react-router-dom'
import BookingPage from './pages/BookingPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import CrystalShopPage from './pages/CrystalShopPage'
import CrystalSuccessPage from './pages/CrystalSuccessPage'
import HomePage from './pages/HomePage'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="section-container pt-20 pb-10 sm:pb-14">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/success" element={<BookingSuccessPage />} />
          <Route path="/crystals" element={<CrystalShopPage />} />
          <Route path="/crystals/success" element={<CrystalSuccessPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
