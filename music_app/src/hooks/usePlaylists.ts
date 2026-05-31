import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'
import { Album, Playlist } from '@/types'

const STORAGE_KEY = '@noomi:playlists'

function makeId(): string {
  return `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      setPlaylists(raw ? JSON.parse(raw) : [])
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
    setPlaylists(updated)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  async function createPlaylist(name: string): Promise<Playlist> {
    const newPlaylist: Playlist = {
      id: makeId(),
      name: name.trim(),
      albums: [],
      createdAt: new Date().toISOString(),
    }
    await persist([newPlaylist, ...playlists])
    return newPlaylist
  }

  async function deletePlaylist(playlistId: string) {
    await persist(playlists.filter((p) => p.id !== playlistId))
  }

  async function renamePlaylist(playlistId: string, newName: string) {
    await persist(
      playlists.map((p) => (p.id === playlistId ? { ...p, name: newName.trim() } : p))
    )
  }

  async function addAlbumToPlaylist(playlistId: string, album: Album) {
    await persist(
      playlists.map((p) => {
        if (p.id !== playlistId) return p
        const alreadyIn = p.albums.some((a) => a.idAlbum === album.idAlbum)
        if (alreadyIn) return p
        return { ...p, albums: [...p.albums, album] }
      })
    )
  }

  async function removeAlbumFromPlaylist(playlistId: string, albumId: string) {
    await persist(
      playlists.map((p) =>
        p.id === playlistId
          ? { ...p, albums: p.albums.filter((a) => a.idAlbum !== albumId) }
          : p
      )
    )
  }

  function getPlaylist(id: string): Playlist | undefined {
    return playlists.find((p) => p.id === id)
  }

  function isInPlaylist(playlistId: string, albumId: string): boolean {
    return playlists.find((p) => p.id === playlistId)?.albums.some((a) => a.idAlbum === albumId) ?? false
  }

  return {
    playlists,
    loading,
    reload: load,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addAlbumToPlaylist,
    removeAlbumFromPlaylist,
    getPlaylist,
    isInPlaylist,
  }
}
