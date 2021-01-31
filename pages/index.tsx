import Head from 'next/head';
import { useState } from 'react'
import Piano from '../components/Piano';
import Player from '../components/Player';

import styles from '../styles/Home.module.css';
import { notes, SharpToFlat } from '../utils/notes';
import { calcScale, Scales } from '../utils/scales';

export default function Home() {
  const [key, setKey] = useState('C')
  const [scale, setScale] = useState(Scales.MAJOR)
  return (
    <div className={styles.container}>
      <Head>
        <title>Scaletron 3000</title>
      </Head>

      <main className={styles.main}>
        <select value={scale} onChange={e => setScale(e.target.value)}>
          {Object.keys(Scales).map(s => (
            <option key={s} value={Scales[s]}>{Scales[s]}</option>
          ))}
        </select>
        <select value={key} onChange={e => setKey(e.target.value)}>
          {notes.map(n => (
            <option key={n} value={n}>{n.includes('#') ? `${n}/${SharpToFlat[n]}` : n}</option>
          ))}
        </select>
        <Player notes={calcScale(key, scale)} />
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
