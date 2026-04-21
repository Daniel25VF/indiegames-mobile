import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import type { Game } from '../types/games'

interface GameCardProps {
  game: Game
  onPress: (game: Game) => void
  onAddToCart?: (game: Game) => void
}

export default function GameCard({ game, onPress, onAddToCart }: GameCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(game)} activeOpacity={0.8}>
      <Image
        source={{ uri: game.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{game.title}</Text>
        <Text style={styles.genres} numberOfLines={1}>
          {game.genres.length > 0 ? game.genres.join(', ') : 'Indie'}
        </Text>
        <View style={styles.priceRow}>
          {game.oldPrice != null && (
            <Text style={styles.oldPrice}>{game.oldPrice.toFixed(2)}€</Text>
          )}
          {game.price != null && (
            <Text style={styles.price}>{game.price.toFixed(2)}€</Text>
          )}
          {onAddToCart && (
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => onAddToCart(game)}
            >
              <Text style={styles.cartBtnText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    overflow: 'hidden',
    flex: 1,
    margin: 6,
  },
  image: {
    width: '100%',
    height: 110,
    backgroundColor: '#3a3a3a',
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 3,
  },
  genres: {
    fontSize: 11,
    color: '#888',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  oldPrice: {
    fontSize: 11,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e0e0e0',
    flex: 1,
  },
  cartBtn: {
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnText: {
    color: '#ccc',
    fontSize: 18,
    lineHeight: 22,
  },
})
