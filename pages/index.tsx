import Head from 'next/head';
import { useState } from 'react'
import Player from '../components/Player';
import Toggle from '../components/Toggle';

import styles from '../styles/Home.module.scss';
import { calcChord, Chords } from '../utils/chords';
import { notes, SharpToFlat } from '../utils/notes';
import { calcScale, Scales } from '../utils/scales';

export default function Home() {
  const [key, setKey] = useState('C')
  const [mode, setMode] = useState<'scale' | 'chord'>('scale')
  const [scale, setScale] = useState(Scales.MAJOR)
  const [chord, setChord] = useState(Chords.MAJOR)
  return (
    <div className={styles.container}>
      <Head>
        <title>Virtual Piano</title>
      </Head>
      <header>
        <h1 className={styles.title}>Virtual Piano</h1>
      </header>
      <main className={styles.main}>
        <Toggle
          legend="Operating mode"
          // @ts-ignore
          onChange={e => setMode((e.target as HTMLInputElement).value)}
          optionLeft={{
            id: 'scale',
            label: 'Scales',
            value: 'scale',
            checked: mode === 'scale'
          }}
          optionRight={{
            id: 'chord',
            value: 'chord',
            label: 'Chords',
            checked: mode === 'chord'
          }}
        />
        {mode === 'scale' && (
          <>
            <label htmlFor="scale">Scale</label>
            <div className={styles.select}>
              <select id="scale" value={scale} onChange={e => setScale(e.target.value)}>
                {Object.keys(Scales).map(s => (
                  <option key={s} value={Scales[s]}>{Scales[s]}</option>
                ))}
              </select>
            </div>
          </>)}
        {mode === 'chord' && (
          <>
            <label htmlFor="chord">Chord</label>
            <div className={styles.select}>
              <select id="chord" value={chord} onChange={e => setChord(e.target.value)}>
                {Object.keys(Chords).map(c => (
                  <option key={c} value={Chords[c]}>{Chords[c]}</option>
                ))}
              </select>
            </div>
          </>)}
        <label htmlFor="key">Key</label>
        <div className={styles.select}>
          <select id="key" value={key} onChange={e => setKey(e.target.value)}>
            {notes.map(n => (
              <option key={n} value={n}>{n.includes('#') ? `${n}/${SharpToFlat[n]}` : n}</option>
            ))}
          </select>
        </div>
        <Player mode={mode} chord={calcChord(key, chord)} scale={calcScale(key, scale)} />
      </main>

      <footer className={styles.footer}>made by{" "}
        <a
          href="https://localghost.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sophie
        </a>
      </footer>
    </div >
  );
}