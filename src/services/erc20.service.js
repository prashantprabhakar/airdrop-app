const web3Svc = require('./web3.service');
const abi = require('../../config/abis/erc20');

class ERC20 {
    constructor(address) {
        this.abi = abi;
        this.contractAddress = address;
        this.erc20 = web3Svc.getContractInstance(this.abi, this.contractAddress);
    }

    async getBalance(address) {
        return this.erc20.methods.balanceOf(address).call();
    }
}

module.exports = ERC20;
