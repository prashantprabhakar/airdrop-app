// @ts-check
const ERC1155 = require('../services/erc1155.service');
const web3Svc= require('../services/web3.service');
const disburseConfig = require('../config/disburse');
const l = require('../services/logger.service')

function veriyConfig() {
    if(!disburseConfig || !disburseConfig.erc1155) {
        console.log(`Disburse cofig not found. Pls enter erc1155 config in config/disburse.js`);
        process.exit(1);
    }
    
    const { contractAddress, from, recipientList, nftId, amount, privateKey } = disburseConfig.erc1155;
    if(!contractAddress || !from || !nftId || !amount || !privateKey) {
        console.log(`Missing "Nft contract address/ from /to/ amout/ private key/ nft id" in erc1155 disburse config`)
        process.exit(1);
    }
    if(!recipientList || !Array.isArray(recipientList) || recipientList.length === 0) {
        console.log(`Invalid recipient list in erc1155 disburse config.`)
    }
}



module.exports = async() => {
    veriyConfig();
    const adddressToHashMapping = {};
    const { contractAddress, from, recipientList, nftId, amount, privateKey } = disburseConfig.erc1155;
    const erc1155 = new ERC1155(contractAddress);
    const failedRequests = [];
    let nonce = await web3Svc.getPendingNonce(from);
    for(let i=0; i<recipientList.length; i++) {
        const to = recipientList[i];
        try {
            console.log(`\n Processing ${i+1} / ${recipientList.length} records`);
            console.log(`Transfer data`, {
                to, nftId, amount,
            })
            const txHash = await erc1155.transferSingle({
                from, to, nftId, amount, privateKey,
                metaData: {nonce}
            });
            console.log(`Processed from ${to}. Tx Hash: ${txHash}`);
            adddressToHashMapping[to] = txHash;
            // Increment nonce only when transaction is a success
            nonce++;
        } catch(error) {
            console.log(`Error in processing.`, error);
            failedRequests.push(to);
        }
    }
    l.info('Successsfully processed data', adddressToHashMapping);
    console.log('\n')
    l.error(`Transfer failed for following wallets`, failedRequests);
    console.log("\n###############################");
    console.log("Request failed for following wallets")
    console.log(failedRequests)
    process.exit();
}