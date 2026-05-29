import { Album, Artist, Track } from '@/types'

const BASE_URL = 'https://www.theaudiodb.com/api/v1/json/2'

async function fetchFromAPI<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`)
  }
  return response.json()
}

export async function searchArtists(name: string): Promise<Artist[]> {
  const data = await fetchFromAPI<{ artists: Artist[] | null }>(
    `${BASE_URL}/search.php?s=${encodeURIComponent(name)}`
  )
  return data.artists ?? []
}

export async function searchAlbumsByArtist(artistName: string): Promise<Album[]> {
  const data = await fetchFromAPI<{ album: Album[] | null }>(
    `${BASE_URL}/searchalbum.php?s=${encodeURIComponent(artistName)}`
  )
  return data.album ?? []
}

export async function getAlbumById(albumId: string): Promise<Album | null> {
  const data = await fetchFromAPI<{ album: Album[] | null }>(
    `${BASE_URL}/album.php?m=${albumId}`
  )
  return data.album?.[0] ?? null
}

export async function getAlbumTracks(albumId: string): Promise<Track[]> {
  const data = await fetchFromAPI<{ track: Track[] | null }>(
    `${BASE_URL}/track.php?m=${albumId}`
  )
  return data.track ?? []
}

export async function getArtistById(artistId: string): Promise<Artist | null> {
  const data = await fetchFromAPI<{ artists: Artist[] | null }>(
    `${BASE_URL}/artist.php?i=${artistId}`
  )
  return data.artists?.[0] ?? null
}

export async function getAlbumsByArtistId(artistId: string): Promise<Album[]> {
  const data = await fetchFromAPI<{ album: Album[] | null }>(
    `${BASE_URL}/album.php?i=${artistId}`
  )
  return data.album ?? []
}
