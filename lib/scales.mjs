import { calculateNotePattern, generateOctaves } from "./notes.mjs"

export const Scales = Object.freeze({
  MAJOR: "major",
  NAT_MIN: "nat-min",
  HAR_MIN: "har-min",
  MEL_MIN_UP: "mel-min-up",
  MEL_MIN_DOWN: "mel-min-down",
  DORIAN: "dorian",
  PHRYIGAN: "phryigan",
  LYDIAN: "lydian",
  MIXOLYDIAN: "mixolydian",
  LOCRIAN: "locrian",
  PENT_BLUES: "pent-blues",
})

export const ScaleNames = Object.freeze({
  [Scales.MAJOR]: "Major",
  [Scales.NAT_MIN]: "Natural minor",
  [Scales.HAR_MIN]: "Harmonic minor",
  [Scales.MEL_MIN_UP]: "Melodic minor (up)",
  [Scales.MEL_MIN_DOWN]: "Melodic minor (down)",
  [Scales.DORIAN]: "Dorian mode",
  [Scales.PHRYIGAN]: "Phrygian mode",
  [Scales.LYDIAN]: "Lydian mode",
  [Scales.MIXOLYDIAN]: "Mixolydian mode",
  [Scales.LOCRIAN]: "Locrian mode",
  [Scales.PENT_BLUES]: "Minor pentatonic blues",
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
  [Scales.PENT_BLUES]: [0, 3, 2, 2, 3, 2],
})

export function calcScale(rootNote, type) {
  // start on octave 4, we may want to change this later
  const octave = generateOctaves(rootNote, 3, 1)
  const scalePattern = ScalePatterns[type]
  return calculateNotePattern(octave, scalePattern)
}
