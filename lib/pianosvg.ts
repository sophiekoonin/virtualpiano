// this is a React port of pianosvg
// https://github.com/spacejack/pianosvg

// 128 midi notes in total
export const NUM_NOTES = 128

export const Widths = {
  w: 24,
  b: 24 * 0.7
}
export const Heights = {
  w: 120,
  b: 120 * 0.6
}

export const NOTE_COLOURS = [
  "w",
  "b",
  "w",
  "b",
  "w",
  "w",
  "b",
  "w",
  "b",
  "w",
  "b",
  "w"
]

/** Count white keys included from 0 to id (not including id) */
export function wkCountToId(id: number) {
  if (!Number.isSafeInteger(id) || id < 0 || id >= NUM_NOTES) {
    throw new Error("Invalid id for count: " + id)
  }
  let x = 0
  for (let i = 0; i < id; ++i) {
    if (NOTE_COLOURS[i % 12] === "w") {
      ++x
    }
  }
  return x
}

export function idToX(id: number) {
  const x = wkCountToId(id)
  if (NOTE_COLOURS[id % 12] === "w") {
    return x * Widths.w
  }
  // Black key offset
  return x * Widths.w - Widths.b / 2
}
