import Head from 'next/head';
import { useState } from 'react'

import styles from '../styles/Home.module.css';
import { calcScale } from '../utils/scales';

export default function Home() {
  const [key, setKey] = useState('C')
  console.log(calcScale('G', 'Major'))
  return (
    <div className={styles.container}>
      <Head>
        <title>musicologic</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>musicologic</h1>
        <p>What?</p>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://localghost.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          made by Sophie
        </a>
      </footer>
    </div>
  );
}
