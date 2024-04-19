
const {NseIndia} = require('stock-nse-india');
const stocks = new NseIndia();
 

// exports.getNIFTY100 = async () => {
//     return await stocks.getEquityStockIndices('NIFTY 100')
// }

// stocks.getEquityIntradayData('ADANIENSOL').then(data => console.log(data))

stocks.getAllStockSymbols().then(data => console.log(data.length))