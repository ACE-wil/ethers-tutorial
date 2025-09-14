import { keccak256, toUtf8Bytes } from 'ethers'

const value = keccak256(toUtf8Bytes('Hello world'));

console.log('====================================');
console.log('value', value);
console.log('====================================');