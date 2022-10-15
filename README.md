# Smart contract sha245sum
aed3c59bbc77e9cdbb63131e1f9de157461c5ac7c4235f55294f553a204da68c  contracts/PoorPleb.sol

# 1 - Install Node
Install Node Version Manager 
Linux | MacOS -> https://github.com/nvm-sh/nvm
Windows -> https://github.com/coreybutler/nvm-windows

```
nvm install 16
```
Then
```
nvm use 16
```

# Install dependences
## 1.1 - Install yarn package manager
```
npm install -g yarn
```
## 1.2 - Install typescript execution engine
```
npm install -g ts-node
```
## 1.3 - Install project dependences
```
yarn install
```

# 2 - Deploy 
# 2.1 - Create merkle tree
```
ts-node scripts/createMerkleTree.ts
```

# 2.2 - Add deployer private key and merkle root on .env
DEPLOYER_PKY_KEY=1ab.....
# 2.3 - Deploy on Eth Goerli testnet
## Run deploy script
### Testnet
```
npx hardhat run scripts/createMerkleTreeWithProofs.ts --network goerli
```
### Mainnet
```
npx hardhat run scripts/createMerkleTreeWithProofs.ts --network mainnet
```

# Run tests
## 1. Run local eth node
```
npx hardhat node --fork https://eth-goerli.nodereal.io/v1/703500179cfc4348b90bebc0b3fba854
```
## 2. Run test file
```
npx hardhat test test/TestAll.test.ts --network localhost
```

## 3. Listen tests changes
```
nodemon --watch test/TestAll.test.ts --exec 'npx hardhat test test/TestAll.test.ts --network localhost'
```

