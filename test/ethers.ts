import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider('https://ethereum.publicnode.com')
 
// getBalance获取余额

const balance = await provider.getBalance('0x56ecf322E38931f31F2f3b2262e589EEa58ad5ed');

 console.log('====================================');
 console.log(balance.toString());
 console.log('====================================');

 // getNetwork获取网络信息

 const network = await provider.getNetwork();

 console.log('====================================');
 console.log('network', network);
 console.log('====================================');
