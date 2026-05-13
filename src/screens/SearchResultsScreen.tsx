import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParams } from '../navigation'
import { getGames, getGenres, mapApiGameListItem } from '@shared/services/api'
import type { Game } from '@shared/types/games'
import GameCard from '../components/GameCard'
import AuthModal from '../components/AuthModal'
import { useApp } from '../context/AppContext'

type Nav = StackNavigationProp<RootStackParams>
type Route = RouteProp<RootStackParams, 'SearchResults'>

export default function SearchResultsScreen() {
  const navigation = useNavigation<Nav>()
  const route = useRoute<Route>()
  const { query, genreId: initialGenreId } = route.params
  const { addToCartLocal, handleAuthSuccess } = useApp()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [authModalVisible, setAuthModalVisible] = useState(false)

  useEffect(() => {
    setLoading(true)
    setGames([])

    const run = async () => {
      try {
        let resolvedGenreId = initialGenreId

        // If no genreId but query might be a genre name, try to resolve it
        if (!resolvedGenreId) {
          try {
            const page = await getGenres(query, 1, 10)
            const match = page.items.find(
              g => g.name.toLowerCase() === query.toLowerCase()
            )
            if (match) resolvedGenreId = match.id
          } catch { /* ignore */ }
        }

        const page = resolvedGenreId
          ? await getGames('', [resolvedGenreId], 1, 50)
          : await getGames(query, [], 1, 50)

        setGames(page.items.map(mapApiGameListItem))
      } catch {
        setGames([])
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [query, initialGenreId])

  const handleSelectGame = (game: Game) => {
    navigation.navigate('GameDetail', { game })
  }

  const isGenreSearch = !!initialGenreId

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {isGenreSearch ? `Género: ${query}` : `"${query}"`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#a78bfa" size="large" />
        </View>
      ) : games.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTxt}>No se encontraron juegos para "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={g => g.id}
          numColumns={2}
          ListHeaderComponent={
            <Text style={styles.count}>
              {games.length} juego{games.length !== 1 ? 's' : ''} encontrado{games.length !== 1 ? 's' : ''}
            </Text>
          }
          renderItem={({ item }) => (
            <GameCard
              game={item}
              onPress={handleSelectGame}
              onAddToCart={addToCartLocal}
              onRequireAuth={() => setAuthModalVisible(true)}
            />
          )}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onAuthSuccess={user => { handleAuthSuccess(user); setAuthModalVisible(false) }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1b1b1b' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  backBtn: { paddingRight: 4 },
  backTxt: { color: '#a78bfa', fontSize: 14 },
  title: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTxt: { color: '#aaa', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  count: { color: '#aaa', fontSize: 12, paddingHorizontal: 12, paddingVertical: 10 },
  list: { paddingHorizontal: 6, paddingBottom: 20 },
  row: { marginHorizontal: 0 },
})
