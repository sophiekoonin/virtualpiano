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

const NUM_WHITE_KEYS = 14
let mouseDown = false
const keysDown = {}


/* In <script> context, `this` is the window.
 * In node context (browserify), `this` is the node global.
 */
const keyMap = {
    65: "Cl",
    87: "C#l",
    83: "Dl",
    69: "D#l",
    68: "El",
    70: "Fl",
    84: "F#l",
    71: "Gl",
    89: "G#l",
    90: "G#l",
    72: "Al",
    85: "A#l",
    74: "Bl",
    75: "Cu",
    79: "C#u",
    76: "Du",
    80: "D#u",
    59: "Eu",
    186: "Eu",
    222: "Fu",
    221: "F#u",
    220: "Gu",
  }

  let keyDownCallback,
  keyUpCallback

/**
 * Calculate width of white key.
 * @return {number} Width of a single white key in pixels.
 */
var getWhiteKeyWidth = function (number_of_white_keys) {
  return Math.floor(
    (settings.width - number_of_white_keys) / number_of_white_keys
  )
}

/**
 * Merge user settings with defaults.
 * @param  {object} user_settings
 */
function init(us) {
  const user_settings = us || {}

  settings = {
    id: user_settings.id || "keyboard",
    octaves: user_settings.octaves || 3,
    width: user_settings.width,
    height: user_settings.height,
    margin: user_settings.margin || 0,
    startNote: user_settings.startNote || "A3",
    keyboardLayout: user_settings.keyboardLayout || "en",
    musicalTyping: user_settings.musicalTyping === false ? false : true,
  }

  const container = document.getElementById(settings.id)

  if (typeof settings.width === "undefined") {
    settings.width = container.offsetWidth
  }

  if (typeof settings.height === "undefined") {
    settings.height = container.offsetHeight
  }

  settings.startOctave = parseInt(settings.startNote.charAt(1), 10)
  settings.keyOctave = user_settings.keyOctave || settings.startOctave

  // Add getters and setters
  this.setKeyOctave = function (octave) {
    settings.keyOctave = octave
    return settings.keyOctave
  }
  this.getKeyOctave = function () {
    return settings.keyOctave
  }
  this.keyOctaveUp = function () {
    settings.keyOctave++
    return settings.keyOctave
  }
  this.keyOctaveDown = function () {
    settings.keyOctave--
    return settings.keyOctave
  }
  this.getKeyMap = function () {
    return keyMap
  }
  this.setKeyMap = function (newKeyMap) {
    keyMap = newKeyMap
    return keyMap
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
    if (settings.startNote.charAt(0) === notes_to_order[i]) {
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
  key.el.style.height = settings.height + "px"
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
  key.el.style.height = settings.height / 1.5 + "px"
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
  keyboard.el.style.height = settings.height + "px"
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
    mouse_is_down = true
    toggleHighlight(element)
    callback(element.title, calcFrequency(element.title))
  }
}

/**
 * Call user's mouseUp event.
 */
function mouseUp(element, callback) {
  if (element.tagName.toLowerCase() == "button") {
    mouse_is_down = false
    toggleHighlight(element)
    callback(element.title, getFrequencyOfNote(element.title))
  }
}

/**
 * Call user's mouseDown if required.
 */
function mouseOver(element, callback) {
  if (mouse_is_down) {
    toggleHighlight(element)
    callback(element.title, getFrequencyOfNote(element.title))
  }
}

/**
 * Call user's mouseUp if required.
 */
function mouseOut(element, callback) {
  if (mouse_is_down) {
    toggleHighlight(element)
    callback(element.title, getFrequencyOfNote(element.title))
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
  return settings.octaves * 7
}

function createKeys() {
  const that = this,
    i,
    key,
    keys = [],
    note_counter = 0,
    octave_counter = settings.startOctave,


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
  settings.keyPressOffset = sortedWhiteNotes[0] === "C" ? 0 : 1
}

function createKeyboard() {
  var keyboard = {
    el: document.getElementById(settings.id),
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

function getKeyPressed(keyCode) {
  return keyMap[keyCode]
    .replace("l", parseInt(settings.keyOctave, 10) + settings.keyPressOffset)
    .replace(
      "u",
      (
        parseInt(settings.keyOctave, 10) +
        settings.keyPressOffset +
        1
      ).toString()
    )
}

/**
 * Handle a keyboard key being pressed.
 * @param {object} key The keyboard event of the currently pressed key.
 * @param {callback} callback The user's noteDown function.
 * @return {boolean} true if it was a key (combo) used by qwerty-hancock
 */
function keyboardDown(key, callback) {
  var key_pressed

  if (key.keyCode in keysDown) {
    return false
  }

  keysDown[key.keyCode] = true

  if (typeof keyMap[key.keyCode] !== "undefined") {
    key_pressed = getKeyPressed(key.keyCode)

    // Call user's noteDown function.
    callback(key_pressed, getFrequencyOfNote(key_pressed))
    toggleHighlight(document.getElementById(key_pressed))
    return true
  }
  return false
}

/**
 * Handle a keyboard key being released.
 * @param {element} key The DOM element of the key that was released.
 * @param {callback} callback The user's noteDown function.
 * @return {boolean} true if it was a key (combo) used by qwerty-hancock
 */
function keyboardUp(key, callback) {
  var key_pressed

  delete keysDown[key.keyCode]

  if (typeof keyMap[key.keyCode] !== "undefined") {
    key_pressed = getKeyPressed(key.keyCode)
    // Call user's noteDown function.
    callback(key_pressed, getFrequencyOfNote(key_pressed))
    toggleHighlight(document.getElementById(key_pressed))
    return true
  }
  return false
}

/**
 * Determine whether pressed key is a modifier key or not.
 * @param {KeyboardEvent} The keydown event of a pressed key
 */
function isModifierKey(key) {
  return key.ctrlKey || key.metaKey || key.altKey
}

/**
 * Add event listeners to keyboard.
 * @param {element} keyboardEl
 */
function addListeners(keyboardEl) {
  var that = this

  if (settings.musicalTyping) {
    // Key is pressed down on keyboard.
    window.addEventListener("keydown", function (key) {
      if (isModifierKey(key)) {
        return
      }
      if (keyboardDown(key, that.keyDown)) {
        key.preventDefault()
      }
    })

    // Key is released on keyboard.
    window.addEventListener("keyup", function (key) {
      if (isModifierKey(key)) {
        return
      }
      if (keyboardUp(key, that.keyUp)) {
        key.preventDefault()
      }
    })
  }

  // Mouse is clicked down on keyboard element.
  keyboardEl.addEventListener("mousedown", function (event) {
    mouseDown(event.target, that.keyDown)
  })

  // Mouse is released from keyboard element.
  keyboardEl.addEventListener("mouseup", function (event) {
    mouseUp(event.target, that.keyUp)
  })

  // Mouse is moved over keyboard element.
  keyboardEl.addEventListener("mouseover", function (event) {
    mouseOver(event.target, that.keyDown)
  })

  // Mouse is moved out of keyboard element.
  keyboardEl.addEventListener("mouseout", function (event) {
    mouseOut(event.target, that.keyUp)
  })

  // Device supports touch events.
  if ("ontouchstart" in document.documentElement) {
    keyboardEl.addEventListener("touchstart", function (event) {
      mouseDown(event.target, that.keyDown)
    })

    keyboardEl.addEventListener("touchend", function (event) {
      mouseUp(event.target, that.keyUp)
    })

    keyboardEl.addEventListener("touchleave", function (event) {
      mouseOut(event.target, that.keyUp)
    })

    keyboardEl.addEventListener("touchcancel", function (event) {
      mouseOut(event.target, that.keyUp)
    })
  }
}

/**
 * Qwerty Hancock constructor.
 * @param {object} settings Optional user settings.
 */
export function Keyboard(settings) {
  this.keyDown = function (el) {
    // Placeholder function
  }

  this.keyUp = function () {
    // Placeholder function.
  }

  this.setKeyOctave = function (octave) {
    // Placeholder function.
  }

  this.getKeyOctave = function () {}
  this.keyOctaveUp = function () {}
  this.keyOctaveDown = function () {}

  this.getKeyMap = function () {}
  this.setKeyMap = function (newKeyMap) {}

  init.call(this, settings)
}
