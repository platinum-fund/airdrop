const Web3 = require('web3')
const erc20abi = require('./ERC20.abi.json')
const fs = require('fs').promises
const axios = require('axios')

const net = process.env.ETHEREUM_NET
const infuraURL = `wss://${net}.infura.io/ws`
const web3 = new Web3(new Web3.providers.WebsocketProvider(infuraURL))

let nonce = 0
const coefficientGas = 1.15
const contractAddress = process.env.CONTRACT_ADDRESS
const sender = web3.eth.accounts.privateKeyToAccount(
  process.env.SENDER_PRIVATE_KEY
)

const getGasPrice = async (speed = 'average') => {
  const res = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
  return web3.utils.toWei(web3.utils.fromWei(`${res.data[speed]}`, 'gwei')) / 10
}

const sendToken = async ({ address, amount }) => {
  const contract = new web3.eth.Contract(erc20abi, contractAddress, {
    from: sender.address
  })
  const query = contract.methods.transfer(
    address,
    Web3.utils.toWei(`${amount}`)
  )

  const [gasPrice, _nonce] = await Promise.all([
    getGasPrice(),
    web3.eth.getTransactionCount(sender.address)
  ])

  nonce = _nonce <= nonce ? nonce + 1 : _nonce
  const tx = {
    from: sender.address,
    to: contractAddress,
    data: query.encodeABI(),
    nonce,
    gasPrice
  }
  const gas = await web3.eth.estimateGas(tx)
  tx.gas = Math.round(gas * coefficientGas)
  console.log('nonce/gasPrice/gas', nonce, gasPrice, tx.gas)

  const signed = await web3.eth.accounts.signTransaction(tx, sender.privateKey)

  return new Promise((resolve, reject) =>
    web3.eth
      .sendSignedTransaction(signed.rawTransaction)
      .on('receipt', resolve)
      .on('error', reject)
  )
}

const distribute = async list => {
  for (const [i, account] of list.entries()) {
    console.log({ index: i, ...account })
    if (account.status) continue

    const result = await sendToken(account)
    if (!result.status) {
      console.log(result)
      throw 'Wrong result'
    }

    list[i].status = true
    await fs.writeFile('./list.json', JSON.stringify(list, null, 2))
    console.log('status', result.status, '\n')
  }
}

const main = async () => {
  const list = require('./list.json')
  await distribute(list)
  process.exit(0)
}

main()
