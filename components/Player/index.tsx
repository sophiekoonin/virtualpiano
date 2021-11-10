import { useState, useEffect, useRef } from "react"
import { generateOctaves, Note } from "../../lib/notes"
import { real, imag } from "../../lib/wavetable"
import Toggle from "../Toggle"
import Piano from "./Piano"
import styles from "./Player.module.scss"

type Props = {
  scale: Array<Note>
  chord: Array<Note>
  mode: "scale" | "chord"
}

type OscillatorMap = {
  [keyId: string]: OscillatorNode
}

export default function Player({ scale, chord, mode }: Props) {
  const [currentNotes, setCurrentNotes] = useState([])
  const [noteTimeouts, setNoteTimeouts] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [oscillators, setOscillators] = useState<OscillatorMap>({})
  const [pedalOn, setPedalOn] = useState(false)
  const audioContextRef = useRef<AudioContext>()
  const pianoNotes = generateOctaves("C", 4, 3)

  async function initOscillator(): Promise<OscillatorNode> {
    return new Promise((resolve) => {
      let audioCtx: AudioContext
      if (audioContextRef.current == null) {
        audioCtx = new window.AudioContext()
        audioContextRef.current = audioCtx
      } else {
        audioCtx = audioContextRef.current
      }
      // const wave = audioCtx.createPeriodicWave(
      //   new Float32Array(real),
      //   new Float32Array(imag)
      // )
      const osc = audioCtx.createOscillator()
      osc.type = "sine"
      osc.connect(audioCtx.destination)
      osc.start()
      setIsPlaying(true)
      resolve(osc)
    })
  }

  useEffect(() => {
    if (currentNotes.length === 0) {
      setIsPlaying(false)
    }
  }, [currentNotes])

  useEffect(() => {
    if (pedalOn === false) {
      disconnectAll()
    }
  }, [pedalOn])

  useEffect(() => {
    return () => {
      // unmount
      if (isPlaying) {
        disconnectAll()
      }
    }
  }, [])

  function disconnectAll() {
    try {
      Object.keys(oscillators).forEach((o) => {
        oscillators[o].stop()
        oscillators[o].disconnect(audioContextRef.current.destination)
      })
    } catch (err) {
      // best-effort
    } finally {
      setOscillators({})
    }
  }

  async function playNote(id: number) {
    const osc = await initOscillator()
    setOscillators({ ...oscillators, [id]: osc })
    setCurrentNotes(pedalOn ? [...currentNotes, id] : [id])
    osc.frequency.value = pianoNotes[id].frequency
  }

  async function playChord() {
    stopAll()
    const ids = chord.map((note) =>
      pianoNotes.findIndex((n) => n.frequency === note.frequency)
    )
    setPedalOn(true)
    const oscs = oscillators
    ids.forEach(async (id) => {
      const osc = await initOscillator()
      oscs[id] = osc
      osc.frequency.value = pianoNotes[id].frequency
    })
    setCurrentNotes(ids)
    setOscillators(oscs)
  }

  async function playScale() {
    const osc = await initOscillator()
    setOscillators({ ...oscillators, [-1]: osc })
    // audioContextRef.current.resume()

    const playLength = scale.length / 2

    scale.forEach((note, i) => {
      const time = i * 0.5 * 1000
      noteTimeouts.push(
        setTimeout(() => {
          osc.frequency.value = note.frequency
          setCurrentNotes([
            pianoNotes.findIndex((n) => n.frequency === note.frequency)
          ])
          setNoteTimeouts(noteTimeouts.slice(1))
        }, time)
      )
    })

    noteTimeouts.push(
      setTimeout(() => {
        setIsPlaying(false)
        setCurrentNotes([])
      }, scale.length * 0.5 * 1000)
    )
    osc.stop(audioContextRef.current.currentTime + playLength)
  }

  function stopAll() {
    if (!isPlaying) return
    disconnectAll()
    // audioContextRef.current.suspend()
    noteTimeouts.forEach((t) => clearTimeout(t))
    setCurrentNotes([])
    setIsPlaying(false)
  }

  function stop(id: number) {
    if (!isPlaying) return
    const osc = oscillators[id]
    if (osc == null) return
    // remove note from current notes
    const idx = currentNotes.indexOf(id)

    if (idx > -1) {
      const ns = [...currentNotes]
      ns.splice(idx, 1)
      setCurrentNotes(ns)
    }
    osc.stop(0)
    osc.disconnect(audioContextRef.current.destination)
  }

  return (
    <>
      <div className={styles.controls}>
        <button
          onClick={() => (mode === "scale" ? playScale() : playChord())}
          type="button"
          tabIndex={6}
          title="Play"
        >
          <span className="visually-hidden">Play</span>
          <img alt="" src="/images/play.svg" className={styles.icon} />
        </button>
        <button
          onClick={() => stopAll()}
          title="Stop"
          type="button"
          tabIndex={7}
        >
          <span className="visually-hidden">Stop</span>
          <img alt="" src="/images/stop.svg" className={styles.icon} />
        </button>
      </div>
      <Toggle
        legend="Enable/disable pedal"
        onChange={() => setPedalOn(!pedalOn)}
        optionLeft={{
          tabIndex: 8,
          value: "pedal-on",
          checked: pedalOn,
          label: "Pedal on"
        }}
        optionRight={{
          tabIndex: 9,
          value: "pedal-off",
          checked: !pedalOn,
          label: "Pedal off"
        }}
      />
      <Piano
        octaves={3}
        currentNotes={currentNotes}
        play={playNote}
        pedalOn={pedalOn}
        stop={stop}
      />
      <p>
        Notes playing:{" "}
        {currentNotes
          .sort((a, b) => a - b)
          .map((n) => pianoNotes[n].letter)
          .join(" ")}
      </p>
    </>
  )
}
