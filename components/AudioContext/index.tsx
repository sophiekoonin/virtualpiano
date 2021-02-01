import { createContext, ReactNode, useEffect, useState } from "react";

export const AudioContext = createContext({ audioCtx: null })

export default function AudioProvider({ children }: { children: ReactNode }) {
  const [ac, setAc] = useState<AudioContext>()
  useEffect(() => {
    document.documentElement.addEventListener('mousedown', () => {
      const ac = new window.AudioContext()
      setAc(ac)
      document.documentElement.removeEventListener('mousedown', this)
    })
  }, [])

  return (
    <AudioContext.Provider value={{ audioCtx: ac }}>
      { children}
    </AudioContext.Provider >
  )
}