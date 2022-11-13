import { calcChord } from "./chords.mjs"
import { generateOctaves } from "./notes.mjs"
import { QwertyHancock } from "./keyboard.mjs"
import { calcScale } from "./scales.mjs"

let ctx
const pianoNotes = generateOctaves("C", 4, 3)
let noteTimeouts = []

function initAudio() {
  if (ctx == null) {
    ctx = new window.AudioContext()
  }
}

function initOscillator() {
  const osc = new OscillatorNode(ctx)
  osc.type = "triangle"
  osc.connect(ctx.destination)
  osc.start()
  return osc
}

function playScale() {
  initAudio()
  const rootNote = document.getElementById("note-select-scale").value
  const scaleType = document.getElementById("scale-select").value
  const selectedScale = calcScale(rootNote, scaleType)
  const osc = initOscillator()
  const playLength = selectedScale.length / 2

  selectedScale.forEach((note, i) => {
    const time = i * 0.5 * 1000
    noteTimeouts.push(
      setTimeout(() => {
        osc.frequency.value = note.frequency
        noteTimeouts.shift(1)
      }, time)
    )
  })

  osc.stop(ctx?.currentTime + playLength)
}

function playChord() {
  initAudio()
  const rootNote = document.getElementById("note-select-chord").value
  const chordType = document.getElementById("chord-type-select").value
  const chord = calcChord(rootNote, chordType)
  const ids = chord.map((note) =>
    pianoNotes.findIndex((n) => n.frequency === note.frequency)
  )
  const oscillators = []

  ids.forEach(async (id) => {
    const osc = await initOscillator()
    oscillators.push(osc)
    osc.frequency.value = pianoNotes[id].frequency
    osc.stop(ctx?.currentTime + 2)
  })
}

window.onload = function () {
  document.getElementById("play-scale").addEventListener("click", playScale)
  document.getElementById("play-chord").addEventListener("click", playChord)

  const keyboard = new QwertyHancock({
    id: "player",
    width: 600,
    height: 150,
    octaves: 2,
    startNote: "A3",
    whiteNotesColour: "white",
    blackNotesColour: "black",
    hoverColour: "#f3e939",
  })
}
