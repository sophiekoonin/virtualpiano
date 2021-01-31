import { useState } from 'react'
import cx from 'classnames'

import styles from './Piano.module.scss'


// this is a React port of pianosvg
// https://github.com/spacejack/pianosvg

// 128 midi notes in total
const NUM_NOTES = 128

// number of white and black notes in each octave
// this is probs overkill to pull out into a constant but it makes
// the code a bit easier to read
const NUM_WHITE_NOTES = 7
const NUM_BLACK_NOTES = 5

const NOTE_COLOURS = ['w', 'b', 'w', 'b', 'w', 'w', 'b', 'w', 'b', 'w', 'b', 'w']

const WHITE_WIDTH = 24
const WHITE_HEIGHT = 120
const BLACK_WIDTH = WHITE_WIDTH * 0.7
const BLACK_HEIGHT = WHITE_HEIGHT * 0.6
/** Count white keys included from 0 to id (not including id) */
function wkCountToId(id: number) {

  if (!Number.isSafeInteger(id) || id < 0 || id >= NUM_NOTES) {
    throw new Error('Invalid id for count: ' + id)
  }
  let x = 0
  for (let i = 0; i < id; ++i) {
    if (NOTE_COLOURS[i % 12] === 'w') {
      ++x
    }
  }
  return x
}

function idToX(id: number) {
  const x = wkCountToId(id)
  if (NOTE_COLOURS[id % 12] === 'w') {
    return x * WHITE_WIDTH
  }
  // Black key offset
  return x * WHITE_WIDTH - BLACK_WIDTH / 2
}

type Props = {
  octaves: number,
  currentNote: number,
  play: (id: number) => void,
  stop: () => void
}

type Key = {
  id: string,
  x: string,
}

export default function Piano({ octaves = 2, currentNote, play, stop }: Props) {
  const numNotes = octaves * 12
  const whiteKeys = []
  const blackKeys = []

  for (let i = 0; i < (numNotes); i++) {
    const keyColour = NOTE_COLOURS[i % 12]
    const key = {
      x: idToX(i),
      id: i,
    }
    keyColour === 'w' ? whiteKeys.push(key) : blackKeys.push(key)
  }

  // function onNotePress(id: number) {
  //   setCurrentNote(id)
  // }

  return (
    <svg className={styles.piano} width={whiteKeys.length * WHITE_WIDTH}>
      <g className={styles.white}>
        {whiteKeys.map(k => <rect onMouseDown={() => play(k.id)} onMouseUp={stop} tabIndex={k.id} key={k.id} className={cx(styles.white, { [styles.pressed]: currentNote === k.id })} x={k.x} width={WHITE_WIDTH} height={WHITE_HEIGHT} />)}
      </g>
      <g className={styles.black}>
        {blackKeys.map(k => <rect tabIndex={k.id} onMouseDown={() => play(k.id)} onMouseUp={stop} key={k.id} className={cx(styles.black, { [styles.pressed]: currentNote === k.id })} x={k.x} width={BLACK_WIDTH} height={BLACK_HEIGHT} />)}
      </g>
    </svg>
  )
}
