const express = require('express')
const { createBookingOrder, getBookingStatus } = require('../controllers/bookingController')

const router = express.Router()

router.post('/create', createBookingOrder)
router.get('/status/:appointmentId', getBookingStatus)

module.exports = router

