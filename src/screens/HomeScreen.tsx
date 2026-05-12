import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RootStackParams } from '../navigation'
import { getGames, mapApiGameListItem } from '@shared/services/api'
import type { Game } from '@shared/types/games'
import GameCard from '../components/GameCard'
import SearchBar from '../components/SearchBar'
import { useApp } from '../context/AppContext'
import AuthModal from '../components/AuthModal'

type HomeNavProp = StackNavigationProp<RootStackParams>

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>()
  const { addToCartLocal, ownedGameIds, authUser, handleAuthSuccess, handleSignOut } = useApp()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    getGames('', [], 1, 20)
      .then(page => setGames(page.items.map(mapApiGameListItem)))
      .catch(() => setError('No se pudieron cargar los juegos.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return
    navigation.navigate('SearchResults', { query: query.trim() })
  }, [navigation])

  const handleSelectGame = useCallback((game: Game) => {
    navigation.navigate('GameDetail', { game })
  }, [navigation])

  const hero = games[0]

const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color="#a78bfa" size="large" />
        </View>
      )
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorTxt}>{error}</Text>
        </View>
      )
    }
    return (
      <FlatList
        data={games}
        keyExtractor={g => g.id}
        numColumns={2}
        ListHeaderComponent={
          <>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              allGames={games}
              onSelectGame={handleSelectGame}
            />
            {hero && (
              <TouchableOpacity style={styles.hero} onPress={() => handleSelectGame(hero)} activeOpacity={0.9}>
                <Image source={{ uri: hero.image }} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroTitle}>{hero.title}</Text>
                  {hero.genres.length > 0 && (
                    <Text style={styles.heroGenres}>{hero.genres.join(' · ')}</Text>
                  )}
                  <View style={styles.heroActions}>
                    <TouchableOpacity style={styles.heroBtnPrimary} onPress={() => handleSelectGame(hero)}>
                      <Text style={styles.heroBtnTxt}>Ver detalles</Text>
                    </TouchableOpacity>
                    {ownedGameIds.has(hero.id) ? (
                      <TouchableOpacity
                        style={styles.heroBtnOwned}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Library' } as any)}
                      >
                        <Text style={styles.heroBtnOwnedTxt}>Ver en biblioteca</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.heroBtnSecondary} onPress={() => addToCartLocal(hero)}>
                        <Text style={styles.heroBtnOutlineTxt}>+ Carrito</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            <Text style={styles.sectionTitle}>Juegos disponibles</Text>
          </>
        }
        renderItem={({ item }) => (
          <GameCard game={item} onPress={handleSelectGame} onAddToCart={addToCartLocal} />
        )}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07070f" />
      <View style={styles.appBar}>
        <Text style={styles.logo}>IndieGames</Text>
        {authUser ? (
          <View style={styles.authRow}>
            <Text style={styles.authName}>{authUser.username}</Text>
            <TouchableOpacity onPress={handleSignOut}>
              <Text style={styles.authBtn}>Salir</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setAuthModalOpen(true)}>
            <Text style={styles.authBtn}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
      {renderBody()}
      <AuthModal
        visible={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={user => { handleAuthSuccess(user); setAuthModalOpen(false) }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07070f' },
  centered: { flex: 1, backgroundColor: '#07070f', justifyContent: 'center', alignItems: 'center' },
  errorTxt: { color: '#f44', fontSize: 14 },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#14142a',
  },
  logo: { color: '#fff', fontWeight: '700', fontSize: 16 },
  authRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  authName: { color: '#aaa', fontSize: 13 },
  authBtn: {
    color: '#e0e0e0',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#303060',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  hero: {
    margin: 12,
    borderRadius: 10,
    overflow: 'hidden',
    height: 200,
  },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  heroGenres: { color: '#ccc', fontSize: 12, marginBottom: 12 },
  heroActions: { flexDirection: 'row', gap: 10 },
  heroBtnPrimary: {
    backgroundColor: '#7c3aed',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  heroBtnTxt: { color: '#fff', fontWeight: '600', fontSize: 13 },
  heroBtnSecondary: {
    borderWidth: 1,
    borderColor: '#a78bfa',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  heroBtnOutlineTxt: { color: '#a78bfa', fontSize: 13, fontFamily: 'Poppins_400Regular' },
  heroBtnOwned: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  heroBtnOwnedTxt: { color: '#a78bfa', fontSize: 13, fontFamily: 'Poppins_400Regular' },
  sectionTitle: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: { paddingHorizontal: 6, paddingBottom: 20 },
  row: { marginHorizontal: 0 },
})
