import Head from "next/head"
import { useState } from "react"
import cx from "classnames"
import Player from "../components/Player"
import Toggle from "../components/Toggle"
import styles from "../styles/Home.module.scss"
import { calcChord, Chords } from "../utils/chords"
import { notes, SharpToFlat } from "../utils/notes"
import { calcScale, Scales } from "../utils/scales"

export default function Home() {
  const [key, setKey] = useState("C")
  const [mode, setMode] = useState<"scale" | "chord">("scale")
  const [scale, setScale] = useState(Scales.MAJOR)
  const [chord, setChord] = useState(Chords.MAJOR)
  const [showInstructions, setShowInstructions] = useState(false)
  return (
    <div className={styles.container}>
      <Head>
        <title>Virtual Piano</title>
      </Head>
      <header>
        <h1 className={styles.title}>Virtual Piano</h1>
      </header>
      <main className={styles.main}>
        <button
          className={styles["instructions-button"]}
          tabIndex={1}
          onClick={() => setShowInstructions(!showInstructions)}
          aria-hidden="true"
        >
          {showInstructions ? "Hide instructions" : "Show instructions"}
        </button>
        <div
          className={cx(styles.instructions, {
            [styles["instructions-expanded"]]: showInstructions
          })}
        >
          <p>
            Choose scales or chords, select the key and scale you want, then hit
            the play button to see and hear all the notes!
          </p>
          <p>
            Press the piano keys to hear the notes. You can switch on the pedal
            to keep notes held.
          </p>
          <p>
            May not work on mobile devices, sorry!
            <br /> Sometimes the notes get stuck... refresh the page to clear it
            and start again.
          </p>
        </div>
        <Toggle
          legend="Operating mode"
          onChange={(e) => setMode(mode === "scale" ? "chord" : "scale")}
          optionLeft={{
            label: "Scales",
            tabIndex: 2,
            value: "scale",
            checked: mode === "scale"
          }}
          optionRight={{
            value: "chord",
            tabIndex: 3,
            label: "Chords",
            checked: mode === "chord"
          }}
        />
        <div className={styles.selectors}>
          <div className={styles["select-wrapper"]}>
            <label htmlFor="key">Key</label>
            <select
              id="key"
              value={key}
              tabIndex={4}
              onChange={(e) => setKey(e.target.value)}
            >
              {notes.map((n) => (
                <option key={n} value={n}>
                  {n.includes("#") ? `${n}/${SharpToFlat[n]}` : n}
                </option>
              ))}
            </select>
          </div>
          {mode === "scale" && (
            <div className={styles["select-wrapper"]}>
              <label htmlFor="scale">Scale</label>
              <select
                id="scale"
                tabIndex={5}
                value={scale}
                onChange={(e) => setScale(e.target.value)}
              >
                {Object.keys(Scales).map((s) => (
                  <option key={s} value={Scales[s]}>
                    {Scales[s]}
                  </option>
                ))}
              </select>
            </div>
          )}
          {mode === "chord" && (
            <div className={styles["select-wrapper"]}>
              <label htmlFor="chord">Chord</label>
              <select
                tabIndex={5}
                id="chord"
                value={chord}
                onChange={(e) => setChord(e.target.value)}
              >
                {Object.keys(Chords).map((c) => (
                  <option key={c} value={Chords[c]}>
                    {Chords[c]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <Player
          mode={mode}
          chord={calcChord(key, chord)}
          scale={calcScale(key, scale)}
        />
      </main>

      <footer className={styles.footer}>
        <p>If notes get stuck, refresh the page. It happens sometimes.</p>
        <p>
          <span aria-hidden="true">✨</span>
          made by{" "}
          <a
            href="https://localghost.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sophie
          </a>
          <span aria-hidden="true">✨</span>
        </p>
      </footer>
    </div>
  )
}
