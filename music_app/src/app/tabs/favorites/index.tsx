import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { AlbumCard } from '@/components/AlbumCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingView } from '@/components/LoadingView'
import { useFavorites } from '@/hooks/useFavorites'
import { useNotifications } from '@/hooks/useNotifications'
import { REMINDER_OPTIONS } from '@/utils/reminderOptions'
import { Album } from '@/types'
import { colors } from '@/constants/token'

export default function FavoritesScreen() {
  const { favorites, loading, removeFavorite, reload } = useFavorites()
  const { hasReminder, scheduleReminder, cancelReminder } = useNotifications()

  useFocusEffect(
    useCallback(() => {
      reload()
    }, [reload])
  )

  function confirmRemove(albumId: string, albumName: string) {
    Alert.alert(
      'Remover favorito',
      `Deseja remover "${albumName}" dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFavorite(albumId),
        },
      ]
    )
  }

  function handleNotificationPress(album: Album) {
    if (hasReminder(album.idAlbum)) {
      Alert.alert(
        '🔔 Lembrete ativo',
        `Você já tem um lembrete para "${album.strAlbum}". Deseja cancelá-lo?`,
        [
          { text: 'Manter', style: 'cancel' },
          {
            text: 'Cancelar lembrete',
            style: 'destructive',
            onPress: async () => {
              await cancelReminder(album.idAlbum)
              Alert.alert('Lembrete cancelado', `Lembrete de "${album.strAlbum}" removido.`)
            },
          },
        ]
      )
    } else {
      Alert.alert(
        '🔔 Agendar lembrete',
        `Quando você quer ser lembrado de ouvir "${album.strAlbum}"?`,
        [
          ...REMINDER_OPTIONS.map((opt) => ({
            text: opt.label,
            onPress: async () => {
              const success = await scheduleReminder(
                album.idAlbum,
                album.strAlbum,
                album.strArtist,
                opt.seconds
              )
              if (success) {
                Alert.alert('✅ Lembrete agendado!', `Você receberá uma notificação: ${opt.label}.`)
              } else {
                Alert.alert(
                  'Permissão necessária',
                  'Ative as notificações nas configurações do dispositivo para usar esta funcionalidade.'
                )
              }
            },
          })),
          { text: 'Cancelar', style: 'cancel' },
        ]
      )
    }
  }

  if (loading) return <LoadingView />

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        <Text style={styles.subtitle}>
          {favorites.length === 0
            ? 'Nenhum álbum salvo'
            : `${favorites.length} ${favorites.length === 1 ? 'álbum salvo' : 'álbuns salvos'}`}
        </Text>
      </View>

      {favorites.length === 0 ? (
        <EmptyState
          message="Você ainda não favoritou nenhum álbum. Explore e toque em ❤️ para salvar."
          icon="heart-outline"
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.idAlbum}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.itemWrapper}>
              <View style={styles.cardArea}>
                <AlbumCard
                  album={item}
                  onPress={() => router.push(`/tabs/songs/${item.idAlbum}`)}
                />
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  onPress={() => handleNotificationPress(item)}
                  style={styles.iconBtn}
                  hitSlop={8}
                  accessibilityLabel={
                    hasReminder(item.idAlbum) ? 'Cancelar lembrete' : 'Agendar lembrete'
                  }
                >
                  <Ionicons
                    name={hasReminder(item.idAlbum) ? 'notifications' : 'notifications-outline'}
                    size={18}
                    color={hasReminder(item.idAlbum) ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => confirmRemove(item.idAlbum, item.strAlbum)}
                  style={styles.iconBtn}
                  hitSlop={8}
                  accessibilityLabel="Remover dos favoritos"
                >
                  <Ionicons name="trash-outline" size={18} color="#E05A6A" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardArea: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8,
  },
  iconBtn: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },
})
