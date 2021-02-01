import { calculateNotePattern, generateOctaves, Note } from "./notes"

export const Scales = Object.freeze({
  MAJOR: "Major",
  NAT_MIN: "Natural minor",
  HAR_MIN: "Harmonic minor",
  MEL_MIN_UP: "Melodic minor (up)",
  MEL_MIN_DOWN: "Melodic minor (down)",
  DORIAN: "Dorian mode",
  PHRYIGAN: "Phrygian mode",
  LYDIAN: "Lydian mode",
  MIXOLYDIAN: "Mixolydian mode",
  LOCRIAN: "Locrian mode",
  PENT_BLUES: "Minor pentatonic blues"
})

export const ScalePatterns = Object.freeze({
  [Scales.MAJOR]: [0, 2, 2, 1, 2, 2, 2, 1],
  [Scales.NAT_MIN]: [0, 2, 1, 2, 2, 1, 2, 2],
  [Scales.HAR_MIN]: [0, 2, 1, 2, 2, 1, 3, 1],
  [Scales.MEL_MIN_UP]: [0, 2, 1, 2, 2, 2, 2, 1],
  [Scales.MEL_MIN_DOWN]: [12, -2, -2, -1, -2, -2, -1, -2],
  [Scales.DORIAN]: [0, 2, 1, 2, 2, 2, 1, 2],
  [Scales.PHRYIGAN]: [0, 1, 2, 2, 2, 1, 2, 2],
  [Scales.LYDIAN]: [0, 2, 2, 2, 1, 2, 2, 1],
  [Scales.MIXOLYDIAN]: [0, 2, 2, 1, 2, 2, 1, 2],
  [Scales.LOCRIAN]: [0, 1, 2, 2, 1, 2, 2, 2],
  [Scales.PENT_BLUES]: [0, 3, 2, 2, 3, 2]
})

export function calcScale(rootNote: string, type: string): Array<Note> {
  // start on octave 4, we may want to change this later
  const octave = generateOctaves(rootNote, 4, 1)
  const scalePattern = ScalePatterns[type]
  return calculateNotePattern(octave, scalePattern)
}
