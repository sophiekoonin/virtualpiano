import cx from 'classnames'

import styles from './Piano.module.scss'

// this is a React port of pianosvg
// https://github.com/spacejack/pianosvg

// 128 midi notes in total
const NUM_NOTES = 128

const NOTE_COLOURS = ['w', 'b', 'w', 'b', 'w', 'w', 'b', 'w', 'b', 'w', 'b', 'w']

const Widths = {
  w: 24,
  b: 24 * 0.7
}
const Heights = {
  w: 120,
  b: 120 * 0.6
}
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
    return x * Widths.w
  }
  // Black key offset
  return x * Widths.w - Widths.b / 2
}

type Props = {
  octaves: number,
  currentNotes: Array<number>,
  play: (id: number) => void,
  stop: (id: number) => void
  pedal: boolean
}

type KeyProps = {
  id: number,
  colour: string,
  x: number,
}



export default function Piano({ octaves = 2, currentNotes, play, stop, pedal }: Props) {
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


  function Key({ colour, id, x }: KeyProps) {
    if (id === 5) console.log(currentNotes)
    return (<rect
      onClick={() => toggleNote(id)}
      onMouseDown={() => pedal ? null : play(id)}
      onMouseUp={() => pedal ? null : stop(id)}
      tabIndex={id}
      key={id}
      className={cx(styles.key, { [styles.pressed]: currentNotes.includes(id) })}
      x={x}
      width={Widths[colour]}
      height={Heights[colour]}
      data-keyid={id} />)
  }

  function toggleNote(id: number) {
    if (!pedal) return
    if (!currentNotes.includes(id)) {
      play(id)
    } else {
      stop(id)
    }
  }

  return (
    <svg className={styles.piano} width={whiteKeys.length * Widths.w}>
      <g className={styles.white}>
        {whiteKeys.map(k => <Key colour="w" x={k.x} id={k.id} key={k.id} />)}
      </g>
      <g className={styles.black}>
        {blackKeys.map(k => <Key colour="b" x={k.x} id={k.id} key={k.id} />)}
      </g>
    </svg>
  )
}

