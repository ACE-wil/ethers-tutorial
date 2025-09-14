import { ethers } from "ethers";

// 配置提供者（例如 buildbear、Infura、Alchemy 或本地节点）
const provider = new ethers.JsonRpcProvider(
  // 填写你的 RPC 节点，请不要使用下面
  "https://ethereum.publicnode.com"

);  

// 配置钱包
const privateKey = "5c6b2a4d74815f2896e2eb79ae05f56d44db8bf779e8e42aa116ba5c4a3651f3"; // 替换为你的私钥
const wallet = new ethers.Wallet(privateKey, provider);

// 转账参数
const recipientAddress = "0x74835D22E025f5cef7D5e41abaE82070C4a7FdD4"; // 替换为接收者地址
const amountInEther = "50"; // 转账金额（单位：ETH）

// 获取当前 nonce
const nonce = await provider.getTransactionCount(wallet.address, "pending");

// 获取 Gas 费用
const feeData = await provider.getFeeData();


const tx = {
  // 转账给谁
  to: recipientAddress,
  // 转账数量，需要将 0.01 ETH转换为 wei 单位
  value: ethers.parseEther(amountInEther),
  // 交易 nonce
  nonce: nonce,
  // 标准转账 gas 限制, 设置一个 gas 费用上限，避免多扣
  gasLimit: 21000,
  // 设置 gas 价格
  gasPrice: feeData.gasPrice,

};

// 签名并发送交易
const transaction = await wallet.sendTransaction(tx);

// 等待交易确认
const receipt = await transaction.wait();
console.log(`交易已确认，区块号：${receipt.blockNumber}`);