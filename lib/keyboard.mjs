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
    const noteEl = document.querySelector("[title='" + note + "']")
    toggleHighlight(noteEl)
  }

  this.clearAllPlayingNotes = function () {
    Array.from(document.getElementById("player").children).forEach((noteEl) =>
      noteEl.classList.remove("note-pressed")
    )
  }

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
 * Call user's mouseDown event.
 */
function mouseDown(element, callback) {
  if (element.tagName.toLowerCase() == "button") {
    mouseIsDown = true
    callback(element.id, element.title)
  }
}

/**
 * Call user's mouseUp event.
 */
function mouseUp(element, callback) {
  if (element.tagName.toLowerCase() == "button") {
    mouseIsDown = false
    callback(element.id, element.title)
  }
}

/**
 * Call user's mouseDown if required.
 */
function mouseOver(element, callback) {
  if (mouseIsDown) {
    callback(element.id, element.title)
  }
}

/**
 * Call user's mouseUp if required.
 */
function mouseOut(element, callback) {
  if (mouseIsDown) {
    callback(element.id, element.title)
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
