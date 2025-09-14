import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
import { ethers } from "ethers";

function TransactERC20Page() {
  const { siteConfig } = useDocusaurusContext();
  
  // 状态管理
  const [privateKey, setPrivateKey] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [rpcUrl, setRpcUrl] = useState("https://ethereum.publicnode.com");
  const [tokenAddress, setTokenAddress] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"); // USDC默认地址
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  
  // 账户信息状态
  const [accountInfo, setAccountInfo] = useState({
    address: "",
    balance: "",
    network: "",
    chainId: "",
    nonce: "",
    avatar: "",
    ensName: ""
  });

  // 代币信息状态
  const [tokenInfo, setTokenInfo] = useState({
    symbol: "",
    decimals: 0,
    balance: "",
    name: ""
  });

  // ERC-20 ABI
  const tokenABI = [
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 value) public returns (bool)",
    "function approve(address spender, uint256 value) public returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];

  // 获取完整账户信息
  const getAccountInfo = async () => {
    if (!privateKey || !rpcUrl) return;
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      
      // 并行获取所有信息
      const [balance, network, nonce] = await Promise.all([
        provider.getBalance(wallet.address),
        provider.getNetwork(),
        provider.getTransactionCount(wallet.address, "pending")
      ]);
      
      // 尝试获取ENS名称
      let ensName = "";
      try {
        ensName = await provider.lookupAddress(wallet.address) || "";
      } catch (err) {
        // ENS查询失败，忽略错误
      }
      
      // 生成头像URL
      const avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${wallet.address}`;
      
      const newAccountInfo = {
        address: wallet.address,
        balance: ethers.formatEther(balance),
        network: network.name || "Unknown",
        chainId: network.chainId.toString(),
        nonce: nonce.toString(),
        avatar: avatar,
        ensName: ensName
      };
      
      setAccountInfo(newAccountInfo);
    } catch (err) {
      setError(`获取账户信息失败: ${err.message}`);
    }
  };

  // 获取代币信息
  const getTokenInfo = async () => {
    if (!privateKey || !rpcUrl || !tokenAddress) return;
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);
      
      // 并行获取代币信息
      const [symbol, name, decimals, balance] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals(),
        tokenContract.balanceOf(wallet.address)
      ]);
      
      const newTokenInfo = {
        symbol: symbol,
        name: name,
        decimals: decimals,
        balance: ethers.formatUnits(balance, decimals)
      };
      
      setTokenInfo(newTokenInfo);
    } catch (err) {
      setError(`获取代币信息失败: ${err.message}`);
    }
  };

  // 获取Gas价格
  const getGasPrice = async () => {
    if (!rpcUrl) return;
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const feeData = await provider.getFeeData();
      setGasPrice(ethers.formatUnits(feeData.gasPrice || 0, "gwei"));
    } catch (err) {
      setError(`获取Gas价格失败: ${err.message}`);
    }
  };

  // 执行ERC-20转账
  const handleTransfer = async () => {
    if (!privateKey || !recipientAddress || !amount || !rpcUrl || !tokenAddress) {
      setError("请填写所有必填字段");
      return;
    }

    setIsLoading(true);
    setError("");
    setTransactionHash("");

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);

      // 获取代币小数位数
      const decimals = await tokenContract.decimals();
      
      // 转换转账金额
      const transferAmount = ethers.parseUnits(amount, decimals);
      
      // 检查余额是否足够
      const balance = await tokenContract.balanceOf(wallet.address);
      if (balance < transferAmount) {
        throw new Error("代币余额不足");
      }

      // 获取Gas费用
      const feeData = await provider.getFeeData();

      // 估算Gas限制
      const gasLimit = await tokenContract.transfer.estimateGas(recipientAddress, transferAmount);

      // 构建交易
      const tx = await tokenContract.transfer(recipientAddress, transferAmount, {
        gasLimit: gasLimit,
        gasPrice: feeData.gasPrice,
      });

      setTransactionHash(tx.hash);

      // 等待交易确认
      const receipt = await tx.wait();
      console.log(`交易已确认，区块号：${receipt.blockNumber}, Hash: ${receipt.hash}`);
      
      // 更新代币余额
      await getTokenInfo();
      
    } catch (err) {
      setError(`转账失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 页面加载时获取Gas价格
  useEffect(() => {
    getGasPrice();
  }, [rpcUrl]);

  // 当代币地址改变时获取代币信息
  useEffect(() => {
    if (tokenAddress && privateKey && rpcUrl) {
      getTokenInfo();
    }
  }, [tokenAddress, privateKey, rpcUrl]);

  return (
    <Layout
      title="ERC-20转账页面"
      description="ERC-20代币转账页面"
    >
      <div className={styles.container}>
        <Heading as="h1" className={styles.title}>
          ERC-20代币转账
        </Heading>
        
        <div className={styles.mainContent}>
          <div className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label className={styles.label}>RPC节点地址</label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                className={styles.input}
                placeholder="请输入RPC节点地址"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>私钥</label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className={styles.input}
                placeholder="请输入私钥"
              />
              <button onClick={getAccountInfo} className={styles.balanceBtn}>
                获取账户信息
              </button>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>代币合约地址</label>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className={styles.input}
                placeholder="请输入ERC-20代币合约地址"
              />
              <button onClick={getTokenInfo} className={styles.balanceBtn}>
                获取代币信息
              </button>
            </div>

            {tokenInfo.symbol && (
              <div className={styles.tokenInfo}>
                <strong>代币信息:</strong> {tokenInfo.name} ({tokenInfo.symbol})
                <br />
                <strong>余额:</strong> {tokenInfo.balance} {tokenInfo.symbol}
                <br />
                <strong>小数位数:</strong> {tokenInfo.decimals}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>接收地址</label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className={styles.input}
                placeholder="请输入接收者地址"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>转账数量</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.input}
                placeholder="请输入转账数量"
                step="0.000001"
                min="0"
              />
              {tokenInfo.symbol && (
                <span className={styles.tokenUnit}>{tokenInfo.symbol}</span>
              )}
            </div>

            {gasPrice && (
              <div className={styles.gasInfo}>
                当前Gas价格: {gasPrice} Gwei
              </div>
            )}

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {transactionHash && (
              <div className={styles.success}>
                交易成功! 交易哈希: {transactionHash}
              </div>
            )}

            <button
              onClick={handleTransfer}
              disabled={isLoading}
              className={clsx(styles.transferBtn, isLoading && styles.loading)}
            >
              {isLoading ? "转账中..." : "确认转账"}
            </button>
          </div>

          {/* 右侧账户信息展示 */}
          <div className={styles.accountInfoContainer}>
            <h3 className={styles.accountTitle}>账户信息</h3>
            {accountInfo.address ? (
              <div className={styles.accountDetails}>
                <div className={styles.avatarSection}>
                  <img 
                    src={accountInfo.avatar} 
                    alt="Account Avatar" 
                    className={styles.avatar}
                  />
                  <div className={styles.accountName}>
                    {accountInfo.ensName || "未设置ENS"}
                  </div>
                </div>
                
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>地址:</span>
                    <span className={styles.infoValue} title={accountInfo.address}>
                      {accountInfo.address.slice(0, 6)}...{accountInfo.address.slice(-4)}
                    </span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>ETH余额:</span>
                    <span className={styles.infoValue}>
                      {accountInfo.balance} ETH
                    </span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>网络:</span>
                    <span className={styles.infoValue}>
                      {accountInfo.network}
                    </span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>链ID:</span>
                    <span className={styles.infoValue}>
                      {accountInfo.chainId}
                    </span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Nonce:</span>
                    <span className={styles.infoValue}>
                      {accountInfo.nonce}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.noAccountInfo}>
                <p>请输入私钥并点击"获取账户信息"查看账户详情</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.info}>
          <h3>使用说明</h3>
          <ul>
            <li>请确保私钥安全，不要在公共场所使用</li>
            <li>转账前请确认接收地址和代币合约地址正确</li>
            <li>建议先进行小额测试</li>
            <li>确保账户有足够的ETH支付Gas费用</li>
            <li>确保账户有足够的代币余额进行转账</li>
            <li>代币合约地址必须是有效的ERC-20合约</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

export default TransactERC20Page;
