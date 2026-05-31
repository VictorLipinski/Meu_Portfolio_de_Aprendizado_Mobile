export interface Artist {
  idArtist: string
  strArtist: string
  strBiographyEN: string | null
  strArtistThumb: string | null
  strGenre: string | null
  strCountry: string | null
  intFormedYear: string | null
}

export interface Album {
  idAlbum: string
  idArtist: string
  strAlbum: string
  strArtist: string
  strAlbumThumb: string | null
  intYearReleased: string | null
  strGenre: string | null
  strDescriptionEN: string | null
  strLabel: string | null
}

export interface Track {
  idTrack: string
  idAlbum: string
  strTrack: string
  intDuration: string | null
  strTrackThumb: string | null
  intTrackNumber: string | null
}

export interface Playlist {
  id: string
  name: string
  albums: Album[]
  createdAt: string
}

export interface Show {
  id: string
  artistId: string
  artistName: string
  venue: string
  city: string
  date: string
  latitude: number
  longitude: number
}
