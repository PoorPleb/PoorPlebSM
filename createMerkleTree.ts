import keccak256 from 'keccak256'
import { MerkleTree } from 'merkletreejs'
const fs = require('fs');
const lineByLine = require('n-readlines');
const colors = require('colors');
async function main() {
    let addresses: string[] = []
    let rowCounter = 0;

    const liner = new lineByLine('addr-list.txt');

    let line;

    while (line = liner.next()) {
        addresses.push(line.toString())
        rowCounter++;
        console.log({
            rowCounter
        })
    }
    console.log();
    console.log(colors.yellow('Creating Merkle Tree...'));

    const merkleTree = new MerkleTree(
        addresses,
        keccak256,
        { hashLeaves: true, sortPairs: true }
    )

    const root = merkleTree.getHexRoot()
    let rootData = JSON.stringify(root);
    fs.writeFileSync('root.json', rootData);
    console.log({ root });
}
main()
    .then(async () => {
        console.log("Done")
    })
    .catch(error => {
        console.error(error);
        return undefined;
    })
