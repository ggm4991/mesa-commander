// Aviso sonoro al pasarse del límite. El contexto de audio se despierta con el
// primer toque del usuario, que es lo que exigen los navegadores. Portado de
// `ctxAudio()`/`sonarAlarma()` en app.html.
let audio: AudioContext | null = null

function ctxAudio(): AudioContext | null {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    if (!audio) audio = new AC()
    if (audio.state === 'suspended') audio.resume()
    return audio
  } catch {
    return null
  }
}

/** Llamar en el primer toque del usuario para desbloquear el audio del navegador. */
export function despertarAudio(): void {
  ctxAudio()
}

export function sonarAlarma(sonidoActivado: boolean): void {
  if (!sonidoActivado) return
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 90, 200, 90, 340])
  } catch {
    // los navegadores que no soportan vibrate no deben romper la alarma
  }
  const ac = ctxAudio()
  if (!ac) return
  const notas: [number, number, number][] = [
    [0, 880, 0.22],
    [0.3, 880, 0.22],
    [0.6, 620, 0.5],
  ]
  notas.forEach(([t, hz, largo]) => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    const t0 = ac.currentTime + t
    o.type = 'triangle'
    o.frequency.value = hz
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(0.28, t0 + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + largo)
    o.connect(g)
    g.connect(ac.destination)
    o.start(t0)
    o.stop(t0 + largo + 0.05)
  })
}
