import { calcChord } from "./chords.mjs"
import { calcFrequency, generateOctaves, notes } from "./notes.mjs"
import { Keyboard } from "./keyboard.mjs"
import { calcScale } from "./scales.mjs"

let audioCtx
const pianoNotes = generateOctaves("C", 3, 2)
let noteTimeouts = []
let channels = {}
let currentNotes = new Set()
let keyboard
let pedalOn = false
let notesPlayingSection

/* AUDIO FNS */
function initAudio() {
  if (audioCtx == null) {
    audioCtx = new window.AudioContext()
  }
}

function initChannel(frequency) {
  const gainNode = new GainNode(audioCtx)
  gainNode.connect(audioCtx.destination)
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
  gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.06)

  const osc = new OscillatorNode(audioCtx)
  osc.connect(gainNode)
  osc.type = "sine"
  osc.frequency.value = frequency
  osc.start()

  return { osc, gain: gainNode }
}

function disconnectChannel(channel, id) {
  setTimeout(() => {
    try {
      channel.gain.disconnect(audioCtx.destination)
    } catch (err) {
      console.log(err)
      // best-effort
    } finally {
      delete channels[id]
    }
  }, 0.48 * 1000)
}

function stopChannel(id) {
  const channel = channels[id]
  if (channel) {
    disconnectChannel(channel, id)
    channel.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.48)
    channel.osc.stop(audioCtx.currentTime + 0.48)
  } else {
    // We've lost the channel somehow. Better just blow everything up.
    audioCtx.close()
    audioCtx = null
    initAudio()
  }
}

/* MIDI FNS */
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

/* PLAY/STOP */
function playScale() {
  initAudio()
  const rootNote = document.getElementById("note-select-scale").value
  const scaleType = document.getElementById("scale-select").value
  const selectedScale = calcScale(rootNote, scaleType)
  const channel = initChannel()
  const playLength = selectedScale.length / 2
  channels = { [-1]: channel }
  for (let i = 0; i <= selectedScale.length; i++) {
    const time = i * 0.5 * 1000
    noteTimeouts.push(
      setTimeout(() => {
        if (i > 0) {
          // Toggle the previous note colour
          const prevNote = selectedScale[i - 1]
          keyboard.togglePlayingNote(
            prevNote.letter + prevNote.octave.toString()
          )
          currentNotes.delete(prevNote.letter + prevNote.octave.toString())
        }
        if (i == selectedScale.length - 1) {
          // Soft landing
          channel.gain.gain.linearRampToValueAtTime(0, time - 800)
        }
        if (i == selectedScale.length) {
          // At the end, disconnect it all
          disconnectChannel(channel, -1)
          currentNotes.clear()
          updateCurrentlyPlayingNotes()

          return
        }

        const newNote = selectedScale[i]
        channel.osc.frequency.value = newNote.frequency
        keyboard.togglePlayingNote(newNote.letter + newNote.octave.toString())
        currentNotes.add(newNote.letter + newNote.octave.toString())
        updateCurrentlyPlayingNotes()
        noteTimeouts.shift(1)
      }, time)
    )
  }

  const stopAt = audioCtx.currentTime + playLength
  channel.osc.stop(stopAt)
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
        channels = {}
      }, audioCtx?.currentTime + 2000)
    )
  })
  ids.forEach((id) => {
    const channel = initChannel()
    channels[id] = channel
    channel.osc.frequency.value = pianoNotes[id].frequency
    channel.osc.stop(audioCtx?.currentTime + 2)
    channel.gain.gain.linearRampToValueAtTime(0, audioCtx?.currentTime + 2)
  })
}

function play(note, frequency) {
  initAudio()
  const channel = initChannel(frequency)
  keyboard.togglePlayingNote(note)
  channels[note] = channel
  currentNotes.add(note)
  updateCurrentlyPlayingNotes()
}

function stopAll() {
  Object.keys(channels).forEach(stopChannel)
  noteTimeouts.forEach((t) => clearTimeout(t))
  keyboard.clearAllPlayingNotes()
  currentNotes.clear()
  updateCurrentlyPlayingNotes()
}

function stop(note) {
  keyboard.togglePlayingNote(note)
  currentNotes.delete(note)
  updateCurrentlyPlayingNotes()

  stopChannel(note)
}

/* UTILS */

function findPianoNotes(chord) {
  return chord
    .map((note) => pianoNotes.findIndex((n) => n.frequency === note.frequency))
    .filter((idx) => idx > -1)
}

/* UI */
function updateCurrentlyPlayingNotes() {
  if (currentNotes.size == 0) {
    notesPlayingSection.textContent = ""
    return
  }

  notesPlayingSection.textContent =
    "Notes playing: " + Array.from(currentNotes).join(", ")
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
