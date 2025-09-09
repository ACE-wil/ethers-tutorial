import React from "react";
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

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const history = useHistory();
  const [balance, setBalance] = React.useState<string>('');

  function handleClick() {
    history.push("/docs/basic");
  }

  async function getBalance() {
    try {
      const provider = new ethers.JsonRpcProvider('https://rpc.buildbear.io/correct-sabretooth-574414f3');
      const balance = await provider.getBalance('0x56ecf322E38931f31F2f3b2262e589EEa58ad5ed');
      console.log('====================================');
      console.log(balance.toString());
      console.log('====================================');
      setBalance(balance.toString());
    } catch (error) {
      console.error('获取余额失败:', error);
      setBalance('获取失败');
    }
  }

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
        <div className={styles.buttons}>
          <Button onClick={getBalance}>获取余额: {balance || '点击获取'}</Button>
        </div>
        <div className={styles.featureGrid}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>📚</div>
            <h3>基础知识</h3>
            <p>从零开始，掌握 ethers.js 核心概念</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🔧</div>
            <h3>实战应用</h3>
            <p>结合实际场景，学习最佳实践</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🚀</div>
            <h3>进阶技巧</h3>
            <p>深入理解，提升开发效率</p>
          </div>
        </div>
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
