import React, { useRef } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Game } from '@shared/types/games'
import { useApp } from '../context/AppContext'

interface GameCardProps {
  game: Game
  onPress: (game: Game) => void
  onAddToCart?: (game: Game) => void
}

export default function GameCard({ game, onPress, onAddToCart }: GameCardProps) {
  const { ownedGameIds, theme } = useApp()
  const isOwned = ownedGameIds.has(game.id)
  const scale = useRef(new Animated.Value(1)).current

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start()
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()

  const light = theme === 'light'

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.card, light && styles.cardLight]}
        onPress={() => onPress(game)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Image source={{ uri: game.image }} style={styles.image} resizeMode="cover" />

        {isOwned && (
          <View style={styles.ownedBadge}>
            <Ionicons name="checkmark" size={11} color={light ? '#166534' : '#4caf50'} />
            <Text style={[styles.ownedTxt, light && styles.ownedTxtLight]}>Ya lo tienes</Text>
          </View>
        )}

        <View style={[styles.info, light && styles.infoLight]}>
          <Text style={[styles.title, light && styles.titleLight]} numberOfLines={1}>{game.title}</Text>
          <Text style={[styles.genres, light && styles.genresLight]} numberOfLines={1}>
            {game.genres.length > 0 ? game.genres.join(', ') : 'Indie'}
          </Text>
          {!isOwned && (
            <View style={styles.priceRow}>
              {game.oldPrice != null && (
                <Text style={styles.oldPrice}>{game.oldPrice.toFixed(2)}€</Text>
              )}
              {game.price != null && (
                <Text style={[styles.price, light && styles.priceLight]}>{game.price.toFixed(2)}€</Text>
              )}
              {onAddToCart && (
                <TouchableOpacity style={styles.cartBtn} onPress={() => onAddToCart(game)}>
                  <Text style={styles.cartBtnText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  cardWrap: { flex: 1, margin: 6 },
  card: {
    backgroundColor: '#0f0f20',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardLight: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  image: { width: '100%', height: 110, backgroundColor: '#181830' },
  ownedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ownedTxt: { fontSize: 10, fontWeight: '600', color: '#166534', fontFamily: 'Poppins_600SemiBold' },
  ownedTxtLight: { color: '#166534' },
  info: { padding: 10, backgroundColor: '#0f0f20' },
  infoLight: { backgroundColor: '#ffffff' },
  title: { fontSize: 13, fontWeight: '600', color: '#e0e0e0', marginBottom: 3, fontFamily: 'Poppins_600SemiBold' },
  titleLight: { color: '#1a1f2e' },
  genres: { fontSize: 11, color: '#888', marginBottom: 6, fontFamily: 'Poppins_400Regular' },
  genresLight: { color: '#6b7280' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  oldPrice: { fontSize: 11, color: '#666', textDecorationLine: 'line-through', fontFamily: 'Poppins_400Regular' },
  price: { fontSize: 13, fontWeight: '600', color: '#e0e0e0', flex: 1, fontFamily: 'Poppins_600SemiBold' },
  priceLight: { color: '#1a1f2e' },
  cartBtn: { backgroundColor: '#7c3aed', borderRadius: 4, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  cartBtnText: { color: '#fff', fontSize: 18, lineHeight: 22 },
})
