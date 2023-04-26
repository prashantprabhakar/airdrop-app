module.exports = {
  geth: {
    rpcUrl: 'https://bsc-dataseed.binance.org/'
  },

  // additional fee while sending transaction. Required specially for bulk transactions.
  additionalFee: {
    gas: 20000,
    gasPrice: 2000000000 // 2 Gwei
  }, 

  logging :{
    level : 'info',
    logdir : 'log'
  },

  // You can define a max gas limit, to protect yourself from spending too much on a transaction.
  // Keep this to be 0 if you don't want a limit.
  MAX_GAS_LIMIT: 900000,

}