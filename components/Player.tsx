
import { useContext, useState, useEffect, useRef } from 'react';
import { generateOctave, Note } from '../utils/notes';
import { real, imag } from '../utils/wavetable'
import Piano from './Piano';


type Props = {
  notes: Array<Note>
}

function generatePianoNotes(numOctaves: number, startingOctave: number) {
  return Array.from({ length: numOctaves }, ((_, i) => startingOctave + i)).reduce((acc, i) => {
    // slice off the last element of each octave, as it's a dupe of the one next
    return [...acc, ...generateOctave('C', i).slice(0, 12)]
  }, [])
}

export default function Player({ notes }: Props) {
  const [currentNote, setCurrentNote] = useState(-1)
  const [noteTimeouts, setNoteTimeouts] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContextRef = useRef<AudioContext>()
  const oscRef = useRef<OscillatorNode>()
  const pianoNotes = generatePianoNotes(2, 4)
  async function initOscillator(): Promise<OscillatorNode> {
    return new Promise((resolve) => {
      let audioCtx;
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
      oscRef.current = osc

      resolve(osc)
    })

  }

  useEffect(() => {
    return () => {
      // unmount
      if (isPlaying) {
        oscRef.current.disconnect(audioContextRef.current.destination)
      }
    };
  }, [])


  async function playNote(id: number) {
    const osc = await initOscillator()
    audioContextRef.current.resume()
    setCurrentNote(id)
    osc.frequency.value = pianoNotes[id].frequency
  }


  async function playScale() {
    const osc = await initOscillator()
    audioContextRef.current.resume()

    const playLength = notes.length / 2
    for (let i = 0; i < notes.length; i++) {
      const time = (i * 0.5) * 1000
      noteTimeouts.push(setTimeout(() => {
        osc.frequency.value = notes[i].frequency
        setCurrentNote(pianoNotes.findIndex(n => n.frequency === notes[i].frequency))
        setNoteTimeouts(noteTimeouts.slice(1))
      }, time))
    }
    noteTimeouts.push(setTimeout(() => {
      setIsPlaying(false)
      setCurrentNote(-1)
    }, (notes.length * 0.5) * 1000))
    osc.stop(audioContextRef.current.currentTime + playLength)
  }

  function stop() {
    if (!isPlaying) return
    audioContextRef.current.suspend()
    oscRef.current.disconnect(audioContextRef.current.destination)
    noteTimeouts.forEach(t => clearTimeout(t))
    setCurrentNote(-1)
    setIsPlaying(false)
  }
  return (
    <>
      <button onClick={() => playScale()} type="button">Play scale</button>
      <button onClick={() => stop()} type="button">Stop</button>
      <Piano octaves={2} currentNote={currentNote} play={playNote} stop={stop} />
    </>
  )
}