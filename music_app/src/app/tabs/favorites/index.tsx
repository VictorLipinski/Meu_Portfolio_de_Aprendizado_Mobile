import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { AlbumCard } from '@/components/AlbumCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingView } from '@/components/LoadingView'
import { useFavorites } from '@/hooks/useFavorites'
import { colors } from '@/constants/token'

export default function FavoritesScreen() {
  const { favorites, loading, removeFavorite, reload } = useFavorites()

  // Recarrega ao voltar para a aba
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

  if (loading) return <LoadingView />

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Cabeçalho */}
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
              <AlbumCard
                album={item}
                onPress={() => router.push(`/tabs/songs/${item.idAlbum}`)}
              />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => confirmRemove(item.idAlbum, item.strAlbum)}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={17} color="#E05A6A" />
              </TouchableOpacity>
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
  },
  removeBtn: {
    paddingLeft: 12,
    paddingVertical: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },
})
