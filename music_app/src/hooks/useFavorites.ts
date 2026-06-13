import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'
import { Album } from '@/types'

const STORAGE_KEY = '@noomi:favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      setFavorites(raw ? JSON.parse(raw) : [])
    } catch {
      // silently ignore storage errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function persist(updated: Album[]) {
    setFavorites(updated)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  // Returns true if added, false if removed
  async function toggleFavorite(album: Album): Promise<boolean> {
    const already = favorites.some((f) => f.idAlbum === album.idAlbum)
    if (already) {
      await persist(favorites.filter((f) => f.idAlbum !== album.idAlbum))
      return false
    } else {
      await persist([album, ...favorites])
      return true
    }
  }

  async function removeFavorite(albumId: string) {
    await persist(favorites.filter((f) => f.idAlbum !== albumId))
  }

  function isFavorite(albumId: string): boolean {
    return favorites.some((f) => f.idAlbum === albumId)
  }

  return { favorites, loading, isFavorite, toggleFavorite, removeFavorite, reload: load }
}
