import { calculateNotePattern, generateOctaves } from "./notes.mjs"

export const Chords = Object.freeze({
  MAJOR: "major",
  MAJ6: "maj6",
  MAJ7: "maj7",
  DOM7: "dom7",
  AUG: "aug",
  AUG7: "aug7",
  MINOR: "minor",
  MIN6: "min6",
  MIN7: "min7",
  DIM: "dim",
  DIM7: "dim7",
  SUS4: "sus4",
  SUS2: "sus2",
  ADD9: "add9",
  MINMAJ: "minmaj",
  HALF: "half",
})

export const ChordPatterns = Object.freeze({
  [Chords.MAJOR]: [0, 4, 3],
  [Chords.MAJ6]: [0, 4, 3, 2],
  [Chords.MAJ7]: [0, 4, 3, 4],
  [Chords.DOM7]: [0, 4, 3, 3],
  [Chords.AUG]: [0, 4, 4],
  [Chords.AUG7]: [0, 4, 4, 2],
  [Chords.MINOR]: [0, 3, 4],
  [Chords.MIN6]: [0, 3, 4, 2],
  [Chords.MIN7]: [0, 3, 4, 3],
  [Chords.DIM]: [0, 3, 3],
  [Chords.DIM7]: [0, 3, 3, 3],
  [Chords.MINMAJ]: [0, 3, 4, 4],
  [Chords.HALF]: [0, 3, 3, 4],
  [Chords.SUS4]: [0, 5, 2],
  [Chords.SUS2]: [0, 2, 5],
  [Chords.ADD9]: [0, 4, 3, 7],
})

export function calcChord(rootNote, type, startingOctave) {
  // start on octave 4, we may want to change this later
  const octave = generateOctaves(rootNote, startingOctave, 2)
  const pat = ChordPatterns[type]
  return calculateNotePattern(octave, pat)
}
