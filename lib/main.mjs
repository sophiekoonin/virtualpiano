import { calcChord } from "./chords.mjs"
import { generateOctaves, notes } from "./notes.mjs"
import { Keyboard } from "./keyboard.mjs"
import { calcScale } from "./scales.mjs"

let ctx
const pianoNotes = generateOctaves("C", 3, 2)
let noteTimeouts = []
let globalOscillators = {}
let currentNotes = []
let keyboard

function initAudio() {
  if (ctx == null) {
    ctx = new window.AudioContext()
  }
}

function initOscillator() {
  const osc = new OscillatorNode(ctx)
  osc.type = "sine"
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

  for (let i = 0; i <= selectedScale.length; i++) {
    const time = i * 0.5 * 1000
    noteTimeouts.push(
      setTimeout(() => {
        if (i > 0) {
          const prevNote = selectedScale[i - 1]
          keyboard.togglePlayingNote(
            prevNote.letter + prevNote.octave.toString()
          )
        }
        const newNote = selectedScale[i]
        if (newNote == null) return
        osc.frequency.value = newNote.frequency
        keyboard.togglePlayingNote(newNote.letter + newNote.octave.toString())
        noteTimeouts.shift(1)
      }, time)
    )
  }

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
  chord.forEach((note) => {
    keyboard.togglePlayingNote(note.letter + note.octave.toString())

    setTimeout(() => {
      keyboard.togglePlayingNote(note.letter + note.octave.toString())
    }, ctx?.currentTime + 2000)
  })
  ids.forEach((id) => {
    const osc = initOscillator()
    oscillators.push(osc)
    osc.frequency.value = pianoNotes[id].frequency
    osc.stop(ctx?.currentTime + 2)
  })
}

function stop(note) {
  const osc = globalOscillators[note]
  keyboard.togglePlayingNote(note)
  if (osc == null) return
  osc.stop()
}

function play(note, frequency) {
  initAudio()
  const osc = initOscillator()
  keyboard.togglePlayingNote(note)
  globalOscillators[note] = osc
  osc.frequency.value = frequency
}

window.onload = function () {
  document.getElementById("play-scale").addEventListener("click", playScale)
  document.getElementById("play-chord").addEventListener("click", playChord)

  keyboard = new Keyboard()
  keyboard.keyDownCallback = play
  keyboard.keyUpCallback = stop
}
