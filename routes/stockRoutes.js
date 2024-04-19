const express = require('express')
const stockController = require('./../controllers/stockController')
const router = express.Router();

router.get('/nifty-100', stockController.getNIFTY100 )
router.get('/:stockName', stockController.getStockDayData)
module.exports = router