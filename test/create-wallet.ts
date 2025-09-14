import { Wallet } from "ethers";

const wallet = Wallet.createRandom();

console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('Public Key:', wallet.publicKey);
console.log('Mnemonic:', wallet.mnemonic?.phrase || '无');