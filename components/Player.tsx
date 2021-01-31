
import { useState } from 'react';
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
  const [osc, setOsc] = useState<OscillatorNode>()
  const [currentNote, setCurrentNote] = useState(-1)
  const [pianoNotes] = useState(generatePianoNotes(2, 4))
  const [noteTimeouts, setNoteTimeouts] = useState([])
  function playScale() {
    const audioCtx = new window.AudioContext()
    const wave = audioCtx.createPeriodicWave(new Float32Array(real), new Float32Array(imag));
    const osc = audioCtx.createOscillator();
    setOsc(osc)
    osc.setPeriodicWave(wave);

    osc.connect(audioCtx.destination);
    osc.start();
    for (let i = 0; i < notes.length; i++) {
      const time = audioCtx.currentTime + (i * 0.5)
      noteTimeouts.push(setTimeout(() => {
        setCurrentNote(pianoNotes.findIndex(n => n.frequency === notes[i].frequency))
        setNoteTimeouts(noteTimeouts.slice(1))
      }, time * 1000))
      osc.frequency.setValueAtTime(notes[i].frequency, time)
    }
    osc.stop(audioCtx.currentTime + 4)
  }

  function stop() {
    osc.stop()
    noteTimeouts.forEach(t => clearTimeout(t))
    setCurrentNote(-1)
  }
  return (
    <>
      <button onClick={() => playScale()} type="button">Play scale</button>
      <button onClick={() => stop()} type="button">Stop</button>
      <Piano octaves={2} currentNote={currentNote} />
    </>
  )
}