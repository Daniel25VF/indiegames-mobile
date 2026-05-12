import React, { useState, useEffect } from 'react'
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Game } from '@shared/types/games'

const HISTORY_KEY = 'searchHistory'
const MAX_HISTORY = 5

async function getHistory(): Promise<string[]> {
  try { return JSON.parse((await AsyncStorage.getItem(HISTORY_KEY)) ?? '[]') }
  catch { return [] }
}

async function saveToHistory(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return
  const prev = (await getHistory()).filter(q => q !== trimmed)
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([trimmed, ...prev].slice(0, MAX_HISTORY)))
}

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSearch: (v: string) => void
  allGames?: Game[]
  onSelectGame?: (game: Game) => void
}

export default function SearchBar({ value, onChange, onSearch, allGames = [], onSelectGame }: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    if (focused) getHistory().then(setHistory)
  }, [focused])

  const suggestions = value.trim()
    ? allGames.filter(g => g.title.toLowerCase().includes(value.trim().toLowerCase())).slice(0, 5)
    : []

  const showHistory = focused && !value.trim() && history.length > 0
  const showSuggestions = focused && suggestions.length > 0
  const showDropdown = showHistory || showSuggestions

  const handleSearch = async (q: string) => {
    await saveToHistory(q)
    setHistory(await getHistory())
    setFocused(false)
    onSearch(q)
  }

  const handleSelectGame = (game: Game) => {
    setFocused(false)
    onSelectGame?.(game)
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.inner, focused && showDropdown && styles.innerOpen]}>
        <TouchableOpacity style={styles.btn} onPress={() => handleSearch(value)}>
          <Ionicons name="search" size={16} color="#888" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Buscar juegos..."
          placeholderTextColor="#666"
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onSubmitEditing={() => handleSearch(value)}
          returnKeyType="search"
        />
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          {showHistory && (
            <>
              <Text style={styles.dropLabel}>Búsquedas recientes</Text>
              {history.map(q => (
                <TouchableOpacity key={q} style={styles.dropItem} onPress={() => { onChange(q); handleSearch(q) }}>
                  <Ionicons name="time-outline" size={13} color="#666" />
                  <Text style={styles.historyTxt}>{q}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
          {showSuggestions && (
            <>
              {showHistory && <View style={styles.divider} />}
              {suggestions.map(game => (
                <TouchableOpacity key={game.id} style={styles.dropItem} onPress={() => handleSelectGame(game)}>
                  <Image source={{ uri: game.image }} style={styles.thumb} resizeMode="cover" />
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameTitle} numberOfLines={1}>{game.title}</Text>
                    <Text style={styles.gameGenre} numberOfLines={1}>{game.genres.slice(0, 2).join(', ')}</Text>
                  </View>
                  {game.price != null && (
                    <Text style={styles.gamePrice}>{game.price.toFixed(2)}€</Text>
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#0b0b18', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#14142a', zIndex: 50 },
  inner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12122a', borderWidth: 1, borderColor: '#1c1c38', borderRadius: 6, overflow: 'hidden' },
  innerOpen: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderColor: '#303060' },
  input: { flex: 1, color: '#e0e0e0', fontSize: 13, paddingLeft: 0, paddingRight: 12, paddingVertical: 9, fontFamily: 'Poppins_400Regular' },
  btn: { padding: 9 },
  dropdown: { backgroundColor: '#12122a', borderWidth: 1, borderTopWidth: 0, borderColor: '#303060', borderBottomLeftRadius: 6, borderBottomRightRadius: 6, overflow: 'hidden' },
  dropLabel: { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4, fontFamily: 'Poppins_500Medium' },
  divider: { height: 1, backgroundColor: '#14142a', marginVertical: 4 },
  dropItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8 },
  historyTxt: { fontSize: 13, color: '#ccc', flex: 1, fontFamily: 'Poppins_400Regular' },
  thumb: { width: 44, height: 28, borderRadius: 3, backgroundColor: '#1c1c38' },
  gameInfo: { flex: 1, gap: 1 },
  gameTitle: { fontSize: 13, fontWeight: '600', color: '#e0e0e0', fontFamily: 'Poppins_600SemiBold' },
  gameGenre: { fontSize: 11, color: '#888', fontFamily: 'Poppins_400Regular' },
  gamePrice: { fontSize: 12, fontWeight: '600', color: '#e0e0e0', fontFamily: 'Poppins_600SemiBold' },
})
