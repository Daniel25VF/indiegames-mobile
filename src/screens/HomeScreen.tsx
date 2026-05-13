import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RootStackParams } from '../navigation'
import { getGames, getGenres, getCurrentUser, mapApiGameListItem } from '@shared/services/api'
import type { GenreListItemResponse } from '@shared/services/api'
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
  const [genres, setGenres] = useState<GenreListItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  useEffect(() => {
    if (authUser) {
      getCurrentUser()
        .then(u => setAvatarUrl(u.profilePicture?.mediumPictureUrl ?? null))
        .catch(() => {})
    } else {
      setAvatarUrl(null)
    }
  }, [authUser])

  useEffect(() => {
    getGames('', [], 1, 50)
      .then(page => setGames(page.items.map(mapApiGameListItem)))
      .catch(() => setError('No se pudieron cargar los juegos.'))
      .finally(() => setLoading(false))
    getGenres('', 1, 100)
      .then(page => setGenres(page.items))
      .catch(() => {})
  }, [])

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return
    navigation.navigate('SearchResults', { query: query.trim() })
  }, [navigation])

  const handleSelectGame = useCallback((game: Game) => {
    navigation.navigate('GameDetail', { game })
  }, [navigation])

  const hero = games[0]
  const discountedGames = games.filter(g => g.discount !== undefined && g.discount > 0)

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
              allGenres={genres}
              onSelectGame={handleSelectGame}
              onSelectGenre={genre => navigation.navigate('SearchResults', { query: genre.name, genreId: genre.id })}
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
                    {!ownedGameIds.has(hero.id) && (
                      <TouchableOpacity
                        style={styles.heroBtnSecondary}
                        onPress={() => {
                          if (!authUser) { setAuthModalOpen(true); return }
                          addToCartLocal(hero)
                        }}
                      >
                        <Text style={styles.heroBtnOutlineTxt}>+ Carrito</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            {discountedGames.length > 0 && (
              <View style={styles.offersSection}>
                <Text style={styles.sectionTitle}>Juegos con descuento</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.offersScroll}
                >
                  {discountedGames.map(game => (
                    <TouchableOpacity
                      key={game.id}
                      style={styles.offerCard}
                      onPress={() => handleSelectGame(game)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.offerImgWrap}>
                        <Image source={{ uri: game.image }} style={styles.offerImg} resizeMode="cover" />
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountTxt}>-{game.discount}%</Text>
                        </View>
                      </View>
                      <View style={styles.offerInfo}>
                        <Text style={styles.offerTitle} numberOfLines={1}>{game.title}</Text>
                        <View style={styles.offerPriceRow}>
                          {game.oldPrice != null && (
                            <Text style={styles.offerOldPrice}>{game.oldPrice.toFixed(2)}€</Text>
                          )}
                          {game.price != null && (
                            <Text style={styles.offerPrice}>{game.price.toFixed(2)}€</Text>
                          )}
                        </View>
                        {!ownedGameIds.has(game.id) && (
                          <TouchableOpacity
                            style={styles.offerCartBtn}
                            onPress={() => {
                              if (!authUser) { setAuthModalOpen(true); return }
                              addToCartLocal(game)
                            }}
                          >
                            <Text style={styles.offerCartTxt}>+ Carrito</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.sectionTitle}>Juegos disponibles</Text>
          </>
        }
        renderItem={({ item }) => (
          <GameCard game={item} onPress={handleSelectGame} onAddToCart={addToCartLocal} onRequireAuth={() => setAuthModalOpen(true)} />
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
          <TouchableOpacity onPress={() => setProfileMenuOpen(true)} activeOpacity={0.8}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {authUser.username[0].toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setAuthModalOpen(true)}>
            <Text style={styles.authBtn}>Iniciar sesión</Text>
          </TouchableOpacity>
        )}
      </View>
      {renderBody()}
      <AuthModal
        visible={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={user => { handleAuthSuccess(user); setAuthModalOpen(false) }}
      />

      <Modal visible={profileMenuOpen} transparent animationType="fade" onRequestClose={() => setProfileMenuOpen(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setProfileMenuOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.profileMenu}>
            <View style={styles.profileMenuHeader}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.menuAvatar} />
              ) : (
                <View style={styles.menuAvatarPlaceholder}>
                  <Text style={styles.menuAvatarInitial}>{authUser?.username[0].toUpperCase()}</Text>
                </View>
              )}
              <Text style={styles.menuUsername}>{authUser?.username}</Text>
            </View>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setProfileMenuOpen(false); handleSignOut() }}
            >
              <Text style={styles.menuItemSignOut}>Cerrar sesión</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  offersSection: { marginBottom: 4 },
  offersScroll: { paddingHorizontal: 12, paddingBottom: 4, gap: 12 },
  offerCard: {
    width: 160,
    backgroundColor: '#0f0f20',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1c1c38',
  },
  offerImgWrap: { position: 'relative' },
  offerImg: { width: '100%', height: 90 },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#4c6b22',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountTxt: { color: '#a4d007', fontSize: 11, fontWeight: '700' },
  offerInfo: { padding: 8, gap: 4 },
  offerTitle: { color: '#e0e0e0', fontSize: 12, fontWeight: '600' },
  offerPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  offerOldPrice: { color: '#666', fontSize: 11, textDecorationLine: 'line-through' },
  offerPrice: { color: '#a4d007', fontSize: 13, fontWeight: '700' },
  offerCartBtn: {
    backgroundColor: '#4c6b22',
    borderRadius: 4,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 2,
  },
  offerCartTxt: { color: '#a4d007', fontSize: 11, fontWeight: '600' },
  avatarImg: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#181830' },
  avatarPlaceholder: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#181830',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#303060',
  },
  avatarInitial: { color: '#a78bfa', fontSize: 15, fontWeight: '700' },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 12,
  },
  profileMenu: {
    backgroundColor: '#0f0f20',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1c1c38',
    minWidth: 180,
    overflow: 'hidden',
  },
  profileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  menuAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#181830' },
  menuAvatarPlaceholder: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#181830',
    alignItems: 'center', justifyContent: 'center',
  },
  menuAvatarInitial: { color: '#a78bfa', fontSize: 14, fontWeight: '700' },
  menuUsername: { color: '#e0e0e0', fontSize: 13, fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: '#1c1c38' },
  menuItem: { paddingVertical: 14, paddingHorizontal: 16 },
  menuItemSignOut: { color: '#e05555', fontSize: 14 },
})
