Returned from market
{
  info: {
    symbol: 'DOGEEUR',
    orderId: 30354439,
    orderListId: -1,
    clientOrderId: 'VFy1UQ5MgQ28vHE6XWAGEE',     
    transactTime: 1618600668457,
    price: '0.00000000',
    origQty: '50.00000000',
    executedQty: '50.00000000',
    cummulativeQuoteQty: '13.52100000',
    status: 'FILLED',
    timeInForce: 'GTC',
    type: 'MARKET',
    side: 'BUY',
    fills: [ [Object] ]
  },
  id: '30354439',
  clientOrderId: 'VFy1UQ5MgQ28vHE6XWAGEE',       
  timestamp: 1618600668457,
  datetime: '2021-04-16T19:17:48.457Z',
  lastTradeTimestamp: undefined,
  symbol: 'DOGE/EUR',
  type: 'market',
  side: 'buy',
  price: 0.27042,
  amount: 50,
  cost: 13.520999999999999,
  average: 0.27042,
  filled: 50,
  remaining: 0,
  status: 'closed',
  fee: { cost: 0.05, currency: 'DOGE' },
  trades: [
    {
      info: [Object],
      timestamp: undefined,
      datetime: undefined,
      symbol: 'DOGE/EUR',
      id: undefined,
      order: undefined,
      type: undefined,
      takerOrMaker: undefined,
      side: undefined,
      price: 0.27042,
      amount: 50,
      cost: 13.520999999999999,
      fee: [Object]
    }
  ]
}
buy order
30354439
symbol
DOGE/EUR
sent checking: 30354439 on: DOGE/EUR
sent fetch: 30354439 on: DOGE/EUR
EEE in fetch:  OrderNotFound: binance {"code":-2013,"msg":"Order does not exist."}
    at binance.throwExactlyMatchedException (D:\GDrive\delo\ParkSide\node_modules\ccxt\js\base\Exchange.js:531:19)
    at binance.handleErrors (D:\GDrive\delo\ParkSide\node_modules\ccxt\js\binance.js:1955:26)     
    at D:\GDrive\delo\ParkSide\node_modules\ccxt\js\base\Exchange.js:627:18
    at processTicksAndRejections (internal/process/task_queues.js:97:5)
    at async timeout (D:\GDrive\delo\ParkSide\node_modules\ccxt\js\base\functions\time.js:178:24) 
    at async binance.request (D:\GDrive\delo\ParkSide\node_modules\ccxt\js\binance.js:1966:26)    
    at async binance.fetchOrder (D:\GDrive\delo\ParkSide\node_modules\ccxt\js\binance.js:1229:26) 
    at async orderInfo (D:\GDrive\delo\ParkSide\src\js\api.js:371:13)
    at async isOpen (D:\GDrive\delo\ParkSide\src\js\api.js:232:13)
    at async checker (D:\GDrive\delo\ParkSide\src\js\api.js:258:12) {
  constructor: [Function: OrderNotFound],        
  name: 'OrderNotFound'
}
failed
undefined
checker fail

delay
sent checking: 30354439 on: DOGE/EUR
{
  info: {
    symbol: 'DOGEEUR',
    orderId: 30354439,
    orderListId: -1,
    clientOrderId: 'VFy1UQ5MgQ28vHE6XWAGEE',     
    price: '0.00000000',
    origQty: '50.00000000',
    executedQty: '50.00000000',
    cummulativeQuoteQty: '13.52100000',
    status: 'FILLED',
    timeInForce: 'GTC',
    type: 'MARKET',
    side: 'BUY',
    stopPrice: '0.00000000',
    icebergQty: '0.00000000',
    time: 1618600668457,
    updateTime: 1618600668457,
    isWorking: true,
    origQuoteOrderQty: '0.00000000'
  },
  id: '30354439',
  clientOrderId: 'VFy1UQ5MgQ28vHE6XWAGEE',       
  timestamp: 1618600668457,
  datetime: '2021-04-16T19:17:48.457Z',
  lastTradeTimestamp: undefined,
  symbol: 'DOGE/EUR',
  type: 'market',
  side: 'buy',
  price: 0.27042,
  amount: 50,
  cost: 13.521,
  average: 0.27042,
  filled: 50,
  remaining: 0,
  status: 'closed',
  fee: undefined,
  trades: undefined
}
closed
DONE
{
  status: undefined,
  orderId: '30354439',
  orderType: 'bougth',
  bougthPrice: 0.27042,
  symbol: 'DOGE/EUR',
  side: 'buy'
}