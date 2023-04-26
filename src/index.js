const erc1155Disburse = require('./jobs/transferERC1155');

if(process.argv[2] === 'disburse') {
  const tokenType = process.argv[3];
  if(tokenType === 'erc-1155') {
    erc1155Disburse()
      .then(() => {
        console.log(`\n Done for all`);
        process.exit(1);
    })
  } else {
    console.log(`Incorrect token type specified. Only supported action is "erc-1155"`);
    process.exit(0);
  }
} else {
  console.log(`Incorrect action specified. Only supported action is "disburse"`);
  process.exit(1);
}