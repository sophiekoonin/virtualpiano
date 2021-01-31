import Head from 'next/head';
import { useState } from 'react'
import Player from '../components/Player';

import styles from '../styles/Home.module.css';
import { calcScale } from '../utils/scales';

export default function Home() {
  const [key, setKey] = useState('C')
  return (
    <div className={styles.container}>
      <Head>
        <title>musicologic</title>
      </Head>

      <main className={styles.main}>
        <Player freqs={calcScale('G', 'Major').map(n => n.frequency)} />
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
