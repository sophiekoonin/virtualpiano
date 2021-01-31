import { A4 } from "./constants"

const FREQUENCY_RATIO = 1.059463

const SharpToFlat = Object.freeze({
  "A#": "Bb",
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab"
})
const SemitoneIntervals = Object.freeze({
  A: 0,
  "A#": 1,
  B: 2,
  C: -9,
  "C#": -8,
  D: -7,
  "D#": -6,
  E: -5,
  F: -4,
  "F#": -3,
  G: -2,
  "G#": -1
})

export const notes = Object.keys(SemitoneIntervals)
export type Note = { letter: string; octave: number; frequency: number }
export type NoteLetter = typeof notes[number]

// generate an array containing all 12 semitones in octave, from root to root + 8
export function generateOctave(
  rootNote: NoteLetter,
  startingOctave: number = 4
) {
  const octaveNotes: Array<Note> = []
  const noteIndex = notes.indexOf(rootNote)
  // first populate the array with all notes from root note through to G#
  for (let i = noteIndex; i < notes.length; i++) {
    octaveNotes.push({
      letter: notes[i],
      octave: startingOctave,
      frequency: calcFrequency(notes[i], startingOctave)
    })
  }
  // then add the remaining notes from before the root note
  for (let i = 0; i <= noteIndex; i++) {
    octaveNotes.push({
      letter: notes[i],
      octave: startingOctave + 1,
      frequency: calcFrequency(notes[i], startingOctave + 1)
    })
  }
  return octaveNotes
}

export function calcInterval(rootNote: NoteLetter, intervalNote: NoteLetter) {
  // we find the interval from A, and use it as an offset
  const rootNoteIntervalFromA = SemitoneIntervals[rootNote]
  return SemitoneIntervals[intervalNote] - rootNoteIntervalFromA
}

// takes a note and its octave, e.g. A, 4, and return frequency.
export function calcFrequency(note: NoteLetter, octave: number): number {
  const intervalFromA = SemitoneIntervals[note]
  // our base is octave 4, so subtract our note's octave from that, and multiply by number of semitones in an octave
  // then add the interval
  // maths is hard
  const steps = (4 - octave) * -12 + intervalFromA
  const freq = A4 * Math.pow(FREQUENCY_RATIO, steps)
  // round to 1 d.p.
  return Math.round(freq * 10) / 10
}
