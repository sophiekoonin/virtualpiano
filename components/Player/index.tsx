import { useState, useEffect, useRef } from "react"
import { generateOctaves, Note } from "../../lib/notes"
// import { real, imag } from "../../lib/wavetable"
import Toggle from "../Toggle"
import Piano from "./Piano"
import styles from "./Player.module.scss"

type Props = {
  scale: Array<Note>
  chord: Array<Note>
  mode: "scale" | "chord"
}

type Channel = {
  osc: OscillatorNode
  gain: GainNode
}

type ChannelMap = {
  [id: number]: Channel
}

export default function Player({ scale, chord, mode }: Props) {
  const [currentNotes, setCurrentNotes] = useState([])
  const [noteTimeouts, setNoteTimeouts] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [channels, setChannels] = useState<ChannelMap>({})
  const [pedalOn, setPedalOn] = useState(false)
  const audioContextRef = useRef<AudioContext>()
  const pianoNotes = generateOctaves("C", 4, 3)

  async function initChannel(): Promise<Channel> {
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
      const gain = audioCtx.createGain()
      gain.connect(audioCtx.destination)
      gain.gain.setValueAtTime(0, audioCtx.currentTime)

      const osc = audioCtx.createOscillator()
      osc.type = "sine"
      osc.connect(gain)
      osc.start()

      setIsPlaying(true)
      gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.06)

      resolve({ osc, gain })
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
      Object.keys(channels).forEach((o) => {
        channels[o].gain.disconnect(audioContextRef.current.destination)
      })
    } catch (err) {
      // best-effort
    } finally {
      setChannels({})
    }
  }

  async function playNote(id: number) {
    const channel = await initChannel()
    setChannels({ ...channels, [id]: channel })
    setCurrentNotes(pedalOn ? [...currentNotes, id] : [id])
    channel.osc.frequency.value = pianoNotes[id].frequency
  }

  async function playChord() {
    stopAll()
    const ids = chord.map((note) =>
      pianoNotes.findIndex((n) => n.frequency === note.frequency)
    )
    setPedalOn(true)
    const oscs = channels
    ids.forEach(async (id) => {
      const channel = await initChannel()
      oscs[id] = channel
      channel.osc.frequency.value = pianoNotes[id].frequency
    })
    setCurrentNotes(ids)
    setChannels(oscs)
  }

  async function playScale() {
    const channel = await initChannel()
    setChannels({ ...channels, [-1]: channel })
    // audioContextRef.current.resume()

    const playLength = scale.length / 2

    scale.forEach((note, i) => {
      const time = i * 0.5 * 1000
      noteTimeouts.push(
        setTimeout(() => {
          channel.osc.frequency.value = note.frequency
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

    const stopTime = audioContextRef.current.currentTime + playLength + 0.64
    channel.osc.stop(stopTime)
    channel.gain.gain.linearRampToValueAtTime(0, stopTime)
  }

  function stopAll() {
    if (!isPlaying) return
    Object.keys(channels).forEach((c) => stop(parseInt(c)))
    // audioContextRef.current.suspend()
    noteTimeouts.forEach((t) => clearTimeout(t))
    setCurrentNotes([])
    setIsPlaying(false)
  }

  function stop(id: number) {
    if (!isPlaying) return
    const channel = channels[id]
    if (channel == null) return
    // remove note from current notes
    const idx = currentNotes.indexOf(id)

    if (idx > -1) {
      const ns = [...currentNotes]
      ns.splice(idx, 1)
      setCurrentNotes(ns)
    }

    setTimeout(() => {
      try {
        channel.gain.disconnect(audioContextRef.current.destination)
      } catch (err) {
        // best-effort
      } finally {
        delete channels[id]
      }
    }, 0.48 * 1000)

    channel.osc.stop(audioContextRef.current.currentTime + 0.48)
    channel.gain.gain.linearRampToValueAtTime(
      0,
      audioContextRef.current.currentTime + 0.48
    )
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
