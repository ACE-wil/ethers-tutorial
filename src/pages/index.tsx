import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
import { useHistory } from "@docusaurus/router";
import Button from "@site/src/components/Button";
import { ethers } from "ethers";
import { useHomeStore } from "../store/home-store";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const history = useHistory();
  const { netWork, setNetWork, balance, setBalance, feeData, setFeeData, blockNumber, setBlockNumber, transaction, setTransaction } = useHomeStore();
  const provider = new ethers.JsonRpcProvider('https://rpc.buildbear.io/scornful-magma-25161a76');
  function handleClick() {
    history.push("/docs/basic");
  }

  function getBalance() {
   provider.getBalance('0x56ecf322E38931f31F2f3b2262e589EEa58ad5ed').then((balance) => {
    
    setBalance(balance.toString());
   })
  }

   function getTheNetWork() {
    provider.getNetwork().then((network) => {
      // console.log('====================================');
      // console.log(network);
      // console.log('====================================');
      setNetWork(network);
    })
  }

  function getFeeDataFn() {
    provider.getFeeData().then((fee) => {
        // console.log('====================================');
        // console.log(fee);
        // console.log('====================================');
      setFeeData(fee);
    })
  }

  function getBlockNumberFn() {
    provider.getBlockNumber().then((block) => {
      // console.log('====================================');
      // console.log(block);
      // console.log('====================================');
      setBlockNumber(block);
    })
  }

  function getTransactFn() {
    provider.getTransaction('0x60dcad1e3b254f82036d6b579bb6129f9584bbf0deea456c91061a5c39aa1848').then((transaction) => {
      // console.log('====================================');
      console.log('transaction', transaction); // 交易详情
      // console.log('====================================');
      setTransaction(transaction);
    })
  }

  useEffect(() => {
    getBalance();
    getTheNetWork();
    getFeeDataFn();
    getBlockNumberFn();
    getTransactFn();
    },[]) ;

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className={styles.container}>
        <img src="/img/eth.webp" alt="Ethers.js" draggable={false} />

        <Heading as="h1" className={styles.hero__title}>
          {siteConfig.title}
        </Heading>
        <p className={styles.hero__subtitle}>
          最详细的 Ethers.js v6 web3 入门教程
        </p>
        <div className={styles.buttons}>
          <Button onClick={handleClick}>开始学习</Button>
        </div>
        <span style={{color:"black"}}>
          balance: {balance?.toString()}
        </span>
        <br/>
        <span style={{color:"black"}}>
          Name:{netWork?.name.toString()}<br/>
          ChainId:{netWork?.chainId.toString()}
        </span>
        <br></br>
        <span style={{color:"black"}}>
          feeData GasPrice: {feeData?.gasPrice.toString()}
          <br/>
          maxFeePerGas: {feeData?.maxFeePerGas.toString()}
          <br/>
          maxPriorityFeePerGas: {feeData?.maxPriorityFeePerGas.toString()}
        </span>
        <br></br>
        <span style={{color:"black"}}>
        blockNumber：{blockNumber?.toString()}
        </span>
        <br></br>
        <span style={{color:"black"}}>
        transaction：{transaction?.hash.toString()}
        </span>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  React.useEffect(() => {
    // @ts-ignore
    if (window.LA) {
      // @ts-ignore
      window.LA.init({ id: "3MJvRzZFC8VW03Qw", ck: "3MJvRzZFC8VW03Qw" });
    }
  }, []);

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="深入浅出的 ethers.js 中文教程"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
