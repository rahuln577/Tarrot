const express = require('express')
const { listServices, createBookingOrder, getBookingStatus } = require('../controllers/bookingController')

const router = express.Router()

router.get('/services', listServices)
router.post('/create', createBookingOrder)
router.get('/status/:appointmentId', getBookingStatus)

module.exports = router
