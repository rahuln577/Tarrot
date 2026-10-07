const SERVICES = {
  'Love': {
    serviceType: 'Love',
    label: 'Tarot for Love',
    priceInRupees: 2,
    durationMinutes: 60,
  },
  'Career': {
    serviceType: 'Career',
    label: 'Tarot for Career',
    priceInRupees: 2,
    durationMinutes: 60,
  },
  'Personal Growth': {
    serviceType: 'Personal Growth',
    label: 'Tarot for Personal Growth',
    priceInRupees: 2,
    durationMinutes: 60,
  },
}

function getServiceByType(serviceType) {
  if (!serviceType || typeof serviceType !== 'string') return null
  return SERVICES[serviceType.trim()] || null
}

function getAllServices() {
  return Object.values(SERVICES)
}

module.exports = {
  SERVICES,
  getServiceByType,
  getAllServices,
}
