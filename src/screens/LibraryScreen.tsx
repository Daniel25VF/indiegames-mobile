import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import type { Game, Collection } from '../types/games'

const OWNED_GAMES: Game[] = [
  { id: '1', title: 'Cyber Adventure', price: 24.99, genres: ['Acción', 'RPG'], image: 'https://placehold.co/300x400/2a2a2a/555' },
  { id: '2', title: 'Space Survival', price: 19.99, genres: ['Supervivencia', 'Sci-Fi'], image: 'https://placehold.co/300x400/2a2a2a/555' },
  { id: '3', title: 'Fantasy World', price: 24.99, genres: ['RPG', 'Aventura'], image: 'https://placehold.co/300x400/2a2a2a/555' },
  { id: '4', title: 'Dark Dungeon', price: 24.99, genres: ['Roguelike', 'Acción'], image: 'https://placehold.co/300x400/2a2a2a/555' },
  { id: '5', title: 'Pixel Quest', price: 14.99, genres: ['Plataformas', 'Indie'], image: 'https://placehold.co/300x400/2a2a2a/555' },
  { id: '6', title: 'Ocean Depths', price: 24.99, genres: ['Exploración', 'Aventura'], image: 'https://placehold.co/300x400/2a2a2a/555' },
]

const COLLECTIONS: Collection[] = [
  { id: '1', name: 'Modo Historia', games: [OWNED_GAMES[0], OWNED_GAMES[2], OWNED_GAMES[5]] },
  { id: '2', name: 'Favoritos', games: [OWNED_GAMES[0], OWNED_GAMES[1], OWNED_GAMES[4]] },
  { id: '3', name: 'RPG', games: [OWNED_GAMES[0], OWNED_GAMES[2]] },
]

type Tab = 'games' | 'collections'

export default function LibraryScreen() {
  const [tab, setTab] = useState<Tab>('games')
  const [search, setSearch] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  const filteredGames = OWNED_GAMES.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase())
  )

  if (selectedCollection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedCollection(null)} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedCollection.name}</Text>
          <Text style={styles.headerCount}>{selectedCollection.games.length} juegos</Text>
        </View>
        <FlatList
          data={selectedCollection.games}
          keyExtractor={g => g.id}
          numColumns={3}
          contentContainerStyle={styles.coverGrid}
          renderItem={({ item }) => (
            <View style={styles.coverCard}>
              <Image source={{ uri: item.image }} style={styles.coverImage} resizeMode="cover" />
              <Text style={styles.coverTitle} numberOfLines={1}>{item.title}</Text>
            </View>
          )}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoTxt}>Biblioteca</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'games' && styles.tabBtnActive]}
          onPress={() => setTab('games')}
        >
          <Text style={[styles.tabTxt, tab === 'games' && styles.tabTxtActive]}>Juegos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'collections' && styles.tabBtnActive]}
          onPress={() => setTab('collections')}
        >
          <Text style={[styles.tabTxt, tab === 'collections' && styles.tabTxtActive]}>Colecciones</Text>
        </TouchableOpacity>
      </View>

      {tab === 'games' ? (
        <>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar en tu biblioteca..."
              placeholderTextColor="#666"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <FlatList
            data={filteredGames}
            keyExtractor={g => g.id}
            contentContainerStyle={styles.gameList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.gameRow}>
                <Image source={{ uri: item.image }} style={styles.gameThumb} resizeMode="cover" />
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{item.title}</Text>
                  <Text style={styles.gameGenres}>{item.genres.join(', ')}</Text>
                </View>
                <TouchableOpacity style={styles.playBtn}>
                  <Text style={styles.playBtnTxt}>▶ Jugar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <FlatList
          data={COLLECTIONS}
          keyExtractor={c => c.id}
          numColumns={2}
          contentContainerStyle={styles.collGrid}
          columnWrapperStyle={styles.collRow}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.collCard} onPress={() => setSelectedCollection(item)}>
              <View style={styles.collCover}>
                {item.games.slice(0, 4).map((g, i) => (
                  <Image key={i} source={{ uri: g.image }} style={styles.collThumb} resizeMode="cover" />
                ))}
              </View>
              <Text style={styles.collName}>{item.name}</Text>
              <Text style={styles.collCount}>{item.games.length} juegos</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
  logoTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  backBtn: { paddingVertical: 4 },
  backTxt: { color: '#6bb8e8', fontSize: 14 },
  headerTitle: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 16 },
  headerCount: { color: '#666', fontSize: 13 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: '#4a9eff' },
  tabTxt: { color: '#888', fontSize: 13 },
  tabTxtActive: { color: '#fff', fontWeight: '600' },
  searchWrap: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  searchInput: {
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 4,
    color: '#e0e0e0',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gameList: { paddingBottom: 20 },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  gameThumb: { width: 44, height: 44, borderRadius: 4, backgroundColor: '#3a3a3a' },
  gameInfo: { flex: 1 },
  gameTitle: { color: '#e0e0e0', fontSize: 13, fontWeight: '600' },
  gameGenres: { color: '#888', fontSize: 11, marginTop: 2 },
  playBtn: {
    backgroundColor: '#4caf50',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  playBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  collGrid: { padding: 12, paddingBottom: 20 },
  collRow: { gap: 12 },
  collCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  collCover: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    aspectRatio: 1,
  },
  collThumb: { width: '50%', height: '50%' },
  collName: { color: '#e0e0e0', fontSize: 12, fontWeight: '600', padding: 8 },
  collCount: { color: '#666', fontSize: 11, paddingHorizontal: 8, paddingBottom: 8 },
  coverGrid: { padding: 12 },
  coverCard: { flex: 1, margin: 4, alignItems: 'center' },
  coverImage: { width: '100%', aspectRatio: 0.75, borderRadius: 6 },
  coverTitle: { color: '#ccc', fontSize: 11, marginTop: 4, textAlign: 'center' },
})
