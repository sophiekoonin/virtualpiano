
import { useState, useEffect, useRef } from 'react';
import { generateOctave, Note } from '../../utils/notes';
import { real, imag } from '../../utils/wavetable'
import Piano from './Piano';


type Props = {
  notes: Array<Note>
}

function generatePianoNotes(numOctaves: number, startingOctave: number): Note[] {
  return Array.from({ length: numOctaves }, ((_, i) => startingOctave + i)).reduce((acc, i) => {
    // slice off the last element of each octave, as it's a dupe of the one next
    return [...acc, ...generateOctave('C', i).slice(0, 12)]
  }, [])
}

type OscillatorMap = {
  [keyId: string]: OscillatorNode
}

export default function Player({ notes }: Props) {
  const [currentNotes, setCurrentNotes] = useState([])
  const [noteTimeouts, setNoteTimeouts] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [oscillators, setOscillators] = useState<OscillatorMap>({})
  const [pedal, setPedal] = useState(false)
  const audioContextRef = useRef<AudioContext>()
  const pianoNotes = generatePianoNotes(2, 4)

  async function initOscillator(id: number): Promise<OscillatorNode> {
    return new Promise((resolve) => {
      let audioCtx: AudioContext;
      if (audioContextRef.current == null) {
        audioCtx = new window.AudioContext()
        audioContextRef.current = audioCtx
      } else {
        audioCtx = audioContextRef.current
      }
      const wave = audioCtx.createPeriodicWave(new Float32Array(real), new Float32Array(imag));
      const osc = audioCtx.createOscillator();
      osc.setPeriodicWave(wave);
      osc.connect(audioCtx.destination)
      osc.start();
      setIsPlaying(true)
      setOscillators({ ...oscillators, [id]: osc })

      resolve(osc)
    })

  }

  useEffect(() => {
    if (currentNotes.length === 0) {
      setIsPlaying(false)
    }

  }, [currentNotes])

  useEffect(() => {
    if (pedal === false) {
      disconnectAll()
    }
  }, [pedal])

  useEffect(() => {
    return () => {
      // unmount
      if (isPlaying) {
        disconnectAll()
      }
    };
  }, [])


  function disconnectAll() {
    Object.keys(oscillators).forEach(o => {
      oscillators[o].stop()
      oscillators[o].disconnect(audioContextRef.current.destination)
    })
    setOscillators({})

  }
  async function playNote(id: number) {
    const osc = await initOscillator(id)
    audioContextRef.current.resume()
    setCurrentNotes(pedal ? [...currentNotes, id] : [id])
    osc.frequency.value = pianoNotes[id].frequency
  }


  async function playScale() {
    const osc = await initOscillator(-1)
    audioContextRef.current.resume()

    const playLength = notes.length / 2
    for (let i = 0; i < notes.length; i++) {
      const time = (i * 0.5) * 1000
      noteTimeouts.push(setTimeout(() => {
        osc.frequency.value = notes[i].frequency
        setCurrentNotes([pianoNotes.findIndex(n => n.frequency === notes[i].frequency)])
        setNoteTimeouts(noteTimeouts.slice(1))
      }, time))
    }
    noteTimeouts.push(setTimeout(() => {
      setIsPlaying(false)
      setCurrentNotes([])
    }, (notes.length * 0.5) * 1000))
    osc.stop(audioContextRef.current.currentTime + playLength)
  }

  function stopAll() {
    if (!isPlaying) return
    try {
      disconnectAll()
      audioContextRef.current.suspend()
      noteTimeouts.forEach(t => clearTimeout(t))
      setCurrentNotes([])
      setIsPlaying(false)
    } catch (err) {
      // we... don't really care
    }
  }

  function stop(id: number) {
    if (!isPlaying) return
    const osc = oscillators[id]
    if (osc == null) return
    // remove note from current notes
    const idx = currentNotes.indexOf(id)
    if (idx > -1) {
      const ns = currentNotes
      ns.splice(idx, 1)
      setCurrentNotes(ns)
    }
    osc.stop(0)
  }

  return (
    <>
      <button onClick={() => playScale()} type="button">Play scale</button>
      <button onClick={() => stopAll()} type="button">Stop</button>
      <label htmlFor="pedal"><input checked={pedal} onChange={() => setPedal(!pedal)} id="pedal" type="checkbox" />Pedal</label>
      <Piano octaves={2} currentNotes={currentNotes} play={playNote} pedal={pedal} stop={stop} />
      <p>Notes playing: {currentNotes.sort((a, b) => a - b).map(n => pianoNotes[n].letter)}</p>
    </>
  )
}

