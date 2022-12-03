import { calcChord } from "./chords.mjs"
import { calcFrequency, generateOctaves, notes } from "./notes.mjs"
import { Keyboard } from "./keyboard.mjs"
import { calcScale } from "./scales.mjs"

let audioCtx
const pianoNotes = generateOctaves("C", 3, 2)
let noteTimeouts = []
let globalOscillators = {}
let currentNotes = new Set()
let keyboard
let pedalOn = false
let notesPlayingSection

function initAudio() {
  if (audioCtx == null) {
    audioCtx = new window.AudioContext()
  }
}

function initOscillator() {
  const osc = new OscillatorNode(audioCtx)
  osc.type = "triangle"
  osc.connect(audioCtx.destination)
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
  globalOscillators = { [-1]: osc }
  for (let i = 0; i <= selectedScale.length; i++) {
    const time = i * 0.5 * 1000
    noteTimeouts.push(
      setTimeout(() => {
        if (i > 0) {
          const prevNote = selectedScale[i - 1]
          keyboard.togglePlayingNote(
            prevNote.letter + prevNote.octave.toString()
          )
          currentNotes.delete(prevNote.letter + prevNote.octave.toString())
        }
        if (i == selectedScale.length) {
          globalOscillators = {}
          currentNotes.clear()
          updateCurrentlyPlayingNotes()
          return
        }
        const newNote = selectedScale[i]
        osc.frequency.value = newNote.frequency
        keyboard.togglePlayingNote(newNote.letter + newNote.octave.toString())
        currentNotes.add(newNote.letter + newNote.octave.toString())
        updateCurrentlyPlayingNotes()
        noteTimeouts.shift(1)
      }, time)
    )
  }

  osc.stop(audioCtx?.currentTime + playLength)
}

function findPianoNotes(chord) {
  return chord
    .map((note) => pianoNotes.findIndex((n) => n.frequency === note.frequency))
    .filter((idx) => idx > -1)
}

function stopAll() {
  try {
    Object.keys(globalOscillators).forEach((o) => {
      globalOscillators[o].stop()
      globalOscillators[o].disconnect(audioCtx?.destination)
    })
  } catch (err) {
    // best-effort
    console.warn(err)
  } finally {
    globalOscillators = {}
  }
  noteTimeouts.forEach((t) => clearTimeout(t))
  keyboard.clearAllPlayingNotes()
  currentNotes.clear()
  updateCurrentlyPlayingNotes()
}

function playChord() {
  initAudio()
  const rootNote = document.getElementById("note-select-chord").value
  const chordType = document.getElementById("chord-type-select").value
  let chord = calcChord(rootNote, chordType, 4)
  let ids = findPianoNotes(chord)
  if (chord.length > ids.length) {
    // we're too high on the keyboard. try again
    chord = calcChord(rootNote, chordType, 3)
    ids = findPianoNotes(chord)
  }
  chord.forEach((note) => {
    const noteName = note.letter + note.octave.toString()
    keyboard.togglePlayingNote(noteName)
    currentNotes.add(noteName)
    updateCurrentlyPlayingNotes()
    noteTimeouts.push(
      setTimeout(() => {
        keyboard.togglePlayingNote(noteName)
        currentNotes.delete(noteName)
        updateCurrentlyPlayingNotes()
        globalOscillators = {}
      }, audioCtx?.currentTime + 2000)
    )
  })
  ids.forEach((id) => {
    const osc = initOscillator()
    globalOscillators[id] = osc
    osc.frequency.value = pianoNotes[id].frequency
    osc.stop(audioCtx?.currentTime + 2)
  })
}

function updateCurrentlyPlayingNotes() {
  if (currentNotes.size == 0) {
    notesPlayingSection.textContent = ""
    return
  }

  notesPlayingSection.textContent =
    "Notes playing: " + Array.from(currentNotes).join(", ")
}

function play(note, frequency) {
  initAudio()
  const osc = initOscillator()
  keyboard.togglePlayingNote(note)
  globalOscillators[note] = osc
  currentNotes.add(note)
  updateCurrentlyPlayingNotes()
  osc.frequency.value = frequency
}

function stop(note) {
  const osc = globalOscillators[note]
  keyboard.togglePlayingNote(note)
  currentNotes.delete(note)
  updateCurrentlyPlayingNotes()

  if (osc == null) return
  osc.stop()
}

function initMidi(data) {
  const midiData = data
  const inputs = midiData.inputs.values()
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    input.value.onmidimessage = handleMidiMessage
  }
}

function handleMidiMessage(msg) {
  const { data } = msg
  const cmd = data[0] // 144 = on, 128 = off
  const noteNumber = data[1] // the number of the note to play
  // Our array of notes is 0-24
  // Midi notes are going to be higher than that, starting at C3 = 48, so calc the difference
  const noteToPlay = pianoNotes[noteNumber - 48]
  switch (cmd) {
    case 144:
      play(
        noteToPlay.letter + noteToPlay.octave.toString(),
        noteToPlay.frequency
      )
      break
    case 128:
      stop(noteToPlay.letter + noteToPlay.octave.toString())
      break
    default:
      break
  }
}

function toggleMode(el) {
  document.getElementById("scale-options").classList.toggle("hidden")
  document.getElementById("chord-options").classList.toggle("hidden")
  document.getElementById("play-scale").classList.toggle("hidden")
  document.getElementById("play-chord").classList.toggle("hidden")
}

window.onload = function () {
  document.getElementById("play-scale").addEventListener("click", playScale)
  document.getElementById("play-chord").addEventListener("click", playChord)
  document.getElementById("stop").addEventListener("click", stopAll)

  keyboard = new Keyboard()
  keyboard.keyDownCallback = (note, freq) => {
    if (!pedalOn) {
      play(note, freq)
    } else {
      currentNotes.has(note) ? stop(freq) : play(note, freq)
    }
  }
  keyboard.keyUpCallback = (note) => {
    if (!pedalOn) {
      stop(note)
    }
  }

  const scaleRadio = document.getElementById("scale-radio")
  scaleRadio.addEventListener("change", toggleMode)
  scaleRadio.checked = true

  document.getElementById("pedal-checkbox").addEventListener("change", (ev) => {
    const enabled = event.target.checked
    pedalOn = enabled
  })

  notesPlayingSection = document.getElementById("notes-playing")
  document.getElementById("chord-radio").addEventListener("change", toggleMode)
  if (navigator.requestMIDIAccess) {
    navigator
      .requestMIDIAccess({
        sysex: true,
      })
      .then(initMidi, () => console.warn("Not recognising MIDI controller"))
  } else {
    console.warn("No MIDI support in your browser")
  }
}
