
import { useContext, useState, useEffect } from 'react';
import { generateOctave, Note } from '../utils/notes';
import { real, imag } from '../utils/wavetable'
import { AudioContext } from './AudioContext';
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
  const [oscillator, setOscillator] = useState<OscillatorNode>()
  const pianoNotes = generatePianoNotes(2, 4)

  const { audioCtx } = useContext(AudioContext)

  useEffect(() => {
    if (audioCtx == null) {
      return
    }
    const wave = audioCtx.createPeriodicWave(new Float32Array(real), new Float32Array(imag));
    const oscillator = audioCtx.createOscillator();
    oscillator.setPeriodicWave(wave);
    setOscillator(oscillator)
    oscillator.start();

  }, [audioCtx])


  async function playNote(id: number) {
    oscillator.connect(audioCtx.destination)
    setCurrentNote(id)
    oscillator.frequency.setValueAtTime((pianoNotes[id].frequency), audioCtx.currentTime)
  }



  function playScale() {

    oscillator.connect(audioCtx.destination)

    for (let i = 0; i < notes.length; i++) {
      const time = audioCtx.currentTime + (i * 0.5)
      noteTimeouts.push(setTimeout(() => {
        setCurrentNote(pianoNotes.findIndex(n => n.frequency === notes[i].frequency))
        setNoteTimeouts(noteTimeouts.slice(1))
      }, time * 1000))
      oscillator.frequency.setValueAtTime(notes[i].frequency, time)
    }
    oscillator.stop(audioCtx.currentTime + 4)
  }

  function stop() {
    oscillator.disconnect(audioCtx.destination)
    noteTimeouts.forEach(t => clearTimeout(t))
    setCurrentNote(-1)
  }
  return (
    <>
      <button onClick={() => playScale()} type="button">Play scale</button>
      <button onClick={() => stop()} type="button">Stop</button>
      <Piano octaves={2} currentNote={currentNote} play={playNote} stop={stop} />
    </>
  )
}