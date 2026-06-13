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

/** Música individual salva em uma playlist */
export interface PlaylistSong {
  songId: string        // Track.idTrack
  songName: string      // Track.strTrack
  artistName: string    // Album.strArtist
  albumId: string       // Album.idAlbum
  albumName: string     // Album.strAlbum
  albumCover: string | null  // Album.strAlbumThumb
}

export interface Playlist {
  id: string
  name: string
  songs: PlaylistSong[]   // ← músicas individuais (antes: albums: Album[])
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

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export interface Comment {
  id: string
  albumId: string
  userId: string
  userName: string
  comment: string
  createdAt: string
}

/** Lembrete de álbum agendado via expo-notifications */
export interface AlbumReminder {
  id: string              // id local
  notificationId: string  // identificador retornado pelo expo-notifications
  albumId: string
  albumName: string
  artistName: string
  scheduledFor: string    // ISO string do momento agendado
}
