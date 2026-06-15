/**
 * useLikedSongs
 * ─────────────
 * Gerencia músicas curtidas individualmente (≠ álbuns favoritos).
 * Persiste em AsyncStorage sob a chave @noomi:liked_songs.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'
import { LikedSong } from '@/types'

const STORAGE_KEY = '@noomi:liked_songs'

export function useLikedSongs() {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      setLikedSongs(raw ? JSON.parse(raw) : [])
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function persist(updated: LikedSong[]) {
    setLikedSongs(updated)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  /** Alterna curtida. Retorna true se curtiu, false se descurtiu. */
  async function toggleLike(song: LikedSong): Promise<boolean> {
    const alreadyLiked = likedSongs.some((s) => s.songId === song.songId)
    if (alreadyLiked) {
      await persist(likedSongs.filter((s) => s.songId !== song.songId))
      return false
    }
    await persist([{ ...song, likedAt: new Date().toISOString() }, ...likedSongs])
    return true
  }

  /** Verifica se uma música está curtida */
  function isLiked(songId: string): boolean {
    return likedSongs.some((s) => s.songId === songId)
  }

  /** Remove curtida sem alternar */
  async function unlike(songId: string): Promise<void> {
    await persist(likedSongs.filter((s) => s.songId !== songId))
  }

  return { likedSongs, loading, isLiked, toggleLike, unlike, reload: load }
}
