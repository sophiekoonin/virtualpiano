type Props = {
  freqs: Array<number>
}

import { real, imag } from "../utils/wavetable"
export default function Player({ freqs }: Props) {
  function playScale() {
    const audioCtx = new window.AudioContext()
    const wave = audioCtx.createPeriodicWave(
      new Float32Array(real),
      new Float32Array(imag)
    )
    const osc = audioCtx.createOscillator()
    osc.setPeriodicWave(wave)

    osc.connect(audioCtx.destination)
    osc.start()
    for (let i = 0; i < freqs.length; i++) {
      osc.frequency.setValueAtTime(freqs[i], audioCtx.currentTime + i * 0.5)
    }
    osc.stop(audioCtx.currentTime + 4)
  }

  return (
    <button onClick={() => playScale()} type="button">
      Play scale
    </button>
  )
}
