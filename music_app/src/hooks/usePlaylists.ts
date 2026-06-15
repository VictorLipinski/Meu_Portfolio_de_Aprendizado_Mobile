import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Playlist, PlaylistSong } from '@/types'

const STORAGE_KEY = '@noomi:playlists'

function makeId(): string {
  return `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  // Espelha `playlists` de forma síncrona. Necessário porque algumas telas
  // (ex.: "criar playlist e já adicionar a música") chamam duas mutações em
  // sequência (createPlaylist → addSongToPlaylist) no mesmo ciclo assíncrono,
  // antes do React re-renderizar com o novo `playlists`. Sem o ref, a segunda
  // mutação leria o array ANTIGO (sem a playlist recém-criada) e o persist()
  // dela sobrescreveria o AsyncStorage, apagando a playlist criada no passo 1.
  const playlistsRef = useRef<Playlist[]>([])

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: Playlist[] = JSON.parse(raw)
        // Migração: playlists antigas com campo `albums` viram `songs: []`
        const migrated = parsed.map((p: any) => ({
          ...p,
          songs: p.songs ?? [],
        }))
        playlistsRef.current = migrated
        setPlaylists(migrated)
      } else {
        playlistsRef.current = []
        setPlaylists([])
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function persist(updated: Playlist[]) {
    playlistsRef.current = updated
    setPlaylists(updated)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  async function createPlaylist(name: string): Promise<Playlist> {
    const newPlaylist: Playlist = {
      id: makeId(),
      name: name.trim(),
      songs: [],
      createdAt: new Date().toISOString(),
    }
    await persist([newPlaylist, ...playlistsRef.current])
    return newPlaylist
  }

  async function deletePlaylist(playlistId: string) {
    await persist(playlistsRef.current.filter((p) => p.id !== playlistId))
  }

  async function renamePlaylist(playlistId: string, newName: string) {
    await persist(
      playlistsRef.current.map((p) => (p.id === playlistId ? { ...p, name: newName.trim() } : p))
    )
  }

  /** Adiciona uma música à playlist; ignora duplicatas */
  async function addSongToPlaylist(playlistId: string, song: PlaylistSong) {
    await persist(
      playlistsRef.current.map((p) => {
        if (p.id !== playlistId) return p
        const alreadyIn = p.songs.some((s) => s.songId === song.songId)
        if (alreadyIn) return p
        return { ...p, songs: [...p.songs, song] }
      })
    )
  }

  /** Remove uma música da playlist pelo songId */
  async function removeSongFromPlaylist(playlistId: string, songId: string) {
    await persist(
      playlistsRef.current.map((p) =>
        p.id === playlistId
          ? { ...p, songs: p.songs.filter((s) => s.songId !== songId) }
          : p
      )
    )
  }

  function getPlaylist(id: string): Playlist | undefined {
    return playlists.find((p) => p.id === id)
  }

  /** Verifica se uma música já está em qualquer playlist */
  function isSongInAnyPlaylist(songId: string): boolean {
    return playlists.some((p) => p.songs.some((s) => s.songId === songId))
  }

  /** Verifica se uma música está em uma playlist específica */
  function isSongInPlaylist(playlistId: string, songId: string): boolean {
    return (
      playlists.find((p) => p.id === playlistId)?.songs.some((s) => s.songId === songId) ?? false
    )
  }

  return {
    playlists,
    loading,
    reload: load,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPlaylist,
    isSongInPlaylist,
    isSongInAnyPlaylist,
  }
}
