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

// ─── Track enriquecida com dados do álbum ─────────────────────────────────────

/** Faixa com referência ao álbum a que pertence */
export interface TrackWithAlbum extends Track {
  album: Album
}

/**
 * Busca faixas para adicionar a uma playlist.
 *
 * A API gratuita da TheAudioDB não possui endpoint de busca por nome de faixa.
 * Estratégia: busca álbuns pelo termo (artista/álbum) e obtém as faixas
 * de cada álbum em paralelo via Promise.allSettled (tolera falhas individuais).
 */
export async function searchTracksForPlaylist(query: string): Promise<TrackWithAlbum[]> {
  const q = query.trim()
  if (!q) return []

  const albums = await searchAlbumsByArtist(q)
  const topAlbums = albums.slice(0, 5)

  if (topAlbums.length === 0) return []

  const settled = await Promise.allSettled(
    topAlbums.map(async (album) => {
      const tracks = await getAlbumTracks(album.idAlbum)
      return tracks.map((t): TrackWithAlbum => ({ ...t, album }))
    })
  )

  return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}
