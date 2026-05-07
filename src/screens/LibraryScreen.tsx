import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import type { Game, Collection } from '@shared/types/games'
import {
  getUserLibrary,
  mapGameSummary,
  getUserCollections,
  mapCollectionListItem,
  getCollectionById,
} from '@shared/services/api'
import ReportModal from '../components/ReportModal'

type Tab = 'games' | 'collections'

export default function LibraryScreen() {
  const [tab, setTab] = useState<Tab>('games')
  const [search, setSearch] = useState('')
  const [ownedGames, setOwnedGames] = useState<Game[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [reportGame, setReportGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [librarySummaries, collectionsPage] = await Promise.all([
        getUserLibrary(),
        getUserCollections(),
      ])
      setOwnedGames(librarySummaries.map(mapGameSummary))
      setCollections(collectionsPage.items.map(mapCollectionListItem))
    } catch {
      setError('No se pudo cargar la biblioteca.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSelectCollection = async (collection: Collection) => {
    try {
      const full = await getCollectionById(collection.id)
      setSelectedCollection(full)
    } catch {
      setSelectedCollection(collection)
    }
  }

  const filteredGames = ownedGames.filter(g =>
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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#4a9eff" size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorTxt}>{error}</Text>
          <TouchableOpacity onPress={loadData} style={styles.retryBtn}>
            <Text style={styles.retryTxt}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : tab === 'games' ? (
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
          {filteredGames.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyTxt}>
                {ownedGames.length === 0 ? 'Tu biblioteca está vacía' : 'Sin resultados'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredGames}
              keyExtractor={g => g.id}
              contentContainerStyle={styles.gameList}
              renderItem={({ item }) => (
                <View style={styles.gameRow}>
                  <Image source={{ uri: item.image }} style={styles.gameThumb} resizeMode="cover" />
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameTitle}>{item.title}</Text>
                    <Text style={styles.gameGenres}>{item.genres.join(', ')}</Text>
                  </View>
                  <TouchableOpacity style={styles.reportRowBtn} onPress={() => setReportGame(item)}>
                    <Text style={styles.reportRowTxt}>⚑</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </>
      ) : (
        collections.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyTxt}>No tienes colecciones</Text>
          </View>
        ) : (
          <FlatList
            data={collections}
            keyExtractor={c => c.id}
            numColumns={2}
            contentContainerStyle={styles.collGrid}
            columnWrapperStyle={styles.collRow}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.collCard} onPress={() => handleSelectCollection(item)}>
                <View style={styles.collCover}>
                  {(item.previewUrls ?? []).slice(0, 4).map((url, i) => (
                    <Image key={i} source={{ uri: url }} style={styles.collThumb} resizeMode="cover" />
                  ))}
                </View>
                <Text style={styles.collName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )
      )}

      <ReportModal
        visible={reportGame !== null}
        gameName={reportGame?.title ?? ''}
        onClose={() => setReportGame(null)}
        onSubmit={(reason, description) => {
          console.log('[Report]', { gameId: reportGame?.id, reason, description })
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07070f' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#14142a',
  },
  logoTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  backBtn: { paddingVertical: 4 },
  backTxt: { color: '#4a9eff', fontSize: 14 },
  headerTitle: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 16 },
  headerCount: { color: '#666', fontSize: 13 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#14142a',
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
    borderBottomColor: '#14142a',
  },
  searchInput: {
    backgroundColor: '#12122a',
    borderWidth: 1,
    borderColor: '#1c1c38',
    borderRadius: 4,
    color: '#e0e0e0',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTxt: { color: '#aaa', fontSize: 14 },
  errorTxt: { color: '#f44', fontSize: 14 },
  retryBtn: {
    borderWidth: 1,
    borderColor: '#303060',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryTxt: { color: '#4a9eff', fontSize: 13 },
  gameList: { paddingBottom: 20 },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#14142a',
  },
  gameThumb: { width: 44, height: 44, borderRadius: 4, backgroundColor: '#181830' },
  gameInfo: { flex: 1 },
  gameTitle: { color: '#e0e0e0', fontSize: 13, fontWeight: '600' },
  gameGenres: { color: '#888', fontSize: 11, marginTop: 2 },
  reportRowBtn: { padding: 6 },
  reportRowTxt: { color: '#555', fontSize: 16 },
  collGrid: { padding: 12, paddingBottom: 20 },
  collRow: { gap: 12 },
  collCard: {
    flex: 1,
    backgroundColor: '#0f0f20',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  collCover: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    aspectRatio: 1,
    backgroundColor: '#181830',
  },
  collThumb: { width: '50%', height: '50%' },
  collName: { color: '#e0e0e0', fontSize: 12, fontWeight: '600', padding: 8 },
  coverGrid: { padding: 12 },
  coverCard: { flex: 1, margin: 4, alignItems: 'center' },
  coverImage: { width: '100%', aspectRatio: 0.75, borderRadius: 6 },
  coverTitle: { color: '#ccc', fontSize: 11, marginTop: 4, textAlign: 'center' },
})
