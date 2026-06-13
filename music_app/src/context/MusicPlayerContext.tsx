/**
 * MusicPlayerContext
 * ──────────────────
 * Estado central do player de música. Gerencia:
 *  - faixa atual (track + metadados do álbum)
 *  - lista de faixas (queue) do álbum em reprodução
 *  - estado play/pause
 *  - progresso simulado (sem streaming real)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Album, Track } from '@/types'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface NowPlayingTrack {
  track: Track
  album: Album
}

interface MusicPlayerContextData {
  /** Faixa + álbum atualmente selecionados */
  nowPlaying: NowPlayingTrack | null
  /** Lista de faixas do álbum em reprodução (queue) */
  queue: Track[]
  /** Índice da faixa atual dentro da queue */
  currentIndex: number
  /** Estado de reprodução */
  isPlaying: boolean
  /** Progresso em segundos (0 → duration) */
  progress: number
  /** Duração simulada em segundos */
  duration: number

  /** Inicia reprodução de uma faixa dentro de um álbum com sua queue */
  play: (track: Track, album: Album, tracks: Track[]) => void
  /** Alterna play/pause */
  togglePlay: () => void
  /** Próxima faixa */
  next: () => void
  /** Faixa anterior */
  previous: () => void
  /** Busca para um progresso específico (0–1) */
  seekTo: (ratio: number) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MusicPlayerContext = createContext<MusicPlayerContextData>(
  {} as MusicPlayerContextData
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Gera duração simulada a partir do campo intDuration (ms) ou número da faixa */
function simulateDuration(track: Track): number {
  if (track.intDuration) {
    const ms = parseInt(track.intDuration)
    if (!isNaN(ms) && ms > 0) return Math.floor(ms / 1000)
  }
  // Fallback: entre 2:30 e 4:45 com base no idTrack para consistência
  const seed = track.idTrack
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return 150 + (seed % 135) // 150s–285s
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingTrack | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Timer de progresso simulado ──────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(
    (dur: number) => {
      clearTimer()
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= dur) {
            clearTimer()
            return 0
          }
          return prev + 1
        })
      }, 1000)
    },
    [clearTimer]
  )

  // Avança automaticamente para a próxima faixa ao terminar
  useEffect(() => {
    if (progress >= duration && duration > 0 && isPlaying) {
      setProgress(0)
      setCurrentIndex((prev) => {
        const next = prev + 1
        if (next < queue.length) return next
        // Fim da queue: para a reprodução
        setIsPlaying(false)
        return prev
      })
    }
  }, [progress, duration, isPlaying, queue.length])

  // Sincroniza nowPlaying quando currentIndex muda (mas queue/álbum já estão setados)
  useEffect(() => {
    if (queue.length === 0) return
    const track = queue[currentIndex]
    if (!track) return
    // Mantém o álbum atual (só muda a faixa)
    setNowPlaying((prev) => (prev ? { track, album: prev.album } : null))
    const dur = simulateDuration(track)
    setDuration(dur)
    setProgress(0)
    if (isPlaying) startTimer(dur)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, queue])

  // Inicia/pausa o timer conforme isPlaying
  useEffect(() => {
    if (isPlaying) {
      startTimer(duration)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [isPlaying, duration, startTimer, clearTimer])

  // Limpa ao desmontar
  useEffect(() => () => clearTimer(), [clearTimer])

  // ── Ações públicas ────────────────────────────────────────────────────────

  function play(track: Track, album: Album, tracks: Track[]) {
    const idx = tracks.findIndex((t) => t.idTrack === track.idTrack)
    clearTimer()
    setQueue(tracks)
    setCurrentIndex(idx >= 0 ? idx : 0)
    setNowPlaying({ track, album })
    const dur = simulateDuration(track)
    setDuration(dur)
    setProgress(0)
    setIsPlaying(true)
    startTimer(dur)
  }

  function togglePlay() {
    setIsPlaying((prev) => !prev)
  }

  function next() {
    if (queue.length === 0) return
    setCurrentIndex((prev) => {
      const n = (prev + 1) % queue.length
      return n
    })
    setProgress(0)
  }

  function previous() {
    if (queue.length === 0) return
    // Se passou mais de 3 segundos, volta ao início da faixa atual
    if (progress > 3) {
      setProgress(0)
      return
    }
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
    setProgress(0)
  }

  function seekTo(ratio: number) {
    const clamped = Math.max(0, Math.min(1, ratio))
    const newProgress = Math.floor(clamped * duration)
    setProgress(newProgress)
    if (isPlaying) startTimer(duration)
  }

  return (
    <MusicPlayerContext.Provider
      value={{
        nowPlaying,
        queue,
        currentIndex,
        isPlaying,
        progress,
        duration,
        play,
        togglePlay,
        next,
        previous,
        seekTo,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMusicPlayer(): MusicPlayerContextData {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error('useMusicPlayer must be used inside MusicPlayerProvider')
  return ctx
}
