# airdrop
1. Clone repo
```
git clone https://github.com/platinum-fund/airdrop.git
cd airdrop
```

2. Put list.json in forlder with repo, file format:
```
[
  {
    "address": "0x8...3",
    "amount": 3
  },
  {
    "address": "0xb...0",
    "amount": 2
  },
  {
    "address": "0xD...",
    "amount": 1
  }
]
```

3. Create file .env with variables
```
# Network of Ethereum
ETHEREUM_NET=mainnet
# Private Key of the address from which we send tokens
SENDER_PRIVATE_KEY=0x3...5
# Address of smart contract for token
CONTRACT_ADDRESS=0x2...4
```
4. Start airdrop
```
docker-compose up -d; docker-compose logs -f node
```
