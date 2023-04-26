// @ts-check
var path = require('path')
var Web3 = require('web3')

var Tx = require('ethereumjs-tx')
const l = require('./logger.service')
const fileName = path.basename(__filename);

const {
  MAX_GAS_LIMIT,
  geth,
} =  require('../config/config')

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(geth.rpcUrl));

function getContractInstance(abi, address) {
  return new web3.eth.Contract(abi, address);
}

function toChecksumAddress(address) {
  return web3.utils.toChecksumAddress(address);
}

async function estimateGas(payload) {
  let logmsg = fileName + ' | estimate Gas |'
  try {
    let { from, to, data } = payload
    if (!from || !to || !data) return null
    let estimatedGas = await web3.eth.estimateGas({ from, to, value:0, data })
    return (MAX_GAS_LIMIT && estimatedGas >= MAX_GAS_LIMIT) ? null: estimatedGas
  } catch(e) {
    l.error(logmsg, e.message)
    throw e;
  }
}

async function getGasPrice() {
  let logmsg = fileName + ' | getGasPrice |'
  try {
    return await web3.eth.getGasPrice()
  } catch (e){
    l.error(logmsg, e.message)
    return null
  }
}

async function signTx(payload) {
  let logmsg = fileName + ' | signTx |'
  try{
    let { from, to, data, value, gas, gasPrice, privKey, nonce } = payload
    if(!nonce) nonce = await web3.eth.getTransactionCount(from, 'pending')
    if(!value) value = 0

    let txParams = {
      to,
      data,
      value: web3.utils.toHex(value),
      gasPrice: web3.utils.toHex(gasPrice),
      gas: web3.utils.toHex(gas),
      nonce: web3.utils.toHex(nonce)
    }
    var tx = new Tx(txParams)
    privKey = await _validatePrivKey(privKey)
    privKey = new Buffer(privKey, 'hex')
    tx.sign(privKey)
    privKey = null
    return tx
  } catch (e){
    l.error(logmsg, e.message)
    return null
  }
}

async function submitSignedTx(serializedTx) {
  let logmsg = fileName + ' | submit Tx |'
  try{
    return new Promise((fullfill, reject) => {
      web3.eth.sendSignedTransaction(serializedTx)
        .on('transactionHash', txHash => {
          l.info('transaction sent. hash =>', txHash)
          return fullfill({success: true, txHash : txHash})
        })
        .on('error', e => {
          // console.log('unable to send tx', e)
          l.error(logmsg, e.message)
          return fullfill({success: false, message: e})
        })
    })
  } catch(e){
    l.error(logmsg, e.message)
    return {success: false, message: e.message };
  }
}

async function getPendingNonce(address){
  let logmsg = fileName + ' | getPendingNonce |'
  try {
    return await web3.eth.getTransactionCount(address, 'pending')
  } catch(e){
    l.error(logmsg, e.message)
    return null
  }
}

async function getTxStatus(txHash) {
  let logmsg = fileName + ' | getTxStatus |'
  try {
    var txReceipt = await web3.eth.getTransactionReceipt(txHash);
    if(!txReceipt) return 'PENDING'
    if(txReceipt.status) return 'COMPLETED';
    if(!txReceipt.status) return 'FAILED'
   
    
  } catch (e){
    l.error(logmsg, e.message)
    return 'PENDING'
  }
}

async function _validatePrivKey(privKey){
  if(privKey.startsWith('0x')) privKey = privKey.substr(2)
  return privKey
}

async function isContract(address) {
  const code = await web3.eth.getCode(address)
  return code === '0x0'
}

module.exports = {
  signTx,
  getContractInstance,
  estimateGas,
  getGasPrice,
  submitSignedTx,
  getPendingNonce,
  getTxStatus,
  isContract,
  toChecksumAddress,
}