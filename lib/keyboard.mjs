/*
 * Based on:
 * Qwerty Hancock keyboard library v0.10.0
 * The web keyboard for now people.
 * Copyright 2012-20, Stuart Memo
 *
 * Licensed under the MIT License
 * http://opensource.org/licenses/mit-license.php
 *
 * http://stuartmemo.com/qwerty-hancock
 */

import { calcFrequency } from "./notes.mjs"
const WIDTH = 600
const HEIGHT = 150
const NUM_OCTAVES = 2
const START_NOTE = "C3"
const NUM_WHITE_KEYS = 14
let mouseIsDown = false
const keysDown = {}
const startOctave = parseInt(START_NOTE.charAt(1), 10)
let keyOctave = startOctave
let keyPressOffset
let musicalTyping = false
const id = "player"
/* In <script> context, `this` is the window.
 * In node context (browserify), `this` is the node global.
 */

let keyDownCallback, keyUpCallback

/**
 * Calculate width of white key.
 * @return {number} Width of a single white key in pixels.
 */
var getWhiteKeyWidth = function (number_of_white_keys) {
  return Math.floor((WIDTH - number_of_white_keys) / number_of_white_keys)
}

function init(us) {
  const container = document.getElementById(id)

  // Add getters and setters
  this.setKeyOctave = function (octave) {
    keyOctave = octave
  }

  this.keyOctaveUp = function () {
    keyOctave = keyOctave + 1
    return keyOctave
  }
  this.keyOctaveDown = function () {
    keyOctave = keyOctave - 1
    return keyOctave
  }

  this.togglePlayingNote = function (note) {
    const noteEl = document.getElementById(note)
    toggleHighlight(noteEl)
  }

  this.clearAllPlayingNotes = function () {
    Array.from(document.getElementById("player").children).forEach((noteEl) =>
      noteEl.classList.remove("note-pressed")
    )
  }

  createKeyboard()
  addListeners.call(this, container)
}

/**
 * Revert key to original colour.
 * @param  {element} el DOM element to change colour of.
 */
function toggleHighlight(el) {
  if (el !== null) {
    el.classList.toggle("note-pressed")
  }
}

/**
 * Order notes into order defined by starting key in settings.
 * @param {array} notes_to_order Notes to be ordered.
 * @return {array} ordered_notes Ordered notes.
 */
function orderNotes(notes_to_order) {
  var i,
    keyOffset = 0,
    number_of_notes_to_order = notes_to_order.length,
    ordered_notes = []

  for (i = 0; i < number_of_notes_to_order; i++) {
    if (START_NOTE.charAt(0) === notes_to_order[i]) {
      keyOffset = i
      break
    }
  }

  for (i = 0; i < number_of_notes_to_order; i++) {
    if (i + keyOffset > number_of_notes_to_order - 1) {
      ordered_notes[i] =
        notes_to_order[i + keyOffset - number_of_notes_to_order]
    } else {
      ordered_notes[i] = notes_to_order[i + keyOffset]
    }
  }

  return ordered_notes
}

/**
 * Add styling to individual white key.
 * @param  {element} el White key DOM element.
 */
function styleWhiteKey(key) {
  key.el.style.height = HEIGHT + "px"
  key.el.style.width = key.width + "px"
}

/**
 * Add styling to individual black key.
 * @param  {element} el Black key DOM element.
 */
function styleBlackKey(key) {
  var white_key_width = getWhiteKeyWidth(NUM_WHITE_KEYS),
    black_key_width = Math.floor(white_key_width / 2)

  key.el.style.left =
    Math.floor(
      (white_key_width + 1) * (key.noteNumber + 1) - black_key_width / 4
    ) + "px"
  key.el.style.width = black_key_width + "px"
  key.el.style.height = HEIGHT / 1.5 + "px"
}

/**
 * Add styling to individual key on keyboard.
 * @param  {object} key Element of key.
 */
function styleKey(key) {
  if (key.colour === "white") {
    styleWhiteKey(key)
  } else {
    styleBlackKey(key)
  }
}

/**
 * Reset styles on keyboard container and list element.
 * @param {element} keyboard Keyboard container DOM element.
 */
function styleKeyboard(keyboard) {
  keyboard.el.style.height = HEIGHT + "px"
  keyboard.el.style.width =
    keyboard.totalWhiteKeys * (getWhiteKeyWidth(keyboard.totalWhiteKeys) + 1) +
    2 +
    "px"
}

/**
 * Call user's mouseDown event.
 */
function mouseDown(element, callback) {
  if (element.tagName.toLowerCase() == "button") {
    mouseIsDown = true
    callback(element.title, calcFrequency(element.title))
  }
}

/**
 * Call user's mouseUp event.
 */
function mouseUp(element, callback) {
  if (element.tagName.toLowerCase() == "button") {
    mouseIsDown = false
    callback(element.title, calcFrequency(element.title))
  }
}

/**
 * Call user's mouseDown if required.
 */
function mouseOver(element, callback) {
  if (mouseIsDown) {
    callback(element.title, calcFrequency(element.title))
  }
}

/**
 * Call user's mouseUp if required.
 */
function mouseOut(element, callback) {
  if (mouseIsDown) {
    callback(element.title, calcFrequency(element.title))
  }
}

/**
 * Create key DOM element.
 * @return {object} Key DOM element.
 */
function createKey(key) {
  key.el = document.createElement("button")
  key.el.id = key.id
  key.el.title = key.id
  key.el.setAttribute("data-note-type", key.colour)
  key.el.classList.add(`${key.colour}-note`)
  styleKey(key)

  return key
}

function getTotalWhiteKeys() {
  return NUM_OCTAVES * 7
}

function createKeys() {
  const that = this
  let i
  let key
  let keys = []
  let note_counter = 0
  let octave_counter = startOctave

  for (i = 0; i < NUM_WHITE_KEYS; i++) {
    if (i % this.whiteNotes.length === 0) {
      note_counter = 0
    }

    const bizarre_note_counter = this.whiteNotes[note_counter]

    if (bizarre_note_counter === "C" && i !== 0) {
      octave_counter++
    }

    key = createKey({
      colour: "white",
      octave: octave_counter,
      width: getWhiteKeyWidth(NUM_WHITE_KEYS),
      id: this.whiteNotes[note_counter] + octave_counter,
      noteNumber: i,
    })

    keys.push(key.el)

    if (i !== NUM_WHITE_KEYS - 1) {
      this.notesWithSharps.forEach(function (note, index) {
        if (note === that.whiteNotes[note_counter]) {
          key = createKey({
            colour: "black",
            octave: octave_counter,
            width: getWhiteKeyWidth(NUM_WHITE_KEYS) / 2,
            id: that.whiteNotes[note_counter] + "#" + octave_counter,
            noteNumber: i,
          })

          keys.push(key.el)
        }
      })
    }
    note_counter++
  }

  return {
    keys: keys,
    totalWhiteKeys: NUM_WHITE_KEYS,
  }
}

function addKeysToKeyboard(keyboard) {
  keyboard.keys.forEach(function (key) {
    keyboard.el.appendChild(key)
  })
}

function setKeyPressOffset(sortedWhiteNotes) {
  keyPressOffset = sortedWhiteNotes[0] === "C" ? 0 : 1
}

function createKeyboard() {
  var keyboard = {
    el: document.getElementById(id),
    whiteNotes: orderNotes(["C", "D", "E", "F", "G", "A", "B"]),
    notesWithSharps: orderNotes(["C", "D", "F", "G", "A"]),
  }

  var keysObj = createKeys.call(keyboard)
  keyboard.keys = keysObj.keys
  keyboard.totalWhiteKeys = keysObj.totalWhiteKeys

  setKeyPressOffset(keyboard.whiteNotes)
  styleKeyboard(keyboard)

  addKeysToKeyboard(keyboard)

  return keyboard
}

/**
 * Add event listeners to keyboard.
 * @param {element} keyboardEl
 */
function addListeners(keyboardEl) {
  var that = this

  // Mouse is clicked down on keyboard element.
  keyboardEl.addEventListener("mousedown", function (event) {
    mouseDown(event.target, that.keyDownCallback)
  })

  // Mouse is released from keyboard element.
  keyboardEl.addEventListener("mouseup", function (event) {
    mouseUp(event.target, that.keyUpCallback)
  })

  // Mouse is moved over keyboard element.
  keyboardEl.addEventListener("mouseover", function (event) {
    mouseOver(event.target, that.keyDownCallback)
  })

  // Mouse is moved out of keyboard element.
  keyboardEl.addEventListener("mouseout", function (event) {
    mouseOut(event.target, that.keyUpCallback)
  })

  // Device supports touch events.
  if ("ontouchstart" in document.documentElement) {
    keyboardEl.addEventListener("touchstart", function (event) {
      mouseDown(event.target, that.keyDownCallback)
    })

    keyboardEl.addEventListener("touchend", function (event) {
      mouseUp(event.target, that.keyUpCallback)
    })

    keyboardEl.addEventListener("touchleave", function (event) {
      mouseOut(event.target, that.keyUpCallback)
    })

    keyboardEl.addEventListener("touchcancel", function (event) {
      mouseOut(event.target, that.keyUpCallback)
    })
  }
}

/**
 * Qwerty Hancock constructor.
 */
export function Keyboard() {
  this.setKeyOctave = function (octave) {
    // Placeholder function.
  }

  this.getKeyOctave = function () {}
  this.keyOctaveUp = function () {}
  this.keyOctaveDown = function () {}

  init.call(this)
}
