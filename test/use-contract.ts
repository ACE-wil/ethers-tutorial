import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
    "https://ethereum.publicnode.com"
  );
  // 编写交互ABI，后面会介绍ABI是什么
  const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
  ];
  
  // 第一个参数是合约地址
  const contract = new ethers.Contract(
    "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    abi,
    provider
  );
  
  // 调用 ABI 编写的方法
  // 查询代币余额，返回原始 wei
  const balance = await contract.balanceOf(
    // 钱包地址
    "0x56ecf322E38931f31F2f3b2262e589EEa58ad5ed"
  );
  // 查询代币符号
  const symbol = await contract.symbol();
  // 查询代币小数位数
  const decimals = await contract.decimals();
  
  console.log(balance); // 200000000000000000000
  console.log(symbol); // BUSD
  console.log(decimals); // 18