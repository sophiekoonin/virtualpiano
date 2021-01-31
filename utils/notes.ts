import { A4 } from "./constants"

const FREQUENCY_RATIO = 1.059463

const SEMITONE_INTERVAL = Object.freeze({
  A: 0,
  "A#": 1,
  Bb: 1,
  B: 2,
  C: -9,
  "C#": -8,
  Db: -8,
  D: -7,
  "D#": -6,
  Eb: -6,
  E: -5,
  F: -4,
  "F#": -3,
  Gb: -3,
  G: -2,
  "G#": -1,
  Ab: -1
})

// takes a note and its octave, e.g. A, 4, and return frequency.
export function calcFrequency(note: string, octave: number): number {
  const intervalFromA = SEMITONE_INTERVAL[note]
  // our base is octave 4, so subtract our note's octave from that, and multiply by number of semitones in an octave
  // then add the interval
  // maths is hard
  const steps = (4 - octave) * -12 + intervalFromA
  return A4 * Math.pow(FREQUENCY_RATIO, steps)
}
