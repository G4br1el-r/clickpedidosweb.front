// Porta do bip() de wwwroot/js/fila.js: três toques curtos a 880 Hz.
// O navegador só libera áudio depois de um clique na página.
let contexto: AudioContext | null = null

export function tocarAlerta(): void {
  try {
    contexto ??= new AudioContext()
    const t = contexto.currentTime
    for (const atraso of [0, 0.22, 0.44]) {
      const oscilador = contexto.createOscillator()
      const ganho = contexto.createGain()
      oscilador.frequency.value = 880
      oscilador.connect(ganho)
      ganho.connect(contexto.destination)
      ganho.gain.setValueAtTime(0.3, t + atraso)
      ganho.gain.exponentialRampToValueAtTime(0.001, t + atraso + 0.18)
      oscilador.start(t + atraso)
      oscilador.stop(t + atraso + 0.2)
    }
  } catch {
    // sem áudio disponível
  }
}
