
const AppError = require('./../utils/AppError')
const catchAsyncErrors = require('../utils/catchAsyncErrors');

const { NseIndia } = require('stock-nse-india');

const stocks = new NseIndia();

exports.getNIFTY100 = catchAsyncErrors(async (req, res, next) => {
    const stocksData = await stocks.getEquityStockIndices('NIFTY 100')

    res.status(200).json({
        status: "success",
        stocksData
    })
})

exports.getStockDayData = catchAsyncErrors( async (req, res, next) => {

    const stockSymbols = await stocks.getAllStockSymbols();
    
    if (!stockSymbols.includes(req.params.stockName)) {
        next(new AppError('Invalid stock name! Please enter a valid symbol.', 400))
    }    

    const stockData = await stocks.getEquityIntradayData(req.params.stockName)

    res.status(200).json({
        status: "success",
        stockData
    })
})

