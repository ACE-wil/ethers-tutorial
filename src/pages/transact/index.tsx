import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
import { ethers } from "ethers";

function TransactPage() {
  const { siteConfig } = useDocusaurusContext();
  
  // 状态管理
  const [privateKey, setPrivateKey] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [rpcUrl, setRpcUrl] = useState("https://ethereum.publicnode.com");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");
  const [balance, setBalance] = useState("");
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
      
      // 生成头像URL (使用Gravatar或类似服务)
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
      setBalance(ethers.formatEther(balance));
    } catch (err) {
      setError(`获取账户信息失败: ${err.message}`);
    }
  };

  // 获取余额 (保持向后兼容)
  const getBalance = async () => {
    await getAccountInfo();
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

  // 执行转账
  const handleTransfer = async () => {
    if (!privateKey || !recipientAddress || !amount || !rpcUrl) {
      setError("请填写所有必填字段");
      return;
    }

    setIsLoading(true);
    setError("");
    setTransactionHash("");

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);

      // 获取nonce
      const nonce = await provider.getTransactionCount(wallet.address, "pending");
      
      // 获取Gas费用
      const feeData = await provider.getFeeData();

      // 构建交易
      const tx = {
        to: recipientAddress,
        value: ethers.parseEther(amount),
        nonce: nonce,
        gasLimit: 21000,
        gasPrice: feeData.gasPrice,
      };

      // 发送交易
      const transaction = await wallet.sendTransaction(tx);
      setTransactionHash(transaction.hash);

      // 等待交易确认
      const receipt = await transaction.wait();
      console.log(`交易已确认，区块号：${receipt.blockNumber}`);
      
      // 更新余额
      await getBalance();
      
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

  return (
    <Layout
      title="转账页面"
      description="简易的以太坊转账页面"
    >
      <div className={styles.container}>
        <Heading as="h1" className={styles.title}>
          以太坊转账
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
            <button onClick={getBalance} className={styles.balanceBtn}>
              获取余额
            </button>
          </div>

          {balance && (
            <div className={styles.balanceInfo}>
              当前余额: {balance} ETH
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
            <label className={styles.label}>转账金额 (ETH)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.input}
              placeholder="请输入转账金额"
              step="0.001"
              min="0"
            />
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
                    <span className={styles.infoLabel}>余额:</span>
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
                <p>请输入私钥并点击"获取余额"查看账户信息</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.info}>
          <h3>使用说明</h3>
          <ul>
            <li>请确保私钥安全，不要在公共场所使用</li>
            <li>转账前请确认接收地址正确</li>
            <li>建议先进行小额测试</li>
            <li>确保账户有足够的ETH支付Gas费用</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

export default TransactPage;
