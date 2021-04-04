import { A4 } from "./constants"

// it looks weird that this array has sharps in, but i'm using sharps everywhere for consistency
export const KeysWithFlats = ["C", "F", "A#", "F#", "G#", "C#"]
export const KeysWithSharps = ["G", "D", "A", "E", "B", "F#"]

export const RelativeMinors = Object.freeze({
  C: "A",
  "C#": "A#",
  D: "B",
  "D#": "C", // Eb
  E: "F#",
  F: "D",
  "F#": "D#",
  G: "E",
  "G#": "F", // Ab
  A: "F#",
  "A#": "G", // Bb
  B: "G#"
})

export const SharpToFlat = Object.freeze({
  "A#": "Bb",
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab"
})

const SemitoneDistances = Object.freeze({
  C: -9,
  "C#": -8,
  D: -7,
  "D#": -6,
  E: -5,
  F: -4,
  "F#": -3,
  G: -2,
  "G#": -1,
  A: 0,
  "A#": 1,
  B: 2
})

export const notes = Object.keys(SemitoneDistances)
export type Note = { letter: string; octave: number; frequency: number }
export type NoteLetter = typeof notes[number]

// generate an array containing all 12 semitones in octave, from root to root + 8
export function generateOctaves(
  rootNote: NoteLetter,
  startingOctave: number = 4,
  numOctaves: number = 1
) {
  let currentOctave = startingOctave
  const octaveNotes: Array<Note> = []
  const noteIndex = notes.indexOf(rootNote)
  for (let j = 0; j < numOctaves; j++) {
    // first populate the array with all notes from root note through to G#
    for (let i = noteIndex; i < notes.length; i++) {
      octaveNotes.push({
        letter: notes[i],
        octave: currentOctave,
        frequency: calcFrequency(notes[i], currentOctave)
      })
    }
    // then add the remaining notes from before the root note
    for (let i = 0; i < noteIndex; i++) {
      octaveNotes.push({
        letter: notes[i],
        octave: currentOctave + 1,
        frequency: calcFrequency(notes[i], currentOctave + 1)
      })
    }
    currentOctave += 1
  }
  // finally, whack on the last root note + 8
  octaveNotes.push({
    letter: notes[noteIndex],
    octave: currentOctave,
    frequency: calcFrequency(notes[noteIndex], currentOctave)
  })
  return octaveNotes
}

export function calcDistance(rootNote: NoteLetter, otherNote: NoteLetter) {
  // we find the distance from A, and use it as an offset
  const rootNoteDistanceFromA = SemitoneDistances[rootNote]
  return SemitoneDistances[otherNote] - rootNoteDistanceFromA
}

// takes a note and its octave, e.g. A, 4, and return frequency.
export function calcFrequency(note: NoteLetter, octave: number): number {
  const distanceFromA = SemitoneDistances[note]
  // our base is octave 4, so subtract that from our note's octave, and multiply by number of semitones in an octave
  // then add the distance
  const steps = (octave - 4) * 12 + distanceFromA

  // f = 440Hz * 2^n/12
  const freq = A4 * Math.pow(2, steps / 12)
  // round to 1 d.p.
  return Math.round(freq * 10) / 10
}

export function calculateNotePattern(octave: Note[], pattern: number[]) {
  let currentPosition = 0 // root
  const notes = []
  // iterate through the pattern incrementing the position accordingly
  // and get the note at that position.
  for (let pos of pattern) {
    currentPosition += pos
    notes.push(octave[currentPosition])
  }

  return notes
}
