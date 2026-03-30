const express = require('express')
const { createShopOrder, getShopOrderStatus } = require('../controllers/shopController')

const router = express.Router()

router.post('/create', createShopOrder)
router.get('/status/:shopOrderId', getShopOrderStatus)

module.exports = router

