const colors = require('colors');
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai'
import { randomBytes } from 'crypto'
import { Contract, Wallet } from 'ethers'
import { ethers } from 'hardhat'
import keccak256 from 'keccak256'
import { MerkleTree } from 'merkletreejs'
const { time } = require('@openzeppelin/test-helpers');


//available functions
describe("Token contract", async () => {
    let deployer: SignerWithAddress;
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;
    let pa: SignerWithAddress;

    let randomAddresses: string[];
    let merkleTree: MerkleTree;
    let root: string;
    let token: Contract;

    it("1. Get Signer", async () => {
        const signers = await ethers.getSigners();
        if (signers[0] !== undefined) {
            deployer = signers[0];
            console.log(`${colors.cyan('Deployer Address')}: ${colors.yellow(deployer?.address)}`)
        }
        if (signers[1] !== undefined) {
            bob = signers[1];
            console.log(`${colors.cyan('Bob Address')}: ${colors.yellow(bob?.address)}`)
        }
        if (signers[2] !== undefined) {
            pa = signers[2];
            console.log(`${colors.cyan('PA Address')}: ${colors.yellow(pa?.address)}`)
        }
        if (signers[3] !== undefined) {
            alice = signers[3];
            console.log(`${colors.cyan('Alice Address')}: ${colors.yellow(alice?.address)}`)
        }
    });

    it('1. Create merkle tree', async () => {
        randomAddresses = new Array(1000)
            .fill(0)
            .map(() => new Wallet(randomBytes(32).toString('hex')).address)

        randomAddresses.push(bob.address);

        merkleTree = new MerkleTree(
            randomAddresses.concat(deployer.address),
            keccak256,
            { hashLeaves: true, sortPairs: true }
        )

        root = merkleTree.getHexRoot()
        expect(root).to.not.equal("0x0000000000000000000000000000000000000000")
    });

    it('2. Generate proofs', async () => {
        const proofs = merkleTree.getLeaves();
        expect(proofs.length).to.gt(0);

    })

    it('3. Deploy Token', async () => {
        const contractFactory = await ethers.getContractFactory('PoorPleb')
        token = await contractFactory.deploy(root)
        await token.deployed();
        expect(token.address).to.not.equal("0x0000000000000000000000000000000000000000")
    })

    it('4. Set PA Address', async () => {
        await token.setPA(pa.address)
        expect(await token.PA()).to.eq(pa.address)
    })

    it('5. Test Bob Claim', async () => {
        expect(await token.claimed(bob.address)).to.eq(false)
        const proof = merkleTree.getHexProof(keccak256(bob.address));
        expect(proof.length).to.gt(0);

        expect(await token.canClaim(bob.address, proof)).to.eq(true)

        await token.connect(bob).claim(proof)

        await expect(token.connect(bob).claim(proof)).to.be.revertedWith(
            'MerkleAirdrop: Address is not a candidate for claim'
        )
    })

    it('6. Check Bob Proof', async () => {
        const proof = merkleTree.getHexProof(keccak256(bob.address))
        expect(await token.canClaim(bob.address, proof)).to.eq(false)
        expect(await token.claimed(bob.address)).to.eq(true)
    })

    it('7. Test Bad Proof', async () => {
        Object.assign(token, { getAddress: () => token.address })

        const badProof = merkleTree.getHexProof(keccak256(alice.address))

        expect(badProof).to.eql([])

        expect(await token.canClaim(alice.address, badProof)).to.eq(false)

        await expect(token.connect(alice).claim(badProof)).to.be.revertedWith(
            'MerkleAirdrop: Address is not a candidate for claim'
        )
        const proof = merkleTree.getHexProof(keccak256(alice.address))

        await expect(token.connect(alice).claim(proof)).to.be.revertedWith(
            'MerkleAirdrop: Address is not a candidate for claim'
        )
    })

    it('8. ClaimPA Cant claim', async () => {
        await expect(token.connect(deployer).claimPA()).to.be.revertedWith(
            'cant claim yet'
        )
    })

    it('9. ClaimPA OK', async () => {
        await time.increase(6048000); // 70 days increase.
        await token.connect(deployer).claimPA()
    })
})