const Decimal = require('decimal.js')
module.exports = {}

const operations = ['mul', 'div', 'sub', 'add']
const comparisons = ['lt', 'gt', 'gte', 'lte']

for(let i of operations){
  module.exports[i] = (a, b)=>{
    return new Decimal(a)[i](b).toFixed()
  }
}

for(let i of comparisons){
  module.exports[i] = (a, b)=>{
    return new Decimal(a)[i](b)
  }
}
