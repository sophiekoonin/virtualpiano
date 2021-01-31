
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
  const [currentNote, setCurrentNote] = useState(-1)
  const [noteTimeouts, setNoteTimeouts] = useState([])
  const [audioCtx, setAudioCtx] = useState<AudioContext>()
  const [oscillator, setOscillator] = useState<OscillatorNode>()
  const pianoNotes = generatePianoNotes(2, 4)


  function setupAudioCtx() {
    const ac = new window.AudioContext()
    const wave = ac.createPeriodicWave(new Float32Array(real), new Float32Array(imag));
    const oscillator = ac.createOscillator();
    oscillator.setPeriodicWave(wave);
    setAudioCtx(ac)
    setOscillator(oscillator)
    oscillator.start();

  }


  async function playNote(id: number) {
    if (audioCtx == null || oscillator == null) {
      return
    }
    oscillator.connect(audioCtx.destination)
    setCurrentNote(id)
    oscillator.frequency.setValueAtTime((pianoNotes[id].frequency), audioCtx.currentTime)
  }



  function playScale() {
    if (audioCtx == null || oscillator == null) {
      return
    }
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
      {audioCtx != null && oscillator != null ? <span>Ready</span> : <button onClick={() => setupAudioCtx()} type="button">Power on</button>}
      <button onClick={() => playScale()} type="button">Play scale</button>
      <button onClick={() => stop()} type="button">Stop</button>
      <Piano octaves={2} currentNote={currentNote} play={playNote} stop={stop} />
    </>
  )
}