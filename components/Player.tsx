type Props = {
  freqs: Array<number>
}

import { useState, useEffect } from 'react'

import { piano } from '../utils/wavetable'
export default function Player({ freqs }: Props) {
  console.log(freqs)
  function playScale() {
    const audioCtx = new window.AudioContext()
    const wave = audioCtx.createPeriodicWave(piano.real, piano.imag);
    const osc = audioCtx.createOscillator();
    osc.setPeriodicWave(wave);

    osc.connect(audioCtx.destination);
    osc.start();
    for (let i = 0; i < freqs.length; i++) {
      osc.frequency.setValueAtTime(freqs[i], audioCtx.currentTime + (i * 0.5))
    }
    osc.stop(audioCtx.currentTime + 4)
  }

  return (

    <button onClick={() => playScale()} type="button">Play scale</button>
  )
}