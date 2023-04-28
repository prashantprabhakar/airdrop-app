// @ts-check
const web3Svc = require('./web3.service');
const abi = require('../config/abis/erc1155');
const config = require('../config/config');
const { additionalFee } = config;
const l = require('./logger.service')
const { add, mul, div } = require('../utils/decimals');

class ERC1155 {
    constructor(contractAddress) {
        this.contractAddress = contractAddress;
        this.abi = abi;
        this.erc1155 = web3Svc.getContractInstance(this.abi, this.contractAddress);
    }

    getDataForTransfer(from, to, nftId, amount) {
        const data = this.erc1155.methods.safeTransferFrom(from, to, nftId, amount, '0x0');
        return data.encodeABI();
    }

    async transferSingle({from, to, nftId, amount, privateKey, metaData={}}) {
        const { nonce } = metaData;
        const data = this.getDataForTransfer(from, to, nftId, amount);
        // from, to, data, value, gas, gasPrice, privKey, nonce
        let txObj = {
            from,
            to: this.contractAddress,
            data,
            nonce,
        };
        
        const [estimatedGas, estimatedGasPrice ] = await Promise.all([
            web3Svc.estimateGas(txObj),
            web3Svc.getGasPrice()
        ])
        txObj.gas = estimatedGas + additionalFee.gas;
        txObj.gasPrice = add(estimatedGasPrice, additionalFee.gasPrice);
        const feeInEth = div(mul(txObj.gas, txObj.gasPrice), 10**18);
        l.info(`Transaction data`, {...txObj, data: null, feeInEth });
        txObj.privKey = privateKey;
        let signedTx = await web3Svc.signTx(txObj);
        if (!signedTx) throw "Unable to sign tx"
        signedTx = "0x" + signedTx.serialize().toString('hex')
        let submittedTxRes = await web3Svc.submitSignedTx(signedTx)
        if (!submittedTxRes || !submittedTxRes.success || !submittedTxRes.txHash) {
            throw 'Unable to send tx to blockchain';
        }
        return submittedTxRes.txHash;
    }
}

module.exports = ERC1155;
